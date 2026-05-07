export interface DailyForecast {
  day: string;
  iconName: string;
  high: number;
  low: number;
  rainProb: number;
  sunrise: string;
  sunset: string;
  uvIndex: number;
}

export interface WeatherData {
  iconName: string;
  temp: number;
  humidity: number;
  isDay: boolean;
  windSpeed: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  sunrise: string;
  sunset: string;
  condition: "good" | "bad";
  forecast: DailyForecast[];
}

// Maps WMO weather codes to Lucide icon names
const getWeatherIcon = (code: number, isDay: boolean = true): string => {
  if (code === 0) return isDay ? "Sun" : "Moon"; // Clear
  if (code === 1 || code === 2 || code === 3) return isDay ? "CloudSun" : "CloudMoon"; // Partly cloudy
  if (code >= 45 && code <= 48) return "CloudFog"; // Fog
  if (code >= 51 && code <= 67) return "CloudRain"; // Drizzle/Rain
  if (code >= 71 && code <= 77) return "CloudSnow"; // Snow
  if (code >= 80 && code <= 82) return "CloudShowersHeavy"; // Showers
  if (code >= 95) return "CloudLightning"; // Thunderstorm
  return "Cloud";
};

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const res = await aFetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m,surface_pressure,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`);
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
            rainProb: data.daily.precipitation_probability_max[i],
            sunrise: data.daily.sunrise[i].split('T')[1],
            sunset: data.daily.sunset[i].split('T')[1],
            uvIndex: data.daily.uv_index_max[i]
        });
    }

    return {
      iconName: getWeatherIcon(data.current.weather_code, data.current.is_day === 1),
      temp: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      isDay: data.current.is_day === 1,
      windSpeed: data.current.wind_speed_10m,
      uvIndex: data.daily.uv_index_max[0],
      visibility: Math.round(data.current.visibility / 1000), // in km
      pressure: Math.round(data.current.surface_pressure),
      sunrise: data.daily.sunrise[0].split('T')[1],
      sunset: data.daily.sunset[0].split('T')[1],
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
    isDay: true,
    windSpeed: 12,
    uvIndex: 8,
    visibility: 10,
    pressure: 1012,
    sunrise: "06:00",
    sunset: "18:30",
    condition: "good",
    forecast: [
      { day: "Today", iconName: "CloudSun", high: 29, low: 22, rainProb: 10, sunrise: "06:00", sunset: "18:30", uvIndex: 8 },
      { day: "Tomorrow", iconName: "CloudRain", high: 25, low: 20, rainProb: 80, sunrise: "06:01", sunset: "18:29", uvIndex: 3 },
      { day: "Wed", iconName: "CloudLightning", high: 24, low: 20, rainProb: 90, sunrise: "06:02", sunset: "18:28", uvIndex: 2 },
      { day: "Thu", iconName: "CloudSun", high: 27, low: 21, rainProb: 30, sunrise: "06:03", sunset: "18:27", uvIndex: 6 },
      { day: "Fri", iconName: "Sun", high: 30, low: 22, rainProb: 5, sunrise: "06:04", sunset: "18:26", uvIndex: 9 },
      { day: "Sat", iconName: "Sun", high: 31, low: 23, rainProb: 0, sunrise: "06:05", sunset: "18:25", uvIndex: 10 },
      { day: "Sun", iconName: "CloudSun", high: 30, low: 23, rainProb: 15, sunrise: "06:06", sunset: "18:24", uvIndex: 7 }
    ]
  };
};

// Simple global fetch wrapper to fix aFetch
const aFetch = typeof window !== "undefined" ? window.fetch : fetch;
