"use client";
import { List, Brain, Settings, LogOut } from 'lucide-react';
import ChatAssistant from './ChatAssistant'; 
import { ChatMessage } from '../DecentralizedTodoApp'; 

interface SidebarProps {
  showSidebar: boolean;
  walletConnected: boolean;
  walletAddress: string;
  onConnectWallet: () => void;
  chatMessages: ChatMessage[];
  onSendChatMessage: (input: string) => void;
  categories: string[];
  filterCategory: string;
  onSetFilterCategory: (category: string) => void;
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
}: SidebarProps) => {
  return (
    <div className={`${showSidebar ? 'w-64' : 'w-0'} bg-white border-r transition-all duration-300 flex flex-col h-full shadow-sm overflow-hidden`}>
      {/* Header section */}
      <div className="p-4 border-b flex-shrink-0">
        <h1 className="text-xl font-bold flex items-center">
          <List className="mr-2" size={20} />
          DecentTodo
        </h1>
        {walletConnected ? (
          <div className="mt-2 text-xs text-gray-500 truncate" title={walletAddress}>
            {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 6)}
          </div>
        ) : (
          <button
            onClick={onConnectWallet}
            className="mt-2 text-xs bg-blue-500 text-white rounded px-2 py-1 hover:bg-blue-600 transition"
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
             {categories.map(category => (
               <button
                 key={category}
                 onClick={() => onSetFilterCategory(category)}
                 className={`w-full text-left mb-1 flex items-center p-2 rounded text-sm ${filterCategory === category ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-100'}`}
               >
                 {category}
               </button>
             ))}
           </nav>
       </div>

      <div className="p-4 border-t flex-shrink-0">
        <div className="flex items-center justify-between">
          <button className="flex items-center text-gray-600 text-sm hover:text-gray-900">
            <Settings size={16} className="mr-2" />
            Settings
          </button>
          <button className="flex items-center text-gray-600 text-sm hover:text-gray-900">
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;