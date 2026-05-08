import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAI } from '../context/ModelContext';
import { crops } from '../data/crops';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GrowthLog {
  id: string;
  cropId: string;
  sowingDate: string;
  landArea: string;
  stage?: 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvesting';
  notes: string[];
  mode?: 'test' | 'real';
  createdAt?: number;
  analysis?: string;
  healthStatus?: 'Healthy' | 'Warning' | 'Critical';
}

const STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvesting'];

export default function GrowthTracker() {
  const { t, lang } = useLanguage();
  const { generateContent } = useAI();
  const [logs, setLogs] = useState<GrowthLog[]>([]);
  const [showSurvey, setShowSurvey] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState<Record<string, boolean>>({});

  // Survey Form State
  const [newCropId, setNewCropId] = useState('');
  const [newSowingDate, setNewSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [newArea, setNewArea] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('farm_growth_logs');
    if (saved) {
      try {
        let parsedLogs: GrowthLog[] = JSON.parse(saved);
        
        // Auto-delete 'test' logs older than 7 days
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const filteredLogs = parsedLogs.filter(log => {
          if (log.mode === 'test' && log.createdAt) {
            return (now - log.createdAt) < sevenDaysMs;
          }
          return true;
        });

        if (filteredLogs.length !== parsedLogs.length) {
          localStorage.setItem('farm_growth_logs', JSON.stringify(filteredLogs));
          setLogs(filteredLogs);
        } else {
          setLogs(parsedLogs);
        }
      } catch (e) {}
    }
  }, []);

  const saveLogs = (updated: GrowthLog[]) => {
    setLogs(updated);
    localStorage.setItem('farm_growth_logs', JSON.stringify(updated));
  };

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropId || !newArea) return;

    const newLog: GrowthLog = {
      id: Date.now().toString(),
      cropId: newCropId,
      sowingDate: newSowingDate,
      landArea: newArea,
      mode: 'real',
      createdAt: Date.now(),
      notes: [`Planted ${newArea} units on ${newSowingDate}.`]
    };

    saveLogs([...logs, newLog]);
    setShowSurvey(false);
    setNewCropId('');
    setNewArea('');
  };

  const deleteLog = (id: string) => {
    saveLogs(logs.filter(l => l.id !== id));
  };

  const updateStage = (id: string, stage: GrowthLog['stage']) => {
    saveLogs(logs.map(l => l.id === id ? { ...l, stage, notes: [...l.notes, `Manual stage override to ${stage} on ${new Date().toLocaleDateString()}.`] } : l));
  };

  const setAnalysis = (id: string, analysis: string | null) => {
    saveLogs(logs.map(l => l.id === id ? { ...l, analysis: analysis || undefined } : l));
  };

  const analyzeGrowth = async (log: GrowthLog, calculatedStage: string, progress: number, daysLeft: number) => {
    setLoadingAnalysis(prev => ({ ...prev, [log.id]: true }));
    setAnalysis(log.id, null);
    try {
      const crop = crops.find(c => c.id === log.cropId);
      const daysSinceSowing = Math.floor((Date.now() - new Date(log.sowingDate).getTime()) / (1000 * 60 * 60 * 24));
      
      const prompt = `You are Ori, an expert AI agronomist providing a real-time Continuous Growth Check.
Analyze the growth of a ${crop?.name} crop.
Sowing Date: ${log.sowingDate} (${daysSinceSowing} days ago).
Calculated Stage: ${calculatedStage} (${Math.round(progress)}% complete, ${daysLeft} days until expected harvest).
User Reported Overrides: ${log.stage ? 'User marked as: ' + log.stage : 'None'}.
History: ${log.notes.join(' -> ')}.

Based on this timeline, suggest:
1. Real-time Status: Is it on track?
2. Smart Action: What exactly should the farmer do in the next 3-5 days? (Irrigation, fertilization, pests to monitor)
3. Pro-Tip for this specific stage.

Focus on advanced, precise recommendations.
IMPORTANT: You MUST return the result as a strict JSON object with this EXACT schema:
{
  "status": "On Track" | "Needs Attention" | "Critical" | "Calibrating",
  "statusAnalysis": "Detailed analysis of the current biological phase...",
  "actionProtocolName": "Name of the protocol for the next 3-5 days",
  "actions": [
    {
      "icon": "emoji like 💧, 🧪, 🛡️",
      "category": "Irrigation | Fertilization | Pest Control",
      "action": "Specific action to take",
      "detail": "Frequency, reasoning, or observation details"
    }
  ],
  "proTipTitle": "Pro tip title",
  "proTipDescription": "Detailed pro tip",
  "nextCheckIn": "When to check in next"
}`;

      const response = await generateContent(prompt, "You are Ori, an AI designed to respond only with strict JSON objects.");
      const cleanJson = response.replace(/```json|```/g, '').trim();
      JSON.parse(cleanJson); // Validate JSON
      setAnalysis(log.id, cleanJson);
    } catch (e) {
      setAnalysis(log.id, "error");
    } finally {
      setLoadingAnalysis(prev => ({ ...prev, [log.id]: false }));
    }
  };

  return (
    <div className="p-4 pb-24 min-h-screen bg-stone-50">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Icons.Activity className="text-green-700" /> {(t as any)('Continuous Tracker')}
          </h2>
          <p className="text-sm text-stone-600 mt-1">{(t as any)('Real-time monitoring from seed to harvest.')}</p>
        </div>
        <button 
          onClick={() => setShowSurvey(true)}
          className="bg-green-700 text-white p-2.5 rounded-full shadow-lg hover:bg-green-800 transition transform active:scale-95"
        >
          <Icons.Plus size={24} />
        </button>
      </div>

      {!showSurvey && logs.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-stone-200 mt-10">
          <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <Icons.Radar size={32} className="text-green-600" />
          </div>
          <h3 className="font-bold text-stone-800 mb-2">{(t as any)('No Active Logs')}</h3>
          <p className="text-sm text-stone-500 mb-6">{(t as any)('Start tracking real-time growth progress for your farm.')}</p>
          <button 
            onClick={() => setShowSurvey(true)}
            className="bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm"
          >
            {(t as any)('Start Tracking')}
          </button>
        </div>
      )}

      <AnimatePresence>
        {showSurvey && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-stone-800">{(t as any)('Add Crop to Tracker')}</h3>
              <button onClick={() => setShowSurvey(false)} className="text-stone-400 hover:text-stone-600">
                 <Icons.X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCrop} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">{(t as any)('What did you plant?')}</label>
                <select 
                  required
                  value={newCropId}
                  onChange={(e) => setNewCropId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 outline-none focus:border-green-500 bg-stone-50"
                >
                  <option value="">{(t as any)('Select a crop...')}</option>
                  {crops.map(c => <option key={c.id} value={c.id}>{(t as any)(c.id) || c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">{(t as any)('Sowing Date')}</label>
                <input 
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]} // Cannot sow in the future
                  value={newSowingDate}
                  onChange={(e) => setNewSowingDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 outline-none focus:border-green-500 bg-stone-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">{(t as any)('Land Area')}</label>
                <input 
                  type="text"
                  required
                  placeholder={(t as any)('e.g. 2 Acres, 1 Hectare')}
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 outline-none focus:border-green-500 bg-stone-50"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-green-800 transition flex justify-center items-center gap-2"
              >
                <Icons.Save size={18} /> {(t as any)('Add Crop')}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {logs.map((log) => {
          const crop = crops.find(c => c.id === log.cropId);
          const growthPeriodDays = crop?.growthPeriodDays || 100;
          
          const startMs = new Date(log.sowingDate).getTime();
          const nowMs = Date.now();
          let elapsedDays = Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24));
          if (elapsedDays < 0) elapsedDays = 0;

          let progress = Math.min(100, (elapsedDays / growthPeriodDays) * 100);
          const daysLeft = Math.max(0, growthPeriodDays - elapsedDays);
          
          let calculatedStage = STAGES[0];
          if (progress >= 90) calculatedStage = STAGES[4];
          else if (progress >= 65) calculatedStage = STAGES[3];
          else if (progress >= 40) calculatedStage = STAGES[2];
          else if (progress >= 15) calculatedStage = STAGES[1];

          // Use manual stage if available
          const currentStage = log.stage || calculatedStage;
          
          const harvestDateMs = startMs + growthPeriodDays * 24 * 60 * 60 * 1000;
          const harvestDate = new Date(harvestDateMs).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

          return (
             <div key={log.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-stone-200 overflow-hidden relative">
              {log.mode === 'test' && (
                <div className="absolute top-0 right-0 bg-stone-100 text-stone-500 text-[9px] uppercase font-bold px-3 py-1 rounded-bl-xl border-l border-b border-stone-200">
                  {(t as any)('Simulation (Test)')}
                </div>
              )}
              
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-2xl text-green-700 shadow-inner">
                    <Icons.Sprout size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-800 text-lg flex items-center gap-2">
                      {(t as any)(crop?.id || 'unknown') || crop?.name}
                      {log.healthStatus && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider ${
                          log.healthStatus === 'Healthy' ? 'bg-green-100 text-green-700' :
                          log.healthStatus === 'Warning' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {log.healthStatus}
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                       <Icons.MapPin size={12} className="opacity-70" /> {log.landArea}
                       <span className="opacity-50">|</span>
                       <Icons.Calendar size={12} className="opacity-70" /> {(t as any)('Planted')} {new Date(log.sowingDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteLog(log.id)} className="text-stone-300 hover:text-red-500 p-1">
                   <Icons.Trash2 size={20} />
                </button>
              </div>

              {/* Progress Bar & Real-time Stats */}
              <div className="bg-stone-50 rounded-2xl p-4 mb-4 border border-stone-100 shadow-inner">
                 <div className="flex justify-between items-end mb-2">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-green-600 tracking-wider mb-1">{(t as any)('Current Stage')}</div>
                      <div className="font-bold text-stone-800 flex items-center gap-2">
                        {currentStage} {log.stage && <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded uppercase">{(t as any)('Manual Override')}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-green-700 tracking-tight leading-none">{Math.round(progress)}<span className="text-sm font-bold opacity-50">%</span></div>
                    </div>
                 </div>

                 {/* Bar */}
                 <div className="h-3 bg-stone-200 rounded-full overflow-hidden flex w-full relative mb-3">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                     transition={{ duration: 1, ease: 'easeOut' }}
                     className={`h-full ${progress >= 100 ? 'bg-amber-500' : 'bg-green-600'} rounded-full`}
                   ></motion.div>
                 </div>

                 <div className="flex justify-between text-xs text-stone-500 font-medium">
                    <div className="flex items-center gap-1"><Icons.Clock size={12} /> {elapsedDays} days elapsed</div>
                    {daysLeft > 0 ? (
                      <div className="flex items-center gap-1 text-stone-700"><Icons.CalendarCheck size={12}/> {daysLeft} days to harvest</div>
                    ) : (
                      <div className="text-amber-600 font-bold">Ready to Harvest!</div>
                    )}
                 </div>
                 <div className="text-center text-[10px] text-stone-400 mt-2 font-medium">
                   Expected Harvest: {harvestDate}
                 </div>
              </div>

              {/* Log Notes / Diagnosis History */}
              {log.notes && log.notes.length > 1 && (
                 <div className="mb-4">
                    <div className="text-xs font-semibold text-stone-500 mb-2 flex items-center gap-1.5">
                       <Icons.FileText size={14} /> {(t as any)('History & Diagnoses')}
                    </div>
                    <div className="space-y-1">
                      {log.notes.slice(-3).map((note, i) => (
                        <div key={i} className="text-xs text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-100">
                           {note.includes('Diagnosed with:') ? <Icons.Stethoscope size={12} className="inline mr-1 text-indigo-500" /> : <Icons.Sprout size={12} className="inline mr-1 text-green-500" />}
                           {note}
                        </div>
                      ))}
                    </div>
                 </div>
              )}

              {/* Mini Manual Stage Override */}
              <div className="mb-5">
                 <div className="text-xs font-semibold text-stone-500 mb-2 flex items-center gap-1.5">
                    <Icons.SlidersHorizontal size={14} /> {(t as any)('Adjust Stage Manually')}
                 </div>
                 <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                   {STAGES.map((s) => (
                     <button 
                      key={s}
                      onClick={() => updateStage(log.id, s as any)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        currentStage === s 
                          ? 'bg-stone-800 text-white border-stone-800 shadow-md' 
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                     >
                       {s}
                     </button>
                   ))}
                 </div>
              </div>

              <button 
                onClick={() => analyzeGrowth(log, calculatedStage, progress, daysLeft)}
                disabled={loadingAnalysis[log.id]}
                className="w-full bg-indigo-50 hover:bg-indigo-100 disabled:bg-stone-100 text-indigo-700 disabled:text-stone-400 border border-indigo-200 disabled:border-stone-200 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-sm"
              >
                {loadingAnalysis[log.id] ? <Icons.Loader2 className="animate-spin" size={18} /> : <Icons.Activity size={18} />}
                {loadingAnalysis[log.id] ? (t as any)('Analyzing Real-time Data...') : (t as any)('Run Smart Growth Check')}
              </button>

              <AnimatePresence>
                {log.analysis && log.analysis !== "error" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    {(() => {
                      try {
                        const data = JSON.parse(log.analysis);
                        return (
                          <div className="mt-4 bg-white rounded-2xl border border-indigo-100 shadow-[0_0_15px_rgba(79,70,229,0.05)] text-sm relative">
                             <div className="flex justify-between items-center bg-indigo-50/50 p-4 border-b border-indigo-100 rounded-t-2xl">
                               <h4 className="font-bold text-indigo-900 m-0 flex items-center gap-2">
                                  <Icons.Sparkles size={16} className="text-indigo-500" /> {(t as any)('AI Growth Insight')}
                               </h4>
                               <button onClick={() => setAnalysis(log.id, null)} className="text-indigo-400 hover:text-indigo-600 bg-white shadow-sm p-1.5 rounded-full transition-colors">
                                  <Icons.X size={14} />
                               </button>
                             </div>
                             
                             <div className="p-5 space-y-6">
                                {/* Status Section */}
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                                      data.status.includes('Track') ? 'bg-green-100 text-green-700' :
                                      data.status.includes('Critical') ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                      {data.status}
                                    </span>
                                    <h5 className="font-bold text-stone-800 text-base">{(t as any)('Real-time Status')}</h5>
                                  </div>
                                  <p className="text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">{data.statusAnalysis}</p>
                                </div>

                                {/* Actions Section */}
                                <div>
                                  <h5 className="font-bold text-stone-800 text-base mb-3 flex items-center gap-2">
                                    <Icons.ListTodo size={16} className="text-indigo-500" /> 
                                    {data.actionProtocolName}
                                  </h5>
                                  <div className="grid gap-3">
                                    {data.actions.map((act: any, idx: number) => (
                                      <div key={idx} className="bg-white border border-stone-200 p-3 rounded-xl flex gap-3 shadow-sm">
                                        <div className="text-2xl mt-0.5">{act.icon}</div>
                                        <div>
                                          <div className="font-bold text-stone-800 mb-1">{act.category}</div>
                                          <p className="text-stone-700 font-medium mb-1">{act.action}</p>
                                          <p className="text-xs text-stone-500 bg-stone-50 p-1.5 rounded-md inline-block">{act.detail}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Pro Tip */}
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-xl shadow-inner">
                                  <h5 className="font-bold text-amber-900 flex items-center gap-2 mb-2">
                                    <Icons.Lightbulb size={16} className="text-amber-600" />
                                    {(t as any)("Ori's Pro-Tip:")} {data.proTipTitle}
                                  </h5>
                                  <p className="text-amber-800/80 text-sm leading-relaxed">{data.proTipDescription}</p>
                                </div>

                                {/* Next Check In */}
                                <div className="text-center text-xs font-semibold text-stone-500 pt-3 border-t border-stone-100">
                                  <Icons.CalendarClock size={14} className="inline mr-1 mb-0.5 opacity-70" />
                                  {(t as any)('Next Check-in:')} {data.nextCheckIn}
                                </div>
                             </div>
                          </div>
                        );
                      } catch (err) {
                        return (
                          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm relative">
                             <button onClick={() => setAnalysis(log.id, null)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1">
                                <Icons.X size={14} />
                             </button>
                             Failed to parse analysis data. Try again.
                          </div>
                        );
                      }
                    })()}
                  </motion.div>
                )}
                {log.analysis === "error" && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
                     ⚠️ Unable to analyze growth at this moment. Please check your connection.
                   </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

