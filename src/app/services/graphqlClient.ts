import { authService } from './api';

const GRAPHQL_ENDPOINT = 'http://143.110.181.255:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET;

/**
 * Execute a GraphQL query with authentication
 * @param query The GraphQL query string
 * @param variables Optional variables for the query
 * @returns The query result data
 */
export async function executeGraphQLQuery<T>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  try {
    const token = authService.isAuthenticated() ? localStorage.getItem('auth_token') : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET || '', 
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'GraphQL request failed');
    }
    
    const data = await response.json();
    
    if (data.errors && data.errors.length > 0) {
      throw new Error(data.errors[0].message || 'GraphQL query error');
    }
    
    return data.data as T;
  } catch (error) {
    console.error('GraphQL query error:', error);
    throw error;
  }
}

/**
 * Get user's tasks from GraphQL API
 * This function is used to fetch tasks for the current authenticated user
 */
export async function getUserTasks() {
  const query = `
    query GetAllTasks {
      tasks(order_by: {created_at: desc}) {
        created_at
        updated_at
        task_blockchain_hash
        task_category
        task_description
        task_due_date
        task_id
        task_name
        task_priority
        task_status
        user_id
      }
    }
  `;
  
  return executeGraphQLQuery<{ tasks: any[] }>(query);
}

/**
 * Get task context for AI assistant
 * This function fetches all user tasks to provide context for the AI assistant
 * @returns Formatted task context as a string
 */
export async function getTaskContextForAI(): Promise<string> {
  try {
    const { tasks } = await getUserTasks();
    
    if (!tasks || tasks.length === 0) {
      return "No tasks found.";
    }
    
    const formattedTasks = tasks.map(task => `
      Task: ${task.task_name}
      ID: ${task.task_id}
      Status: ${task.task_status}
      Priority: ${task.task_priority}
      Category: ${task.task_category}
      Due Date: ${task.task_due_date}
      Description: ${task.task_description}
    `).join('\n');
    
    return `Here are the user's current tasks:\n${formattedTasks}`;
  } catch (error) {
    console.error('Error getting task context for AI:', error);
    return "Unable to retrieve task information.";
  }
} 