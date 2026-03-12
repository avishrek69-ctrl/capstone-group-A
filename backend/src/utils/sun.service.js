/**
 * Time derivations for photography:
 *   Blue hour (morning)   = nautical_twilight_begin → civil_twilight_begin
 *   Golden hour (morning) = civil_twilight_begin    → sunrise  (+~30 min after)
 *   Golden hour (evening) = ~30 min before sunset   → civil_twilight_end
 *   Blue hour (evening)   = civil_twilight_end       → nautical_twilight_end
 */

const BASE_URL = "https://api.sunrise-sunset.org/json";


// Parse a UTC time string from the API and combine with the date
// to produce a full ISO datetime string.
const toISO = (date, time) => {
  return new Date(`${date} ${time} UTC`).toISOString();
};

// Add minutes to an ISO datetime string.
const addMinutes = (isoString, minutes) => {
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
};

// Fetch sun times for a location and date.
export const fetchSunInfo = async (lat, lng, date) => {
  const params = new URLSearchParams({
    lat,
    lng,
    date,
    formatted: 0,
  });

  const res = await fetch(`${BASE_URL}?${params}`);

  if (!res.ok) {
    throw new Error(`Sunrise-Sunset API error: ${res.status} ${res.statusText}`);
  }

  const { results, status } = await res.json();

  if (status !== "OK") {
    throw new Error(`Sunrise-Sunset API returned status: ${status}`);
  }

  // API returns ISO strings when formatted=0
  const sunrise              = results.sunrise;
  const sunset               = results.sunset;
  const civil_twilight_begin = results.civil_twilight_begin;
  const civil_twilight_end   = results.civil_twilight_end;
  const nautical_twilight_begin = results.nautical_twilight_begin;
  const nautical_twilight_end   = results.nautical_twilight_end;
  const solar_noon           = results.solar_noon;
  const day_length           = results.day_length; // seconds

  return {
    date,
    sunrise,
    sunset,
    solar_noon,
    day_length_seconds: day_length,

    // Civil twilight = start/end of golden hour window
    civil_twilight_begin,
    civil_twilight_end,

    // Nautical twilight = start/end of blue hour window
    nautical_twilight_begin,
    nautical_twilight_end,

    // Photography windows
    golden_hour_morning: {
      start: civil_twilight_begin,
      end: addMinutes(sunrise, 30),
    },
    golden_hour_evening: {
      start: addMinutes(sunset, -30),
      end: civil_twilight_end,
    },
    blue_hour_morning: {
      start: nautical_twilight_begin,
      end: civil_twilight_begin,
    },
    blue_hour_evening: {
      start: civil_twilight_end,
      end: nautical_twilight_end,
    },
  };
};
