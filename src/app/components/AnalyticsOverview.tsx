"use client";
import { BarChart } from 'lucide-react';

interface AnalyticsOverviewProps {
  progress: number;
  completedCount: number;
  pendingCount: number;
  totalCount: number;
}

const AnalyticsOverview = ({
  progress,
  completedCount,
  pendingCount,
  totalCount
}: AnalyticsOverviewProps) => {
  return (
    <div className="bg-white border-t p-4 flex-shrink-0">
      <h3 className="font-semibold flex items-center text-sm mb-3 text-gray-700">
        <BarChart size={16} className="mr-2" />
        Overview
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-xs text-blue-700 mb-0.5">Completion</div>
          <div className="text-xl font-semibold text-blue-900">{Math.round(progress)}%</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-xs text-green-700 mb-0.5">Completed</div>
          <div className="text-xl font-semibold text-green-900">{completedCount}</div>
        </div>
         <div className="bg-yellow-50 p-3 rounded-lg text-center">
          <div className="text-xs text-yellow-700 mb-0.5">Pending</div>
          <div className="text-xl font-semibold text-yellow-900">{pendingCount}</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <div className="text-xs text-purple-700 mb-0.5">Total Tasks</div>
          <div className="text-xl font-semibold text-purple-900">{totalCount}</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;