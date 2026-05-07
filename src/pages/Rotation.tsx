import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAI } from '../context/ModelContext';
import { crops } from '../data/crops';
import { appStore, useAppStore } from '../store/appStore';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type RotationStep = {
  season: string;
  cropType: string;
  examplePlants: string;
  primaryGoal: string;
  rationale: string;
  proTip: string;
};

export default function Rotation() {
  const { t, lang } = useLanguage();
  const { generateContent } = useAI();
  const store = useAppStore();
  
  const [pastCrops, setPastCrops] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('farm_past_crops');
    if (saved) {
      try {
        setPastCrops(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const addPastCrop = () => {
    if (!selectedCrop) return;
    const updated = [...pastCrops, selectedCrop];
    setPastCrops(updated);
    localStorage.setItem('farm_past_crops', JSON.stringify(updated));
    setSelectedCrop('');
  };

  const removePastCrop = (index: number) => {
    const updated = [...pastCrops];
    updated.splice(index, 1);
    setPastCrops(updated);
    localStorage.setItem('farm_past_crops', JSON.stringify(updated));
  };

  const getCropName = (id: string) => crops.find(c => c.id === id)?.name || id;

  const suggestRotation = async () => {
    if (pastCrops.length === 0) return;
    appStore.setRotation({ loading: true, data: null, errorMsg: null });
    setExpandedIndex(null);
    try {

      const cropNames = pastCrops.map(getCropName).join(', ');
      const prompt = `You are an expert agronomist. 
The farmer has recently grown the following crops in sequence: ${cropNames}.
Suggest an optimal crop rotation sequence for the upcoming 3 seasons to maximize soil health, nutrient recovery, and yield. 
Respond ONLY with a valid JSON array of objects, where each object represents a season in the sequence. Do not include markdown markers or backticks around the JSON.
Each object MUST have the following string keys:
- "season": The period, e.g., "Season 1", "Winter", etc.
- "cropType": The type/family, e.g., "Legumes", "Brassicas"
- "examplePlants": Examples, e.g., "Peas, Beans, Clover"
- "primaryGoal": Short 2-4 word goal, e.g., "Nutrient Recovery"
- "rationale": Short explanation 1-2 sentences.
- "proTip": Short practical tip.
All text values MUST be translated to ${lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English'}.`;

      const aiResponse = await generateContent(prompt, "You are Ori, an AI designed to respond strictly with JSON arrays.");
      
      const cleanJson = aiResponse.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      if (Array.isArray(parsed)) {
        appStore.setRotation({ data: parsed });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e: any) {
      console.error(e);
      appStore.setRotation({ errorMsg: "⚠️ Sorry, rotation suggestions couldn't be loaded at the moment. Please try again." });
    } finally {
      appStore.setRotation({ loading: false });
    }
  };

  return (
    <div className="p-4 pb-24 min-h-screen bg-stone-50">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <Icons.Recycle className="text-green-700" /> Crop Rotation
        </h2>
        <p className="text-sm text-stone-600 mt-1">Plan optimal sequences to improve soil health and yield.</p>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 mb-6">
        <h3 className="font-semibold text-stone-800 mb-3 text-sm">Past Crops Log</h3>
        
        <div className="flex gap-2 mb-4">
          <select 
            value={selectedCrop} 
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-stone-300 outline-none focus:border-green-500 bg-white"
          >
            <option value="">Select a crop...</option>
            {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button 
            onClick={addPastCrop}
            disabled={!selectedCrop}
            className="bg-green-600 disabled:bg-stone-300 text-white p-3 rounded-xl hover:bg-green-700 transition"
          >
            <Icons.Plus size={24} />
          </button>
        </div>

        {pastCrops.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {pastCrops.map((c, i) => (
              <div key={i} className="bg-green-50 border border-green-200 text-green-800 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                {i + 1}. {getCropName(c)}
                <button onClick={() => removePastCrop(i)} className="text-green-600 hover:text-red-500">
                  <Icons.X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500 mb-4 italic">No past crops logged yet. Add your recent crops to get suggestions.</p>
        )}

        <button
          onClick={suggestRotation}
          disabled={pastCrops.length === 0 || store.rotation.loading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold py-3.5 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2"
        >
          {store.rotation.loading ? (
            <><Icons.Loader2 className="animate-spin" /> Analyzing Soil Cycles...</>
          ) : (
            <><Icons.Sparkles size={20} /> Suggest Next Crops</>
          )}
        </button>
      </div>

      {store.rotation.errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6 text-sm">
          {store.rotation.errorMsg}
        </div>
      )}

      {store.rotation.data && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-green-800 flex items-center gap-2 px-2">
             <Icons.Lightbulb size={20} /> Recommended Sequence
          </h3>
          <AnimatePresence>
            {store.rotation.data.map((step: any, idx: number) => {
              const isExpanded = expandedIndex === idx;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden cursor-pointer transition-all duration-300 ${isExpanded ? 'border-green-400 ring-2 ring-green-100' : 'border-stone-200 hover:border-green-300'}`}
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-stone-100 text-stone-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-0.5">{step.season}</div>
                        <h4 className="font-bold text-stone-800">{step.cropType}</h4>
                        <div className="text-xs text-stone-500 mt-1">{step.primaryGoal}</div>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? <Icons.ChevronUp className="text-stone-400" /> : <Icons.ChevronDown className="text-stone-400" />}
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-stone-50 px-4 pb-4 pt-1 text-sm border-t border-stone-100"
                      >
                        <div className="space-y-4 mt-3">
                          <div>
                            <span className="font-bold text-stone-700 block mb-1">Recommended Plants:</span>
                            <span className="text-stone-600">{step.examplePlants}</span>
                          </div>
                          <div>
                            <span className="font-bold text-stone-700 block mb-1">Why this works:</span>
                            <span className="text-stone-600">{step.rationale}</span>
                          </div>
                          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100">
                            <span className="font-bold block mb-0.5 flex items-center gap-1"><Icons.Lightbulb size={14} /> Pro-Tip:</span>
                            {step.proTip}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
