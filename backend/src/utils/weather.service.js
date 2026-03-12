
const BASE_URL = "https://api.open-meteo.com/v1/forecast";

// Open-Meteo weather code → human-readable description
const WEATHER_CODE_MAP = {
  0: "Clear sky",
  1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Icy fog",
  51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
  80: "Slight showers", 81: "Moderate showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
};

/**
 * Fetch hourly weather data for a location and date.
 * @param {number} lat
 * @param {number} lng
 * @param {string} date  YYYY-MM-DD
 * @returns {Promise<{ hourly: Array, daily: object }>}
 */
export const fetchWeather = async (lat, lng, date) => {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lng,
    hourly: [
      "cloud_cover",
      "precipitation_probability",
      "temperature_2m",
      "wind_speed_10m",
      "weather_code",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "wind_speed_10m_max",
    ].join(","),
    start_date: date,
    end_date: date,
    wind_speed_unit: "kmh",
    timezone: "auto",
  });

  const res = await fetch(`${BASE_URL}?${params}`);

  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  console.log(data)

  // Build structured hourly array for the requested date
  const hourly = data.hourly.time.map((time, i) => ({
    time,
    cloud_cover: data.hourly.cloud_cover[i],
    precipitation_probability: data.hourly.precipitation_probability[i],
    temperature: data.hourly.temperature_2m[i],
    wind_speed: data.hourly.wind_speed_10m[i],
    weather_code: data.hourly.weather_code[i],
    condition: WEATHER_CODE_MAP[data.hourly.weather_code[i]] ?? "Unknown",
  }));

  const cloudValues = data.hourly.cloud_cover.filter((v) => v != null);
  const cloud_cover_avg =
    cloudValues.length > 0
      ? Math.round(cloudValues.reduce((a, b) => a + b, 0) / cloudValues.length)
      : null;

  const daily = {
    weather_code: data.daily.weather_code[0],
    condition: WEATHER_CODE_MAP[data.daily.weather_code[0]] ?? "Unknown",
    temp_max: data.daily.temperature_2m_max[0],
    temp_min: data.daily.temperature_2m_min[0],
    precipitation_probability_max: data.daily.precipitation_probability_max[0],
    wind_speed_max: data.daily.wind_speed_10m_max[0],
    cloud_cover_avg,
  };

  return { hourly, daily, utc_offset_seconds: data.utc_offset_seconds ?? 0 };
};

/**
 * Fetch a multi-day forecast (up to 16 days from today).
 * @param {number} lat
 * @param {number} lng
 * @param {number} days  number of days (default 7)
 * @returns {Promise<Array>}  array of daily summaries
 */
export const fetchForecast = async (lat, lng, days = 7) => {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lng,
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "cloud_cover_mean",
      "sunrise",
      "sunset",
    ].join(","),
    forecast_days: days,
    wind_speed_unit: "kmh",
    timezone: "auto",
  });

  const res = await fetch(`${BASE_URL}?${params}`);

  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  return data.daily.time.map((date, i) => ({
    date,
    weather_code: data.daily.weather_code[i],
    condition: WEATHER_CODE_MAP[data.daily.weather_code[i]] ?? "Unknown",
    temp_max: data.daily.temperature_2m_max[i],
    temp_min: data.daily.temperature_2m_min[i],
    precipitation_probability_max: data.daily.precipitation_probability_max[i],
    wind_speed_max: data.daily.wind_speed_10m_max[i],
    cloud_cover: data.daily.cloud_cover_mean[i] ?? null,
    sunrise: data.daily.sunrise[i],
    sunset: data.daily.sunset[i],
  }));
};
