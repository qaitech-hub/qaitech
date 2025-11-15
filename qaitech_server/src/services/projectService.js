const prisma = require("../db/db");

/**
 * Создает новый проект.
 * @param {string} title - Название проекта.
 * @param {string} description - Описание проекта.
 * @param {string} userId - ID пользователя, создающего проект.
 * @returns {Promise<Object>} - Созданный проект.
 */
const createProject = async (title, userId) => {
  try {
    const project = await prisma.project.create({
      data: {
        title,
        description: "",
        UserProject: {
          create: {
            userId,
          },
        },
      },
      include: {
        UserProject: true, // Включаем связь с пользователем
      },
    });

    return project;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

const getMyWorkSpaces = async (cursor, userId, input = "") => {
  const data = await prisma.userProject.findMany({
    take: 11,
    ...(cursor && cursor.length > 0 && { cursor: { id: cursor }, skip: 1 }),
    where: {
      userId,
      project: {
        title: {
          contains: input,
        },
      },
    },
    select: {
      project: {
        include: {
          _count: {
            select: {
              Page: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // console.log(data);

  const hasNextPage = data.length > 10;
  let slicedPosts = data;
  if (data.length > 10) {
    slicedPosts = data.slice(0, -1);
  }

  const result = slicedPosts.map((item) => {
    item = item?.project;

    return item;
  });

  const lastPostInResults = result[result.length - 1];
  const newCursor = lastPostInResults?.id || "";
  return {
    data: result,
    hasNextPage: hasNextPage,
    cursor: newCursor,
  };
};

module.exports = {
  createProject,
  getMyWorkSpaces,
};
