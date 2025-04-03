"use client";
import { useState, useEffect, useMemo } from 'react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AiSuggestionBanner from './components/AiSuggestionBanner';
import TaskListControls from './components/TaskListControls';
import ProgressBar from './components/ProgressBar';
import TaskList from './components/TaskList';
import AnalyticsOverview from './components/AnalyticsOverview';
import WalletBalanceIndicator from './components/WalletBalanceIndicator';
import AddTaskModal from './components/Modals/AddTaskModal';
import TaskDetailsModal from './components/Modals/TaskDetailsModal';
import EditTaskModal from './components/Modals/EditTaskModal';
import LoginModal from './components/Modals/LoginModal';
import { taskService, authService } from './services/api';
import { generateTaskSuggestions } from './services/langchain';
import { getTaskContextForAI } from './services/graphqlClient';

export interface Task {
  id: number;                  
  title: string;
  description?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  due: string;                 
  category: string;
  blockchainHash?: string;
  bounty?: string;             
  originalId?: string;         
}

export interface ChatMessage {
    sender: 'ai' | 'user';
    text: string;
}

const DecentralizedTodoApp = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("all");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriority, setFilterPriority] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Initial AI suggestions that will be replaced with LangChain-generated ones
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    "Based on your deadlines, consider prioritizing tasks with approaching due dates",
    "Group similar tasks together for better focus and productivity",
    "Consider breaking down complex tasks into smaller, manageable subtasks"
  ]);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: "Hi! How can I help you manage your tasks today?" }
  ]);

  // Derived state
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

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const isAuth = authService.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        // Try to connect wallet at startup if ethereum provider exists
        if (typeof window !== 'undefined' && window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              setWalletConnected(true);
              setWalletAddress(accounts[0]);
            }
          } catch (walletError) {
            console.error('Error checking wallet status:', walletError);
          }
        }
        
        if (isAuth) {
          // Fetch tasks if authenticated
          await fetchTasks();
        } else {
          // Show login modal if not authenticated
          setShowLogin(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
        addChatMessage({ sender: 'ai', text: "There was a problem connecting to the server. Please try again." });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Set up wallet event listeners
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletConnected(false);
        setWalletAddress("");
        addChatMessage({ sender: 'ai', text: 'Wallet disconnected.' });
      } else {
        setWalletAddress(accounts[0]);
        addChatMessage({ 
          sender: 'ai', 
          text: `Wallet switched to ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}` 
        });
      }
    };
    
    const handleChainChanged = () => {
      window.location.reload();
    };
    
    // Handler for disconnect
    const handleDisconnect = () => {
      setWalletConnected(false);
      setWalletAddress("");
      addChatMessage({ sender: 'ai', text: 'Wallet disconnected.' });
    };
    
    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);
    
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, []);

   useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSuggestionIndex(prev => (prev + 1) % aiSuggestions.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [aiSuggestions]);

  // Generate new AI suggestions when tasks change
  useEffect(() => {
    const updateSuggestions = async () => {
      if (tasks.length > 0) {
        try {
          const newSuggestions = await generateTaskSuggestions(tasks);
          
          if (newSuggestions && newSuggestions.length > 0) {
            setAiSuggestions(newSuggestions);
            setCurrentSuggestionIndex(0);
          }
        } catch (error) {
          console.error("Failed to generate task suggestions:", error);
        }
      }
    };
    
    updateSuggestions();
    
    const suggestionsTimer = setInterval(updateSuggestions, 5 * 60 * 1000);
    return () => clearInterval(suggestionsTimer);
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(""); 
      
      try {
        const fetchedTasks = await taskService.getAllTasks();
        setTasks(fetchedTasks);
        
        if (fetchedTasks.length === 0) {
          addChatMessage({ 
            sender: 'ai', 
            text: "Welcome! You don't have any tasks yet. Click 'Add Task' to get started." 
          });
        }
      } catch (apiError) {
        console.error('Error fetching tasks:', apiError);
        
        // Load some mock data for offline usage
        setTasks([
          { 
            id: 1, 
            title: "Example Task", 
            description: "This is an example task. You appear to be working offline.", 
            completed: false, 
            priority: "medium", 
            due: new Date().toISOString().split('T')[0], 
            category: "General"
          }
        ]);
        
        setError(apiError instanceof Error ? apiError.message : 'Failed to fetch tasks from server. Using local data.');
        
        addChatMessage({ 
          sender: 'ai', 
          text: "I couldn't load your tasks from the server. You're working in offline mode with example data." 
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize tasks');
      addChatMessage({ 
        sender: 'ai', 
        text: "There was a problem connecting to the server. Please check your connection and try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (token: string, userWalletAddress: string | null) => {
    setIsAuthenticated(true);
    setShowLogin(false);
    
    if (userWalletAddress) {
      setWalletConnected(true);
      setWalletAddress(userWalletAddress);
    }
    
    fetchTasks();
    addChatMessage({ 
      sender: 'ai', 
      text: "Welcome back! You've been successfully authenticated."
    });
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setWalletConnected(false);
    setWalletAddress("");
    setTasks([]);
    setShowLogin(true);
  };

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const addr = accounts[0]; // Get the first account
        
        setWalletConnected(true);
        setWalletAddress(addr);
        addChatMessage({ sender: 'ai', text: `Wallet ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)} connected!` });
        
        return addr;
      } else {
        addChatMessage({ sender: 'ai', text: 'No Ethereum wallet found. Please install MetaMask or another compatible wallet.' });
        return null;
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      addChatMessage({ sender: 'ai', text: 'Failed to connect wallet. Please try again.' });
      return null;
    }
  };

  // Chat functionality
  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

const handleSendChatMessage = (input: string) => {
  if (input.trim() === "") return;

  const newUserMessage: ChatMessage = { sender: 'user', text: input };
  addChatMessage(newUserMessage);

  setTimeout(async () => {
    try {
      // Get task context from GraphQL if user is authenticated
      let taskContext = "";
      if (isAuthenticated) {
        try {
          taskContext = await getTaskContextForAI();
        } catch (error) {
          console.error('Error getting task context for AI:', error);
        }
      }

      if (taskContext) {
        console.log('Using task context from GraphQL:', taskContext);
      }
      
      processAIResponse(input, taskContext);
    } catch (error) {
      console.error('Error processing AI response:', error);
      addChatMessage({ 
        sender: 'ai', 
        text: 'Sorry, I encountered an error processing your request.' 
      });
    }
  }, 800);
};

const processAIResponse = (input: string, taskContext: string = "") => {
  const lowerCaseInput = input.toLowerCase();
  
  if (taskContext && (
    lowerCaseInput.includes("tell me about") || 
    lowerCaseInput.includes("describe") || 
    lowerCaseInput.includes("explain") ||
    lowerCaseInput.includes("how do i") ||
    lowerCaseInput.includes("help me with")
  )) {
    // Format a concise response about tasks using taskContext
    const lines = taskContext.split('\n').filter(line => line.trim() !== '');
    const taskCount = (lines.length - 1) / 7; 
    
    if (taskCount === 0) {
      addChatMessage({ sender: 'ai', text: "You don't have any tasks yet." });
    } else {
      // Extract specific information about tasks based on what the user is asking about
      if (lowerCaseInput.includes("blockchain")) {
        const blockchainTasks = lines.filter(line => 
          line.toLowerCase().includes("blockchain") || 
          line.toLowerCase().includes("crypto")
        );
        
        if (blockchainTasks.length > 0) {
          addChatMessage({ 
            sender: 'ai', 
            text: `Here are your blockchain-related tasks:\n${blockchainTasks.join('\n')}` 
          });
        } else {
          addChatMessage({ sender: 'ai', text: "You don't have any blockchain-related tasks." });
        }
      } else {
        // Default response with concise summary
        addChatMessage({ 
          sender: 'ai', 
          text: `You have ${taskCount} tasks. Use commands like "show incomplete tasks" or "what's due today?" to see specific tasks.` 
        });
      }
    }
    return;
  }
  
  // Handle task creation
  if (lowerCaseInput.startsWith("add task:") || lowerCaseInput.startsWith("create task:")) {
    const taskTitle = input.substring(input.indexOf(":") + 1).trim();
    if (taskTitle) {
      handleAddTask(taskTitle);
      return;
    } else {
      addChatMessage({ 
        sender: 'ai', 
        text: "Please provide a title after 'add task:'. For example: 'add task: Write documentation'" 
      });
      return;
    }
  }
  
  // Handle task update
  const updateTaskRegex = /update task (?:"([^"]+)"|(\d+)) to(?::|,) (.+)/i;
  const updateMatch = input.match(updateTaskRegex);
  
  if (updateMatch) {
    const taskIdentifier = updateMatch[1] || updateMatch[2]; 
    const updateInfo = updateMatch[3].trim();
    
    handleTaskUpdate(taskIdentifier, updateInfo);
    return;
  }
  
  // Handle task deletion
  const deleteTaskRegex = /delete task (?:"([^"]+)"|(\d+))/i;
  const deleteMatch = input.match(deleteTaskRegex);
  
  if (deleteMatch || lowerCaseInput.includes("delete") && lowerCaseInput.includes("task")) {
    const taskIdentifier = deleteMatch ? (deleteMatch[1] || deleteMatch[2]) : 
                          input.replace(/delete|task/gi, '').trim();
    
    handleTaskDeletion(taskIdentifier);
    return;
  }
  
  // Handle task completion toggling
  const completeTaskRegex = /(complete|mark done|mark as done|mark complete|mark as complete) task (?:"([^"]+)"|(\d+))/i;
  const completeMatch = input.match(completeTaskRegex);
  
  if (completeMatch) {
    const taskIdentifier = completeMatch[2] || completeMatch[3];
    handleTaskCompletion(taskIdentifier, true);
    return;
  }
  
  const uncompleteTaskRegex = /(uncomplete|mark pending|mark as pending|mark incomplete|mark as incomplete) task (?:"([^"]+)"|(\d+))/i;
  const uncompleteMatch = input.match(uncompleteTaskRegex);
  
  if (uncompleteMatch) {
    const taskIdentifier = uncompleteMatch[2] || uncompleteMatch[3];
    handleTaskCompletion(taskIdentifier, false);
    return;
  }
  
  // Handle task queries
  if (lowerCaseInput.includes("how many task") || lowerCaseInput.includes("count task")) {
    const aiResponseText = `You currently have ${tasks.length} tasks. ${completedTasksCount} completed, ${tasks.length - completedTasksCount} pending. ${filteredTasks.length} match your current filters.`;
    addChatMessage({ sender: 'ai', text: aiResponseText });
    return;
  }
  
  // Handle incomplete/pending tasks queries
  if (lowerCaseInput.includes("incomplete task") || 
      lowerCaseInput.includes("pending task") || 
      lowerCaseInput.includes("not completed") || 
      lowerCaseInput.includes("show pending") || 
      lowerCaseInput.includes("show incomplete")) {
    
    const pendingTasks = tasks.filter(t => !t.completed);
    
    if (pendingTasks.length === 0) {
      addChatMessage({ sender: 'ai', text: "You have no pending tasks. Great job!" });
    } else {
      const pendingTasksList = pendingTasks
        .map(t => `- "${t.title}" (${t.priority} priority, due: ${t.due || 'unset'})`)
        .join('\n');
      
      addChatMessage({ 
        sender: 'ai', 
        text: `You have ${pendingTasks.length} pending tasks:\n${pendingTasksList}` 
      });
    }
    return;
  }
  
  if (lowerCaseInput.includes("summarize") || lowerCaseInput.includes("high priority") || lowerCaseInput.includes("urgent")) {
    const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed);
    if (highPriority.length > 0) {
      const aiResponseText = `High priority (${highPriority.length}): ${highPriority.map(t => t.title).join(', ')}`;
      addChatMessage({ sender: 'ai', text: aiResponseText });
    } else {
      addChatMessage({ sender: 'ai', text: "No high priority tasks pending." });
    }
    return;
  }
  
  // Handle due date queries
  if (lowerCaseInput.includes("due") && (lowerCaseInput.includes("today") || lowerCaseInput.includes("tomorrow") || lowerCaseInput.includes("this week"))) {
    handleDueDateQuery(lowerCaseInput);
    return;
  }
  
  // Handle category queries
  if (lowerCaseInput.includes("category") || lowerCaseInput.includes("categories")) {
    handleCategoryQuery(lowerCaseInput);
    return;
  }
  
  // Search for tasks
  if (lowerCaseInput.includes("find task") || lowerCaseInput.includes("search for") || lowerCaseInput.startsWith("find ")) {
    const searchTerm = lowerCaseInput.replace(/find task|search for|find/gi, '').trim();
    handleTaskSearch(searchTerm);
    return;
  }
  
  // Handle authentication
  if (lowerCaseInput.includes("login") || lowerCaseInput.includes("sign in")) {
    setShowLogin(true);
    addChatMessage({ sender: 'ai', text: "I've opened the login dialog for you." });
    return;
  }
  
  if (lowerCaseInput.includes("logout") || lowerCaseInput.includes("sign out")) {
    handleLogout();
    addChatMessage({ sender: 'ai', text: "You've been successfully logged out." });
    return;
  }
  
  // Handle help request
  if (lowerCaseInput.includes("what can you do") || lowerCaseInput.includes("help")) {
    const helpText = `I can help you manage your tasks in various ways:

1. **Task Management**:
   - Add tasks: "add task: Buy groceries"
   - Update tasks: "update task 'Build UI' to: priority high"
   - Delete tasks: "delete task 'Old task'"
   - Complete tasks: "mark task 'Review code' as done"

2. **Task Information**:
   - Count tasks: "How many tasks do I have?"
   - Prioritize: "Show high priority tasks"
   - View pending: "Show incomplete tasks"
   - Find due dates: "What's due today?"
   - Search: "find tasks about blockchain"

3. **Categories**:
   - List categories: "What categories do I have?"
   - Filter: "Show Development tasks"
   
4. **Task Analysis**:
   - Get details: "Tell me about my tasks"
   - Task explanations: "Describe my blockchain tasks"
   - Help with tasks: "How do I complete this task?"

Just ask naturally and I'll try to help!`;

    addChatMessage({ sender: 'ai', text: helpText });
    return;
  }
  
  // Default response if no other handlers matched
  addChatMessage({ 
    sender: 'ai', 
    text: `I'm not sure how to help with that. Try asking for "help" to see what I can do with your tasks.` 
  });
};

