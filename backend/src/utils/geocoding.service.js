const BASE_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "PhotographyPlanner/1.0";

export const searchLocations = async (query, limit = 5) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    q: query.trim(),
    format: "json",
    limit,
    addressdetails: 1,
  });

  const res = await fetch(`${BASE_URL}?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`Nominatim API error: ${res.status} ${res.statusText}`);
  }

  const results = await res.json();

  return results.map((r) => ({
    display_name: r.display_name,
    suburb: r.address?.suburb || r.address?.town || r.address?.city || null,
    city: r.address?.city || r.address?.town || null,
    state: r.address?.state || null,
    postcode: r.address?.postcode || null,
    country: r.address?.country || null,
    latitude: parseFloat(r.lat),
    longitude: parseFloat(r.lon),
  }));
};


// Resolve a single location name/postcode to coordinates.
// Returns the best match or null if nothing found.
export const resolveLocation = async (query) => {
  const results = await searchLocations(query, 1);
  return results.length > 0 ? results[0] : null;
};
