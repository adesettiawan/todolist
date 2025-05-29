import React from "react";
import TodoList from "./components/TodoList";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8 tracking-tight">
          🚀 My Todo List
        </h1>
        <TodoList />
      </div>
    </div>
  );
}

export default App;
