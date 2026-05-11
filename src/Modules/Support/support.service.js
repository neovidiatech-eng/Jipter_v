import * as db from "../../database/dbService.js";

// ==============================
// Helpers
// ==============================

const throwError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};

const checkCategoryExists = async (categoryId) => {
  if (!categoryId) return null;

  const category = await db.findOne({
    model: "support_category",
    where: { id: categoryId },
  });

  if (!category) {
    throwError("CATEGORY_NOT_FOUND", 404);
  }

  return category;
};

const checkSupportExists = async (id) => {
  const support = await db.findOne({
    model: "support",
    where: { id },
  });

  if (!support) {
    throwError("SUPPORT_NOT_FOUND", 404);
  }

  return support;
};

const checkDuplicateSupportTitle = async (title, id = null) => {
  if (!title) return;

  const where = {
    title,
  };

  if (id) {
    where.id = {
      not: id,
    };
  }

  const existTitle = await db.findFirst({
    model: "support",
    where,
  });

  if (existTitle) {
    throwError("SUPPORT_TITLE_ALREADY_EXISTS", 409);
  }
};

const checkCategoryExistsById = async (id) => {
  const category = await db.findOne({
    model: "support_category",
    where: { id },
  });

  if (!category) {
    throwError("CATEGORY_NOT_FOUND", 404);
  }

  return category;
};

const checkDuplicateCategoryTitle = async (title, id = null) => {
  if (!title) return;

  const where = {
    title,
  };

  if (id) {
    where.id = {
      not: id,
    };
  }

  const existCategory = await db.findFirst({
    model: "support_category",
    where,
  });

  if (existCategory) {
    throwError("CATEGORY_ALREADY_EXISTS", 409);
  }
};

// ==============================
// Support Logic
// ==============================

export const getSupport = async ({ req }) => {
  const { active, categoryId, search } = req.query;

  const where = {};

  if (active !== undefined) {
    where.active = active === "true";
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  return await db.findMany({
    model: "support",
    where,
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getTeacherSupport = async ({ req }) => {
  const { active, categoryId, search } = req.query;

  const where = {};

  if (active !== undefined) {
    where.active = active === "true";
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const groupedData = await db.groupBy({
    model: "support",
    by: ["categoryId"],
    where,
    _count: {
      id: true,
      active: true,
    },
    _sum: {
      readingCount: true,
    },
  });

  const categoryIds = groupedData.map((item) => item.categoryId);

  const categories = await db.findMany({
    model: "support_category",
    where: {
      id: {
        in: categoryIds,
      },
    },
  });
const count = await db.count({
  model: "support",
});

const randomSkip = Math.floor(Math.random() * count);

const randomRows = await db.findMany({
  model: "support",
  skip: randomSkip,
  take: 4,
});

  const result = groupedData.map((item) => ({
    ...item,
    popular: randomRows,
    category: categories.find((category) => category.id === item.categoryId),
  }));
  return result;
};

export const getSupportById = async ({ req }) => {
  const { id } = req.params;

  const support = await db.findOne({
    model: "support",
    where: { id },
    include: {
      category: true,
    },
  });

  if (!support) {
    throwError("SUPPORT_NOT_FOUND", 404);
  }

  // Increment reading count
  await db.updateOne({
    model: "support",
    where: { id },
    data: {
      readingCount: {
        increment: 1,
      },
    },
  });

  return support;
};

export const createSupport = async ({ req }) => {
  const { title, url, description, categoryId, active = true } = req.body;

  await checkDuplicateSupportTitle(title);
  await checkCategoryExists(categoryId);

  return await db.create({
    model: "support",
    data: {
      title,
      url,
      description,
      categoryId,
      active,
    },
  });
};

export const updateSupport = async ({ req }) => {
  const { id } = req.params;

  await checkSupportExists(id);

  if (req.body.title) {
    await checkDuplicateSupportTitle(req.body.title, id);
  }

  if (req.body.categoryId) {
    await checkCategoryExists(req.body.categoryId);
  }

  return await db.updateOne({
    model: "support",
    where: { id },
    data: req.body,
  });
};

export const deleteSupport = async ({ req }) => {
  const { id } = req.params;

  await checkSupportExists(id);

  return await db.deleteOne({
    model: "support",
    where: { id },
  });
};

// ==============================
// Category Logic
// ==============================

export const getCategories = async ({ req }) => {
  const { active, search } = req.query;

  const where = {};

  if (active !== undefined) {
    where.active = active === "true";
  }

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  return await db.findMany({
    model: "support_category",
    where,
    include: {
      supports: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createCategory = async ({ req }) => {
  const { title, active = true } = req.body;

  await checkDuplicateCategoryTitle(title);

  return await db.create({
    model: "support_category",
    data: {
      title,
      active,
    },
  });
};

export const updateCategory = async ({ req }) => {
  const { id } = req.params;

  await checkCategoryExistsById(id);

  if (req.body.title) {
    await checkDuplicateCategoryTitle(req.body.title, id);
  }

  return await db.updateOne({
    model: "support_category",
    where: { id },
    data: req.body,
  });
};

export const deleteCategory = async ({ req }) => {
  const { id } = req.params;

  await checkCategoryExistsById(id);

  const supports = await db.findMany({
    model: "support",
    where: {
      categoryId: id,
    },
  });

  if (supports.length > 0) {
    throwError("CATEGORY_HAS_SUPPORTS", 409);
  }

  return await db.deleteOne({
    model: "support_category",
    where: { id },
  });
};
