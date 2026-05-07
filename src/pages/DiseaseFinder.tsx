import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAI } from '../context/ModelContext';
import { appStore, useAppStore } from '../store/appStore';
import { crops } from '../data/crops';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type DiagnosisHistory = {
  id: string;
  date: number;
  image: string;
  result: string;
};

export default function DiseaseFinder() {
  const { t, lang } = useLanguage();
  const { generateContent } = useAI();
  const store = useAppStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<DiagnosisHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [savedToTracker, setSavedToTracker] = useState(false);
  const [activeLogs, setActiveLogs] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('farm_diagnosis_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch(e) {}
    }
    const savedLogs = localStorage.getItem('farm_growth_logs');
    if (savedLogs) {
      try { setActiveLogs(JSON.parse(savedLogs)); } catch(e) {}
    }
  }, []);

  const saveHistory = (logs: DiagnosisHistory[]) => {
    setHistory(logs);
    try {
      localStorage.setItem('farm_diagnosis_history', JSON.stringify(logs));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.message?.includes('exceeded the quota')) {
        if (logs.length > 1) {
          saveHistory(logs.slice(0, logs.length - 1));
        } else {
          try {
            const noImages = logs.map(l => ({ ...l, image: '' }));
            localStorage.setItem('farm_diagnosis_history', JSON.stringify(noImages));
          } catch(err) {} 
        }
      }
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
             if (width > MAX_WIDTH) {
               height *= MAX_WIDTH / width;
               width = MAX_WIDTH;
             }
          } else {
             if (height > MAX_HEIGHT) {
               width *= MAX_HEIGHT / height;
               height = MAX_HEIGHT;
             }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
             appStore.setDisease({ data: null, errorMsg: null }, dataUrl);
          } else {
             appStore.setDisease({ data: null, errorMsg: null }, reader.result as string);
          }
        };
        if (typeof reader.result === 'string') {
          img.src = reader.result;
        }
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
Please write the response in ${lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English'}.
IMPORTANT: You MUST return the result as a strict JSON object with this EXACT schema:
{
  "diseaseName": "Name of the disease or pest (or 'Healthy')",
  "confidence": "High" | "Medium" | "Low",
  "severity": "Low" | "Moderate" | "High" | "Critical" | "None",
  "diagnosis": "Detailed explanation of what is wrong",
  "immediateAction": "What to do right now",
  "treatments": [
    {
      "type": "Chemical" | "Organic" | "Cultural",
      "instruction": "What to use/do",
      "details": "Dosage or specific instructions"
    }
  ],
  "preventativeMeasures": [
    "Measure 1",
    "Measure 2"
  ]
}`;

      const response = await generateContent(prompt, "You are Ori, an AI designed to respond only with strict JSON objects.", true, store.diseaseImage);
      const cleanJson = response.replace(/```json|```/g, '').trim();
      JSON.parse(cleanJson); // Validate JSON

      appStore.setDisease({ data: cleanJson });
      
      saveHistory([{
        id: Date.now().toString(),
        date: Date.now(),
        image: store.diseaseImage,
        result: cleanJson
      }, ...history].slice(0, 5)); // Keep last 5

      if (activeLogs.length > 0) {
        setSavedToTracker(false);
      }

    } catch (e: any) {
      console.error(e);
      appStore.setDisease({ errorMsg: "⚠️ Sorry, I could not analyze the image right now. Please try again." });
    } finally {
      appStore.setDisease({ loading: false });
    }
  };

  return (
    <div className="p-4 pb-24 min-h-screen bg-stone-50">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Icons.ScanSearch className="text-green-700" /> Disease Finder
          </h2>
          <p className="text-sm text-stone-600 mt-1">Take a photo of a sick plant to get instant solutions.</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 bg-white rounded-xl shadow-sm border border-stone-200 text-stone-600 hover:text-green-700"
          >
            <Icons.History size={20} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <h3 className="font-bold text-sm text-stone-500 uppercase tracking-wider mb-3">Recent Scans</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {history.map((h) => (
                <div 
                  key={h.id} 
                  onClick={() => {
                    appStore.setDisease({ data: h.result, errorMsg: null }, h.image);
                    setShowHistory(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="min-w-[120px] bg-white rounded-xl p-2 border border-stone-200 shadow-sm cursor-pointer"
                >
                  <img src={h.image} alt="Scan" className="w-full h-20 object-cover rounded-lg mb-2" />
                  <div className="text-[10px] text-stone-400 font-medium text-center">
                    {new Date(h.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          className="bg-white rounded-[2rem] shadow-sm border border-stone-200 p-6"
        >
          <div className="flex items-center gap-3 mb-5 border-b border-stone-100 pb-4">
             <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
               <Icons.Stethoscope size={24} />
             </div>
             <h3 className="font-black text-xl text-stone-800">Diagnosis Result</h3>
          </div>
          
          {(() => {
            try {
              const data = typeof store.disease.data === 'string' ? JSON.parse(store.disease.data) : store.disease.data;
              return (
                <div className="space-y-6">
                  {/* Health Status Header */}
                  <div className={`p-4 rounded-xl border ${data.severity === 'Critical' || data.severity === 'High' ? 'bg-red-50 border-red-100 text-red-900' : data.severity === 'Moderate' || data.severity === 'Low' ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-green-50 border-green-100 text-green-900' }`}>
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-lg flex items-center gap-2">
                          {data.diseaseName === 'Healthy' ? <Icons.CheckCircle size={20} className="text-green-600" /> : <Icons.AlertTriangle size={20} className={data.severity === 'Critical' || data.severity === 'High' ? 'text-red-500' : 'text-amber-500'} />}
                          {data.diseaseName}
                       </h4>
                       <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${data.confidence === 'High' ? 'bg-indigo-100 text-indigo-700' : 'bg-stone-200 text-stone-600'}`}>
                         {data.confidence} Confidence
                       </span>
                    </div>
                    <p className="text-sm font-medium opacity-90 mb-4">{data.diagnosis}</p>
                    {/* Health Status Bar */}
                    {(() => {
                      const getHealthScore = (severity: string) => {
                        if (severity === 'None' || severity === 'Healthy' || data.diseaseName === 'Healthy') return 100;
                        if (severity === 'Low') return 80;
                        if (severity === 'Moderate') return 50;
                        if (severity === 'High') return 25;
                        if (severity === 'Critical') return 10;
                        return 50;
                      }
                      const score = getHealthScore(data.severity);
                      const barColor = score > 80 ? 'bg-green-500' : score > 40 ? 'bg-amber-500' : 'bg-red-500';
                      const textColor = score > 80 ? 'text-green-700' : score > 40 ? 'text-amber-700' : 'text-red-700';
                      return (
                        <div>
                          <div className="flex justify-between items-end mb-1.5">
                             <div className="text-[10px] font-bold uppercase opacity-70">Overall Health</div>
                             <div className={`text-sm font-black ${textColor}`}>{score}%</div>
                          </div>
                          <div className="h-2 bg-white/50 rounded-full overflow-hidden w-full relative">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`h-full ${barColor} rounded-full`}
                             ></motion.div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {data.diseaseName !== 'Healthy' && (
                    <>
                      {/* Immediate Action */}
                      <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 border-l-4 border-l-indigo-500">
                        <h5 className="font-bold text-stone-800 mb-1">Immediate Action</h5>
                        <p className="text-sm text-stone-600">{data.immediateAction}</p>
                      </div>

                      {/* Treatments */}
                      {data.treatments && data.treatments.length > 0 && (
                        <div>
                          <h5 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                             <Icons.ShieldCheck size={18} className="text-green-600" /> Treatment Options
                          </h5>
                          <div className="space-y-3">
                            {data.treatments.map((t: any, i: number) => (
                              <div key={i} className="bg-white border border-stone-200 rounded-xl p-3 shadow-sm flex gap-3">
                                 <div className="mt-0.5 text-stone-400">
                                   {t.type === 'Chemical' ? <Icons.FlaskConical size={18} className="text-purple-500" /> : t.type === 'Organic' ? <Icons.Leaf size={18} className="text-green-500" /> : <Icons.Settings size={18} />}
                                 </div>
                                 <div>
                                   <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">{t.type}</div>
                                   <div className="font-medium text-stone-800 text-sm mb-1">{t.instruction}</div>
                                   {t.details && <div className="text-xs text-stone-500 bg-stone-50 p-1.5 rounded-md inline-block">{t.details}</div>}
                                 </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Preventative Measures */}
                  {data.preventativeMeasures && data.preventativeMeasures.length > 0 && (
                    <div>
                       <h5 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
                         <Icons.LeafyGreen size={18} className="text-emerald-600" /> Preventative Measures
                       </h5>
                       <ul className="space-y-2">
                         {data.preventativeMeasures.map((measure: string, i: number) => (
                           <li key={i} className="flex gap-2 text-sm text-stone-600">
                             <Icons.Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                             <span>{measure}</span>
                           </li>
                         ))}
                       </ul>
                    </div>
                  )}
                  {/* Link to Tracker */}
                  {activeLogs.length > 0 && !savedToTracker && (
                    <div className="mt-8 pt-6 border-t border-stone-100">
                       <h5 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                         <Icons.Sprout size={18} className="text-green-600" /> Save to Tracker?
                       </h5>
                       <p className="text-sm text-stone-500 mb-4">Is this diagnosis for one of your active crops?</p>
                       <div className="grid gap-2">
                         {activeLogs.map(log => {
                           const crop = crops.find(c => c.id === log.cropId);
                           return (
                             <button 
                               key={log.id}
                               onClick={() => {
                                 const savedLogsStr = localStorage.getItem('farm_growth_logs');
                                 if (savedLogsStr) {
                                   try {
                                     const savedLogs = JSON.parse(savedLogsStr);
                                     const logIndex = savedLogs.findIndex((l: any) => l.id === log.id);
                                     if (logIndex !== -1) {
                                       if (!savedLogs[logIndex].notes) savedLogs[logIndex].notes = [];
                                       savedLogs[logIndex].notes.push(`Diagnosed with: ${data.diseaseName}`);
                                       localStorage.setItem('farm_growth_logs', JSON.stringify(savedLogs));
                                       setSavedToTracker(true);
                                     }
                                   } catch(e) {}
                                 }
                               }}
                               className="w-full bg-white border border-stone-200 rounded-xl p-3 flex items-center gap-3 hover:border-green-400 hover:bg-green-50 transition text-left shadow-sm"
                             >
                               <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                 <Icons.Leaf size={20} />
                               </div>
                               <div className="flex-1">
                                 <div className="font-bold text-stone-800 text-sm">{crop?.name || 'Crop'}</div>
                                 <div className="text-[10px] text-stone-500 font-medium">Planted: {new Date(log.sowingDate).toLocaleDateString()}</div>
                               </div>
                               <Icons.Plus size={18} className="text-stone-400" />
                             </button>
                           )
                         })}
                       </div>
                    </div>
                  )}

                  {savedToTracker && (
                    <div className="mt-8 pt-6 border-t border-stone-100">
                      <div className="bg-green-50 text-green-800 text-sm font-bold p-3 rounded-xl flex items-center gap-2 justify-center">
                        <Icons.CheckCircle size={18} /> Saved to Tracker
                      </div>
                    </div>
                  )}
                </div>
              );
            } catch (err) {
              return (
                <div className="text-sm text-stone-600">
                  <p>Failed to parse diagnosis details. Raw output:</p>
                  <pre className="mt-2 text-xs bg-stone-100 p-2 rounded whitespace-pre-wrap">{store.disease.data}</pre>
                </div>
              );
            }
          })()}
        </motion.div>
      )}

    </div>
  );
}
