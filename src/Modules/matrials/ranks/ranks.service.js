import * as db from "../../../database/dbService.js";
export const getRanks = async (req, res, next) => {
  console.log(req.query);

  const { name, page, limit } = req.query || {};
  const where = {};
  if (name) {
    where.name = { contains: name, mode: "insensitive" };
  }

  const data = await db.findManyWithPaginationAndCount({
    model: "ranks",
    where: where,
    limit: Number(limit),
    page: Number(page),
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      ageRange: true,
      createdAt: true,
    },
  });
  if (!data) {
    const error = new Error("Failed to fetch ranks");
    error.status = 500;
    throw error;
  }
  return data;
};
export const addRank = async (req, res, next) => {
  const { name, color, ageRange } = req.body || {};
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const check = await db.findFirst({
    model: "ranks",
    where: {
      OR: [
        {
          name: name,
        },
        {
          slug: slug,
        },
      ],
    },
  });
  if (check) {
    const error = new Error("Rank already exists");
    error.status = 400;
    throw error;
  }
  const data = await db.create({
    model: "ranks",
    data: { name, slug, color, ageRange },
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      ageRange: true,
      createdAt: true,
    },
  });
  return data;
};

export const getRank = async (req, res, next) => {
  const { id } = req.params;
  const data = await db.findOne({
    model: "ranks",
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      ageRange: true,
      createdAt: true,
    },
  });
  if (!data) {
    const error = new Error("Rank not found");
    error.status = 404;
    throw error;
  }
  return data;
};

export const updateRank = async (req, res, next) => {
  const { id } = req.params;
  const { name, color, ageRange } = req.body;

  const rank = await db.findOne({
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
        OR: [{ name }, { slug }],
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
  if (color) {
    updateData.color = color;
  }

  if (ageRange) {
    updateData.ageRange = ageRange;
  }

  const data = await db.updateOne({
    model: "ranks",
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      ageRange: true,
      createdAt: true,
    },
  });

  return data;
};

export const deleteRank = async (req, res, next) => {
  const { id } = req.params;

  const rank = await db.findOne({
    model: "ranks",
    where: { id },
  });

  if (!rank) {
    const error = new Error("Rank not found");
    error.status = 404;
    throw error;
  }

  const data = await db.deleteOne({
    model: "ranks",
    where: { id },
  });

  return data;
};
