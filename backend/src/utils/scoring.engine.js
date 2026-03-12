import {
  SCORING_WEIGHTS,
  SCORE_THRESHOLDS,
  CLOUD_COVER_IDEAL_MIN,
  CLOUD_COVER_IDEAL_MAX,
  WIND_SPEED_COMFORTABLE,
  WIND_SPEED_ACCEPTABLE,
  WIND_SPEED_POOR,
  TEMP_IDEAL_MIN,
  TEMP_IDEAL_MAX,
  TEMP_ACCEPTABLE_MIN,
  TEMP_ACCEPTABLE_MAX,
} from "../constant.js";

// Clamp a value between min and max
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Linear interpolation: map value in [inMin, inMax] → [outMin, outMax]
const lerp = (val, inMin, inMax, outMin, outMax) => {
  const t = clamp((val - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
};

// Check if a UTC ISO time string falls within a window { start, end }
const isInWindow = (timeISO, window) => {
  const t = new Date(timeISO).getTime();
  return t >= new Date(window.start).getTime() && t <= new Date(window.end).getTime();
};

// Minutes difference between two ISO strings (signed)
const minutesDiff = (isoA, isoB) =>
  (new Date(isoA).getTime() - new Date(isoB).getTime()) / 60000;

// Factor: Golden / Blue Hour Alignment

const scoreGoldenHour = (sunInfo, shootTime, utcOffsetSeconds = 0) => {
  // No shoot time specified — return a neutral score
  if (!shootTime || !sunInfo) {
    return { raw: 60, label: "No shoot time specified" };
  }

  // shootTime is local time (HH:MM) from the user's time picker.
  // Sun windows from sunrise-sunset.org are in UTC.
  // Use Date.UTC so server timezone never affects the result, then
  // subtract the location's UTC offset to convert local → UTC.
  const [year, month, day] = sunInfo.date.split("-").map(Number);
  const [hh, mm]           = shootTime.split(":").map(Number);
  const shootUTCMs = Date.UTC(year, month - 1, day, hh, mm, 0) - utcOffsetSeconds * 1000;
  const shootISO   = new Date(shootUTCMs).toISOString();

  const windows = [
    { name: "golden_hour_morning", window: sunInfo.golden_hour_morning },
    { name: "golden_hour_evening", window: sunInfo.golden_hour_evening },
    { name: "blue_hour_morning",   window: sunInfo.blue_hour_morning },
    { name: "blue_hour_evening",   window: sunInfo.blue_hour_evening },
  ];

  // Check exact window timeline
  for (const { name, window } of windows) {
    if (!window?.start || !window?.end) continue;
    if (isInWindow(shootISO, window)) {
      const isGolden = name.startsWith("golden");
      return {
        raw: isGolden ? 100 : 80,
        label: isGolden ? "Inside golden hour window" : "Inside blue hour window",
      };
    }
  }

  // Check proximity — within 30 minutes of any window boundary
  const boundaries = windows.flatMap(({ window }) =>
    window?.start && window?.end ? [window.start, window.end] : []
  );

  const closestMinutes = Math.min(
    ...boundaries.map((b) => Math.abs(minutesDiff(shootISO, b)))
  );

  if (closestMinutes <= 30) {
    return { raw: 60, label: "Near a golden/blue hour window" };
  }

  return { raw: 20, label: "Outside golden/blue hour windows" };
};

// Factor: Cloud Cover 

const scoreCloudCover = (cloudCover) => {
  if (cloudCover === null || cloudCover === undefined) {
    return { raw: 50, label: "Cloud cover unknown" };
  }

  if (cloudCover >= CLOUD_COVER_IDEAL_MIN && cloudCover <= CLOUD_COVER_IDEAL_MAX) {
    return { raw: 100, label: "Ideal diffused light" };
  }

  if (cloudCover < CLOUD_COVER_IDEAL_MIN) {
    // 0–20%: harsh direct sun, scales 60→100 as it approaches ideal
    const raw = Math.round(lerp(cloudCover, 0, CLOUD_COVER_IDEAL_MIN, 60, 100));
    return { raw, label: "Mostly clear — harsh direct light" };
  }

  if (cloudCover <= 80) {
    // 60–80%: getting too overcast
    const raw = Math.round(lerp(cloudCover, CLOUD_COVER_IDEAL_MAX, 80, 100, 50));
    return { raw, label: "Moderately overcast" };
  }

  // 80–100%: very overcast, flat and dark
  const raw = Math.round(lerp(cloudCover, 80, 100, 50, 10));
  return { raw, label: "Heavy overcast — flat, dark conditions" };
};

// Factor: Precipitation Probability

const scorePrecipitation = (precipProb) => {
  if (precipProb === null || precipProb === undefined) {
    return { raw: 50, label: "Precipitation unknown" };
  }

  if (precipProb <= 10) {
    return { raw: 100, label: "No rain expected" };
  }
  if (precipProb <= 30) {
    const raw = Math.round(lerp(precipProb, 10, 30, 100, 70));
    return { raw, label: "Low chance of rain" };
  }
  if (precipProb <= 60) {
    const raw = Math.round(lerp(precipProb, 30, 60, 70, 30));
    return { raw, label: "Moderate chance of rain" };
  }

  const raw = Math.round(lerp(precipProb, 60, 100, 30, 0));
  return { raw, label: "High chance of rain" };
};

// Factor: Wind Speed 

const scoreWindSpeed = (windSpeed) => {
  if (windSpeed === null || windSpeed === undefined) {
    return { raw: 50, label: "Wind speed unknown" };
  }

  if (windSpeed <= WIND_SPEED_COMFORTABLE) {
    return { raw: 100, label: "Calm — ideal for outdoor shoots" };
  }
  if (windSpeed <= WIND_SPEED_ACCEPTABLE) {
    const raw = Math.round(lerp(windSpeed, WIND_SPEED_COMFORTABLE, WIND_SPEED_ACCEPTABLE, 100, 70));
    return { raw, label: "Light breeze" };
  }
  if (windSpeed <= WIND_SPEED_POOR) {
    const raw = Math.round(lerp(windSpeed, WIND_SPEED_ACCEPTABLE, WIND_SPEED_POOR, 70, 30));
    return { raw, label: "Moderate wind — affects hair and fabric" };
  }

  return { raw: 0, label: "Strong wind — unsuitable for outdoor shoots" };
};

// Factor: Temperature 

const scoreTemperature = (tempAvg) => {
  if (tempAvg === null || tempAvg === undefined) {
    return { raw: 50, label: "Temperature unknown" };
  }

  if (tempAvg >= TEMP_IDEAL_MIN && tempAvg <= TEMP_IDEAL_MAX) {
    return { raw: 100, label: "Comfortable temperature" };
  }

  if (tempAvg >= TEMP_ACCEPTABLE_MIN && tempAvg < TEMP_IDEAL_MIN) {
    const raw = Math.round(lerp(tempAvg, TEMP_ACCEPTABLE_MIN, TEMP_IDEAL_MIN, 50, 100));
    return { raw, label: "Cool — consider comfort for clients" };
  }

  if (tempAvg > TEMP_IDEAL_MAX && tempAvg <= TEMP_ACCEPTABLE_MAX) {
    const raw = Math.round(lerp(tempAvg, TEMP_IDEAL_MAX, TEMP_ACCEPTABLE_MAX, 100, 50));
    return { raw, label: "Warm — monitor client comfort" };
  }

  if (tempAvg < TEMP_ACCEPTABLE_MIN) {
    return { raw: 0, label: "Too cold for outdoor shoots" };
  }

  return { raw: 0, label: "Too hot for outdoor shoots" };
};

// Public API 
/**
 * Lookup rating label and colour from a final score.
 * @param {number} score  0–100
 */
export const getRating = (score) => {
  const threshold = SCORE_THRESHOLDS.find(
    (t) => score >= t.min && score <= t.max
  );
  return threshold
    ? { rating: threshold.rating, colour: threshold.colour }
    : { rating: "Unsuitable", colour: "red" };
};

/**
 * Score a single day given weather and sun data.
 * @param {object} weatherData  output of fetchWeather() — { hourly, daily }
 * @param {object} sunInfo      output of fetchSunInfo()
 * @param {string} [shootTime]  optional HH:MM in UTC e.g. "07:30"
 * @returns {{ score, rating, colour, factors }}
 */
export const scoreDay = (weatherData, sunInfo, shootTime = null, utcOffsetSeconds = 0) => {
  const { daily } = weatherData;

  const tempAvg = daily.temp_max !== undefined && daily.temp_min !== undefined
    ? (daily.temp_max + daily.temp_min) / 2
    : null;

  const goldenHour   = scoreGoldenHour(sunInfo, shootTime, utcOffsetSeconds);
  const cloudCover   = scoreCloudCover(daily.cloud_cover_avg ?? daily.cloud_cover ?? null);
  const precipitation = scorePrecipitation(daily.precipitation_probability_max ?? null);
  const windSpeed    = scoreWindSpeed(daily.wind_speed_max ?? null);
  const temperature  = scoreTemperature(tempAvg);

  const score = Math.round(
    goldenHour.raw    * SCORING_WEIGHTS.GOLDEN_HOUR_ALIGNMENT +
    cloudCover.raw    * SCORING_WEIGHTS.CLOUD_COVER +
    precipitation.raw * SCORING_WEIGHTS.PRECIPITATION +
    windSpeed.raw     * SCORING_WEIGHTS.WIND_SPEED +
    temperature.raw   * SCORING_WEIGHTS.TEMPERATURE
  );

  const { rating, colour } = getRating(score);

  return {
    score,
    rating,
    colour,
    factors: {
      golden_hour: {
        raw: goldenHour.raw,
        weighted: Math.round(goldenHour.raw * SCORING_WEIGHTS.GOLDEN_HOUR_ALIGNMENT * 10) / 10,
        label: goldenHour.label,
      },
      cloud_cover: {
        raw: cloudCover.raw,
        weighted: Math.round(cloudCover.raw * SCORING_WEIGHTS.CLOUD_COVER * 10) / 10,
        label: cloudCover.label,
      },
      precipitation: {
        raw: precipitation.raw,
        weighted: Math.round(precipitation.raw * SCORING_WEIGHTS.PRECIPITATION * 10) / 10,
        label: precipitation.label,
      },
      wind_speed: {
        raw: windSpeed.raw,
        weighted: Math.round(windSpeed.raw * SCORING_WEIGHTS.WIND_SPEED * 10) / 10,
        label: windSpeed.label,
      },
      temperature: {
        raw: temperature.raw,
        weighted: Math.round(temperature.raw * SCORING_WEIGHTS.TEMPERATURE * 10) / 10,
        label: temperature.label,
      },
    },
  };
};

/**
 * Score each hour individually — used for the hourly timeline chart.
 * Golden hour alignment is checked per-hour against the hour's own time.
 * @param {Array}  hourlyArray  output of fetchWeather().hourly
 * @param {object} sunInfo      output of fetchSunInfo()
 * @returns {Array<{ time, score, rating, colour }>}
 */
export const scoreHourly = (hourlyArray, sunInfo) => {
  return hourlyArray.map((hour) => {
    // Extract HH:MM from the hourly time string (ISO or "YYYY-MM-DDTHH:MM")
    const timePart = hour.time.includes("T")
      ? hour.time.split("T")[1].slice(0, 5)
      : hour.time.slice(11, 16);

    const goldenHour    = scoreGoldenHour(sunInfo, timePart);
    const cloudCover    = scoreCloudCover(hour.cloud_cover ?? null);
    const precipitation = scorePrecipitation(hour.precipitation_probability ?? null);
    const windSpeed     = scoreWindSpeed(hour.wind_speed ?? null);
    const temperature   = scoreTemperature(hour.temperature ?? null);

    const score = Math.round(
      goldenHour.raw    * SCORING_WEIGHTS.GOLDEN_HOUR_ALIGNMENT +
      cloudCover.raw    * SCORING_WEIGHTS.CLOUD_COVER +
      precipitation.raw * SCORING_WEIGHTS.PRECIPITATION +
      windSpeed.raw     * SCORING_WEIGHTS.WIND_SPEED +
      temperature.raw   * SCORING_WEIGHTS.TEMPERATURE
    );

    const { rating, colour } = getRating(score);

    return { time: hour.time, score, rating, colour };
  });
};
