"use client";
import { Plus } from 'lucide-react';

interface TaskListControlsProps {
  activeTab: "all" | "pending" | "completed";
  setActiveTab: (tab: "all" | "pending" | "completed") => void;
  onAddTask: () => void;
}

const TaskListControls = ({ activeTab, setActiveTab, onAddTask }: TaskListControlsProps) => {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between w-full">
      <div className="flex space-x-1 border border-gray-200 rounded-md p-0.5">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1 text-sm rounded-md ${activeTab === "all" ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-3 py-1 text-sm rounded-md ${activeTab === "pending" ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-3 py-1 text-sm rounded-md ${activeTab === "completed" ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Completed
        </button>
      </div>

      <button
        onClick={onAddTask}
        className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center hover:bg-blue-700 transition text-sm shadow-sm"
      >
        <Plus size={16} className="mr-1" /> Add Task
      </button>
    </div>
  );
};

export default TaskListControls;