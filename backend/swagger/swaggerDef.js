const swaggerDef = {
  openapi: "3.0.0", // Versi OpenAPI Specification
  info: {
    title: "Todo List API", // Nama API
    version: "1.0.0", // Versi API
    description:
      "API documentation for a simple Todo List application using Node.js, Express, and Sequelize.",
    contact: {
      name: "Ade Setiawan",
      email: "adesetiawan0675@gmail.com",
    },
  },
  servers: [
    {
      url: "http://localhost:5000/api", // Base URL API
      description: "Development server",
    },
  ],
  components: {
    schemas: {
      Task: {
        type: "object",
        required: ["description", "order_index"],
        properties: {
          id: {
            type: "integer",
            format: "int64",
            readOnly: true,
            description: "Unique identifier for the task.",
          },
          description: {
            type: "string",
            description: "The description of the task.",
          },
          is_completed: {
            type: "boolean",
            default: false,
            description: "Indicates if the task is completed.",
          },
          order_index: {
            type: "integer",
            description: "The order index of the task in the list.",
          },
          created_at: {
            type: "string",
            format: "date-time",
            readOnly: true,
            description: "The timestamp when the task was created.",
          },
          updated_at: {
            type: "string",
            format: "date-time",
            readOnly: true,
            description: "The timestamp when the task was last updated.",
          },
        },
        example: {
          // Contoh representasi objek Task
          id: 1,
          description: "Buy groceries",
          is_completed: false,
          order_index: 1,
          created_at: "2023-10-27T10:00:00.000Z",
          updated_at: "2023-10-27T10:00:00.000Z",
        },
      },
      NewTask: {
        // Skema untuk membuat task baru (tanpa ID, created_at, updated_at)
        type: "object",
        required: ["description"],
        properties: {
          description: {
            type: "string",
            description: "The description of the new task.",
          },
        },
        example: {
          description: "Learn Swagger",
        },
      },
      UpdateTask: {
        // Skema untuk mengupdate task
        type: "object",
        properties: {
          description: {
            type: "string",
            description: "The new description of the task.",
          },
          is_completed: {
            type: "boolean",
            description: "The new completion status of the task.",
          },
          order_index: {
            type: "integer",
            description: "The new order index of the task.",
          },
        },
        example: {
          description: "Updated task description",
          is_completed: true,
        },
      },
      ReorderTasks: {
        // Skema untuk reorder tasks
        type: "object",
        required: ["tasks"],
        properties: {
          tasks: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "order_index"],
              properties: {
                id: {
                  type: "integer",
                  description: "ID of the task.",
                },
                order_index: {
                  type: "integer",
                  description: "New order index for the task.",
                },
              },
            },
          },
        },
        example: {
          tasks: [
            { id: 1, order_index: 2 },
            { id: 2, order_index: 1 },
          ],
        },
      },
    },
  },
};

module.exports = swaggerDef;
