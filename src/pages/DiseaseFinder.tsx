import { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAI } from '../context/ModelContext';
import { appStore, useAppStore } from '../store/appStore';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

export default function DiseaseFinder() {
  const { t, lang } = useLanguage();
  const { generateContent } = useAI();
  const store = useAppStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        appStore.setDisease({ data: null, errorMsg: null }, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!store.diseaseImage) return;
    appStore.setDisease({ loading: true, data: null, errorMsg: null });
    try {

      const prompt = `You are a plant pathologist and expert AI farmer assistant. 
Examine this plant image.
1. Identify the crop if possible.
2. Identify the disease or pest affecting it. If it looks healthy, say so.
3. Provide a detailed, step-by-step solution or treatment plan (chemical and organic if applicable).
Please write the response in ${lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English'}, formatting it cleanly with Markdown headers and bullet points.`;

      const response = await generateContent(prompt, "You are Ori, an advanced AI farmer companion.", true, store.diseaseImage);

      appStore.setDisease({ data: response.trim() });
    } catch (e: any) {
      console.error(e);
      appStore.setDisease({ errorMsg: "⚠️ Sorry, I could not analyze the image right now. Please try again." });
    } finally {
      appStore.setDisease({ loading: false });
    }
  };

  return (
    <div className="p-4 pb-24 min-h-screen bg-stone-50">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <Icons.ScanSearch className="text-green-700" /> Disease Finder
        </h2>
        <p className="text-sm text-stone-600 mt-1">Take a photo of a sick plant to get instant solutions.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 mb-6 text-center">
        {store.diseaseImage ? (
          <div className="relative rounded-xl overflow-hidden mb-4 border border-stone-200 bg-stone-100 flex justify-center items-center h-64">
             <img src={store.diseaseImage} alt="Captured plant" className="max-h-full object-contain" />
             <button 
               onClick={() => { appStore.setDisease({ data: null, errorMsg: null }, null); }}
               className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
             >
               <Icons.X size={20} />
             </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-green-300 rounded-xl bg-green-50/50 p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 transition-colors mb-4 h-64"
          >
            <Icons.Camera size={48} className="text-green-600 mb-4 opacity-80" />
            <p className="text-stone-700 font-medium mb-1">Upload or Take Photo</p>
            <p className="text-stone-500 text-xs">Tap here to open camera or gallery</p>
          </div>
        )}

        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleImageCapture}
        />

        <button
          onClick={analyzeImage}
          disabled={!store.diseaseImage || store.disease.loading}
          className="w-full bg-green-700 hover:bg-green-800 disabled:bg-stone-300 disabled:text-stone-500 text-white font-bold py-3.5 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2"
        >
          {store.disease.loading ? (
            <>
              <Icons.Loader2 className="animate-spin" /> Analyzing Image...
            </>
          ) : (
            <>
              <Icons.Sparkles size={20} /> Diagnose Plant
            </>
          )}
        </button>
      </div>

      {store.disease.errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6 text-sm">
          {store.disease.errorMsg}
        </div>
      )}

      {store.disease.data && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-green-200 p-5"
        >
          <h3 className="font-bold text-lg text-green-800 mb-3 flex items-center gap-2">
             <Icons.Stethoscope size={20} /> Diagnosis Result
          </h3>
          <div className="prose prose-sm prose-green max-w-none text-stone-700">
             {/* Simple markdown render or text split */}
             {(store.disease.data as string).split('\n').map((line, i) => {
               if (line.startsWith('##')) return <h4 key={i} className="font-bold text-stone-800 mt-4 mb-2">{line.replace(/#/g, '').trim()}</h4>
               if (line.startsWith('#')) return <h3 key={i} className="font-bold text-green-700 mt-4 mb-2">{line.replace(/#/g, '').trim()}</h3>
               if (line.startsWith('* ') || line.startsWith('- ')) return <li key={i} className="ml-4 mb-1">{line.substring(2)}</li>
               if (line.trim() === '') return <div key={i} className="h-2"></div>
               return <p key={i} className="mb-2 leading-relaxed">{line}</p>
             })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
