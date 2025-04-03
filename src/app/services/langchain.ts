import { Task } from '../DecentralizedTodoApp';
import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const categoryTemplates: Record<string, string[]> = {
  'Development': [
    "Implement {title} following best coding practices and ensure proper error handling. This task involves writing clean, maintainable code with comprehensive test coverage.",
    "Develop the {title} feature with attention to performance and scalability. Create modular components that can be easily maintained and extended in the future.",
    "Build {title} functionality with proper documentation and unit tests. Follow the project's coding standards and ensure compatibility with existing systems."
  ],
  'UI/UX': [
    "Design an intuitive user interface for {title} that follows accessibility guidelines and provides a seamless user experience across devices.",
    "Create responsive layouts for {title} with attention to visual hierarchy, color theory, and typography. Ensure the design aligns with brand guidelines.",
    "Develop an engaging visual design for {title} that enhances usability while maintaining aesthetic appeal. Consider user feedback in the design process."
  ],
  'Blockchain': [
    "Implement {title} with proper security considerations and gas optimization. Ensure the smart contract is thoroughly tested on testnets before deployment.",
    "Develop {title} functionality with attention to blockchain security best practices. Consider potential attack vectors and implement appropriate safeguards.",
    "Build secure and efficient {title} integration with proper exception handling and validation. Follow established patterns for blockchain interactions."
  ],
  'AI Integration': [
    "Integrate AI capabilities for {title} with proper data handling and model optimization. Ensure the system provides accurate and relevant results.",
    "Develop machine learning components for {title} with appropriate validation and testing procedures. Consider edge cases and potential biases in the data.",
    "Implement AI features for {title} that enhance user experience while maintaining performance. Ensure the AI components can scale with increasing usage."
  ],
  'General': [
    "Complete {title} with attention to detail and quality standards. Document your approach and any considerations for future development.",
    "Execute {title} efficiently while maintaining high-quality standards. Consider how this task fits into the broader project goals.",
    "Accomplish {title} following established best practices and guidelines. Ensure your implementation is maintainable and well-documented."
  ]
};

// Priority context strings
const priorityContext: Record<string, string> = {
  'high': "This is a critical task that requires immediate attention and thoroughness. It should be prioritized above other tasks due to its impact on the project timeline or functionality.",
  'medium': "This task has standard priority and should be completed within the scheduled timeframe. It's important but not urgent enough to displace high-priority items.",
  'low': "This is a lower priority task that should be addressed after higher priority items. While still necessary, it has less impact on immediate project goals."
};


function initChatModel() {
  if (process.env.NEXT_PUBLIC_GROQ_API_KEY) {
    return new ChatGroq({
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
      model: "llama-3.1-8b-chat", 
      temperature: 0.2,
    });
  }
  
  // Fallback to OpenAI
  if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    return new ChatOpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      model: "gpt-3.5-turbo",
      temperature: 0.2,
    });
  }
  
  return null;
}

/**
 * Generate a task description using LangChain
 * @param title The task title
 * @param category The task category
 * @param priority The task priority
 * @returns A detailed task description
 */
export async function generateTaskDescription(
  title: string, 
  category: string, 
  priority: string
): Promise<string> {
  console.log(`Generating description for task: ${title}, category: ${category}, priority: ${priority}`);
  
  const model = initChatModel();
  
  if (model) {
    try {
      const promptTemplate = ChatPromptTemplate.fromMessages([
        ["system", "You are an AI assistant that generates detailed task descriptions for a todo application. Keep descriptions concise (max 2-3 sentences) but informative."],
        ["user", "Generate a description for a task with the following details:\n- Title: {title}\n- Category: {category}\n- Priority: {priority}\n\nThe description should be professional and actionable."]
      ]);
      
      // Format the prompt with our variables
      const formattedPrompt = await promptTemplate.invoke({
        title,
        category,
        priority
      });
      
      // Call the model
      const response = await model.invoke(formattedPrompt);
      return response.content.toString().trim();
    } catch (error) {
      console.error('Error using LangChain API:', error);
      return mockLangChainGenerate(title, category, priority);
    }
  } else {
    // If no API keys, use mock implementation
    console.log('Using mock LangChain implementation');
    return mockLangChainGenerate(title, category, priority);
  }
}

/**
 * Mock LangChain description generation based on templates
 * @param title The task title
 * @param category The task category
 * @param priority The task priority
 * @returns A generated task description
 */
