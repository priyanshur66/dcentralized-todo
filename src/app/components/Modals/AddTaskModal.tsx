"use client";
import { useState } from 'react';
import { Brain } from 'lucide-react';

interface AddTaskModalProps {
    onClose: () => void;
    onAddTask: (title: string) => void;
}

const AddTaskModal = ({ onClose, onAddTask }: AddTaskModalProps) => {
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const handleAdd = () => {
        onAddTask(newTaskTitle);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
                <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

                <input
                    type="text"
                    placeholder="Task title (e.g., Deploy contract on Polygon)"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full p-2 border rounded mb-4 text-sm"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                />

                <div className="bg-blue-50 p-3 rounded mb-4 flex items-start">
                    <Brain size={18} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="text-blue-700 font-medium">AI Assistant</p>
                        <p className="text-blue-600">Priority & category are auto-detected from the title. You can edit them later.</p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded hover:bg-gray-50 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!newTaskTitle.trim()} // Disable if empty
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add Task
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTaskModal;