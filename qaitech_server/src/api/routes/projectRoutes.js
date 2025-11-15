const express = require("express");
const router = express.Router();
const {
  createProject,
  getMyWorkSpaces,
} = require("../../services/projectService");
const { WorkSpaceSchema } = require("../../utils/validation");
const prisma = require("../../db/db");

/**
 * Создание нового проекта.
 * @route POST /api/projects
 * @param {string} title - Название проекта.
 * @param {string} description - Описание проекта.
 * @param {string} userId - ID пользователя, создающего проект.
 * @returns {Object} - Созданный проект.
 */
router.post("/get_user_workspaces", async (req, res) => {
  try {
    const userId = req?.session?.user?.id;
    const { cursor, input } = req?.body;

    const data = await getMyWorkSpaces(cursor, userId, input);

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch workspaces" });
  }
});

router.post("/create", async (req, res) => {
  try {
    // if (process.env.DISABLE_AUTH === "true") {
    //   // Разрешаем только один workspace с названием 'Main Workspace'
    //   const mainWorkspace = await prisma.project.findFirst({
    //     where: { title: "Main Workspace" },
    //   });
    //   if (mainWorkspace) {
    //     return res
    //       .status(403)
    //       .json({
    //         error:
    //           "Создание дополнительных воркспейсов запрещено в режиме DISABLE_AUTH",
    //       });
    //   }
    //   // Принудительно устанавливаем название
    //   req.body.title = "Main Workspace";
    // }
    const userId = req?.session?.user?.id;
    const formData = req?.body;

    // валидация полей
    const validatedFields = WorkSpaceSchema.safeParse(formData);

    if (!validatedFields.success)
      return res.status(500).json({ error: "Check form data" });

    const { title } = validatedFields.data;
    // валидация полей

    const data = await createProject(title, userId);

    return res
      .status(200)
      .json({ data, message: "Workspace created successfully!" });
  } catch (err) {
    return res.status(500).json({ error: "Failed create workspace" });
  }
});

module.exports = router;
