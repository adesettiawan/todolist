import React, { useState, useEffect } from "react";
import TodoItem from "./TodoItem";
import axios from "axios";

// Impor dari @dnd-kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null); // State untuk item yang sedang diseret
  const API_URL = "http://localhost:5000/api/tasks";

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (newTaskDescription.trim() === "") return;

    try {
      const response = await axios.post(API_URL, {
        description: newTaskDescription,
      });
      setTasks([...tasks, response.data]);
      setNewTaskDescription("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleComplete = async (id, is_completed) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        is_completed: !is_completed,
      });
      setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
    } catch (error) {
      console.error("Error toggling task complete status:", error);
    }
  };

  const updateTaskDescription = async (id, newDescription) => {
    if (newDescription.trim() === "") return;
    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        description: newDescription,
      });
      setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
    } catch (error) {
      console.error("Error updating task description:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  function handleDragStart(event) {
    setActiveId(event.active.id);
    // Menemukan objek tugas yang sesuai dengan ID yang diseret
    const draggedTask = tasks.find((task) => task.id === event.active.id);
    setActiveTask(draggedTask);
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrderedTasks = arrayMove(items, oldIndex, newIndex);

        const payload = newOrderedTasks.map((task, index) => ({
          id: task.id,
          order_index: index + 1,
        }));

        axios
          .put(`${API_URL}/reorder`, { tasks: payload })
          .then((response) => {
            // data if backend sends ordered tasks
          })
          .catch((error) => {
            console.error("Error reordering tasks:", error);
            fetchTasks(); // Rollback local state if API fails
          });

        return newOrderedTasks;
      });
    }
    setActiveId(null);
    setActiveTask(null); // Reset active task
  }

  function handleDragCancel() {
    setActiveId(null);
    setActiveTask(null);
  }

  return (
    <div>
      <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          placeholder="Tambahkan tugas baru..."
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 text-base"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 text-base font-semibold"
        >
          Add Task
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="text-center text-gray-500 text-lg py-8">
          Belum ada tugas. Tambahkan satu untuk memulai! 🎉
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-3">
              {tasks.map((task) => (
                <TodoItem
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleComplete}
                  onUpdateDescription={updateTaskDescription}
                  onDeleteTask={deleteTask}
                />
              ))}
            </ul>
          </SortableContext>

          {/* Drag Overlay untuk item yang sedang diseret */}
          <DragOverlay
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          >
            {activeTask ? (
              <TodoItem task={activeTask} isOverlay={true} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

export default TodoList;
