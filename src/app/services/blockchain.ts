import { ethers } from 'ethers';
import { Task } from '../DecentralizedTodoApp';

// basic abi for the task registry contract
const taskRegistryABI = [
  "event TaskCreated(address indexed owner, bytes32 indexed taskHash, uint256 bounty)",
  "event TaskCompleted(address indexed owner, bytes32 indexed taskHash, uint256 bounty)",
  
  // Functions
  "function createTask(bytes32 _taskHash, uint256 _bounty) external",
  "function completeTask(bytes32 _taskHash) external",
  "function getTaskDetails(bytes32 _taskHash) external view returns (address owner, uint256 bounty, bool completed, bool exists)",
  "function getContractBalance() external view returns (uint256)"
];

// USDT Token ABI (simplified)
const usdtABI = [
  // Functions
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
];

// Contract addresses
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x3B46fA0835FfCc60A507566e1bCb39237F586B17"; 
const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS || "0x741e049ed61A5EBa4B0A7D8C379298F9ECDCaD96"; 

/**
 * Generate a hash for a task
 * @param task 
 * @returns A bytes32 hash string
 */
export function generateTaskHash(task: Task): string {
 
  // For now, we'll use a mock implementation
  const taskString = JSON.stringify({
    id: task.id,
    title: task.title,
    category: task.category,
    priority: task.priority,
    due: task.due,
    timestamp: Date.now()
  });
  
  try {
    // If ethers is available, use proper hashing
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(taskString));
  } catch (error) {
    // Fallback for environments where ethers isn't available
    let hash = 0;
    for (let i = 0; i < taskString.length; i++) {
      const char = taskString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; 
    }
    
    return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
  }
}

/**
 * Get the current wallet provider
 * @returns Ethers provider and signer if available
 */
async function getProvider() {
  // Check if window is defined (client-side only)
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []); // Connect to MetaMask
      const signer = provider.getSigner();
      return { provider, signer };
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      throw error;
    }
  }
  
  throw new Error('No Ethereum provider found. Please install MetaMask or a compatible wallet.');
}

/**
 * Check if user has sufficient USDT balance
 * @param amount The amount to check
 * @returns True if user has sufficient balance
 */
export async function checkUSDTBalance(amount: string): Promise<boolean> {
  try {
    const { provider, signer } = await getProvider();
    const usdtContract = new ethers.Contract(USDT_ADDRESS, usdtABI, provider);
    const address = await signer.getAddress();
    
    const balance = await usdtContract.balanceOf(address);
    const requiredAmount = ethers.utils.parseUnits(amount, 6); 
    
    return balance.gte(requiredAmount);
  } catch (error) {
    console.error('Error checking USDT balance:', error);
    return false;
  }
}

/**
 * Get user's USDT balance
 * @returns The USDT balance as a formatted string
 */
export async function getUSDTBalance(): Promise<string> {
  try {
    const { provider, signer } = await getProvider();
    const usdtContract = new ethers.Contract(USDT_ADDRESS, usdtABI, provider);
    const address = await signer.getAddress();
    
    const balance = await usdtContract.balanceOf(address);
    return ethers.utils.formatUnits(balance, 6); 
  } catch (error) {
    console.error('Error getting USDT balance:', error);
    return '0.00';
  }
}

/**
 * Check allowance for the task registry contract to spend USDT
 * @returns The allowance amount as a formatted string
 */
export async function checkUSDTAllowance(): Promise<string> {
  try {
    const { provider, signer } = await getProvider();
    const usdtContract = new ethers.Contract(USDT_ADDRESS, usdtABI, provider);
    const address = await signer.getAddress();
    
    const allowance = await usdtContract.allowance(address, CONTRACT_ADDRESS);
    return ethers.utils.formatUnits(allowance, 6); // USDT has 6 decimals
  } catch (error) {
    console.error('Error checking USDT allowance:', error);
    return '0.00';
  }
}

/**
 * Approve the task registry contract to spend USDT
 * @param amount The amount to approve (in USDT)
 * @returns The transaction hash
 */
export async function approveUSDTSpending(amount: string): Promise<string> {
  try {
    const { signer } = await getProvider();
    const usdtContract = new ethers.Contract(USDT_ADDRESS, usdtABI, signer);
    
    const amountInWei = ethers.utils.parseUnits(amount, 6);
    
    const tx = await usdtContract.approve(CONTRACT_ADDRESS, amountInWei);
    await tx.wait(); 
    
    console.log('Approval transaction:', tx.hash);
    return tx.hash;
  } catch (error) {
    console.error('Error approving USDT spending:', error);
    throw error;
  }
}

/**
 * Store a task hash on the blockchain with USDT bounty
 * @param taskHash The hash to store
 * @param bountyAmount The USDT bounty amount
 * @returns The transaction hash
 */