function mockLangChainGenerate(
  title: string,
  category: string,
  priority: string
): string {
  // Simulate network delay
  // await new Promise(resolve => setTimeout(resolve, 800));
  
  const templates = categoryTemplates[category] || categoryTemplates['General'];
  
  const randomIndex = Math.floor(Math.random() * templates.length);
  const template = templates[randomIndex];
  
  // Replace {title} placeholder with the actual title
  const baseDescription = template.replace('{title}', title);
  
  const priorityDesc = priorityContext[priority as keyof typeof priorityContext] || priorityContext['medium'];
  
  return `${baseDescription} ${priorityDesc}`;
}

/**
 * Generate task suggestions based on the current task list
 * @param tasks The current list of tasks
 * @returns A list of AI-generated suggestions
 */
export async function generateTaskSuggestions(tasks: Task[]): Promise<string[]> {
    // If no tasks, return default suggestions
    if (!tasks || tasks.length === 0) {
      return [
        "Add your first task to get started!",
        "You can create tasks by clicking the 'Add Task' button",
        "Tasks can be organized by priority and category for better management"
      ];
    }
  
    const model = initChatModel();
    
    if (model) {
      try {
        // Normalize dates to ISO strings 
        const normalizedTasks = tasks.map(task => ({
          title: task.title || "Untitled Task",
          category: task.category || "General", 
          priority: task.priority || "medium",
          completed: !!task.completed,
          due: typeof task.due === 'string' ? task.due : new Date().toISOString().split('T')[0]
        }));
        
        const taskListString = JSON.stringify(normalizedTasks);
        
        const messages = [
          new SystemMessage("You are an AI assistant that analyzes task lists and provides helpful suggestions to improve productivity. Keep suggestions concise and actionable."),
          new HumanMessage(`Here is my current task list:\n${taskListString}\n\nPlease provide 3 specific suggestions to help me manage these tasks better. Focus on prioritization, scheduling, and task organization.`)
        ];
        
        const response = await model.invoke(messages);
        
        const content = response.content.toString();
        
        // Try different  approaches
        let suggestions: string[] = [];
        
        const numberedMatches = content.match(/\d+\.\s+([^\n]+)/g);
        if (numberedMatches && numberedMatches.length > 0) {
          suggestions = numberedMatches.map(match => match.replace(/^\d+\.\s+/, '').trim());
        } 
        else {
          suggestions = content
            .split(/\n+/)
            .filter(line => line.trim().length > 10) 
            .slice(0, 3); 
        }
        
        if (suggestions.length > 0) {
          return suggestions;
        }
        
        // Fallback to mock implementation
        return mockTaskSuggestions(tasks);
      } catch (error) {
        console.error('Error generating task suggestions:', error);
        return mockTaskSuggestions(tasks);
      }
    } else {
      return mockTaskSuggestions(tasks);
    }
  }
/**
 * Generate mock task suggestions based on task data
 * @param tasks The list of tasks
 * @returns A list of suggestions
 */
function mockTaskSuggestions(tasks: Task[]): string[] {
  const defaultSuggestions = [
    "Consider prioritizing high-priority tasks that are near their due dates.",
    "You have several tasks in the same category. Group similar work for better efficiency.",
    "Break down larger tasks into smaller, more manageable subtasks.",
    "Schedule regular breaks between focused work sessions for optimal productivity."
  ];
  
  // If we have tasks, we can generate more specific suggestions
  if (tasks.length > 0) {
    const suggestions: string[] = [];
    
    // Check for overdue tasks
    const today = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter(t => !t.completed && t.due < today);
    if (overdueTasks.length > 0) {
      suggestions.push(`You have ${overdueTasks.length} overdue tasks. Consider rescheduling or prioritizing them today.`);
    }
    
    // Check for high priority tasks
    const highPriorityTasks = tasks.filter(t => !t.completed && t.priority === 'high');
    if (highPriorityTasks.length > 0) {
      suggestions.push(`Focus on your ${highPriorityTasks.length} high-priority tasks, especially "${highPriorityTasks[0].title}".`);
    }
    
    // Check for task categories
    const categories = tasks.map(t => t.category);
    const mostCommonCategory = categories
      .filter((category, index, array) => array.indexOf(category) === index)
      .sort((a, b) => {
        return categories.filter(c => c === b).length - categories.filter(c => c === a).length;
      })[0];
      
    if (mostCommonCategory) {
      suggestions.push(`You have multiple tasks in the "${mostCommonCategory}" category. Consider batching this work for better focus.`);
    }
    
    // Return a mix of specific and default suggestions
    return [
      ...suggestions,
      ...defaultSuggestions.slice(0, 3 - suggestions.length)
    ];
  }
  
  // If no tasks, return default suggestions
  return defaultSuggestions.slice(0, 3);
}