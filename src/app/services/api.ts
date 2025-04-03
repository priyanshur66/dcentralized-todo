import { Task } from '../DecentralizedTodoApp';
import { 
  generateTaskHash, 
  storeTaskHashOnBlockchain, 
  completeTaskOnBlockchain 
} from './blockchain';
import { generateTaskDescription } from './langchain';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  walletAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

// Task types for API
export interface ApiTask {
  task_id: string;
  task_name: string;
  task_description: string;
  task_status: 'todo' | 'in-progress' | 'done';
  task_priority: 'high' | 'medium' | 'low';
  task_blockchain_hash: string;
  task_category: string;
  task_due_date: string;
  task_bounty: string; 
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

// Common headers with auth token
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Authentication APIs
export const authService = {
  async register(email: string, password: string, displayName: string, walletAddress?: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        displayName,
        walletAddress,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    const data = await response.json();
    return data;
  },
  
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await response.json();
    setToken(data.token);
    return data;
  },
  
  logout(): void {
    removeToken();
  },
  
  isAuthenticated(): boolean {
    return !!getToken();
  }
};

// Task APIs
export const taskService = {
  // Simple hash function to create more unique IDs
  hashCode(str: string): number {
    let hash = 0;
    if (!str) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash % 10000); 
  },
  
  // Convert frontend task format to backend format
  mapTaskToApi(task: Task): Partial<ApiTask> {
    console.log('Mapping task to API format:', task);
    
    // The backend expects: "todo", "in-progress", or "done"
    let taskStatus: 'todo' | 'in-progress' | 'done';
    if (task.completed) {
      taskStatus = 'done';
    } else {
      taskStatus = 'todo';
    }

    const mappedTask = {
      task_name: task.title || 'Untitled Task',
      task_description: task.description || 'No description provided.',
      task_status: taskStatus,
      task_priority: task.priority || 'medium',
      task_category: task.category || 'General',
      task_due_date: task.due || new Date().toISOString().split('T')[0],
      task_blockchain_hash: task.blockchainHash || '0x0000000000000000000000000000000000000000000000000000000000000000', // Default hash
      task_bounty: task.bounty || '0.00', // Default bounty this amount will be avoided 
    };
    
    // Log the mapped task
    console.log('Mapped to API format:', mappedTask);
    
    return mappedTask;
  },
  
  // Convert backend task format to frontend format
  mapTaskFromApi(apiTask: ApiTask): Task {
    if (!apiTask || typeof apiTask !== 'object') {
      console.error('Invalid API task object:', apiTask);
      return {
        id: Date.now() + Math.floor(Math.random() * 1000), 
        title: 'Error: Failed to parse task',
        description: 'There was an error processing this task from the API.',
        completed: false,
        priority: 'medium',
        due: new Date().toISOString().split('T')[0],
        category: 'General',
        blockchainHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        bounty: '0.00',
      };
    }
    
    const originalId = apiTask.task_id;
    
    const uniqueId = Date.now() + this.hashCode(originalId);
    
    return {
      id: uniqueId,
      title: apiTask.task_name || 'Untitled Task',
      description: apiTask.task_description || '',
      completed: apiTask.task_status === 'done', // Map 'done' to completed=true
      priority: apiTask.task_priority || 'medium',
      due: apiTask.task_due_date || new Date().toISOString().split('T')[0],
      category: apiTask.task_category || 'General',
      blockchainHash: apiTask.task_blockchain_hash || '0x0000000000000000000000000000000000000000000000000000000000000000',
      bounty: apiTask.task_bounty || '0.00',
      originalId: originalId, // Store the UUID for API operations
    };
  },
  
  async getAllTasks(): Promise<Task[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch tasks');
      }
      
      const data = await response.json();
      
      if (data.tasks && Array.isArray(data.tasks)) {
        return data.tasks.map((task: ApiTask) => this.mapTaskFromApi(task));
      } else if (data.data && Array.isArray(data.data)) {
        return data.data.map((task: ApiTask) => this.mapTaskFromApi(task));
      } else if (Array.isArray(data)) {
        // Handle case where the API returns an array directly
        return data.map((task: ApiTask) => this.mapTaskFromApi(task));
      } else {
        console.error('Invalid API response format:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },
  
  async getTaskById(taskId: string | number): Promise<Task> {
    try {
      

      const apiEndpoint = `${API_BASE_URL}/api/v1/tasks/${taskId}`;
      
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch task ${taskId}`);
      }
      
      const data = await response.json();
      
      if (data.task) {
        return this.mapTaskFromApi(data.task as ApiTask);
      } else if (data.data) {
        return this.mapTaskFromApi(data.data as ApiTask);
      } else if (data.task_id) {
        return this.mapTaskFromApi(data as ApiTask);
      } else {
        console.error('Invalid response format:', data);
        throw new Error(`Invalid response format for task ${taskId}`);
      }
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      throw error;
    }
  },
  
  async createTask(task: Task, bountyAmount: string = '0.00'): Promise<Task> {
    try {
      // Generate description using LangChain
      const description = await generateTaskDescription(task.title, task.category, task.priority);
      task.description = description;
      
      // Set the bounty amount
      task.bounty = bountyAmount;
      
      // Generate a hash of the task for blockchain storage
      const taskHash = generateTaskHash(task);
      
      // Store the task hash as the blockchain hash
      task.blockchainHash = taskHash;
      
      // Always store on blockchain regardless of bounty amount
      await storeTaskHashOnBlockchain(taskHash, bountyAmount);
      
      const apiTask = this.mapTaskToApi(task);
      
      // For API calls, we don't need to send the bounty info
      const apiTaskWithoutBounty = { ...apiTask };
      delete apiTaskWithoutBounty.task_bounty;
      
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(apiTaskWithoutBounty),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }
      
      const data = await response.json();
      
      // The API returns { message: string, task: ApiTask } 
      if (!data) {
        console.error('Empty response received');
        throw new Error('Empty response received');
      }
      
      if (data.task) {
        const taskFromApi = this.mapTaskFromApi(data.task as ApiTask);
        // Re-add the bounty value 
        taskFromApi.bounty = bountyAmount;
        return taskFromApi;
      } 
      else if (data.data) {
        const taskFromApi = this.mapTaskFromApi(data.data as ApiTask);
        taskFromApi.bounty = bountyAmount;
        return taskFromApi;
      }
      else {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format: missing task data');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },
  
  async updateTask(taskId: string | number, task: Partial<Task>): Promise<Task> {
    try {
      
      const apiTaskId = typeof taskId === 'string' ? taskId : taskId.toString();
      
      console.log(`Updating task ${apiTaskId} with:`, task);

     
      let fullTask: Task;
      
      try {
        // First, try to get the existing task using the API
        const existingTask = await this.getTaskById(apiTaskId);
        fullTask = { ...existingTask, ...task };
      } catch (error) {
        // If we can't get the existing task, create a reasonably complete task object
        console.error(`Couldn't fetch existing task ${apiTaskId}:`, error);
        
        if (!task.title) {
          throw new Error("Cannot update task: Missing title field and unable to fetch existing task.");
        }
        
        // Create a minimal task object with the required fields
        fullTask = {
          id: typeof taskId === 'number' ? taskId : parseInt(taskId),
          title: task.title,
          completed: task.completed ?? false,
          priority: task.priority ?? 'medium',
          due: task.due ?? new Date().toISOString().split('T')[0],
          category: task.category ?? 'General',
          blockchainHash: task.blockchainHash ?? '0x0000000000000000000000000000000000000000000000000000000000000000',
          bounty: task.bounty ?? '0.00',
          ...task,
        };
      }
      
      if (task.originalId) {
        fullTask.originalId = task.originalId;
      }
      
      if (task.completed && fullTask.completed && parseFloat(fullTask.bounty || '0') > 0 && fullTask.blockchainHash) {
        try {
          // Complete the task on blockchain to claim the bounty
          await completeTaskOnBlockchain(fullTask.blockchainHash);
        } catch (error) {
          console.error('Error completing task on blockchain:', error);
          // Continue with the update even if blockchain interaction fails
          // todo: add a alert to the user that the task was completed but the bounty was not claimed
        }
      }
      
      // If this is a substantial update (changing title, category, or priority), 
      // regenerate the description and blockchain hash
      if ((task.title || task.category || task.priority) && !task.description) {
        const description = await generateTaskDescription(
          fullTask.title, 
          fullTask.category, 
          fullTask.priority
        );
        fullTask.description = description;
        
        if ((task.title || task.priority || task.category)) {
          const taskHash = generateTaskHash(fullTask);
          fullTask.blockchainHash = taskHash;
          await storeTaskHashOnBlockchain(taskHash, fullTask.bounty || '0.00');
        }
      }
      
      const apiTask = this.mapTaskToApi(fullTask);
      
      // For API calls, we don't need to send the bounty info
      const apiTaskWithoutBounty = { ...apiTask };
      delete apiTaskWithoutBounty.task_bounty;
      
      // Log sending to the API
      console.log('Sending to API:', apiTaskWithoutBounty);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${apiTaskId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(apiTaskWithoutBounty),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update task ${apiTaskId}`);
      }
      
      const data = await response.json();
      
      if (data.task) {
        const taskFromApi = this.mapTaskFromApi(data.task as ApiTask);
        taskFromApi.bounty = fullTask.bounty || '0.00';
        return taskFromApi;
      } else if (data.data) {
        const taskFromApi = this.mapTaskFromApi(data.data as ApiTask);
        taskFromApi.bounty = fullTask.bounty || '0.00';
        return taskFromApi;
      } else if (data.task_id) {
        const taskFromApi = this.mapTaskFromApi(data as ApiTask);
        taskFromApi.bounty = fullTask.bounty || '0.00';
        return taskFromApi;
      } else {
        console.error('Invalid API response format:', data);
        
        return fullTask;
      }
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  },
  
  async deleteTask(taskId: string | number): Promise<void> {
    try {


      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete task ${taskId}`);
      }
      
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  }
};