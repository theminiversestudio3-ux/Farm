import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAI } from '../context/ModelContext';
import { fetchWeather, WeatherData } from '../data/weather';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { crops } from '../data/crops';
import * as Icons from 'lucide-react';
import { appStore } from '../store/appStore';

export default function Home() {
  const { t, lang, setLang } = useLanguage();
  const { generateContent } = useAI();
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [aiGreeting, setAiGreeting] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [activeLogs, setActiveLogs] = useState<any[]>([]);
  const [recentDiagnosis, setRecentDiagnosis] = useState<any>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const w = await fetchWeather(position.coords.latitude, position.coords.longitude);
          setWeather(w);
        },
        async (error) => {
          console.warn("Geolocation denied or failed, using default", error);
          const w = await fetchWeather(23.0, 79.0);
          setWeather(w);
        }
      );
    } else {
      fetchWeather(23.0, 79.0).then(setWeather);
    }

    // Load active tracker logs natively from local storage
    const savedLogs = localStorage.getItem('farm_growth_logs');
    if (savedLogs) {
      try {
         const parsed = JSON.parse(savedLogs);
         setActiveLogs(parsed.slice(0, 2)); // Get top 2
      } catch(e) {}
    }

    // Load recent diagnosis
    const savedDiagnosis = localStorage.getItem('farm_diagnosis_history');
    if (savedDiagnosis) {
      try {
        const parsed = JSON.parse(savedDiagnosis);
        if (parsed.length > 0) {
          setRecentDiagnosis(parsed[0]);
        }
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const greeting = await generateContent(
          `Give a short, 1-sentence supportive greeting to a farmer in ${lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English'}. Mention the importance of their hard work. Keep it under 15 words.`
        );
        setAiGreeting(greeting);
      } catch (e) {
        setAiGreeting(t('tagline'));
      }
    };
    fetchGreeting();
  }, [lang]);

  const renderIcon = (name: string, size: number = 48) => {
    const IconComponent = (Icons as any)[name] || Icons.CloudSun;
    return <IconComponent size={size} className="text-amber-500" />;
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2">
            <Icons.Leaf size={24} className="text-green-600" /> {t('app_name')}
          </h1>
          <p className="text-sm font-medium text-stone-600 mt-1 italic">
            {aiGreeting || t('tagline')}
          </p>
        </div>
        <div className="relative z-50">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-white rounded-full shadow-sm border border-stone-200 text-stone-600 hover:text-green-700 transition"
          >
            <Icons.Settings size={20} />
          </button>
          
          {/* Compact Settings Dropdown */}
          <AnimatePresence>
            {showSettings && (
              <>
                <div className="fixed inset-0" onClick={() => setShowSettings(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, transformOrigin: 'top right' }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden"
                >
                  <div className="p-3 bg-stone-50 border-b border-stone-100 font-bold text-stone-700 text-sm flex items-center gap-2">
                    <Icons.Globe size={16} className="text-stone-500" /> Language
                  </div>
                  <div className="p-2 space-y-1">
                    {(['en', 'hi', 'mr'] as const).map(l => (
                      <button
                        key={l}
                        onClick={() => { setLang(l); setShowSettings(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-all ${lang === l ? 'bg-green-100 text-green-800' : 'text-stone-600 hover:bg-stone-50'}`}
                      >
                        {l === 'en' ? 'English' : l === 'hi' ? 'हिंदी' : 'मराठी'}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 border-t border-stone-100 text-xs text-stone-400 bg-stone-50 text-center">
                    AI: Autonomous Mode
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {weather ? (
        <motion.div 
          layout
          onClick={() => setExpanded(!expanded)}
          className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden cursor-pointer relative z-10"
        >
          <div className="p-5 flex items-center justify-between bg-gradient-to-br from-stone-50 to-stone-100">
            <div className="flex items-center gap-4">
              {renderIcon(weather.iconName)}
              <div>
                <div className="text-3xl font-bold text-stone-800">{weather.temp}°C</div>
                <div className="text-stone-500 text-sm mt-1 font-medium">
                  {weather.condition === 'good' ? t('weather_good_sowing') : t('weather_rain_likely')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-stone-500 text-sm flex items-center justify-end gap-1 font-bold">
                 <Icons.Droplets size={14} className="text-blue-400" /> {weather.humidity}%
              </div>
              <div className="text-stone-400 text-xs mt-1">Forecast</div>
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-stone-200"
              >
                <div className="p-4 bg-stone-50">
                  <h3 className="font-semibold text-stone-700 mb-3 text-sm">{t('forecast_7_day')}</h3>
                  <div className="space-y-3">
                    {weather.forecast.map((fc, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="w-20 text-stone-600 font-medium">{fc.day}</span>
                        <div className="w-8 flex justify-center">
                          {renderIcon(fc.iconName, 20)}
                        </div>
                        <span className="w-16 text-right text-stone-500 flex items-center justify-end gap-1">
                          {fc.rainProb}% <Icons.CloudRain size={14} className="text-blue-400" />
                        </span>
                        <span className="w-20 text-right font-bold text-stone-700">
                          {fc.high}° <span className="text-stone-400 font-normal">/ {fc.low}°</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 p-8 flex justify-center items-center">
           <span className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></span>
        </div>
      )}

      {/* Widgets Area */}
      <h3 className="font-bold text-lg text-stone-800 mt-8 mb-4">Farm Overview</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Quick Action Widget */}
        <div 
          onClick={() => navigate('/diagnose')}
          className="bg-green-700 rounded-3xl p-5 text-white shadow-sm cursor-pointer hover:bg-green-800 transition"
        >
          <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mb-3">
             <Icons.ScanSearch size={22} className="text-white" />
          </div>
          <div className="font-bold">Scan Plant</div>
          <div className="text-xs text-green-100 mt-1">Instant disease diagnosis</div>
        </div>
        
        {/* Quick Action Widget 2 */}
        <div 
          onClick={() => navigate('/sow')}
          className="bg-amber-500 rounded-3xl p-5 text-white shadow-sm cursor-pointer hover:bg-amber-600 transition"
        >
          <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mb-3">
             <Icons.Sprout size={22} className="text-white" />
          </div>
          <div className="font-bold">What to Grow?</div>
          <div className="text-xs text-amber-100 mt-1">AI suggestions</div>
        </div>
      </div>

      {recentDiagnosis && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-lg text-stone-800">Diagnosis History</h3>
             <button onClick={() => navigate('/diagnose')} className="text-sm font-bold text-green-700 flex items-center gap-1">
               Open <Icons.ChevronRight size={16} />
             </button>
          </div>
          <div onClick={() => {
            appStore.setDisease({ data: recentDiagnosis.result, errorMsg: null }, recentDiagnosis.image);
            navigate('/diagnose');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-green-300 transition">
             <img src={recentDiagnosis.image} alt="Recent scan" className="w-16 h-16 rounded-xl object-cover bg-stone-100" />
             <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                   <Icons.History size={14} className="text-indigo-500" />
                   <span className="text-xs text-stone-500">{new Date(recentDiagnosis.date).toLocaleDateString()}</span>
                </div>
                <div className="text-sm font-bold text-stone-800 line-clamp-1">
                   {(() => {
                    try {
                      const parsed = JSON.parse(recentDiagnosis.result);
                      return <span className={`${parsed.diseaseName === 'Healthy' ? 'text-green-600' : 'text-stone-800'}`}>{parsed.diseaseName}</span>;
                    } catch (e) {
                      return recentDiagnosis.result.replace(/#/g, '');
                    }
                  })()}
                </div>
             </div>
          </div>
        </div>
      )}

      {activeLogs.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-lg text-stone-800">Growth Progress</h3>
             <button onClick={() => navigate('/tracker')} className="text-sm font-bold text-green-700 flex items-center gap-1">
               See All <Icons.ChevronRight size={16} />
             </button>
          </div>
          <div className="space-y-4">
            {activeLogs.map((log, i) => {
               const crop = crops.find(c => c.id === log.cropId);
               const STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvesting'];
               const growthPeriodDays = crop?.growthPeriodDays || 100;
               const startMs = new Date(log.sowingDate).getTime();
               const nowMs = Date.now();
               let elapsedDays = Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24));
               if (elapsedDays < 0) elapsedDays = 0;
               let progress = Math.min(100, (elapsedDays / growthPeriodDays) * 100);
               
               let calculatedStage = STAGES[0];
               if (progress >= 90) calculatedStage = STAGES[4];
               else if (progress >= 65) calculatedStage = STAGES[3];
               else if (progress >= 40) calculatedStage = STAGES[2];
               else if (progress >= 15) calculatedStage = STAGES[1];
               const currentStage = log.stage || calculatedStage;

               return (
                 <div key={i} onClick={() => navigate('/tracker')} className="bg-white border border-stone-200 rounded-2xl p-5 cursor-pointer hover:border-green-300 transition shadow-sm pb-6">
                   <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center gap-3">
                       <div className="bg-gradient-to-br from-green-50 to-green-100 p-2.5 rounded-xl text-green-700 shadow-inner">
                         <Icons.Sprout size={24} />
                       </div>
                       <div>
                         <div className="font-bold text-stone-800 flex items-center gap-2">
                           {crop?.name || 'Unknown'} 
                           {log.mode === 'test' && <span className="bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold">Test</span>}
                         </div>
                         <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1 font-medium">
                           <Icons.Calendar size={12}/> Planted: {new Date(log.sowingDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                         </div>
                       </div>
                     </div>
                     <Icons.ChevronRight size={18} className="text-stone-300" />
                   </div>
                   
                   <div>
                     <div className="flex justify-between items-end mb-2">
                       <div className="text-xs font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">{currentStage}</div>
                       <div className="text-sm font-black text-green-700">{Math.round(progress)}%</div>
                     </div>
                     <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden w-full relative">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${progress}%` }}
                           transition={{ duration: 1, ease: 'easeOut' }}
                           className={`h-full ${progress >= 100 ? 'bg-amber-500' : 'bg-green-500'} rounded-full`}
                        ></motion.div>
                     </div>
                   </div>
                 </div>
               )
            })}
          </div>
        </div>
      )}
    </div>
  );
}
