const express = require("express");
const cors = require("cors");
const db = require("./models");

require("dotenv").config();

// Swagger UI & JSDoc imports
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerDef = require("./swagger/swaggerDef"); // Swagger definition

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Swagger Setup ---
// Options for swagger-jsdoc
const swaggerOptions = {
  swaggerDefinition: swaggerDef,
  // path to the API docs (where you define routes and schemas in JSDoc format)
  apis: ["./server.js"],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI at a specific route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- API Routes ---

/**
 * @swagger
 * /api/tasks:
 * get:
 * summary: Retrieve a list of all tasks
 * tags: [Tasks]
 * responses:
 * 200:
 * description: A list of tasks.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Task'
 * 500:
 * description: Server error
 */
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await db.Task.findAll({
      order: [
        ["order_index", "ASC"],
        ["id", "ASC"],
      ],
    });
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /api/tasks:
 * post:
 * summary: Create a new task
 * tags: [Tasks]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/NewTask'
 * responses:
 * 201:
 * description: The newly created task.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Task'
 * 400:
 * description: Bad request (e.g., description is missing)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * msg:
 * type: string
 * example: "Description is required"
 * 500:
 * description: Server error
 */
app.post("/api/tasks", async (req, res) => {
  const { description } = req.body;
  if (!description || description.trim() === "") {
    return res.status(400).json({ msg: "Description is required" });
  }
  try {
    const maxOrderTask = await db.Task.findOne({
      attributes: [
        [
          db.sequelize.fn("MAX", db.sequelize.col("order_index")),
          "maxOrderIndex",
        ],
      ],
      raw: true,
    });
    const newOrderIndex = (maxOrderTask.maxOrderIndex || 0) + 1;

    const newTask = await db.Task.create({
      description: description.trim(),
      is_completed: false,
      order_index: newOrderIndex,
    });
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Error adding task:", err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /api/tasks/reorder:
 * put:
 * summary: Reorder tasks
 * tags: [Tasks]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ReorderTasks'
 * responses:
 * 200:
 * description: A list of tasks with updated order.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Task'
 * 400:
 * description: Bad request (e.g., invalid tasks array provided)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * msg:
 * type: string
 * example: "Invalid tasks array provided"
 * 500:
 * description: Server error
 */
app.put("/api/tasks/reorder", async (req, res) => {
  const { tasks } = req.body;
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ msg: "Invalid tasks array provided" });
  }

  const t = await db.sequelize.transaction();
  try {
    for (const taskData of tasks) {
      if (
        typeof taskData.id !== "number" ||
        typeof taskData.order_index !== "number"
      ) {
        throw new Error(
          "Invalid task object in reorder array: id or order_index missing/invalid"
        );
      }
      await db.Task.update(
        { order_index: taskData.order_index },
        { where: { id: taskData.id }, transaction: t }
      );
    }
    await t.commit();

    const updatedTasks = await db.Task.findAll({
      order: [
        ["order_index", "ASC"],
        ["id", "ASC"],
      ],
    });
    res.json(updatedTasks);
  } catch (err) {
    await t.rollback();
    console.error("Error during task reorder transaction:", err.message);
    res.status(500).send("Server Error during reorder");
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 * put:
 * summary: Update an existing task
 * tags: [Tasks]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: The task ID
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UpdateTask'
 * responses:
 * 200:
 * description: The updated task.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Task'
 * 400:
 * description: Bad request (e.g., no fields provided for update)
 * 404:
 * description: Task not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * msg:
 * type: string
 * example: "Task not found"
 * 500:
 * description: Server error
 */
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { description, is_completed, order_index } = req.body;

  try {
    const task = await db.Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    if (description !== undefined) {
      task.description = description.trim();
    }
    if (is_completed !== undefined) {
      task.is_completed = is_completed;
    }
    if (order_index !== undefined) {
      task.order_index = order_index;
    }

    if (
      description === undefined &&
      is_completed === undefined &&
      order_index === undefined
    ) {
      return res.status(400).json({ msg: "No fields provided for update" });
    }

    await task.save();
    res.json(task);
  } catch (err) {
    console.error("Error updating task:", err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 * delete:
 * summary: Delete a task
 * tags: [Tasks]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: The task ID
 * responses:
 * 200:
 * description: Task deleted successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * msg:
 * type: string
 * example: "Task deleted successfully"
 * 404:
 * description: Task not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * msg:
 * type: string
 * example: "Task not found"
 * 500:
 * description: Server error
 */
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const task = await db.Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }
    await task.destroy();
    res.json({ msg: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err.message);
    res.status(500).send("Server Error");
  }
});

// Start the server only if this file is run directly (not imported for testing)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
    console.log(`API Docs available at http://localhost:${port}/api-docs`);
  });
}

// Export the app instance for testing
module.exports = app;
