"use client";
import { Task } from '../../DecentralizedTodoApp'; 
import { X, Calendar, Edit } from 'lucide-react';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onToggleComplete: (id: number) => void;
}

const TaskDetailsModal = ({ task, onClose, onEdit, onToggleComplete }: TaskDetailsModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold break-words mr-4">{task.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            title="Close Details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 mb-6">
           {/* Status */}
           <div className="flex justify-between items-center py-1 border-b border-gray-100">
             <span className="text-sm font-medium text-gray-500">Status</span>
             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
               task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
             }`}>
               {task.completed ? 'Completed' : 'Pending'}
             </span>
           </div>
           {/* Priority */}
           <div className="flex justify-between items-center py-1 border-b border-gray-100">
             <span className="text-sm font-medium text-gray-500">Priority</span>
             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
               task.priority === 'high' ? 'bg-red-100 text-red-800' :
               task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
               'bg-green-100 text-green-800'
             }`}>
               {task.priority}
             </span>
           </div>
           {/* Due Date */}
           <div className="flex justify-between items-center py-1 border-b border-gray-100">
             <span className="text-sm font-medium text-gray-500">Due Date</span>
             <span className="flex items-center text-sm">
               <Calendar size={14} className="mr-1.5 text-gray-400" />
               {task.due}
             </span>
           </div>
            {/* Category */}
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
               <span className="text-sm font-medium text-gray-500">Category</span>
               <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">{task.category}</span>
            </div>
            {/* Blockchain Verification sample */}
            <div className="pt-2">
              <div className="text-sm font-medium text-gray-500 mb-1">Blockchain Verification (Mock)</div>
              <div className="bg-gray-50 p-2 rounded text-xs font-mono break-all text-gray-600">
                0x{task.id.toString(16)}f9c...d7c6b {/* Simple mock hash */}
              </div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:space-x-3 sm:justify-end space-y-2 sm:space-y-0">
          <button
            onClick={() => onEdit(task)}
            className="flex items-center justify-center border px-4 py-2 rounded hover:bg-gray-50 text-sm w-full sm:w-auto"
          >
            <Edit size={16} className="mr-1.5" /> Edit Task
          </button>
          <button
            onClick={() => {
                onToggleComplete(task.id);
                onClose(); 
            }}
            className={`flex items-center justify-center px-4 py-2 rounded text-sm text-white w-full sm:w-auto ${
              task.completed ?
              'bg-yellow-500 hover:bg-yellow-600' :
              'bg-green-500 hover:bg-green-600'
            }`}
          >
            {task.completed ? 'Mark as Pending' : 'Mark as Completed'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;