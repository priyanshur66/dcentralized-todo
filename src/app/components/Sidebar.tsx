"use client";
import { LogOut, User } from 'lucide-react';
import ChatAssistant from './ChatAssistant'; 
import { ChatMessage } from '../DecentralizedTodoApp'; 

interface SidebarProps {
  showSidebar: boolean;
  walletConnected: boolean;
  walletAddress: string;
  onConnectWallet: () => Promise<string | null>;
  chatMessages: ChatMessage[];
  onSendChatMessage: (input: string) => void;
  categories: string[];
  filterCategory: string;
  onSetFilterCategory: (category: string) => void;
  onLogout: () => void;
  isAuthenticated: boolean;
}

const Sidebar = ({
  showSidebar,
  walletConnected,
  walletAddress,
  onConnectWallet,
  chatMessages,
  onSendChatMessage,
  categories,
  filterCategory,
  onSetFilterCategory,
  onLogout,
  isAuthenticated,
}: SidebarProps) => {
  return (
    <div className={`${showSidebar ? 'w-64' : 'w-0'} bg-white border-r transition-all duration-300 flex flex-col h-full shadow-sm overflow-hidden`}>
      {/* Header section */}
      <div className="p-4 border-b flex-shrink-0">
        
        {walletConnected ? (
          <div className="mt-2 text-xs text-gray-500 truncate" title={walletAddress}>
            {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 6)}
          </div>
        ) : (
          <button
            onClick={async () => await onConnectWallet()}
            className="mt-2 text-xs bg-blue-500 text-white rounded px-2 py-1 hover:bg-blue-600 transition"
            disabled={!isAuthenticated}
          >
            Connect Wallet
          </button>
        )}
      </div>

       <div className="flex-1 flex flex-col overflow-hidden">
          <ChatAssistant
              messages={chatMessages}
              onSendMessage={onSendChatMessage}
          />

          <nav className="p-4 border-t flex-shrink-0 max-h-[40%] overflow-y-auto">
            <div className="mb-2 text-xs font-semibold text-gray-500 uppercase">Categories</div>
            <div className="flex flex-wrap gap-1">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => onSetFilterCategory(category)}
                  className={`text-left text-gray-500 flex items-center p-1.5 rounded text-xs sm:text-sm ${filterCategory === category ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-100'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </nav>
       </div>

      <div className="p-4 border-t flex-shrink-0">
        <div className="flex items-center justify-center">
          {isAuthenticated ? (
            <button 
              onClick={onLogout}
              className="flex items-center text-gray-600 text-sm hover:text-gray-900"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          ) : (
            <button className="flex items-center text-gray-600 text-sm hover:text-gray-900">
              <User size={16} className="mr-2" />
              Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;