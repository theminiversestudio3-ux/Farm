import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAI } from '../context/ModelContext';
import { fetchWeather, WeatherData } from '../data/weather';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';

export default function Home() {
  const { t, lang, setLang } = useLanguage();
  const { generateContent } = useAI();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [aiGreeting, setAiGreeting] = useState<string>('');

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2">
            <Icons.Leaf size={24} className="text-green-600" /> {t('app_name')}
          </h1>
          <p className="text-sm font-medium text-stone-600 mt-1 italic">
            {aiGreeting || t('tagline')}
          </p>
        </div>
      </div>

      {weather ? (
        <motion.div 
          layout
          onClick={() => setExpanded(!expanded)}
          className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer"
        >
          <div className="p-5 flex items-center justify-between bg-gradient-to-br from-stone-50 to-stone-100">
            <div className="flex items-center gap-4">
              {renderIcon(weather.iconName)}
              <div>
                <div className="text-3xl font-bold text-stone-800">{weather.temp}°C</div>
                <div className="text-stone-500 text-sm mt-1">
                  {weather.condition === 'good' ? t('weather_good_sowing') : t('weather_rain_likely')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-stone-500 text-sm flex items-center justify-end gap-1">
                 <Icons.Droplets size={14} className="text-blue-400" /> {weather.humidity}%
              </div>
              <div className="text-stone-400 text-xs mt-1">Tap for details</div>
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
                  <h3 className="font-semibold text-stone-700 mb-3">{t('forecast_7_day')}</h3>
                  <div className="space-y-3">
                    {weather.forecast.map((fc, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="w-20 text-stone-600">{fc.day}</span>
                        <div className="w-8 flex justify-center">
                          {renderIcon(fc.iconName, 20)}
                        </div>
                        <span className="w-16 text-right text-stone-500 flex items-center justify-end gap-1">
                          {fc.rainProb}% <Icons.CloudRain size={14} className="text-blue-400" />
                        </span>
                        <span className="w-20 text-right font-medium text-stone-700">
                          {fc.high}° / {fc.low}°
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
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 flex justify-center items-center">
           <span className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></span>
        </div>
      )}

      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-stone-200 p-5">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Icons.Settings size={20} className="text-stone-500" /> {t('settings' as any) || 'App Settings'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-2">Select Language</label>
            <div className="grid grid-cols-3 gap-2">
              {(['en', 'hi', 'mr'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`p-3 rounded-xl border text-sm font-bold transition-all ${lang === l ? 'bg-green-600 border-green-600 text-white shadow-md' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                >
                  {l === 'en' ? 'English' : l === 'hi' ? 'हिंदी' : 'मराठी'}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2 text-[10px] text-stone-400">
              <Icons.Cpu size={12} />
              AI System: Fully Autonomous (Failover Enabled)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
