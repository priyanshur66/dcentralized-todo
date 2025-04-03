"use client";
import { Task } from '../DecentralizedTodoApp';
import TaskItem from './TaskItem';
import { Check } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onEditTask: (task: Task) => void;
  onShowDetails: (task: Task) => void;
}

const TaskList = ({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
  onShowDetails,
}: TaskListProps) => {
  const idMap = new Map<number, number>();
  

  // todo 

  const processedTasks = tasks.map(task => {
    if (idMap.has(task.id)) {
      const count = idMap.get(task.id)! + 1;
      idMap.set(task.id, count);
      
      // Create a modified task with a unique ID
      return {
        ...task,
        id: task.id * 1000 + count 
      };
    } else {
      // Add this ID to the map
      idMap.set(task.id, 1);
      
      // Return the original task
      return task;
    }
  });
  
  return (
    <div className="space-y-3">
      {processedTasks.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-gray-400 mb-4">
            <Check size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600">All caught up!</h3>
          <p className="text-gray-500 mt-1 text-sm">No tasks match your current filters.</p>
        </div>
      ) : (
        processedTasks.map(task => (
          <TaskItem
            key={`task-${task.id}`} 
            task={task}
            onToggleComplete={onToggleComplete}
            onDelete={onDeleteTask}
            onEdit={onEditTask}
            onShowDetails={onShowDetails}
          />
        ))
      )}
    </div>
  );
};

export default TaskList;