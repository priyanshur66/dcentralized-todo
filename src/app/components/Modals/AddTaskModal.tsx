"use client";
import { useState, useEffect } from 'react';
import { Brain, DollarSign, HelpCircle } from 'lucide-react';
import { checkUSDTBalance, checkUSDTAllowance, approveUSDTSpending, getUSDTBalance } from '../../services/blockchain';

interface AddTaskModalProps {
    onClose: () => void;
    onAddTask: (title: string, bounty: string) => void;
}

const AddTaskModal = ({ onClose, onAddTask }: AddTaskModalProps) => {
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [bountyAmount, setBountyAmount] = useState("0.00");
    const [usdtBalance, setUsdtBalance] = useState<string>("0.00");
    const [needsApproval, setNeedsApproval] = useState<boolean>(false);
    const [isApprovingUSDT, setIsApprovingUSDT] = useState<boolean>(false);
    const [showBountyHelp, setShowBountyHelp] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // Fetch USDT balance and allowance when component mounts
    useEffect(() => {
        const fetchBalanceAndAllowance = async () => {
            try {
                const balance = await getUSDTBalance();
                await checkUSDTAllowance(); // We'll check but not store it since it's unused
                
                setUsdtBalance(balance);
            } catch (error) {
                console.error("Error fetching balance or allowance:", error);
            }
        };
        
        fetchBalanceAndAllowance();
    }, []);

    // Check if approval is needed when bounty amount changes
    useEffect(() => {
        const checkApprovalNeeded = async () => {
            if (parseFloat(bountyAmount) > 0) {
                try {
                    const allowance = await checkUSDTAllowance();
                    
                    const needsApproval = parseFloat(allowance) < parseFloat(bountyAmount);
                    console.log('Checking USDT approval status:', { allowance, bountyAmount, needsApproval });
                    setNeedsApproval(needsApproval);
                } catch (error) {
                    console.error("Error checking allowance:", error);
                    setNeedsApproval(true);
                }
            } else {
                setNeedsApproval(false);
            }
        };
        
        checkApprovalNeeded();
        
        // Set up polling to check allowance status every 3 seconds 
        let intervalId: NodeJS.Timeout;
        if (parseFloat(bountyAmount) > 0) {
            intervalId = setInterval(checkApprovalNeeded, 3000);
        }
        
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [bountyAmount]);

    const handleBountyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
            setBountyAmount(value);
            setError("");
        }
    };

    const handleApproveUSDT = async () => {
        setIsApprovingUSDT(true);
        setError("");
        
        try {
            // Check if user has enough USDT
            const hasBalance = await checkUSDTBalance(bountyAmount);
            if (!hasBalance) {
                setError(`Insufficient USDT balance. Your balance: ${usdtBalance} USDT`);
                setIsApprovingUSDT(false);
                return;
            }
            
            const txHash = await approveUSDTSpending(bountyAmount);
            console.log('USDT approval transaction:', txHash);
            
            // Add a slight delay 
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verify the approval went through 
            let attempts = 0;
            let approved = false;
            while (attempts < 3 && !approved) {
                const newAllowance = await checkUSDTAllowance();
                console.log(`Approval verification attempt ${attempts + 1}:`, newAllowance);
                
                if (parseFloat(newAllowance) >= parseFloat(bountyAmount)) {
                    approved = true;
                    setNeedsApproval(false);
                    break;
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
            }
            
            if (!approved) {
                console.warn('Approval may not have been processed yet, but transaction was sent');
            }
        } catch (error) {
            console.error("Error approving USDT:", error);
            setError("Failed to approve USDT. Please check your wallet and try again.");
        } finally {
            setIsApprovingUSDT(false);
        }
    };

    const handleAdd = async () => {
        if (!newTaskTitle.trim()) {
            setError("Task title is required");
            return;
        }
        
        if (parseFloat(bountyAmount) > 0) {
            try {
                // Check if user has enough USDT
                const hasBalance = await checkUSDTBalance(bountyAmount);
                if (!hasBalance) {
                    setError(`Insufficient USDT balance. Your balance: ${usdtBalance} USDT`);
                    return;
                }
                
                // Check if we need approval
                if (needsApproval) {
                    setError("Please approve USDT spending before creating task with bounty");
                    return;
                }
                
                onAddTask(newTaskTitle, bountyAmount);
            } catch (error) {
                console.error("Error checking USDT requirements:", error);
                setError("Error checking USDT requirements. Creating task without bounty.");
                onAddTask(newTaskTitle, "0.00");
            }
        } else {
            onAddTask(newTaskTitle, "0.00");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Task</h2>
                
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Task title (e.g., Deploy contract on Polygon)"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full p-2 border border-gray-400 rounded mb-4 text-sm text-gray-700"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter' && !needsApproval) handleAdd(); }}
                />

                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                            USDT Bounty
                            <button 
                                onClick={() => setShowBountyHelp(!showBountyHelp)}
                                className="ml-1 text-gray-500 hover:text-gray-700"
                            >
                                <HelpCircle size={14} />
                            </button>
                        </label>
                        <span className="text-xs text-gray-600">Balance: {usdtBalance} USDT</span>
                    </div>
                    
                    {showBountyHelp && (
                        <div className="bg-blue-50 p-2 rounded mb-2 text-xs text-blue-700">
                            Set a USDT bounty to motivate yourself to complete this task. The bounty amount will be locked and returned to you when the task is marked as complete.
                        </div>
                    )}
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign size={16} className="text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="0.00"
                            value={bountyAmount}
                            onChange={handleBountyChange}
                            className="w-full pl-9 p-2 border border-gray-400 rounded text-sm text-gray-700"
                        />
                    </div>
                </div>

                {parseFloat(bountyAmount) > 0 && needsApproval && (
                    <div className="bg-yellow-50 p-3 rounded mb-4">
                        <p className="text-sm text-yellow-700 mb-2">
                            You need to approve the contract to use your USDT.
                        </p>
                        <button
                            onClick={handleApproveUSDT}
                            disabled={isApprovingUSDT}
                            className="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                        >
                            {isApprovingUSDT ? (
                                <span className="flex items-center justify-center">
                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                    Approving...
                                </span>
                            ) : (
                                'Approve USDT Spending'
                            )}
                        </button>
                    </div>
                )}

                <div className="bg-blue-50 p-3 rounded mb-4 flex items-start">
                    <Brain size={18} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="text-blue-700 font-medium">AI Assistant</p>
                        <p className="text-blue-700">
                            {parseFloat(bountyAmount) > 0 
                                ? `I'll help you create this task with a ${bountyAmount} USDT bounty. The funds will be returned when you mark it as complete.` 
                                : "Priority & category are auto-detected from the title. You can edit them later."}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-50 text-sm text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!newTaskTitle.trim() || (parseFloat(bountyAmount) > 0 && needsApproval)} // Disable if empty or needs approval
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add Task
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTaskModal;