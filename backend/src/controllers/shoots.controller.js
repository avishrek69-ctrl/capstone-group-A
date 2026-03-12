import prisma from "../db/index.js";
import { SESSION_TYPES } from "../constant.js";

/**
 * GET /api/shoots
 * List all shoot sessions for the authenticated user.
 */
export const getShoots = async (req, res, next) => {
  try {
    const shoots = await prisma.shootSession.findMany({
      where: { user_id: req.user.id },
      orderBy: { shoot_date: "asc" },
    });

    return res.status(200).json({ shoots });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/shoots
 * Create a new shoot session.
 */
export const createShoot = async (req, res, next) => {
  try {
    const {
      location_name,
      latitude,
      longitude,
      shoot_date,
      shoot_time,
      session_type,
      suitability_score,
      notes,
    } = req.body;

    if (!location_name || !latitude || !longitude || !shoot_date || !session_type) {
      return res.status(400).json({
        message: "location_name, latitude, longitude, shoot_date and session_type are required.",
      });
    }

    if (!SESSION_TYPES.includes(session_type)) {
      return res.status(400).json({
        message: `session_type must be one of: ${SESSION_TYPES.join(", ")}.`,
      });
    }

    const shoot = await prisma.shootSession.create({
      data: {
        user_id: req.user.id,
        location_name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        shoot_date: new Date(shoot_date),
        shoot_time: shoot_time || null,
        session_type,
        suitability_score: suitability_score != null ? parseInt(suitability_score) : null,
        notes: notes || null,
      },
    });

    return res.status(201).json({ shoot });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/shoots/:id
 * Update an existing shoot session.
 */
export const updateShoot = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.shootSession.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: "Shoot session not found." });
    }

    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorised to update this shoot session." });
    }

    const {
      location_name,
      latitude,
      longitude,
      shoot_date,
      shoot_time,
      session_type,
      suitability_score,
      notes,
    } = req.body;

    if (session_type && !SESSION_TYPES.includes(session_type)) {
      return res.status(400).json({
        message: `session_type must be one of: ${SESSION_TYPES.join(", ")}.`,
      });
    }

    const updated = await prisma.shootSession.update({
      where: { id },
      data: {
        ...(location_name  && { location_name }),
        ...(latitude       && { latitude: parseFloat(latitude) }),
        ...(longitude      && { longitude: parseFloat(longitude) }),
        ...(shoot_date     && { shoot_date: new Date(shoot_date) }),
        ...(shoot_time !== undefined && { shoot_time: shoot_time || null }),
        ...(session_type   && { session_type }),
        ...(suitability_score != null && { suitability_score: parseInt(suitability_score) }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return res.status(200).json({ shoot: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/shoots/:id
 * Delete a shoot session.
 */
export const deleteShoot = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.shootSession.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: "Shoot session not found." });
    }

    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorised to delete this shoot session." });
    }

    await prisma.shootSession.delete({ where: { id } });

    return res.status(200).json({ message: "Shoot session deleted successfully." });
  } catch (err) {
    next(err);
  }
};
