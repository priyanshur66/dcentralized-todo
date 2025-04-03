"use client";
import { List, LogIn } from 'lucide-react';
import WalletBalanceIndicator from './WalletBalanceIndicator';

interface HeaderProps {
  showSidebar: boolean;
  onToggleSidebar: () => void;
  isAuthenticated: boolean;
  onShowLogin: () => void;
  walletConnected: boolean;
}

const Header = ({
  showSidebar,
  onToggleSidebar,
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