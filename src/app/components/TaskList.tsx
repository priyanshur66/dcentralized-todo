"use client";
import { Task } from '../DecentralizedTodoApp';
import TaskItem from './TaskItem';
import { Check, Plus } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  onShowDetails: (task: Task) => void;
  onShowAddTask: () => void; 
}

const TaskList = ({
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onShowDetails,
  onShowAddTask,
}: TaskListProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Check size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600">All caught up!</h3>
          <p className="text-gray-500 mt-1 text-sm">No tasks match your current filters.</p>
          <button
            onClick={onShowAddTask}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition mx-auto text-sm"
          >
            <Plus size={16} className="mr-1" /> Add New Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onShowDetails={onShowDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;