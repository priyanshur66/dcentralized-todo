"use client";
import { List, ChevronDown, Bell, User } from 'lucide-react';
import { Task } from '../DecentralizedTodoApp'; 

interface HeaderProps {
  showSidebar: boolean;
  onToggleSidebar: () => void;
  filterPriority: "All" | "High" | "Medium" | "Low";
  onSetFilterPriority: (priority: "All" | "High" | "Medium" | "Low") => void;
  // t: odo other props as needed, e.g., notificationCount, userName
}

const Header = ({
  showSidebar,
  onToggleSidebar,
  filterPriority,
  onSetFilterPriority,
}: HeaderProps) => {
  return (
    <header className="bg-white border-b px-6 py-4 flex-shrink-0">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="mr-4 text-gray-500 hover:text-gray-800"
            title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
          >
            <List size={20} />
          </button>
          <h2 className="text-xl font-semibold">My Tasks</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Priority Filter Dropdown */}
          <div className="relative">
             <select
               value={filterPriority}
               onChange={(e) => onSetFilterPriority(e.target.value as "All" | "High" | "Medium" | "Low")}
               className="text-sm border rounded py-1.5 pl-2 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white" // Added bg-white for consistency
             >
               <option value="All">All Priorities</option>
               <option value="High">High</option>
               <option value="Medium">Medium</option>
               <option value="Low">Low</option>
             </select>
             <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>

          {/* Mock Notification and User Icons */}
          <button className="text-gray-500 hover:text-gray-800 relative" title="Notifications">
            <Bell size={20} />
            {/* Example notification indicator */}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          <button className="text-gray-500 hover:text-gray-800" title="User Profile">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;