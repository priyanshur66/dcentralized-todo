"use client";
import { useState, useEffect, useRef } from 'react';
import { Brain, Send, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatMessage } from '../DecentralizedTodoApp';

interface ChatAssistantProps {
    messages: ChatMessage[];
    onSendMessage: (input: string) => void;
}

const ChatAssistant = ({ messages, onSendMessage }: ChatAssistantProps) => {
    const [chatInput, setChatInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const chatDisplayRef = useRef<HTMLDivElement>(null);

    // Example commands that showcase the AI's capabilities
    const exampleCommands = [
        "add task: Review blockchain integration",
        "update task 'Example Task' to: priority high",
        "mark task 'Example Task' as done",
        "What's due today?",
        "Show me high priority tasks",
        "show incomplete tasks",
        "What categories do I have?",
        "delete task 'Old task'",
        "find tasks about blockchain",
        "tell me about my tasks",
        "describe my blockchain tasks",
        "help"
    ];

    const handleSend = () => {
        onSendMessage(chatInput);
        setChatInput(""); 
    };

    const handleExampleClick = (example: string) => {
        setChatInput(example);
        setShowSuggestions(false);
        // Focus the input after selecting a suggestion
        const inputElement = document.getElementById('chat-input');
        if (inputElement) {
            inputElement.focus();
        }
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
                 <h3 className="mb-2 text-xs font-semibold text-gray-700 uppercase flex items-center">
                     <Brain size={14} className="mr-1 text-gray-700" />
                     AI Assistant
                 </h3>
             </div>
             {/* Scrollable Message Display */}
             <div ref={chatDisplayRef} className="flex-grow overflow-y-auto px-4 text-sm space-y-2.5 min-h-[150px] pb-2">
                 {messages.map((msg, index) => (
                     <div key={index} className={`p-2 rounded-lg max-w-[90%] break-words ${msg.sender === 'ai'
                             ? 'bg-gray-100 text-gray-700 self-start clear-both border border-gray-200'
                             : 'bg-blue-500 text-white self-end clear-both ml-auto'
                         }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                     </div>
                 ))}
             </div>
             
             {/* Example Commands */}
             <div className="px-4 pt-2 flex-shrink-0">
                <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
                    <span>Try asking me:</span>
                    <button
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                        {showSuggestions ? (
                            <>Hide <ChevronUp size={14} className="ml-1" /></>
                        ) : (
                            <>Examples <ChevronDown size={14} className="ml-1" /></>
                        )}
                    </button>
                </div>
                
                {showSuggestions && (
                    <div className="mb-3 bg-gray-50 rounded p-2 max-h-32 overflow-y-auto border border-gray-200">
                        {exampleCommands.map((command, index) => (
                            <div
                                key={index}
                                onClick={() => handleExampleClick(command)}
                                className="text-xs py-1 px-2 hover:bg-gray-100 rounded cursor-pointer text-blue-700"
                            >
                                {command}
                            </div>
                        ))}
                    </div>
                )}
             </div>
             
             {/* Chat Input Area */}
             <div className="p-4 pt-2 flex-shrink-0 border-t border-gray-200">
                 <div className="flex items-center">
                     <input
                         id="chat-input"
                         type="text"
                         placeholder="Ask AI..."
                         className="flex-grow p-2 border border-gray-400 rounded-l text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                         value={chatInput}
                         onChange={(e) => setChatInput(e.target.value)}
                         onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                     />
                     <button
                         onClick={handleSend}
                         title="Send message"
                         className="bg-blue-600 text-white px-3 py-2 rounded-r text-sm hover:bg-blue-700 flex items-center justify-center border border-blue-600"
                     >
                         <Send size={16} />
                     </button>
                 </div>
                 
                 {/* Help button */}
                 <div className="mt-2 flex justify-end">
                    <button
                        onClick={() => onSendMessage("help")}
                        className="text-xs text-gray-700 hover:text-blue-600 flex items-center"
                    >
                        <HelpCircle size={12} className="mr-1" />
                        View all commands
                    </button>
                 </div>
             </div>
        </>
    );
};

export default ChatAssistant;