const findTaskByIdentifier = (identifier: string): Task | null => {
  if (!isNaN(parseInt(identifier))) {
    const id = parseInt(identifier);
    const task = tasks.find(t => t.id === id);
    if (task) return task;
  }
  
  const exactMatch = tasks.find(t => t.title.toLowerCase() === identifier.toLowerCase());
  if (exactMatch) return exactMatch;
  
  const partialMatches = tasks.filter(t => 
    t.title.toLowerCase().includes(identifier.toLowerCase())
  );
  
  if (partialMatches.length === 1) {
    return partialMatches[0];
  } else if (partialMatches.length > 1) {
    // If multiple matches, return null and handle ambiguity in the caller
    return null;
  }
  
  return null;
};

// Handle updating a task through chat
const handleTaskUpdate = (taskIdentifier: string, updateInfo: string) => {
  const task = findTaskByIdentifier(taskIdentifier);
  
  if (!task) {
    const matches = tasks.filter(t => 
      t.title.toLowerCase().includes(taskIdentifier.toLowerCase())
    );
    
    if (matches.length > 1) {
      addChatMessage({ 
        sender: 'ai', 
        text: `I found multiple matching tasks. Please be more specific or use the task ID:\n${
          matches.map(t => `- "${t.title}" (ID: ${t.id})`).join('\n')
        }` 
      });
    } else {
      addChatMessage({ 
        sender: 'ai', 
        text: `I couldn't find a task matching "${taskIdentifier}". Please check the task title or ID.` 
      });
    }
    return;
  }
  
  // Create an updated task object
  const updatedTask = { ...task };
  
  if (updateInfo.toLowerCase().includes("priority")) {
    const priorityMatch = updateInfo.match(/priority\s+(high|medium|low)/i);
    if (priorityMatch) {
      updatedTask.priority = priorityMatch[1].toLowerCase() as 'high' | 'medium' | 'low';
    }
  }
  
  if (updateInfo.toLowerCase().includes("category")) {
    const categoryMatch = updateInfo.match(/category\s+([a-z0-9\s]+)/i);
    if (categoryMatch) {
      updatedTask.category = categoryMatch[1].trim();
    }
  }
  
  if (updateInfo.toLowerCase().includes("due")) {
    // Parse dates like "due tomorrow", "due next week", "due 2023-04-15"
    const dateMatch = updateInfo.match(/due\s+([a-z0-9\s\-]+)/i);
    if (dateMatch) {
      const dateText = dateMatch[1].trim().toLowerCase();
      let dueDate = new Date();
      
      if (dateText === "tomorrow") {
        dueDate.setDate(dueDate.getDate() + 1);
      } else if (dateText === "next week") {
        dueDate.setDate(dueDate.getDate() + 7);
      } else if (dateText.match(/\d{4}-\d{2}-\d{2}/)) {
        // ISO format date
        dueDate = new Date(dateText);
      }
      
      updatedTask.due = dueDate.toISOString().split('T')[0];
    }
  }
  
  if (updateInfo.toLowerCase().includes("title")) {
    const titleMatch = updateInfo.match(/title\s+(.+)/i);
    if (titleMatch) {
      updatedTask.title = titleMatch[1].trim();
    }
  }
  
  if (JSON.stringify(updatedTask) === JSON.stringify(task)) {
    addChatMessage({ 
      sender: 'ai', 
      text: `I'm not sure what to update. Try specifying 'priority', 'category', 'due', or 'title' followed by the new value.` 
    });
    return;
  }
  
  handleUpdateTask(updatedTask);
  
  // Notify the user
  addChatMessage({ 
    sender: 'ai', 
    text: `Updated task "${task.title}" with the new information.` 
  });
};

