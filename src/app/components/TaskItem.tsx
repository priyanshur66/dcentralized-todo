"use client";
import { Task } from '../DecentralizedTodoApp'; 
import { Check, Calendar, Edit, Trash2, Shield, DollarSign } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  onShowDetails: (task: Task) => void;
}

const TaskItem = ({ task, onToggleComplete, onDelete, onEdit, onShowDetails }: TaskItemProps) => {
  // Check if the task has a bounty
  const hasBounty = task.bounty && parseFloat(task.bounty) > 0;
  
  // Check if the task is verified on blockchain
  const isVerifiedOnBlockchain = task.blockchainHash && task.blockchainHash !== '0x0000000000000000000000000000000000000000000000000000000000000000';

  return (
    <div
      onClick={() => onShowDetails(task)}
      className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer flex items-center group"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(task.id);
        }}
        title={task.completed ? "Mark as Pending" : "Mark as Completed"}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mr-4 transition-colors duration-200 ${
          task.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-400 hover:border-blue-400 group-hover:border-blue-400'
        }`}
      >
        {task.completed && <Check size={12} strokeWidth={3}/>}
      </button>

      {/* Task Info */}
      <div className="flex-grow overflow-hidden">
        <div className="flex items-center">
          <h3 className={`font-medium truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
            {task.title}
          </h3>
          {isVerifiedOnBlockchain && (
            <span 
              className="ml-2 text-green-600" 
              title="Verified on blockchain"
            >
              <Shield size={14} />
            </span>
          )}
          {hasBounty && (
            <span 
              className="ml-2 bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center"
              title={`${task.bounty} USDT bounty`}
            >
              <DollarSign size={10} className="mr-0.5" />
              {task.bounty}
            </span>
          )}
        </div>
        
        {/* Short description preview if available */}
        {task.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5 mb-1 max-w-[90%]">
            {task.description.substring(0, 80)}
            {task.description.length > 80 ? '...' : ''}
          </p>
        )}
        
        <div className="flex items-center flex-wrap mt-1 text-xs text-gray-500 gap-x-3 gap-y-1">
          <div className="flex items-center" title="Due Date">
            <Calendar size={12} className="mr-1 text-gray-600" />
            <span className="text-gray-600">{task.due}</span>
          </div>
          <div
            title="Priority"
            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
              task.priority === 'high' ? 'bg-red-100 text-red-800' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}
          >
            {task.priority}
          </div>
           <div title="Category" className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                {task.category}
           </div>
        </div>
      </div>

      <div className="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
          title="Edit Task"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id); 
          }}
          className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
           title="Delete Task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;