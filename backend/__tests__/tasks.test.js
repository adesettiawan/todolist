const request = require("supertest");
const app = require("../server"); // Import aplikasi
const db = require("../models"); // Import Sequelize models

// Before all tests, sync the database (create tables if not exist)
// and clear it.
beforeAll(async () => {
  // For this example, we'll just clear the 'development' database tasks table.
  try {
    await db.sequelize.sync({ force: false }); // Ensure tables exist without dropping if already exist
    // Clear the tasks table before running tests
    await db.Task.destroy({ truncate: true, restartIdentity: true });
    console.log("Database tasks table cleared for testing.");
  } catch (error) {
    console.error("Error in beforeAll setup:", error);
    // If there's an error connecting to DB or clearing, exit tests
    process.exit(1);
  }
});

// After all tests, close the database connection
afterAll(async () => {
  await db.sequelize.close(); // Close Sequelize connection pool
  console.log("Database connection closed.");
});

describe("Tasks API", () => {
  let taskId; // Variable to store task ID for subsequent tests

  // Test GET /api/tasks
  test("GET /api/tasks should return an empty array initially", async () => {
    const response = await request(app).get("/api/tasks");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Test POST /api/tasks
  test("POST /api/tasks should create a new task", async () => {
    const newTask = { description: "Test Task 1" };
    const response = await request(app).post("/api/tasks").send(newTask);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.description).toBe(newTask.description);
    expect(response.body.is_completed).toBe(false);
    expect(response.body.order_index).toBe(1); // First task should have order_index 1
    taskId = response.body.id; // Save ID for future tests
  });

  // Test POST /api/tasks with missing description
  test("POST /api/tasks should return 400 if description is missing", async () => {
    const response = await request(app).post("/api/tasks").send({}); // Empty body

    expect(response.statusCode).toBe(400);
    expect(response.body.msg).toBe("Description is required");
  });

  // Test GET /api/tasks after adding a task
  test("GET /api/tasks should return the newly created task", async () => {
    const response = await request(app).get("/api/tasks");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toBe(taskId);
    expect(response.body[0].description).toBe("Test Task 1");
  });

  // Test PUT /api/tasks/:id (update description)
  test("PUT /api/tasks/:id should update the task description", async () => {
    const updatedDescription = "Updated Test Task 1";
    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ description: updatedDescription });

    expect(response.statusCode).toBe(200);
    expect(response.body.description).toBe(updatedDescription);
    expect(response.body.id).toBe(taskId);
  });

  // Test PUT /api/tasks/:id (toggle complete status)
  test("PUT /api/tasks/:id should toggle task completion status", async () => {
    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ is_completed: true });

    expect(response.statusCode).toBe(200);
    expect(response.body.is_completed).toBe(true);
    expect(response.body.id).toBe(taskId);
  });

  // Test PUT /api/tasks/:id for non-existent task
  test("PUT /api/tasks/:id should return 404 for non-existent task", async () => {
    const nonExistentId = 9999;
    const response = await request(app)
      .put(`/api/tasks/${nonExistentId}`)
      .send({ description: "Non existent" });

    expect(response.statusCode).toBe(404);
    expect(response.body.msg).toBe("Task not found");
  });

  // Test PUT /api/tasks/reorder
  test("PUT /api/tasks/reorder should update task order", async () => {
    // Add a second task for reordering
    const newTask2 = { description: "Test Task 2" };
    await request(app).post("/api/tasks").send(newTask2);

    const tasksBeforeReorder = await request(app).get("/api/tasks");
    const task1 = tasksBeforeReorder.body.find(
      (t) => t.description === "Updated Test Task 1"
    );
    const task2 = tasksBeforeReorder.body.find(
      (t) => t.description === "Test Task 2"
    );

    // Swap order: task1 (id: taskId) to 2, task2 to 1
    const reorderPayload = {
      tasks: [
        { id: task1.id, order_index: 2 },
        { id: task2.id, order_index: 1 },
      ],
    };

    const response = await request(app)
      .put("/api/tasks/reorder")
      .send(reorderPayload);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].description).toBe("Test Task 2"); // Should be first now
    expect(response.body[0].order_index).toBe(1);
    expect(response.body[1].description).toBe("Updated Test Task 1"); // Should be second now
    expect(response.body[1].order_index).toBe(2);
  });

  // Test DELETE /api/tasks/:id
  test("DELETE /api/tasks/:id should delete the task", async () => {
    const response = await request(app).delete(`/api/tasks/${taskId}`); // Use the ID saved from creation

    expect(response.statusCode).toBe(200);
    expect(response.body.msg).toBe("Task deleted successfully");

    // Verify task is actually deleted
    const getResponse = await request(app).get("/api/tasks");
    expect(getResponse.statusCode).toBe(200);
    // Expecting one remaining task after deleting the first one
    expect(getResponse.body.length).toBe(1);
    expect(getResponse.body.find((t) => t.id === taskId)).toBeUndefined();
  });

  // Test DELETE /api/tasks/:id for non-existent task
  test("DELETE /api/tasks/:id should return 404 for non-existent task", async () => {
    const nonExistentId = 9999;
    const response = await request(app).delete(`/api/tasks/${nonExistentId}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.msg).toBe("Task not found");
  });
});
