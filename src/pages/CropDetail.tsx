import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { crops, Activity } from '../data/crops';
import { useLanguage } from '../context/LanguageContext';
import { appStore, useAppStore } from '../store/appStore';
import { useAI } from '../context/ModelContext';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';

type Unit = 'acre' | 'hectare' | 'bigha';

export default function CropDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { generateContent } = useAI();
  const store = useAppStore();
  const crop = crops.find(c => c.id === id);

  const [landArea, setLandArea] = useState<string>('');
  const [unit, setUnit] = useState<Unit>('acre');
  const [showRoadmap, setShowRoadmap] = useState(false);

  const roadmapState = store.cropRoadmaps[id || ''] || { loading: false, data: null, errorMsg: null };

  const handleGenerate = async () => {
    if (!id || parseFloat(landArea) <= 0) return;
    
    setShowRoadmap(true);
    appStore.setCropRoadmap(id, { loading: true, errorMsg: null });
    
    try {

      const prompt = `You are Ori, an expert AI farming assistant. 
The user wants a seed-to-harvest roadmap for growing ${crop?.name}.
The expected growth period is ${crop?.growthPeriodDays} days.
The selected language is ${lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English'}.
Please generate a weekly roadmap with specific activities.
For each week (if applicable), predict an expected disease based on the growth stage and provide a detailed solution. 
The text MUST be in the requested language.
IMPORTANT: You MUST return the result as a strict JSON array with this EXACT schema for each object:
{
  "week": number,
  "activity": "Short title of the activity",
  "description": "Detailed description of what to do",
  "expectedDisease": "Name of potential disease (optional)",
  "diseaseSolution": "Solution for the disease (optional)"
}`;

      const aiResponse = await generateContent(prompt, "You are Ori, an AI designed to respond with a JSON array.");
      
      const cleanJson = aiResponse.replace(/```json|```/g, '').trim();
      const generated = JSON.parse(cleanJson);
      appStore.setCropRoadmap(id, { data: generated });
    } catch(e: any) {
      console.error("AI Generation failed", e);
      appStore.setCropRoadmap(id, { 
        errorMsg: "⚠️ AI service temporarily unavailable. Showing default recommendations.",
        data: crop?.activities
      });
    } finally {
      appStore.setCropRoadmap(id, { loading: false });
      setTimeout(() => {
        window.scrollTo({ top: 500, behavior: 'smooth' });
      }, 100);
    }
  };

  // Conversion factors to Acres
  const unitToAcre = {
    acre: 1,
    hectare: 2.47105,
    bigha: 0.62 // approx based on region, using 0.62 for MVP
  };

  const calculatedData = useMemo(() => {
    if (!crop || !landArea || isNaN(parseFloat(landArea))) return null;
    const areaInAcres = parseFloat(landArea) * unitToAcre[unit];
    
    return {
      seedReq: (crop.seedRatePerAcre * areaInAcres).toFixed(1),
      plants: Math.round(crop.plantsPerAcre * areaInAcres).toLocaleString('en-IN'),
      urea: (crop.fertilizerPerAcre.urea * areaInAcres).toFixed(1),
      dap: (crop.fertilizerPerAcre.dap * areaInAcres).toFixed(1),
      mop: (crop.fertilizerPerAcre.mop * areaInAcres).toFixed(1),
      yield: (crop.expectedYieldPerAcre * areaInAcres).toFixed(1),
      harvestDate: new Date(Date.now() + crop.growthPeriodDays * 24 * 60 * 60 * 1000).toLocaleDateString()
    };
  }, [crop, landArea, unit]);

  const saveToTracker = (mode: 'test' | 'real') => {
    if (!crop || !landArea) return;
    
    // Get existing logs
    const saved = localStorage.getItem('farm_growth_logs');
    let logs = [];
    if (saved) {
      try {
        logs = JSON.parse(saved);
      } catch (e) {}
    }

    const newLog = {
      id: Date.now().toString(),
      cropId: crop.id,
      sowingDate: new Date().toISOString().split('T')[0],
      landArea: `${landArea} ${unit}`,
      stage: 'Seedling',
      mode: mode,
      createdAt: Date.now(),
      notes: [`Added via Roadmap estimator as a ${mode} crop on ${new Date().toLocaleDateString()}.`]
    };

    localStorage.setItem('farm_growth_logs', JSON.stringify([...logs, newLog]));
    navigate('/tracker');
  };

  if (!crop) return <div className="p-4">Crop not found</div>;

  const renderIcon = (name: string, size: number = 48) => {
    const IconComponent = (Icons as any)[name] || Icons.Sprout;
    return <IconComponent size={size} />;
  };

  return (
    <div className="p-4 pb-24 relative min-h-screen">
      <button 
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-green-700 font-medium bg-green-50 px-3 py-1.5 rounded-full w-max"
      >
        <span className="text-lg">←</span> Back
      </button>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 mb-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 text-green-800">
           {renderIcon(crop.iconName, 120)}
        </div>
        <span className="mb-3 relative z-10 text-green-700">{renderIcon(crop.iconName, 64)}</span>
        <h2 className="text-2xl font-bold text-stone-800 relative z-10">{crop.name}</h2>
        <div className="flex gap-4 mt-4 w-full">
          <div className="flex-1 bg-stone-50 rounded-xl p-3 text-center border border-stone-100">
            <div className="text-xl font-bold text-green-700">{crop.growthPeriodDays}</div>
            <div className="text-xs text-stone-500">Days</div>
          </div>
          <div className="flex-1 bg-stone-50 rounded-xl p-3 text-center border border-stone-100">
            <div className="text-xl font-bold text-green-700">{crop.expectedYieldPerAcre}</div>
            <div className="text-xs text-stone-500">Qtl/Acre</div>
          </div>
        </div>
      </div>

      <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 shadow-sm mb-6">
        <label className="block text-sm font-semibold text-stone-700 mb-2">
          {t('land_area')}
        </label>
        <div className="flex gap-3 mb-4">
          <input
            type="number"
            value={landArea}
            onChange={(e) => setLandArea(e.target.value)}
            placeholder="e.g. 2.5"
            className="flex-1 rounded-xl border border-stone-300 p-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 w-full"
          />
          <select 
            value={unit} 
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="rounded-xl border border-stone-300 p-3 bg-white outline-none focus:border-green-500 text-stone-700 min-w-[100px]"
          >
            <option value="acre">{t('unit_acre')}</option>
            <option value="hectare">{t('unit_hectare')}</option>
            <option value="bigha">{t('unit_bigha')}</option>
          </select>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={!landArea || parseFloat(landArea) <= 0 || roadmapState.loading}
          className="w-full bg-amber-500 disabled:bg-stone-300 disabled:text-stone-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          {roadmapState.loading ? (
            <>
              <Icons.Loader2 className="animate-spin w-5 h-5 text-white/50" />
              {t('ori_generating' as any)}
            </>
          ) : (
            <>
              {t('generate_roadmap')} ✨
            </>
          )}
        </button>

        {roadmapState.errorMsg && (
          <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 text-sm flex items-start gap-2">
            <Icons.AlertCircle className="shrink-0 mt-0.5" size={16} />
            <p>{roadmapState.errorMsg}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showRoadmap && calculatedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-bold text-xl text-stone-800 mb-4 flex items-center gap-2">
                <span className="bg-green-100 text-green-700 p-1.5 rounded-lg text-sm text-center flex justify-center items-center">
                  <Icons.BarChart2 size={16} />
                </span>
                Estimation Summary
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                  <div className="text-stone-500 text-xs mb-1">{t('seed_required')}</div>
                  <div className="font-bold text-lg text-stone-800">{calculatedData.seedReq} kg</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                  <div className="text-stone-500 text-xs mb-1">{t('number_of_plants')}</div>
                  <div className="font-bold text-lg text-stone-800">{calculatedData.plants}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm col-span-2">
                  <div className="text-stone-500 text-xs mb-1">{t('fertilizer_schedule')} (Total)</div>
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      <span className="font-bold text-stone-800">{calculatedData.urea}</span> <span className="text-xs text-stone-500">kg Urea</span>
                    </div>
                    <div>
                      <span className="font-bold text-stone-800">{calculatedData.dap}</span> <span className="text-xs text-stone-500">kg DAP</span>
                    </div>
                    {parseFloat(calculatedData.mop) > 0 && (
                      <div>
                        <span className="font-bold text-stone-800">{calculatedData.mop}</span> <span className="text-xs text-stone-500">kg MOP</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm col-span-2 flex justify-between items-center">
                  <div>
                    <div className="text-green-800 text-xs font-semibold mb-1">{t('expected_yield')}</div>
                    <div className="font-bold text-2xl text-green-700">{calculatedData.yield} <span className="text-sm font-medium">Quintals</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-stone-500 text-xs mb-1">{t('estimated_harvest')}</div>
                    <div className="font-bold text-stone-800">{calculatedData.harvestDate}</div>
                  </div>
                </div>
              </div>
            </div>

            {roadmapState.data && (
              <div>
                <h3 className="font-bold text-xl text-stone-800 mb-4 flex items-center justify-between">
                  <span>{t('roadmap_title')}</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">{t('powered_by_ori' as any)}</span>
                </h3>
                <div className="relative pl-4 border-l-2 border-stone-200 ml-4 space-y-6">
                  {roadmapState.data.map((act: any, i: number) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-5 w-4 h-4 bg-green-500 rounded-full border-4 border-stone-50 transform -translate-x-1/2 mt-1"></div>
                      <div className="bg-white p-4 rounded-xl rounded-tl-none border border-stone-200 shadow-sm">
                        <div className="text-xs font-bold text-amber-600 mb-1 tracking-wider uppercase">
                          {t('week')} {act.week ?? (i + 1)}
                        </div>
                        <h4 className="font-bold text-stone-800 text-lg mb-1">
                          {act.activity ? t(act.activity as any) : "Activity details"}
                        </h4>
                        <p className="text-sm text-stone-600 leading-relaxed mb-3">
                          {act.description ? t(act.description as any) : JSON.stringify(act)}
                        </p>
                        
                        {act.expectedDisease && (
                          <div className="bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                             <h5 className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                                <Icons.Bug size={14} /> Expected Disease
                             </h5>
                             <p className="text-sm font-semibold text-red-800 mb-1">{act.expectedDisease}</p>
                             <p className="text-xs text-red-700 leading-relaxed">{act.diseaseSolution}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION TO SAVE TRACKING */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 mt-6 shadow-sm">
                <h4 className="font-bold text-stone-800 mb-3 text-lg flex items-center gap-2">
                  <Icons.Save className="text-green-600" /> Save to Tracker
                </h4>
                <p className="text-sm text-stone-600 mb-4">
                  Log this crop to monitor its growth phases and receive AI-driven insights over time.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => saveToTracker('test')}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-3 rounded-xl shadow-sm transition-colors text-sm border border-stone-200"
                  >
                    Save as Test
                    <span className="block text-[10px] font-normal text-stone-500 mt-0.5">Deleted after 7 days</span>
                  </button>
                  <button
                    onClick={() => saveToTracker('real')}
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl shadow-sm transition-colors text-sm flex flex-col justify-center items-center"
                  >
                    Save as Real
                    <span className="block text-[10px] font-normal text-green-200 mt-0.5">Track till harvest</span>
                  </button>
                </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