// Handle deleting a task through chat
const handleTaskDeletion = (taskIdentifier: string) => {
  const task = findTaskByIdentifier(taskIdentifier);
  
  if (!task) {
    const matches = tasks.filter(t => 
      t.title.toLowerCase().includes(taskIdentifier.toLowerCase())
    );
    
    if (matches.length > 1) {
      addChatMessage({ 
        sender: 'ai', 
        text: `I found multiple matching tasks. Please be more specific or use the task ID:\n${
          matches.map(t => `- "${t.title}" (ID: ${t.id})`).join('\n')
        }` 
      });
    } else {
      addChatMessage({ 
        sender: 'ai', 
        text: `I couldn't find a task matching "${taskIdentifier}". Please check the task title or ID.` 
      });
    }
    return;
  }
  
  // Ask for confirmation
  if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
    handleDeleteTask(task.id);
    addChatMessage({ 
      sender: 'ai', 
      text: `Task "${task.title}" has been deleted.` 
    });
  } else {
    addChatMessage({ 
      sender: 'ai', 
      text: `Task deletion cancelled.` 
    });
  }
};

// Handle toggling task completion through chat
const handleTaskCompletion = (taskIdentifier: string, complete: boolean) => {
  const task = findTaskByIdentifier(taskIdentifier);
  
  if (!task) {
    const matches = tasks.filter(t => 
      t.title.toLowerCase().includes(taskIdentifier.toLowerCase())
    );
    
    if (matches.length > 1) {
      addChatMessage({ 
        sender: 'ai', 
        text: `I found multiple matching tasks. Please be more specific or use the task ID:\n${
          matches.map(t => `- "${t.title}" (ID: ${t.id})`).join('\n')
        }` 
      });
    } else {
      addChatMessage({ 
        sender: 'ai', 
        text: `I couldn't find a task matching "${taskIdentifier}". Please check the task title or ID.` 
      });
    }
    return;
  }
  
  // If task is already in the requested state, inform the user
  if (task.completed === complete) {
    addChatMessage({ 
      sender: 'ai', 
      text: `Task "${task.title}" is already ${complete ? 'completed' : 'pending'}.` 
    });
    return;
  }
  
  toggleTaskCompletion(task.id);
  
  addChatMessage({ 
    sender: 'ai', 
    text: `Marked task "${task.title}" as ${complete ? 'completed' : 'pending'}.` 
  });
};

