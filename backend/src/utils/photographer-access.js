export const getPhotographerEmails = () =>
  (process.env.PHOTOGRAPHER_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isPhotographerEmail = (email = "") =>
  getPhotographerEmails().includes(email.trim().toLowerCase());

export const toAuthUser = ({ id, email, name, preferences, created_at }) => ({
  id,
  email,
  name,
  preferences,
  created_at,
  isPhotographer: isPhotographerEmail(email),
});