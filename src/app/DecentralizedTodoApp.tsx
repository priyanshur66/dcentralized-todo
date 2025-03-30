"use client";
import { useState, useEffect, useMemo } from 'react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AiSuggestionBanner from './components/AiSuggestionBanner';
import TaskListControls from './components/TaskListControls';
import ProgressBar from './components/ProgressBar';
import TaskList from './components/TaskList';
import AnalyticsOverview from './components/AnalyticsOverview';
import AddTaskModal from './components/Modals/AddTaskModal';
import TaskDetailsModal from './components/Modals/TaskDetailsModal';
import EditTaskModal from './components/Modals/EditTaskModal';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  due: string; // YYYY-MM-DD 
  category: string;
}

export interface ChatMessage {
    sender: 'ai' | 'user';
    text: string;
}

const initialTasks: Task[] = [
  { id: 1, title: "Develop Smart Contract", completed: true, priority: "high", due: "2025-04-05", category: "Development" },
  { id: 2, title: "Integrate LangChain AI Agent", completed: false, priority: "high", due: "2025-04-10", category: "AI Integration" },
  { id: 3, title: "Create Unit Tests for Backend", completed: false, priority: "medium", due: "2025-04-15", category: "Development" },
  { id: 4, title: "Design Analytics Dashboard", completed: false, priority: "low", due: "2025-04-20", category: "UI/UX" },
  { id: 5, title: "Deploy to Polygon Testnet", completed: false, priority: "medium", due: "2025-04-12", category: "Blockchain" },
];

const aiSuggestions = [
  "Based on your deadlines, consider prioritizing 'Integrate Agent'",
  "You have 3 overdue tasks. Would you like to reschedule them?",
  "Your productivity peaks in the morning. Consider scheduling important tasks before noon."
];


