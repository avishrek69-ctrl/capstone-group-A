import { fetchWeather, fetchForecast } from "../utils/weather.service.js";
import { fetchSunInfo } from "../utils/sun.service.js";
import { scoreDay, scoreHourly, getRating } from "../utils/scoring.engine.js";

/**
 * GET /api/conditions?lat=&lng=&date=&time=
 * Returns full weather + sun data + suitability score for a single date.
 */
export const getConditions = async (req, res, next) => {
  try {
    const { lat, lng, date, time } = req.query;

    if (!lat || !lng || !date) {
      return res.status(400).json({ message: "lat, lng and date are required." });
    }

    const latitude  = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: "lat and lng must be valid numbers." });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "date must be in YYYY-MM-DD format." });
    }

    const [weatherData, sunInfo] = await Promise.all([
      fetchWeather(latitude, longitude, date),
      fetchSunInfo(latitude, longitude, date),
    ]);

    const dayScore  = scoreDay(weatherData, sunInfo, time || null, weatherData.utc_offset_seconds ?? 0);
    const hourly    = scoreHourly(weatherData.hourly, sunInfo);

    return res.status(200).json({
      date,
      location: { latitude, longitude },
      score:    dayScore.score,
      rating:   dayScore.rating,
      colour:   dayScore.colour,
      factors:  dayScore.factors,
      sun:      sunInfo,
      weather:  weatherData.daily,
      hourly,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/forecast?lat=&lng=&days=
 * Returns a multi-day forecast with a suitability score per day.
 */
export const getForecast = async (req, res, next) => {
  try {
    const { lat, lng, days } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required." });
    }

    const latitude  = parseFloat(lat);
    const longitude = parseFloat(lng);
    const forecastDays = Math.min(parseInt(days) || 7, 16);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: "lat and lng must be valid numbers." });
    }

    const forecastData = await fetchForecast(latitude, longitude, forecastDays);

    // Score each day using daily summary data
    const scored = await Promise.all(
      forecastData.map(async (day) => {
        const sunInfo = await fetchSunInfo(latitude, longitude, day.date);

        const weatherData = {
          daily: {
            cloud_cover: day.cloud_cover ?? null,
            precipitation_probability_max: day.precipitation_probability_max,
            temp_max: day.temp_max,
            temp_min: day.temp_min,
            wind_speed_max: day.wind_speed_max,
          },
          hourly: [],
        };

        const { score, rating, colour } = scoreDay(weatherData, sunInfo);

        return {
          date:      day.date,
          condition: day.condition,
          temp_max:  day.temp_max,
          temp_min:  day.temp_min,
          precipitation_probability_max: day.precipitation_probability_max,
          wind_speed_max: day.wind_speed_max,
          sunrise:   day.sunrise,
          sunset:    day.sunset,
          score,
          rating,
          colour,
        };
      })
    );

    return res.status(200).json({ location: { latitude, longitude }, forecast: scored });
  } catch (err) {
    next(err);
  }
};