const handleDueDateQuery = (query: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const weekFromNowStr = weekFromNow.toISOString().split('T')[0];
  
  let matchingTasks: Task[] = [];
  let responsePrefix = "";
  
  if (query.includes("today")) {
    matchingTasks = tasks.filter(t => t.due === today && !t.completed);
    responsePrefix = "Due today";
  } else if (query.includes("tomorrow")) {
    matchingTasks = tasks.filter(t => t.due === tomorrowStr && !t.completed);
    responsePrefix = "Due tomorrow";
  } else if (query.includes("this week")) {
    matchingTasks = tasks.filter(t => 
      !t.completed && t.due >= today && t.due <= weekFromNowStr
    );
    responsePrefix = "Due this week";
  }
  
  if (matchingTasks.length === 0) {
    addChatMessage({ 
      sender: 'ai', 
      text: `${responsePrefix}: No pending tasks.` 
    });
  } else {
    const taskList = matchingTasks.map(t => 
      `- "${t.title}" (${t.priority}, ${t.due})`
    ).join('\n');
    
    addChatMessage({ 
      sender: 'ai', 
      text: `${responsePrefix} (${matchingTasks.length}):\n${taskList}` 
    });
  }
};

const handleCategoryQuery = (query: string) => {
  if (query.includes("what categories") || query.includes("list categories")) {
    const uniqueCategories = [...new Set(tasks.map(t => t.category))];
    
    if (uniqueCategories.length === 0) {
      addChatMessage({ 
        sender: 'ai', 
        text: "No categories yet." 
      });
    } else {
      const categoryStats = uniqueCategories.map(category => {
        const tasksInCategory = tasks.filter(t => t.category === category);
        const completedCount = tasksInCategory.filter(t => t.completed).length;
        return `- ${category}: ${tasksInCategory.length} (${completedCount} done)`;
      }).join('\n');
      
      addChatMessage({ 
        sender: 'ai', 
        text: `Categories:\n${categoryStats}` 
      });
    }
    return;
  }
  
  for (const category of categories.filter(c => c !== 'All')) {
    if (query.toLowerCase().includes(category.toLowerCase())) {
      const tasksInCategory = tasks.filter(t => t.category === category);
      const pendingCount = tasksInCategory.filter(t => !t.completed).length;
      const completedCount = tasksInCategory.filter(t => t.completed).length;
      
      if (tasksInCategory.length === 0) {
        addChatMessage({ 
          sender: 'ai', 
          text: `No tasks in "${category}" category.` 
        });
      } else {
        const pendingTasks = tasksInCategory
          .filter(t => !t.completed)
          .map(t => `- "${t.title}" (${t.priority}, due: ${t.due || 'unset'})`)
          .join('\n');
        
        addChatMessage({ 
          sender: 'ai', 
          text: `"${category}": ${pendingCount} pending, ${completedCount} done.\n\n${pendingTasks || "No pending tasks."}` 
        });
      }
      return;
    }
  }
  
  // If no specific category was matched
  addChatMessage({ 
    sender: 'ai', 
    text: `Available categories: ${categories.filter(c => c !== 'All').join(', ')}` 
  });
};

