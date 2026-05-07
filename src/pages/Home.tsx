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
  const [locationName, setLocationName] = useState<string>('');
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
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=12`);
            const geo = await res.json();
            if (geo && geo.address) {
              const localArea = geo.address.suburb || geo.address.village || geo.address.town || geo.address.city || geo.address.county || geo.address.state_district;
              if (localArea) setLocationName(localArea);
            }
          } catch(e) {}
        },
        async (error) => {
          console.warn("Geolocation denied or failed, using default", error);
          const w = await fetchWeather(23.0, 79.0);
          setWeather(w);
          setLocationName('Central India');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
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

  const renderIcon = (name: string, size: number = 48, customColor?: string) => {
    const IconComponent = (Icons as any)[name] || Icons.CloudSun;
    const defaultColor = weather?.isDay ? "text-amber-500" : "text-indigo-400";
    return <IconComponent size={size} className={customColor || defaultColor} />;
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
          <div className={`p-5 flex items-center justify-between transition-colors duration-500 ${weather.isDay ? 'bg-gradient-to-br from-blue-50 to-amber-50' : 'bg-gradient-to-br from-slate-800 to-indigo-900'}`}>
            <div className="flex items-center gap-4">
              {renderIcon(weather.iconName)}
              <div>
                <div className={`text-3xl font-bold flex items-center gap-2 ${weather.isDay ? 'text-stone-800' : 'text-white'}`}>
                   {weather.temp}°C
                   {locationName && <span className={`text-sm px-2 py-1 rounded-lg border flex items-center gap-1 font-bold ${weather.isDay ? 'bg-white border-stone-200 text-stone-600' : 'bg-white/10 border-white/20 text-indigo-100'}`}><Icons.MapPin size={10} /> {locationName}</span>}
                </div>
                <div className={`text-sm mt-1 font-medium ${weather.isDay ? 'text-stone-500' : 'text-indigo-200'}`}>
                  {weather.condition === 'good' ? t('weather_good_sowing') : t('weather_rain_likely')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm flex items-center justify-end gap-1 font-bold ${weather.isDay ? 'text-stone-500' : 'text-indigo-100'}`}>
                 <Icons.Droplets size={14} className="text-blue-400" /> {weather.humidity}%
              </div>
              <div className={`text-xs mt-1 ${weather.isDay ? 'text-stone-400' : 'text-indigo-300 opacity-70'}`}>Forecast</div>
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
                <div className={`p-4 ${weather.isDay ? 'bg-stone-50' : 'bg-slate-900'}`}>
                  {/* Expanded Weather Details */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className={`p-3 rounded-2xl flex items-center gap-3 ${weather.isDay ? 'bg-white border border-stone-100' : 'bg-white/5 border border-white/10'}`}>
                      <Icons.Wind size={18} className="text-stone-400" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-stone-400">Wind</div>
                        <div className={`text-sm font-bold ${weather.isDay ? 'text-stone-700' : 'text-indigo-50'}`}>{weather.windSpeed} km/h</div>
                      </div>
                    </div>
                    <div className={`p-3 rounded-2xl flex items-center gap-3 ${weather.isDay ? 'bg-white border border-stone-100' : 'bg-white/5 border border-white/10'}`}>
                      <Icons.Sun size={18} className="text-amber-500" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-stone-400">UV Index</div>
                        <div className={`text-sm font-bold ${weather.isDay ? 'text-stone-700' : 'text-indigo-50'}`}>{weather.uvIndex}</div>
                      </div>
                    </div>
                    <div className={`p-3 rounded-2xl flex items-center gap-3 ${weather.isDay ? 'bg-white border border-stone-100' : 'bg-white/5 border border-white/10'}`}>
                      <Icons.Eye size={18} className="text-blue-400" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-stone-400">Visibility</div>
                        <div className={`text-sm font-bold ${weather.isDay ? 'text-stone-700' : 'text-indigo-50'}`}>{weather.visibility} km</div>
                      </div>
                    </div>
                    <div className={`p-3 rounded-2xl flex items-center gap-3 ${weather.isDay ? 'bg-white border border-stone-100' : 'bg-white/5 border border-white/10'}`}>
                      <Icons.Gauge size={18} className="text-emerald-400" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-stone-400">Pressure</div>
                        <div className={`text-sm font-bold ${weather.isDay ? 'text-stone-700' : 'text-indigo-50'}`}>{weather.pressure} hPa</div>
                      </div>
                    </div>
                    <div className={`p-3 rounded-2xl flex items-center gap-3 ${weather.isDay ? 'bg-white border border-stone-100' : 'bg-white/5 border border-white/10'}`}>
                      <Icons.Sunrise size={18} className="text-amber-400" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-stone-400">Sunrise</div>
                        <div className={`text-sm font-bold ${weather.isDay ? 'text-stone-700' : 'text-indigo-50'}`}>{weather.sunrise}</div>
                      </div>
                    </div>
                    <div className={`p-3 rounded-2xl flex items-center gap-3 ${weather.isDay ? 'bg-white border border-stone-100' : 'bg-white/5 border border-white/10'}`}>
                      <Icons.Sunset size={18} className="text-orange-400" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-stone-400">Sunset</div>
                        <div className={`text-sm font-bold ${weather.isDay ? 'text-stone-700' : 'text-indigo-50'}`}>{weather.sunset}</div>
                      </div>
                    </div>
                  </div>

                  <h3 className={`font-semibold mb-3 text-sm ${weather.isDay ? 'text-stone-700' : 'text-indigo-200'}`}>{t('forecast_7_day')}</h3>
                  <div className="space-y-3">
                    {weather.forecast.map((fc, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className={`w-20 font-medium ${weather.isDay ? 'text-stone-600' : 'text-indigo-300'}`}>{fc.day}</span>
                        <div className="w-8 flex justify-center">
                          {renderIcon(fc.iconName, 20)}
                        </div>
                        <span className={`w-16 text-right flex items-center justify-end gap-1 ${weather.isDay ? 'text-stone-500' : 'text-indigo-400'}`}>
                          {fc.rainProb}% <Icons.CloudRain size={14} className="text-blue-400" />
                        </span>
                        <span className={`w-20 text-right font-bold ${weather.isDay ? 'text-stone-700' : 'text-indigo-50'}`}>
                          {fc.high}° <span className={`font-normal ${weather.isDay ? 'text-stone-400' : 'text-indigo-700'}`}>/ {fc.low}°</span>
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

      {/* Primary Actions */}
      <div 
        onClick={() => navigate('/diagnose')}
        className="mt-8 bg-green-700 rounded-[2rem] p-6 text-white shadow-sm flex items-center justify-between cursor-pointer hover:bg-green-800 transition relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
            <Icons.ScanSearch size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Scan & Diagnose</h3>
            <p className="text-xs text-green-100">AI-powered disease detection</p>
          </div>
        </div>
        <Icons.ChevronRight className="text-green-300 relative z-10" />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Market Widget */}
        <div 
          onClick={() => navigate('/market')}
          className="bg-indigo-600 rounded-[2rem] p-5 text-white shadow-sm cursor-pointer hover:bg-indigo-700 transition relative overflow-hidden"
        >
          <div className="bg-white/20 w-10 h-10 rounded-2xl flex items-center justify-center mb-3">
             <Icons.TrendingUp size={22} className="text-white" />
          </div>
          <div className="font-bold text-sm tracking-tight">{t('nav_market')}</div>
          <div className="text-[10px] text-indigo-100 mt-1 flex items-center gap-1 font-medium">
            Live Mandi rates <Icons.ArrowUpRight size={10} />
          </div>
        </div>
        
        {/* Suggestion Widget */}
        <div 
          onClick={() => navigate('/sow')}
          className="bg-amber-500 rounded-[2rem] p-5 text-white shadow-sm cursor-pointer hover:bg-amber-600 transition relative overflow-hidden"
        >
          <div className="bg-white/20 w-10 h-10 rounded-2xl flex items-center justify-center mb-3">
             <Icons.Sprout size={22} className="text-white" />
          </div>
          <div className="font-bold text-sm tracking-tight">What to Grow?</div>
          <div className="text-[10px] text-amber-100 mt-1 flex items-center gap-1 font-medium">
            AI recommendations <Icons.Sparkles size={10} />
          </div>
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
