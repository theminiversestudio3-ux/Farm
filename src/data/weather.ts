export interface DailyForecast {
  day: string;
  iconName: string;
  high: number;
  low: number;
  rainProb: number;
}

export interface WeatherData {
  iconName: string;
  temp: number;
  humidity: number;
  condition: "good" | "bad";
  forecast: DailyForecast[];
}

// Maps WMO weather codes to Lucide icon names
const getWeatherIcon = (code: number): string => {
  if (code === 0) return "Sun"; // Clear
  if (code === 1 || code === 2 || code === 3) return "CloudSun"; // Partly cloudy
  if (code >= 45 && code <= 48) return "CloudFog"; // Fog
  if (code >= 51 && code <= 67) return "CloudRain"; // Drizzle/Rain
  if (code >= 71 && code <= 77) return "CloudSnow"; // Snow
  if (code >= 80 && code <= 82) return "CloudShowersHeavy"; // Showers
  if (code >= 95) return "CloudLightning"; // Thunderstorm
  return "Cloud";
};

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const res = await aFetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
    if (!res.ok) throw new Error("Weather fetch failed");
    const data = await res.json();
    
    const conditionStr = data.current.weather_code < 50 ? "good" : "bad";
    
    const forecast: DailyForecast[] = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(data.daily.time[i]);
        let dayStr = i === 0 ? "Today" : i === 1 ? "Tomorrow" : days[date.getDay()];
        
        forecast.push({
            day: dayStr,
            iconName: getWeatherIcon(data.daily.weather_code[i]),
            high: Math.round(data.daily.temperature_2m_max[i]),
            low: Math.round(data.daily.temperature_2m_min[i]),
            rainProb: data.daily.precipitation_probability_max[i]
        });
    }

    return {
      iconName: getWeatherIcon(data.current.weather_code),
      temp: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      condition: conditionStr,
      forecast
    };
  } catch (err) {
    console.error(err);
    // fallback to default
    return getFallbackWeather();
  }
};

const getFallbackWeather = (): WeatherData => {
  return {
    iconName: "CloudSun",
    temp: 28,
    humidity: 65,
    condition: "good",
    forecast: [
      { day: "Today", iconName: "CloudSun", high: 29, low: 22, rainProb: 10 },
      { day: "Tomorrow", iconName: "CloudRain", high: 25, low: 20, rainProb: 80 },
      { day: "Wed", iconName: "CloudLightning", high: 24, low: 20, rainProb: 90 },
      { day: "Thu", iconName: "CloudSun", high: 27, low: 21, rainProb: 30 },
      { day: "Fri", iconName: "Sun", high: 30, low: 22, rainProb: 5 },
      { day: "Sat", iconName: "Sun", high: 31, low: 23, rainProb: 0 },
      { day: "Sun", iconName: "CloudSun", high: 30, low: 23, rainProb: 15 }
    ]
  };
};

// Simple global fetch wrapper to fix aFetch
const aFetch = typeof window !== "undefined" ? window.fetch : fetch;
