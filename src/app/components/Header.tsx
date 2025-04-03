"use client";
import { List, ChevronDown, LogIn } from 'lucide-react';
import WalletBalanceIndicator from './WalletBalanceIndicator';

interface HeaderProps {
  showSidebar: boolean;
  onToggleSidebar: () => void;
  filterPriority: "All" | "High" | "Medium" | "Low";
  onSetFilterPriority: (priority: "All" | "High" | "Medium" | "Low") => void;
  isAuthenticated: boolean;
  onShowLogin: () => void;
  walletConnected: boolean;
}

const Header = ({
  showSidebar,
  onToggleSidebar,
  filterPriority,
  onSetFilterPriority,
  isAuthenticated,
  onShowLogin,
  walletConnected,
}: HeaderProps) => {
  return (
    <header className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="mr-3 text-gray-500 hover:text-gray-800"
            title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
            aria-label={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
          >
            <List size={20} />
          </button>
          <h2 className="text-gray-800 text-lg sm:text-xl font-semibold">My Tasks</h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* USDT Balance Indicator  */}
          {isAuthenticated && (
            <div className="hidden sm:block">
              <WalletBalanceIndicator walletConnected={walletConnected} />
            </div>
          )}
          
          {/* Priority Filter Dropdown */}
          {/* <div className="relative">
             <select
               value={filterPriority}
               onChange={(e) => onSetFilterPriority(e.target.value as "All" | "High" | "Medium" | "Low")}
               className="text-xs sm:text-sm border rounded py-1 sm:py-1.5 pl-2 pr-6 sm:pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
               aria-label="Filter by priority"
             >
               <option value="All">All</option>
               <option value="High">High</option>
               <option value="Medium">Medium</option>
               <option value="Low">Low</option>
             </select>
             <ChevronDown size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div> */}

          {/* Login Button  */}
          {!isAuthenticated && (
            <button 
              onClick={onShowLogin}
              className="flex items-center text-blue-600 hover:text-blue-800 text-xs sm:text-sm border border-blue-300 rounded-md px-2 py-1 sm:py-1.5 hover:bg-blue-50"
              aria-label="Login"
            >
              <LogIn size={14} className="mr-1" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;