const handleTaskSearch = (searchTerm: string) => {
  if (!searchTerm) {
    addChatMessage({ 
      sender: 'ai', 
      text: "Please specify a search term." 
    });
    return;
  }
  
  const matchingTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  if (matchingTasks.length === 0) {
    addChatMessage({ 
      sender: 'ai', 
      text: `No tasks found matching "${searchTerm}".` 
    });
  } else {
    const pendingTasks = matchingTasks.filter(t => !t.completed);
    const completedTasks = matchingTasks.filter(t => t.completed);
    
    let response = `${matchingTasks.length} tasks for "${searchTerm}":\n\n`;
    
    if (pendingTasks.length > 0) {
      response += `Pending (${pendingTasks.length}):\n` + 
        pendingTasks.map(t => `- "${t.title}" (${t.priority}, due: ${t.due || 'unset'})`).join('\n') + 
        '\n\n';
    }
    
    if (completedTasks.length > 0) {
      response += `Completed (${completedTasks.length}):\n` + 
        completedTasks.map(t => `- "${t.title}"`).join('\n');
    }
    
    addChatMessage({ sender: 'ai', text: response });
  }
};

  // Task CRUD operations
  const toggleTaskCompletion = async (id: number) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      const updatedTask = { ...task, completed: !task.completed };
      
      // Update UI optimistic update
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
      
      try {
        const apiTaskId = task.originalId || id.toString();
        

        await taskService.updateTask(apiTaskId, {
          ...task,          
          completed: !task.completed,
          // Ensure these fields are explicitly included
          title: task.title,
          description: task.description,
          priority: task.priority,
          category: task.category,
          due: task.due,
          blockchainHash: task.blockchainHash
        });
        
        
      } catch (apiError) {
        console.error('API Error when updating task:', apiError);
        
        
        
        setError(apiError instanceof Error ? apiError.message : 'Failed to update task on server, but change was applied locally');
      }
    } catch (err) {
      // Revert UI change if there's a client-side error
      setTasks([...tasks]); // Create a new array to trigger re-render with original data
      
      setError(err instanceof Error ? err.message : 'Failed to update task');
      addChatMessage({ 
        sender: 'ai', 
        text: "I couldn't update that task. Please try again." 
      });
    }
  };

  const handleAddTask = async (title: string, bountyAmount: string = "0.00") => {
    if (!title.trim()) return;
    
    try {
      setIsLoading(true); 
      
      const aiDeterminedPriority = title.toLowerCase().includes('urgent') || title.toLowerCase().includes('asap') ? 'high' :
                                  title.toLowerCase().includes('important') ? 'medium' : 'low';
  
      const aiDeterminedCategory = title.toLowerCase().includes('smart contract') || title.toLowerCase().includes('polygon') || title.toLowerCase().includes('deploy') ? 'Blockchain' :
                                  title.toLowerCase().includes('ai') || title.toLowerCase().includes('agent') || title.toLowerCase().includes('langchain')? 'AI Integration' :
                                  title.toLowerCase().includes('design') || title.toLowerCase().includes('ui') || title.toLowerCase().includes('ux') ? 'UI/UX' :
                                  title.toLowerCase().includes('test') || title.toLowerCase().includes('backend') ? 'Development' : 'General';
  
      const newTask: Task = {
        id: Date.now(), 
        title: title,
        completed: false,
        priority: aiDeterminedPriority as 'high' | 'medium' | 'low',
        due: new Date().toISOString().split('T')[0], // Default due date
        category: aiDeterminedCategory,
        bounty: bountyAmount 
      };
      
      setShowAddTask(false); 
      
      const hasBounty = parseFloat(bountyAmount) > 0;
      
      addChatMessage({ 
        sender: 'ai', 
        text: hasBounty 
          ? `Processing task "${title}" with ${bountyAmount} USDT bounty... Generating AI description and storing on blockchain.`
          : `Processing task "${title}"... Generating AI description.`
      });
      
      try {
        const createdTask = await taskService.createTask(newTask, bountyAmount);
        
        setTasks(prevTasks => [...prevTasks, createdTask]);
        
        addChatMessage({ 
          sender: 'ai', 
          text: hasBounty
            ? `Added task: "${createdTask.title}" with ${createdTask.priority} priority in ${createdTask.category}. A ${bountyAmount} USDT bounty has been locked and will be returned when the task is completed.`
            : `Added task: "${createdTask.title}" with ${createdTask.priority} priority in ${createdTask.category}.`
        });
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // Check if it's an allowance error
        const isAllowanceError = apiError instanceof Error && 
          apiError.message.includes('allowance');
        
        if (isAllowanceError) {
          addChatMessage({ 
            sender: 'ai', 
            text: `Unable to create task with bounty: USDT approval required. Please try again after approving the contract to use your USDT.`
          });
          setError("USDT approval required");
          setIsLoading(false);
          return;
        }
        
        // We'll generate a simple description and mock blockchain hash
        newTask.description = `Task to ${title}. This ${aiDeterminedPriority} priority task needs to be completed for the ${aiDeterminedCategory} category.`;
        newTask.blockchainHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
        newTask.bounty = "0.00"; // Reset bounty on error
        
        setTasks(prevTasks => [...prevTasks, newTask]);
        
        addChatMessage({ 
          sender: 'ai', 
          text: `Added task: "${newTask.title}" locally. Note: There was an issue connecting to the server, but the task was saved locally.` 
        });
        
        // Set error state
        setError(apiError instanceof Error ? apiError.message : 'Failed to add task to server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
      addChatMessage({ 
        sender: 'ai', 
        text: "I couldn't add that task. There might be a connection issue with the API or blockchain." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    const taskToDelete = tasks.find(task => task.id === id);
    if (!taskToDelete) return;
    
    if (window.confirm(`Are you sure you want to delete "${taskToDelete?.title}"?`)) {
      try {
        // Optimistic UI update
        setTasks(tasks.filter(task => task.id !== id));
        setShowTaskDetails(null); 
        
        if (editingTask && editingTask.id === id) {
            setEditingTask(null); 
        }
        
        try {
          const apiTaskId = taskToDelete.originalId || id.toString();
          await taskService.deleteTask(apiTaskId);
          
          if (taskToDelete) {
              addChatMessage({ sender: 'ai', text: `Task "${taskToDelete.title}" deleted.` });
          }
        } catch (apiError) {
          console.error('API Error when deleting task:', apiError);
          
          setError(apiError instanceof Error ? apiError.message : 'Failed to delete task from server, but it was removed locally');
        }
      } catch (err) {
        // Restore the task on error
        if (taskToDelete) {
          setTasks(prevTasks => [...prevTasks, taskToDelete]);
        }
        
        setError(err instanceof Error ? err.message : 'Failed to delete task');
        addChatMessage({ 
          sender: 'ai', 
          text: "I couldn't delete that task. There might be a connection issue." 
        });
      }
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const originalTask = tasks.find(task => task.id === updatedTask.id);
      if (!originalTask) return;
      
      // Optimistic UI update
      setTasks(tasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
      ));
      
      // Close modals
      setEditingTask(null); 
      setShowTaskDetails(null); 
      
      try {
        const apiTaskId = updatedTask.originalId || originalTask.originalId || updatedTask.id.toString();
        
        if (originalTask.originalId && !updatedTask.originalId) {
          updatedTask.originalId = originalTask.originalId;
        }
        
        if (!updatedTask.blockchainHash && originalTask.blockchainHash) {
          updatedTask.blockchainHash = originalTask.blockchainHash;
        }
        
        await taskService.updateTask(apiTaskId, updatedTask);
        
        addChatMessage({ sender: 'ai', text: `Task "${updatedTask.title}" updated.` });
      } catch (apiError) {
        console.error('API Error when saving task update:', apiError);
        
        // Set error state but keep the UI updated
        setError(apiError instanceof Error ? apiError.message : 'Failed to save task changes to server, but changes were applied locally');
        
        addChatMessage({ 
          sender: 'ai', 
          text: `Task "${updatedTask.title}" updated locally. Note: There was an issue saving to the server, but your changes are visible.` 
        });
      }
    } catch (err) {
      // Revert changes on error
      setTasks([...tasks]); 
      
      setError(err instanceof Error ? err.message : 'Failed to update task');
      addChatMessage({ 
        sender: 'ai', 
        text: "I couldn't update that task. Please try again." 
      });
    }
  };

  const handleEditRequest = (task: Task) => {
    setEditingTask(task);
    setShowTaskDetails(null); 
  };

  const handleShowDetails = (task: Task) => {
    setShowTaskDetails(task);
    setEditingTask(null); 
  };

  return (
    <div className="h-screen flex flex-col">
      {showLogin && (
        <LoginModal
          isOpen={showLogin}
          onClose={() => isAuthenticated && setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      
      {/* Modals */}
      {showAddTask && (
        <AddTaskModal
          isOpen={showAddTask}
          onClose={() => setShowAddTask(false)}
          onAddTask={handleAddTask}
          walletConnected={walletConnected}
        />
      )}
      
      {showTaskDetails && (
        <TaskDetailsModal
          isOpen={!!showTaskDetails}
          task={showTaskDetails}
          onClose={() => setShowTaskDetails(null)}
          onEdit={() => {
            setEditingTask(showTaskDetails);
            setShowTaskDetails(null);
          }}
          onDelete={() => {
            handleDeleteTask(showTaskDetails.id);
            setShowTaskDetails(null);
          }}
          onComplete={(complete: boolean) => {
            toggleTaskCompletion(showTaskDetails.id);
            setShowTaskDetails(null);
          }}
        />
      )}
      
      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleUpdateTask}
        />
      )}
      
      <Header
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        filterPriority={filterPriority as "All" | "High" | "Medium" | "Low"}
        onSetFilterPriority={setFilterPriority}
        isAuthenticated={isAuthenticated}
        onShowLogin={() => setShowLogin(true)}
        walletConnected={walletConnected}
      />
      
      {/* Mobile Wallet Balance  */}
      {isAuthenticated && walletConnected && (
        <div className="sm:hidden bg-gray-50 px-3 py-1.5 border-b flex justify-center">
          <WalletBalanceIndicator walletConnected={walletConnected} />
        </div>
      )}
      
      <div className="flex-1 flex overflow-hidden">
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
          onLogout={handleLogout}
          isAuthenticated={isAuthenticated}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 bg-gray-50">
          {/* AI Suggestion Banner */}
          <AiSuggestionBanner suggestion={aiSuggestions[currentSuggestionIndex]} />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">
            <div className="w-full sm:w-auto">
              <ProgressBar progress={progress} />
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">{completedTasksCount}</span> of <span className="font-medium">{tasks.length}</span> tasks completed
              </p>
            </div>
            
            <TaskListControls
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onAddTask={() => setShowAddTask(true)}
            />
          </div>
          
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-red-500">Error: {error}</div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <TaskList 
                  tasks={filteredTasks}
                  onToggleComplete={toggleTaskCompletion}
                  onEditTask={(task) => setEditingTask(task)}
                  onDeleteTask={handleDeleteTask}
                  onShowDetails={handleShowDetails}
                />
              </div>
              
              <AnalyticsOverview tasks={tasks} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DecentralizedTodoApp;