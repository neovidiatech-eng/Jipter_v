import * as db from "../../../database/dbService.js";

/* -----------------------------
   Constants & Shared Includes
----------------------------- */
const nestedInclude = {
  courses: {
    include: {
      lectures: {
        orderBy: { order: "asc" }
      }
    }
  }
};

/* -----------------------------
   GET ALL RANKS
----------------------------- */
export const getRanks = async (req, res, next) => {
  const { name, page, limit } = req.query || {};
  const where = {};
  if (name) {
    where.name = { contains: name, mode: "insensitive" };
  }

  return await db.findManyWithPaginationAndCount({
    model: "ranks",
    where,
    limit: Number(limit) || 10,
    page: Number(page) || 1,
    orderBy: { name: "asc" },
    include: nestedInclude
  });
};

/* -----------------------------
   ADD RANK
----------------------------- */
export const addRank = async (req, res, next) => {
  const { name, color, ageRange } = req.body || {};
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const check = await db.findFirst({
    model: "ranks",
    where: {
      OR: [{ name }, { slug }]
    },
  });

  if (check) {
    const error = new Error("Rank already exists");
    error.status = 400;
    throw error;
  }

  return await db.create({
    model: "ranks",
    data: { name, slug, color, ageRange },
  });
};

/* -----------------------------
   GET RANK BY ID
----------------------------- */
export const getRank = async (req, res, next) => {
  const { id } = req.params;
  const rank = await db.findFirst({
    model: "ranks",
    where: { id },
    include: nestedInclude
  });

  if (!rank) {
    const error = new Error("Rank not found");
    error.status = 404;
    throw error;
  }

  return rank;
};

/* -----------------------------
   UPDATE RANK
----------------------------- */
export const updateRank = async (req, res, next) => {
  const { id } = req.params;
  const { name, color, ageRange } = req.body;

  const rank = await db.findFirst({
    model: "ranks",
    where: { id },
  });

  if (!rank) {
    const error = new Error("Rank not found");
    error.status = 404;
    throw error;
  }

  const updateData = {};
  if (name) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const check = await db.findFirst({
      model: "ranks",
      where: {
        id: { not: id },
        OR: [{ name }, { slug }]
      },
    });

    if (check) {
      const error = new Error("Rank name or slug already exists");
      error.status = 400;
      throw error;
    }

    updateData.name = name;
    updateData.slug = slug;
  }
  
  if (color) updateData.color = color;
  if (ageRange) updateData.ageRange = ageRange;

  return await db.updateOne({
    model: "ranks",
    where: { id },
    data: updateData,
  });
};

/* -----------------------------
   DELETE RANK
----------------------------- */
export const deleteRank = async (req, res, next) => {
  const { id } = req.params;

  const rank = await db.findFirst({
    model: "ranks",
    where: { id },
  });

  if (!rank) {
    const error = new Error("Rank not found");
    error.status = 404;
    throw error;
  }

  return await db.deleteOne({
    model: "ranks",
    where: { id },
  });
};
