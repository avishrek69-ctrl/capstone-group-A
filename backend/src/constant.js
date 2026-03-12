// Photography suitability scoring weights (must sum to 1.0)
export const SCORING_WEIGHTS = {
  GOLDEN_HOUR_ALIGNMENT: 0.25,
  CLOUD_COVER: 0.20,
  PRECIPITATION: 0.25,
  WIND_SPEED: 0.15,
  TEMPERATURE: 0.15,
};

// Score thresholds → rating labels
export const SCORE_THRESHOLDS = [
  { min: 85, max: 100, rating: "Excellent", colour: "green" },
  { min: 65, max: 84,  rating: "Good",      colour: "blue" },
  { min: 45, max: 64,  rating: "Acceptable", colour: "amber" },
  { min: 25, max: 44,  rating: "Poor",       colour: "orange" },
  { min: 0,  max: 24,  rating: "Unsuitable", colour: "red" },
];

// Cloud cover ideal range (%) — moderate cloud is good for photography
export const CLOUD_COVER_IDEAL_MIN = 20;
export const CLOUD_COVER_IDEAL_MAX = 60;

// Wind speed thresholds (km/h)
export const WIND_SPEED_COMFORTABLE = 15;  // ideal
export const WIND_SPEED_ACCEPTABLE = 25;   // tolerable
export const WIND_SPEED_POOR = 40;         // penalised heavily

// Temperature comfort range (°C) — important for newborn/outdoor shoots
export const TEMP_IDEAL_MIN = 18;
export const TEMP_IDEAL_MAX = 28;
export const TEMP_ACCEPTABLE_MIN = 12;
export const TEMP_ACCEPTABLE_MAX = 35;

// Session types
export const SESSION_TYPES = [
  "Maternity",
  "Newborn",
  "Birth",
  "Family",
  "Portrait",
  "Engagement",
  "Wedding",
  "Other",
];

// JWT
export const JWT_EXPIRY = "7d";
