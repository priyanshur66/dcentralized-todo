"use client";

interface ProgressBarProps {
  progress: number;
  completedCount: number;
  totalCount: number;
}

const ProgressBar = ({ progress, completedCount, totalCount }: ProgressBarProps) => {
  return (
    <div className="px-6 py-4 bg-white border-b flex-shrink-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Overall Progress</span>
        <span className="text-sm text-gray-500">{completedCount} of {totalCount} tasks completed</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
          aria-label="Task completion progress"
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;