export const getPhotographerEmails = () =>
  (process.env.PHOTOGRAPHER_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isPhotographerEmail = (email = "") =>
  getPhotographerEmails().includes(email.trim().toLowerCase());

const isPhotographerFromPreferences = (preferences) => {
  if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) {
    return false;
  }

  return preferences.isPhotographer === true || preferences.role === "photographer";
};

export const toAuthUser = ({ id, email, name, preferences, created_at }) => ({
  id,
  email,
  name,
  preferences,
  created_at,
  isPhotographer: isPhotographerEmail(email) || isPhotographerFromPreferences(preferences),
});