"use client";
import { Plus } from 'lucide-react';

interface TaskListControlsProps {
  activeTab: "all" | "pending" | "completed";
  onSetTab: (tab: "all" | "pending" | "completed") => void;
  onShowAddTask: () => void;
}

const TaskListControls = ({ activeTab, onSetTab, onShowAddTask }: TaskListControlsProps) => {
  return (
    <div className="bg-white p-4 flex justify-between items-center border-b flex-shrink-0">
      <div className="flex space-x-1 border border-gray-200 rounded-md p-0.5">
        <button
          onClick={() => onSetTab("all")}
          className={`px-3 py-1 text-sm rounded-md ${activeTab === "all" ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          All
        </button>
        <button
          onClick={() => onSetTab("pending")}
          className={`px-3 py-1 text-sm rounded-md ${activeTab === "pending" ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Pending
        </button>
        <button
          onClick={() => onSetTab("completed")}
          className={`px-3 py-1 text-sm rounded-md ${activeTab === "completed" ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Completed
        </button>
      </div>

      <button
        onClick={onShowAddTask}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition text-sm shadow-sm"
      >
        <Plus size={16} className="mr-1" /> Add Task
      </button>
    </div>
  );
};

export default TaskListControls;