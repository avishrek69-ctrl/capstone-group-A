import prisma from "../db/index.js";
import { searchLocations } from "../utils/geocoding.service.js";

/**
 * GET /api/locations/search?q=
 * Search for locations by name, suburb, or postcode via Nominatim.
 */
export const searchLocation = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Query must be at least 2 characters." });
    }

    const results = await searchLocations(q.trim());

    return res.status(200).json({ results });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/locations/favourites
 * Get all saved favourite locations for the authenticated user.
 */
export const getFavourites = async (req, res, next) => {
  try {
    const favourites = await prisma.favouriteLocation.findMany({
      where: { user_id: req.user.id },
      orderBy: { name: "asc" },
    });

    return res.status(200).json({ favourites });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/locations/favourites
 * Save a new favourite location for the authenticated user.
 */
export const addFavourite = async (req, res, next) => {
  try {
    const { name, latitude, longitude, suburb } = req.body;

    if (!name || !latitude || !longitude) {
      return res.status(400).json({ message: "name, latitude and longitude are required." });
    }

    // Prevent duplicate favourites (same user + same coords)
    const existing = await prisma.favouriteLocation.findFirst({
      where: {
        user_id:   req.user.id,
        latitude:  parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });

    if (existing) {
      return res.status(409).json({ message: "This location is already saved as a favourite." });
    }

    const favourite = await prisma.favouriteLocation.create({
      data: {
        user_id:   req.user.id,
        name:      name.trim(),
        latitude:  parseFloat(latitude),
        longitude: parseFloat(longitude),
        suburb:    suburb || null,
      },
    });

    return res.status(201).json({ favourite });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/locations/favourites/:id
 * Remove a favourite location.
 */
export const deleteFavourite = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.favouriteLocation.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: "Favourite location not found." });
    }

    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorised to delete this favourite." });
    }

    await prisma.favouriteLocation.delete({ where: { id } });

    return res.status(200).json({ message: "Favourite location removed." });
  } catch (err) {
    next(err);
  }
};
