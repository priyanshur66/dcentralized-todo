"use client";
import { useState, useEffect, useRef } from 'react';
import { Brain, Send } from 'lucide-react';
import { ChatMessage } from '../DecentralizedTodoApp';

interface ChatAssistantProps {
    messages: ChatMessage[];
    onSendMessage: (input: string) => void;
}

const ChatAssistant = ({ messages, onSendMessage }: ChatAssistantProps) => {
    const [chatInput, setChatInput] = useState("");
    const chatDisplayRef = useRef<HTMLDivElement>(null);

    const handleSend = () => {
        onSendMessage(chatInput);
        setChatInput(""); 
    };

    // Scroll chat to bottom
    useEffect(() => {
        if (chatDisplayRef.current) {
            chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <>
             {/* Chat Header */}
             <div className="px-4 pt-4 flex-shrink-0">
                 <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase flex items-center">
                     <Brain size={14} className="mr-1" />
                     AI Assistant
                 </h3>
             </div>
             {/* Scrollable Message Display */}
             <div ref={chatDisplayRef} className="flex-grow overflow-y-auto px-4 text-sm space-y-2.5 min-h-[150px] pb-2">
                 {messages.map((msg, index) => (
                     <div key={index} className={`p-2 rounded-lg max-w-[90%] break-words ${msg.sender === 'ai'
                             ? 'bg-gray-100 text-gray-800 self-start clear-both'
                             : 'bg-blue-500 text-white self-end clear-both ml-auto'
                         }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                     </div>
                 ))}
             </div>
             {/* Chat Input Area */}
             <div className="p-4 pt-2 flex-shrink-0 border-t border-gray-200">
                 <div className="flex items-center">
                     <input
                         type="text"
                         placeholder="Ask AI..."
                         className="flex-grow p-2 border border-gray-300 rounded-l text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                         value={chatInput}
                         onChange={(e) => setChatInput(e.target.value)}
                         onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                     />
                     <button
                         onClick={handleSend}
                         title="Send message"
                         className="bg-blue-500 text-white px-3 py-2 rounded-r text-sm hover:bg-blue-600 flex items-center justify-center border border-blue-500"
                     >
                         <Send size={16} />
                     </button>
                 </div>
             </div>
        </>
    );
};

export default ChatAssistant;