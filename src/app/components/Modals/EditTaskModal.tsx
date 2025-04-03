"use client";
import { useState, useEffect } from 'react';
import { Task } from '../../DecentralizedTodoApp'; 
import { X, ExternalLink } from 'lucide-react';

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

const EditTaskModal = ({ isOpen, task, onClose, onSave }: EditTaskModalProps) => {
  const [editedTask, setEditedTask] = useState<Task>(task);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: checked }));
  };

  const handleSaveChanges = () => {
    onSave(editedTask);
  };

  const openBlockchainExplorer = (hash: string) => {
    window.open(`https://sepolia.basescan.org/address/${hash}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
       <div className="absolute inset-0" onClick={onClose}></div>
       <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl relative z-10">
        <div className="flex justify-between items-start mb-5">
          <h2 className="text-xl font-semibold text-gray-800">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
                  className="w-full p-2 border border-gray-400 rounded text-sm text-gray-700 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                />
            </div>

            <div>
                <label htmlFor="edit-description" className="block text-sm font-medium mb-1 text-gray-700">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editedTask.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-400 rounded text-sm text-gray-700 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="Task description..."
                />
                <p className="mt-1 text-xs text-gray-600">
                  Note: Significant changes may trigger the AI to regenerate the description.
                </p>
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
                  className="w-full p-2 border border-gray-400 rounded text-sm text-gray-700 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div>
                <label htmlFor="edit-priority" className="block text-sm font-medium mb-1 text-gray-700">Priority</label>
                <select
                  id="edit-priority"
                  name="priority" 
                  value={editedTask.priority}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-400 rounded capitalize text-sm text-gray-700 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
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
                  className="mr-2 h-4 w-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`edit-completed-${editedTask.id}`} className="text-sm text-gray-700 cursor-pointer">Mark as Completed</label>
              </div>
            </div>

            <div>
              <label htmlFor="edit-category" className="block text-sm font-medium mb-1 text-gray-700">Category</label>
              <input
                id="edit-category"
                name="category" 
                type="text"
                value={editedTask.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded text-sm text-gray-700 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>

            {/* Blockchain Hash (read-only) */}
            {editedTask.blockchainHash && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Blockchain Verification</label>
                <div className="flex items-center">
                  <div className="bg-gray-50 p-2 rounded text-xs font-mono overflow-hidden text-gray-700 flex-grow border border-gray-300">
                    {editedTask.blockchainHash.substring(0, 10)}...
                    {editedTask.blockchainHash.substring(editedTask.blockchainHash.length - 8)}
                  </div>
                  <button 
                    onClick={() => openBlockchainExplorer(editedTask.blockchainHash || '')}
                    className="ml-2 p-2 text-blue-600 hover:text-blue-700"
                    title="View on Blockchain Explorer"
                    type="button"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Significant changes will create a new blockchain transaction.
                </p>
              </div>
            )}
         </div>


        <div className="flex justify-between items-center pt-4 border-t">
           <div></div>
           <div className="flex space-x-3">
             <button
               onClick={onClose} 
               className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100 text-sm transition-colors text-gray-700"
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