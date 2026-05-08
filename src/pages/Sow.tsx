import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAI } from '../context/ModelContext';
import { crops, Crop } from '../data/crops';
import { fetchWeather } from '../data/weather';
import { appStore, useAppStore } from '../store/appStore';
import * as Icons from 'lucide-react';

export default function Sow() {
  const { t } = useLanguage();
  const { generateContent } = useAI();
  const navigate = useNavigate();
  const store = useAppStore();
  
  const [soilType, setSoilType] = useState('');

  const fetchSuggestions = async (lat: number, lon: number, soil: string) => {
    try {
      appStore.setSow({ errorMsg: null });
      // Free reverse geocoding to give context to Ori
      const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      const geoData = await geoRes.json();
      const regionInfo = `${geoData.city || ''}, ${geoData.principalSubdivision || ''}, ${geoData.countryName || ''}`;

      const weatherData = await fetchWeather(lat, lon);
      const forecastSummary = weatherData.forecast.slice(0, 3).map(f => `${f.day}: ${f.high}°/${f.low}°, Rain Prob: ${f.rainProb}%`).join(' | ');

      const monthId = new Date().getMonth() + 1; // 1-12
      
      const prompt = `You are Ori, an expert AI farming assistant. 
The user is located in ${regionInfo} (Lat: ${lat}, Lon: ${lon}).
The user has specified their soil type as: "${soil || 'Unknown / Let AI analyze based on location'}".
The current month is ${monthId} (1=Jan, 12=Dec).
The short-term weather forecast is: ${forecastSummary}. Currently it is ${weatherData.temp}°C and ${weatherData.humidity}% humidity.
We have the following crops in our database:
${crops.map(c => `- ${c.id}: ${c.name} (Ideal sowing months: ${c.idealSowingWindow.join(', ')})`).join('\n')}

Based on the region's climate, the short-term weather forecast, the specified soil type, and the current month, suggest the top 3-4 most suitable crops from the list above. Return a JSON array of strings containing ONLY the crop IDs that match our database.`;

      const aiResponse = await generateContent(prompt, "You are Ori, an AI designed to respond with JSON arrays of crop IDs.");
      
      // Clean the response in case it has markdown markers
      const cleanJson = aiResponse.replace(/```json|```/g, '').trim();
      const suggestedIds = JSON.parse(cleanJson);
      
      let filtered = crops.filter(c => suggestedIds.includes(c.id));
      
      if (filtered.length === 0) {
        filtered = crops.slice(0, 3); // Fallback
      }
      
      // Sort based on the order from AI
      filtered.sort((a, b) => suggestedIds.indexOf(a.id) - suggestedIds.indexOf(b.id));
      appStore.setSow({ data: filtered });
    } catch (e: any) {
      console.error("AI suggestion failed", e);
      appStore.setSow({ errorMsg: "AI service temporarily unavailable. Showing default recommendations.", data: crops.slice(0, 3) });
    } finally {
      appStore.setSow({ loading: false });
    }
  };

  const handleSuggest = () => {
    appStore.setSow({ loading: true });
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await fetchSuggestions(position.coords.latitude, position.coords.longitude, soilType);
        },
        async (error) => {
          console.warn("Geolocation denied or failed, using default (Central India)", error);
          await fetchSuggestions(23.0, 79.0, soilType); // Default approximation
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      fetchSuggestions(23.0, 79.0, soilType);
    }
  };

  const handleCropSelect = (id: string) => {
    navigate(`/crop/${id}`);
  };

  const renderIcon = (name: string, size: number = 24, className: string = "text-green-600") => {
    const IconComponent = (Icons as any)[name] || Icons.Sprout;
    return <IconComponent size={size} className={className} />;
  };

  return (
    <div className="p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-stone-800">{t('nav_sow')}</h2>
      </div>

      <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 shadow-sm mb-8">
        <h3 className="font-semibold text-lg text-stone-800 mb-2 flex items-center justify-between">
          <span>{t('find_best_crops_title')}</span>
          {store.sow.data && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{t('powered_by_ori' as any)}</span>}
        </h3>
        <p className="text-sm text-stone-500 mb-4">
          Based on your location, soil, and season.
        </p>

        <div className="mb-4">
           <label className="block text-xs font-semibold text-stone-600 mb-1">Soil Type (Optional)</label>
           <select 
             value={soilType}
             onChange={(e) => setSoilType(e.target.value)}
             className="w-full p-3 rounded-xl border border-stone-300 outline-none focus:border-green-500 bg-white"
           >
             <option value="">Let AI analyze based on location</option>
             <option value="Alluvial Soil">Alluvial Soil (Doam, Loam)</option>
             <option value="Black Soil">Black Soil (Regur)</option>
             <option value="Red Soil">Red Soil</option>
             <option value="Laterite Soil">Laterite Soil</option>
             <option value="Arid/Desert Soil">Arid / Sandy Soil</option>
             <option value="Mountain/Forest Soil">Mountain / Forest Soil</option>
           </select>
        </div>

        {store.sow.errorMsg && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 text-sm flex items-start gap-2">
            <Icons.AlertCircle className="shrink-0 mt-0.5" size={16} />
            <p>{store.sow.errorMsg}</p>
          </div>
        )}

        <button
          onClick={handleSuggest}
          disabled={store.sow.loading}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 rounded-xl shadow-sm transition-colors relative"
        >
          {store.sow.loading ? (
            <span className="flex items-center justify-center gap-2">
               <Icons.Loader2 className="animate-spin text-white/50" />
              Ori is finding best crops...
            </span>
          ) : t('suggest_best_crops')}
        </button>

        {store.sow.data && (
          <div className="mt-6 space-y-3">
            {store.sow.data.map((crop, idx) => (
              <div 
                key={crop.id}
                onClick={() => handleCropSelect(crop.id)}
                className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-green-300 transition-colors"
              >
                <div className="bg-green-50 w-14 h-14 flex items-center justify-center rounded-full">
                  {renderIcon(crop.iconName, 32)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-stone-800">{(t as any)(crop.id) || crop.name}</h4>
                  <p className="text-sm text-green-700 font-medium">
                    {t('profit_per_acre')}{crop.profitPerAcre.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {t('success_chance')} {85 - (idx * 5)}%
                  </p>
                </div>
                <div className="text-green-500">
                  <Icons.ChevronRight size={20} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-stone-700 mb-4 px-1">{t('or_choose_own')}</h3>
        <div className="grid grid-cols-2 gap-3">
          {crops.map((crop) => (
            <button
              key={crop.id}
              onClick={() => handleCropSelect(crop.id)}
              className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm text-center hover:border-green-400 hover:bg-green-50 transition-colors flex flex-col items-center justify-center"
            >
              <div className="mb-2">{renderIcon(crop.iconName, 32)}</div>
              <div className="font-medium text-stone-800 text-sm">{(t as any)(crop.id) || crop.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
