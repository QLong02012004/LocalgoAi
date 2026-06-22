import axios from 'axios';

export interface WeatherData {
  temp: number;
  condition: string;
  weatherCode: number;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
  rainChance?: string;
  tempMax?: number;
  tempMin?: number;
}

export interface WeatherForecastResponse {
  current: WeatherData & { time: string };
  daily: Record<string, WeatherData>;
  hourly: Array<{
    time: string;
    temp: number;
    weatherCode: number;
    humidity: number;
    windSpeed: number;
    pressure: number;
  }>;
}

export const getWeatherForecast = async (lat: number, lng: number): Promise<WeatherForecastResponse> => {
  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,surface_pressure,wind_speed_10m&hourly=temperature_2m,weather_code,relative_humidity_2m,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto`
    );

    const { current, daily, hourly } = response.data;
    
    // ... (current processing stays same)
    const currentData: WeatherForecastResponse['current'] = {
      time: current.time,
      temp: Math.round(current.temperature_2m),
      weatherCode: current.weather_code,
      condition: getWeatherLabel(current.weather_code),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      pressure: Math.round(current.surface_pressure),
    };

    // Process daily
    const dailyForecast: Record<string, WeatherData> = {};
    daily.time.forEach((dateStr: string, index: number) => {
      dailyForecast[dateStr] = {
        temp: Math.round(daily.temperature_2m_max[index]),
        tempMax: Math.round(daily.temperature_2m_max[index]),
        tempMin: Math.round(daily.temperature_2m_min[index]),
        weatherCode: daily.weather_code[index],
        condition: getWeatherLabel(daily.weather_code[index]),
        rainChance: daily.precipitation_probability_max[index] + "%",
        windSpeed: Math.round(daily.wind_speed_10m_max[index]),
        humidity: 60, // Fallback for daily as it's less common
        pressure: 1012,
      };
    });

    // Process hourly (next 24 hours)
    const hourlyForecast = hourly.time.map((time: string, index: number) => ({
      time,
      temp: Math.round(hourly.temperature_2m[index]),
      weatherCode: hourly.weather_code[index],
      humidity: hourly.relative_humidity_2m[index],
      windSpeed: Math.round(hourly.wind_speed_10m[index]),
      pressure: Math.round(hourly.surface_pressure[index]),
    })).slice(0, 24);

    return {
      current: currentData,
      daily: dailyForecast,
      hourly: hourlyForecast,
    };
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    throw error;
  }
};

const getWeatherLabel = (code: number): string => {
  if (code === 0) return "Trời nắng";
  if (code <= 3) return "Nhiều mây";
  if (code <= 48) return "Có sương mù";
  if (code <= 55) return "Mưa phùn";
  if (code <= 65) return "Có mưa";
  if (code <= 77) return "Có tuyết";
  if (code <= 82) return "Mưa rào";
  if (code <= 99) return "Có dông";
  return "Nắng nhẹ";
};
