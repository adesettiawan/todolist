import React, { useState } from "react";
import { FaTrash, FaCheckCircle, FaRegCircle, FaBars } from "react-icons/fa";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";

const TodoItem = ({
  task,
  onToggleComplete,
  onUpdateDescription,
  onDeleteTask,
  isOverlay = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = isOverlay
    ? {
        attributes: {},
        listeners: {},
        setNodeRef: () => {},
        transform: null,
        transition: null,
        isDragging: true,
      }
    : useSortable({ id: task.id });

  const style = isOverlay
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : "auto",
        opacity: isDragging ? 0.8 : 1,
      };

  const handleDoubleClick = () => {
    if (!isOverlay) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    if (!isOverlay && editedDescription.trim() !== task.description) {
      onUpdateDescription(task.id, editedDescription.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (!isOverlay && e.key === "Enter") {
      handleBlur();
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center justify-between p-4 rounded-lg transition-all duration-200 ease-in-out
        ${
          isOverlay
            ? "bg-blue-50 shadow-xl transform scale-[1.02] border-2 border-blue-400 opacity-90"
            : isDragging
            ? "bg-blue-50 shadow-md transform scale-[1.02] border-2 border-blue-400"
            : "bg-white shadow-sm hover:shadow-md"
        }
        ${
          task.is_completed
            ? "bg-green-50 text-gray-500 opacity-80"
            : "text-gray-800"
        }
        ${isDragging && task.is_completed ? "opacity-100" : ""}
        ${isEditing ? "border border-blue-300" : ""}
      `}
    >
      {/* Drag Handle - Hanya tampilkan dan aktifkan jika BUKAN overlay */}
      {!isOverlay && (
        <Tippy
          content="Seret untuk mengubah urutan"
          placement="left"
          animation="scale"
        >
          <div
            {...listeners}
            {...attributes}
            className="mr-3 cursor-grab text-gray-400 hover:text-gray-600 p-1 -ml-1 transition-colors duration-150"
            aria-label="Drag to reorder task"
          >
            <FaBars className="text-xl" />
          </div>
        </Tippy>
      )}

      <div className="flex items-center flex-grow">
        {/* Checkbox/Icon for completion - Nonaktifkan interaksi jika overlay */}
        <Tippy
          content={
            task.is_completed ? "Tandai belum selesai" : "Tandai selesai"
          }
          placement="top"
          animation="scale"
        >
          <div
            onClick={
              !isOverlay
                ? () => onToggleComplete(task.id, task.is_completed)
                : undefined
            }
            className={!isOverlay ? "cursor-pointer" : "cursor-default"}
          >
            {task.is_completed ? (
              <FaCheckCircle className="text-green-500 text-2xl mr-3" />
            ) : (
              <FaRegCircle className="text-gray-400 text-2xl mr-3 hover:text-blue-500 transition-colors duration-150" />
            )}
          </div>
        </Tippy>

        {/* Task Description - Nonaktifkan edit jika overlay */}
        {isEditing && !isOverlay ? (
          <input
            type="text"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            autoFocus
            className="flex-grow p-1 -ml-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-lg"
            style={{ minWidth: "0" }}
          />
        ) : (
          <Tippy
            content="Double click untuk mengedit tugas"
            placement="top"
            animation="scale"
            disabled={isOverlay}
          >
            <span
              className={`cursor-pointer flex-grow text-lg font-medium select-none ${
                task.is_completed
                  ? "line-through text-gray-500"
                  : "text-gray-800"
              }`}
              onDoubleClick={handleDoubleClick}
            >
              {task.description}
            </span>
          </Tippy>
        )}
      </div>

      {/* Tombol Hapus - Nonaktifkan interaksi jika overlay */}
      <Tippy content="Hapus tugas" placement="right" animation="scale">
        <button
          onClick={!isOverlay ? () => onDeleteTask(task.id) : undefined}
          disabled={isOverlay} // Nonaktifkan tombol jika overlay
          className={`ml-4 p-2 rounded-full text-red-400 ${
            !isOverlay
              ? "hover:bg-red-100 hover:text-red-600"
              : "opacity-50 cursor-not-allowed"
          } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
          aria-label="Delete task"
        >
          <FaTrash className="text-xl" />
        </button>
      </Tippy>
    </li>
  );
};

export default TodoItem;
