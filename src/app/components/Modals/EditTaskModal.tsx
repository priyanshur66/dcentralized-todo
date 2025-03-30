"use client";
import { useState, useEffect } from 'react';
import { Task } from '../../DecentralizedTodoApp'; 
import { X, Trash2 } from 'lucide-react';

interface EditTaskModalProps {
  task: Task;
  allCategories: string[]; // all unique categories
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete: (id: number) => void; 
}

const EditTaskModal = ({ task, allCategories, onClose, onSave, onDelete }: EditTaskModalProps) => {
  const [editedTask, setEditedTask] = useState<Task>(task);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setEditedTask(prev => ({ ...prev, [name]: checked }));
    };


  const handleSaveChanges = () => {
    onSave(editedTask);
    //will be called by the parent component after saving if needed
  };

  const handleDelete = () => {
      onDelete(editedTask.id);
      // onClose() will be called by parent component after delete confirms/completes
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
       <div className="absolute inset-0" onClick={onClose}></div>
       <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl relative z-10">
        <div className="flex justify-between items-start mb-5">
          <h2 className="text-xl font-semibold">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            title="Cancel Edit"
          >
            <X size={20} />
          </button>
        </div>

         <div className="space-y-4 mb-6">
            <div>
                <label htmlFor="edit-title" className="block text-sm font-medium mb-1 text-gray-700">Title</label>
                <input
                  id="edit-title"
                  name="title" 
                  type="text"
                  value={editedTask.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                />
             </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-due" className="block text-sm font-medium mb-1 text-gray-700">Due Date</label>
                <input
                  id="edit-due"
                  name="due" 
                  type="date"
                  value={editedTask.due}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div>
                <label htmlFor="edit-priority" className="block text-sm font-medium mb-1 text-gray-700">Priority</label>
                <select
                  id="edit-priority"
                  name="priority" 
                  value={editedTask.priority}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded capitalize text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white" // Added bg-white
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="edit-category" className="block text-sm font-medium mb-1 text-gray-700">Category</label>
              <select
                id="edit-category"
                name="category" 
                value={editedTask.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white" // Added bg-white
              >
                {allCategories
                    .sort() 
                    .map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))
                }
                {/* todo : Add an option to create a new category */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1 flex items-center">
                <input
                  type="checkbox"
                  id={`edit-completed-${editedTask.id}`}
                  name="completed" 
                  checked={editedTask.completed}
                  onChange={handleCheckboxChange} 
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`edit-completed-${editedTask.id}`} className="text-sm text-gray-700 cursor-pointer">Mark as Completed</label>
              </div>
            </div>
         </div>


        <div className="flex justify-between items-center pt-4 border-t">
           <button
             onClick={handleDelete} // the local handler 
             className="px-4 py-2 border border-red-300 rounded bg-red-50 text-red-600 hover:bg-red-100 text-sm flex items-center transition-colors"
             title="Delete this task permanently"
           >
             <Trash2 size={14} className="mr-1.5" /> Delete
           </button>
           <div className="flex space-x-3">
             <button
               onClick={onClose} 
               className="px-4 py-2 border rounded hover:bg-gray-100 text-sm transition-colors"
             >
               Cancel
             </button>
             <button
               onClick={handleSaveChanges}
               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm transition-colors shadow-sm"
             >
               Save Changes
             </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;