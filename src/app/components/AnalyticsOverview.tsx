"use client";
import { BarChart } from 'lucide-react';
import { Task } from '../DecentralizedTodoApp';
import { useMemo } from 'react';

interface AnalyticsOverviewProps {
  tasks: Task[];
}

const AnalyticsOverview = ({ tasks }: AnalyticsOverviewProps) => {
  // Calculate statistics
  const stats = useMemo(() => {
    const completedCount = tasks.filter(task => task.completed).length;
    const pendingCount = tasks.length - completedCount;
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
    
    return {
      progress: Math.round(progress),
      completedCount,
      pendingCount,
      totalCount: tasks.length
    };
  }, [tasks]);

  return (
    <div className="bg-white border-t p-4 flex-shrink-0 mt-4">
      <h3 className="font-semibold flex items-center text-sm mb-3 text-gray-700">
        <BarChart size={16} className="mr-2" />
        Overview
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-xs text-blue-700 mb-0.5">Completion</div>
          <div className="text-xl font-semibold text-blue-900">{stats.progress}%</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-xs text-green-700 mb-0.5">Completed</div>
          <div className="text-xl font-semibold text-green-900">{stats.completedCount}</div>
        </div>
         <div className="bg-yellow-50 p-3 rounded-lg text-center">
          <div className="text-xs text-yellow-700 mb-0.5">Pending</div>
          <div className="text-xl font-semibold text-yellow-900">{stats.pendingCount}</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <div className="text-xs text-purple-700 mb-0.5">Total Tasks</div>
          <div className="text-xl font-semibold text-purple-900">{stats.totalCount}</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;