const DecentralizedTodoApp = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("all");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriority, setFilterPriority] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [showSidebar, setShowSidebar] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: "Hi! How can I help you manage your tasks today?" }
  ]);

  const completedTasksCount = useMemo(() => tasks.filter(task => task.completed).length, [tasks]);
  const progress = useMemo(() => tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0, [tasks, completedTasksCount]);
  const categories = useMemo(() => ["All", ...new Set(tasks.map(task => task.category))].sort((a, b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (activeTab === "completed" && !task.completed) return false;
      if (activeTab === "pending" && task.completed) return false;
      if (filterCategory !== "All" && task.category !== filterCategory) return false;
      if (filterPriority !== "All" && task.priority !== filterPriority.toLowerCase()) return false;
      return true;
    });
  }, [tasks, activeTab, filterCategory, filterPriority]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSuggestionIndex(prev => (prev + 1) % aiSuggestions.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const connectWallet = () => {
    const addr = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"; // Mock
    setWalletConnected(true);
    setWalletAddress(addr);
    addChatMessage({ sender: 'ai', text: `Wallet ${addr.substring(0, 6)}... connected!` });
  };

   const addChatMessage = (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
   };

  const handleSendChatMessage = (input: string) => {
     if (input.trim() === "") return;

     const newUserMessage: ChatMessage = { sender: 'user', text: input };
     addChatMessage(newUserMessage);

     setTimeout(() => {
       let aiResponseText = "Sorry, I didn't quite get that. ";
       const lowerCaseInput = input.toLowerCase();

       if (lowerCaseInput.includes("how many task") || lowerCaseInput.includes("count task")) {
         aiResponseText = `You currently have ${tasks.length} tasks. ${completedTasksCount} completed, ${tasks.length - completedTasksCount} pending. ${filteredTasks.length} match your current filters.`;
       } else if (lowerCaseInput.includes("summarize") || lowerCaseInput.includes("high priority") || lowerCaseInput.includes("urgent")) {
           const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed);
           if (highPriority.length > 0) {
              aiResponseText = `You have ${highPriority.length} high priority pending tasks: ${highPriority.map(t => t.title).join(', ')}. Consider tackling these first.`;
           } else {
              aiResponseText = "You have no pending high priority tasks. Great job staying on top of things!";
           }
       } else if (lowerCaseInput.startsWith("add task:") || lowerCaseInput.startsWith("create task:")) {
           const taskTitle = input.substring(input.indexOf(":") + 1).trim();
           if (taskTitle) {
               handleAddTask(taskTitle); 
               return; 
           } else {
               aiResponseText = "Please provide a title after 'add task:'. For example: 'add task: Write documentation'";
           }
       } else if (lowerCaseInput.includes("what can you do") || lowerCaseInput.includes("help")) {
           aiResponseText = "I can help you: \n- Summarize high-priority tasks\n- Count your tasks\n- Add tasks (e.g., 'add task: my new task')\n- Provide task suggestions (see banner above)";
       } else {
           aiResponseText = `I can currently help with task summaries, counts, or adding tasks via chat. Ask "help" to see options.`;
       }

       addChatMessage({ sender: 'ai', text: aiResponseText });
     }, 800);
   };


  const toggleTaskCompletion = (id: number) => {
    const task = tasks.find(t => t.id === id);
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
     if (task) {
        const status = !task.completed ? 'completed' : 'pending';
        // addChatMessage({ sender: 'ai', text: `Task "${task.title}" marked as ${status}.` });
     }
  };

  const handleAddTask = (title: string) => {
    if (title.trim()) {
      const aiDeterminedPriority = title.toLowerCase().includes('urgent') || title.toLowerCase().includes('asap') ? 'high' :
                                  title.toLowerCase().includes('important') ? 'medium' : 'low';

      const aiDeterminedCategory = title.toLowerCase().includes('smart contract') || title.toLowerCase().includes('polygon') || title.toLowerCase().includes('deploy') ? 'Blockchain' :
                                  title.toLowerCase().includes('ai') || title.toLowerCase().includes('agent') || title.toLowerCase().includes('langchain')? 'AI Integration' :
                                  title.toLowerCase().includes('design') || title.toLowerCase().includes('ui') || title.toLowerCase().includes('ux') ? 'UI/UX' :
                                  title.toLowerCase().includes('test') || title.toLowerCase().includes('backend') ? 'Development' : 'General';

      const task: Task = {
        id: Date.now(), // Simple ID 
        title: title,
        completed: false,
        priority: aiDeterminedPriority,
        due: new Date().toISOString().split('T')[0], // Default due date
        category: aiDeterminedCategory
      };
      setTasks(prevTasks => [...prevTasks, task]);
      setShowAddTask(false); 
      addChatMessage({ sender: 'ai', text: `Okay, I've added task: "${task.title}" with ${task.priority} priority in ${task.category}.` });
    }
  };

  const handleDeleteTask = (id: number) => {
    const taskToDelete = tasks.find(task => task.id === id);
    if (window.confirm(`Are you sure you want to delete "${taskToDelete?.title}"?`)) {
        setTasks(tasks.filter(task => task.id !== id));
        setShowTaskDetails(null); // Close details if open
        if (editingTask && editingTask.id === id) {
            setEditingTask(null); // edit 
        }
        if (taskToDelete) {
            addChatMessage({ sender: 'ai', text: `Task "${taskToDelete.title}" deleted.` });
        }
    }
  };

    const handleUpdateTask = (updatedTask: Task) => {
        setTasks(tasks.map(task =>
            task.id === updatedTask.id ? updatedTask : task
        ));
        setEditingTask(null); 
        setShowTaskDetails(null); 
        addChatMessage({ sender: 'ai', text: `Task "${updatedTask.title}" updated.` });
    };

   const handleEditRequest = (task: Task) => {
        setEditingTask(task);
        setShowTaskDetails(null); 
   };

   const handleShowDetails = (task: Task) => {
       setShowTaskDetails(task);
       setEditingTask(null); // Ensure edit view is closed
   };


  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <Sidebar
        showSidebar={showSidebar}
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        onConnectWallet={connectWallet}
        chatMessages={chatMessages}
        onSendChatMessage={handleSendChatMessage}
        categories={categories}
        filterCategory={filterCategory}
        onSetFilterCategory={setFilterCategory}
      />

    
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          showSidebar={showSidebar} // Pass state for the toggle button icon/action
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          filterPriority={filterPriority}
          onSetFilterPriority={setFilterPriority}
        />

        <AiSuggestionBanner suggestion={aiSuggestions[currentSuggestionIndex]} />

        <TaskListControls
          activeTab={activeTab}
          onSetTab={setActiveTab}
          onShowAddTask={() => setShowAddTask(true)}
        />

        <ProgressBar progress={progress} completedCount={completedTasksCount} totalCount={tasks.length} />

        <TaskList
          tasks={filteredTasks}
          onToggleComplete={toggleTaskCompletion}
          onDelete={handleDeleteTask}
          onEdit={handleEditRequest}
          onShowDetails={handleShowDetails}
          onShowAddTask={() => setShowAddTask(true)} 
        />

        <AnalyticsOverview
          progress={progress}
          completedCount={completedTasksCount}
          pendingCount={tasks.length - completedTasksCount}
          totalCount={tasks.length}
        />
      </div>

      {/* Modals */}
      {showAddTask && (
        <AddTaskModal
          onClose={() => setShowAddTask(false)}
          onAddTask={handleAddTask}
        />
      )}

      {showTaskDetails && !editingTask && (
        <TaskDetailsModal
          task={showTaskDetails}
          onClose={() => setShowTaskDetails(null)}
          onEdit={handleEditRequest}
          onToggleComplete={toggleTaskCompletion}
        />
      )}

      {editingTask && (
         <EditTaskModal
           task={editingTask}
           allCategories={categories.filter(c => c !== 'All')} // Pass existing categories for the dropdown
           onClose={() => setEditingTask(null)}
           onSave={handleUpdateTask}
           onDelete={handleDeleteTask}
         />
      )}
    </div>
  );
};

export default DecentralizedTodoApp;