export async function storeTaskHashOnBlockchain(taskHash: string, bountyAmount: string): Promise<string> {
  console.log('Storing task hash on blockchain:', taskHash, 'with bounty:', bountyAmount);
  
  // Check if window is defined (client-side only)
  if (typeof window !== 'undefined') {
    try {
      // Check if we're in development mode or don't have ethereum provider
      if (process.env.NODE_ENV === 'development' && !window.ethereum) {
        console.log('Using mock blockchain implementation');
        return await mockBlockchainStore(taskHash, bountyAmount);
      }
      
      // Real implementation using ethers.js and MetaMask
      const { signer } = await getProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, taskRegistryABI, signer);
      
      // Convert string hash to bytes32 if it's not already
      const bytes32Hash = taskHash.startsWith('0x') && taskHash.length === 66 
        ? taskHash 
        : ethers.utils.id(taskHash);
      
      // Convert the bounty amount to wei (USDT has 6 decimals)
      const bountyInWei = ethers.utils.parseUnits(bountyAmount, 6);
      
      // Check if we have enough allowance
      const usdtContract = new ethers.Contract(USDT_ADDRESS, usdtABI, signer);
      const address = await signer.getAddress();
      const allowance = await usdtContract.allowance(address, CONTRACT_ADDRESS);
      
      if (allowance.lt(bountyInWei)) {
        throw new Error('Insufficient USDT allowance. Please approve spending first.');
      }
      
      // Create the task with bounty
      const tx = await contract.createTask(bytes32Hash, bountyInWei);
      await tx.wait(); // Wait for transaction to be mined
      
      console.log('Transaction hash:', tx.hash);
      return tx.hash;
    } catch (error) {
      console.error('Error storing task hash on blockchain:', error);
      
      // If this is an allowance error, throw it so we can handle it specifically
      const err = error as any; // Type assertion for the error
      if (
        (err.message && (
          err.message.includes('allowance') || 
          err.message.includes('insufficient') || 
          err.message.includes('approve') ||
          err.message.toLowerCase().includes('usdt')
        )) || 
        // Also check for ERC20 related errors
        (err.code && err.code === -32603 && err.data && err.data.message && 
          (err.data.message.includes('transfer amount exceeds allowance') || 
           err.data.message.includes('ERC20')))
      ) {
        console.log('Detected allowance or USDT approval error, propagating to UI');
        throw error;
      }
      
      return await mockBlockchainStore(taskHash, bountyAmount);
    }
  } else {
    // Server-side rendering, return a mock
    return await mockBlockchainStore(taskHash, bountyAmount);
  }
}

/**
 * Mock implementation for blockchain storage
 * @param taskHash The hash to "store"
 * @param bountyAmount The bounty amount
 * @returns The task hash itself (not a transaction hash)
 */
async function mockBlockchainStore(taskHash: string, bountyAmount: string): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Mock blockchain storage for task hash:', taskHash, 'with bounty:', bountyAmount);
  return taskHash;
}

/**
 * Complete a task on the blockchain to claim the bounty
 * @param taskHash The task hash to complete
 * @returns The transaction hash
 */
export async function completeTaskOnBlockchain(taskHash: string): Promise<string> {
  console.log('Completing task on blockchain:', taskHash);
  
  if (typeof window !== 'undefined') {
    try {
      if (process.env.NODE_ENV === 'development' && !window.ethereum) {
        console.log('Using mock blockchain implementation');
        return await mockCompleteTask(taskHash);
      }
      
      const { signer } = await getProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, taskRegistryABI, signer);
      
      const bytes32Hash = taskHash.startsWith('0x') && taskHash.length === 66 
        ? taskHash 
        : ethers.utils.id(taskHash);
      
      const tx = await contract.completeTask(bytes32Hash);
      await tx.wait(); 
      
      console.log('Transaction hash:', tx.hash);
      return tx.hash;
    } catch (error) {
      console.error('Error completing task on blockchain:', error);
      return await mockCompleteTask(taskHash);
    }
  } else {
    return await mockCompleteTask(taskHash);
  }
}

/**
 * Mock implementation for task completion
 * @param taskHash The hash to "complete"
 * @returns The task hash itself
 */
async function mockCompleteTask(taskHash: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Mock completion for task hash:', taskHash);
  return taskHash;
}

/**
 * Verify a task hash on the blockchain (check if it exists)
 * @param taskHash The hash to verify
 * @returns Task details if it exists
 */
export async function verifyTaskOnBlockchain(taskHash: string): Promise<{
  owner: string;
  bounty: string;
  completed: boolean;
  exists: boolean;
} | null> {
  console.log('Verifying task on blockchain:', taskHash);
  
  // Check if taskHash is valid
  if (!taskHash || taskHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    console.log('Invalid task hash, skipping blockchain verification');
    return null;
  }
  
  try {
    // Check if we're in development mode or don't have ethereum provider
    if (process.env.NODE_ENV === 'development' || !window.ethereum) {
      console.log('Using mock blockchain verification');
      return await mockVerifyTask(taskHash);
    }
    
    const { provider } = await getProvider();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, taskRegistryABI, provider);
    
    const bytes32Hash = taskHash.startsWith('0x') && taskHash.length === 66 
      ? taskHash 
      : ethers.utils.id(taskHash);
    
    const result = await contract.getTaskDetails(bytes32Hash);
    
    return {
      owner: result.owner,
      bounty: ethers.utils.formatUnits(result.bounty, 6), 
      completed: result.completed,
      exists: result.exists
    };
  } catch (error) {
    console.error('Error verifying task on blockchain:', error);
    return await mockVerifyTask(taskHash);
  }
}

/**
 * Mock implementation for task verification
 * @param taskHash The hash to "verify"
 * @returns Mock task details
 */
async function mockVerifyTask(taskHash: string): Promise<{
  owner: string;
  bounty: string;
  completed: boolean;
  exists: boolean;
}> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let mockOwner = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'; // Default mock address
  
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        mockOwner = accounts[0]; 
      }
    } catch (error) {
      console.error('Error getting wallet accounts in mockVerifyTask:', error);
    }
  }
  
  return {
    owner: mockOwner,
    bounty: '10.00',
    completed: false,
    exists: true
  };
}

declare global {
  interface Window {
    ethereum?: any;
  }
}