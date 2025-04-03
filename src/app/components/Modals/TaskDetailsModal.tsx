"use client";
import { Task } from '../../DecentralizedTodoApp'; 
import { X, Calendar, Edit, ExternalLink, DollarSign, Shield, Check } from 'lucide-react';
import { completeTaskOnBlockchain, verifyTaskOnBlockchain } from '../../services/blockchain';
import { useState, useEffect } from 'react';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onComplete: (complete: boolean) => void;
}

const TaskDetailsModal = ({ task, onClose, onEdit, onComplete }: TaskDetailsModalProps) => {
  const [isClaimingBounty, setIsClaimingBounty] = useState(false);
  const [blockchainStatus, setBlockchainStatus] = useState<{
    owner: string;
    bounty: string;
    completed: boolean;
    exists: boolean;
  } | null>(null);
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState(false);

  const hasBounty = task.bounty && parseFloat(task.bounty) > 0;
  
  const isVerifiedOnBlockchain = task.blockchainHash && 
    task.blockchainHash !== '0x0000000000000000000000000000000000000000000000000000000000000000';

  // Verify the task on blockchain when component mounts
  useEffect(() => {
    const verifyTask = async () => {
      if (isVerifiedOnBlockchain) {
        try {
          const status = await verifyTaskOnBlockchain(task.blockchainHash!);
          setBlockchainStatus(status);
        } catch (error) {
          console.error("Error verifying task on blockchain:", error);
        }
      }
    };
    
    verifyTask();
  }, [task.blockchainHash, isVerifiedOnBlockchain]);

  // Function to open blockchain explorer (mock for now)
  const openBlockchainExplorer = (hash: string) => {
    window.open(`https://sepolia.basescan.org/address/${hash}`, '_blank');
  };

  // Function to claim the bounty reward
  const handleClaimBounty = async () => {
    if (!isVerifiedOnBlockchain || !hasBounty) return;
    
    setIsClaimingBounty(true);
    setClaimError("");
    setClaimSuccess(false);
    
    try {
      await completeTaskOnBlockchain(task.blockchainHash!);
      setClaimSuccess(true);
      
      // Toggle task completion if not already completed
      if (!task.completed) {
        onComplete(true);
      }
    } catch (error) {
      console.error("Error claiming bounty:", error);
      setClaimError("Failed to claim bounty. Please try again later.");
    } finally {
      setIsClaimingBounty(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold break-words mr-4">{task.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            title="Close Details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 mb-6">
           {/* Description */}
           {task.description && (
             <div className="mb-4">
               <span className="text-sm font-medium text-gray-500">Description</span>
               <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                 {task.description}
               </p>
             </div>
           )}

           {/* Bounty section - only if there is a bounty */}
           {hasBounty && (
             <div className="mb-4 bg-yellow-50 p-4 rounded-lg">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-sm font-medium text-yellow-800 flex items-center">
                   <DollarSign size={16} className="mr-1" />
                   USDT Bounty
                 </span>
                 <span className="font-bold text-yellow-800">{task.bounty} USDT</span>
               </div>
               
               {blockchainStatus && (
                 <div className="text-xs text-yellow-700 mb-3">
                   {blockchainStatus.completed 
                     ? "This bounty has been claimed." 
                     : "This bounty will be returned when the task is completed."}
                 </div>
               )}
               
               {task.completed && isVerifiedOnBlockchain && !blockchainStatus?.completed && !claimSuccess && (
                 <button
                   onClick={handleClaimBounty}
                   disabled={isClaimingBounty}
                   className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isClaimingBounty ? (
                     <span className="flex items-center justify-center">
                       <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                       Claiming Bounty...
                     </span>
                   ) : (
                     "Claim Bounty Reward"
                   )}
                 </button>
               )}
               
               {claimSuccess && (
                 <div className="text-sm text-green-600 bg-green-50 p-2 rounded flex items-center">
                   <Check size={16} className="mr-1" />
                   Bounty claimed successfully!
                 </div>
               )}
               
               {claimError && (
                 <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                   {claimError}
                 </div>
               )}
             </div>
           )}
          
           {/* Status */}
           <div className="flex justify-between items-center py-1 border-b border-gray-100">
             <span className="text-sm font-medium text-gray-500">Status</span>
             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
               task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
             }`}>
               {task.completed ? 'Completed' : 'Pending'}
             </span>
           </div>
           {/* Priority */}
           <div className="flex justify-between items-center py-1 border-b border-gray-100">
             <span className="text-sm font-medium text-gray-500">Priority</span>
             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
               task.priority === 'high' ? 'bg-red-100 text-red-800' :
               task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
               'bg-green-100 text-green-800'
             }`}>
               {task.priority}
             </span>
           </div>
           {/* Due Date */}
           <div className="flex justify-between items-center py-1 border-b border-gray-100">
             <span className="text-sm font-medium text-gray-500">Due Date</span>
             <span className="flex items-center text-sm">
               <Calendar size={14} className="mr-1.5 text-gray-400" />
               {task.due}
             </span>
           </div>
            {/* Category */}
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
               <span className="text-sm font-medium text-gray-500">Category</span>
               <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">{task.category}</span>
            </div>
            {/* Blockchain Verification */}
            <div className="pt-2">
              <div className="text-sm font-medium text-gray-500 mb-1">Blockchain Verification</div>
              {isVerifiedOnBlockchain ? (
                <div className="flex items-center">
                  <div className="bg-gray-50 p-2 rounded text-xs font-mono overflow-hidden text-gray-600 flex-grow flex items-center">
                    <Shield size={14} className="text-green-500 mr-1.5 flex-shrink-0" />
                    {task.blockchainHash && `${task.blockchainHash.substring(0, 10)}...${task.blockchainHash.substring(task.blockchainHash.length - 8)}`}
                  </div>
                  <button 
                    onClick={() => openBlockchainExplorer(task.blockchainHash || '')}
                    className="ml-2 p-2 text-blue-500 hover:text-blue-700"
                    title="View on Blockchain Explorer"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 p-2 rounded text-xs text-gray-500">
                  Not verified on blockchain
                </div>
              )}
            </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:space-x-3 sm:justify-end space-y-2 sm:space-y-0">
          <button
            onClick={() => onEdit()}
            className="flex items-center justify-center border px-4 py-2 rounded hover:bg-gray-50 text-sm w-full sm:w-auto"
          >
            <Edit size={16} className="mr-1.5" /> Edit Task
          </button>
          <button
            onClick={() => {
              onComplete(!task.completed);
              onClose(); 
            }}
            className={`flex items-center justify-center px-4 py-2 rounded text-sm text-white w-full sm:w-auto ${
              task.completed ?
              'bg-yellow-500 hover:bg-yellow-600' :
              'bg-green-500 hover:bg-green-600'
            }`}
          >
            {task.completed ? 'Mark as Pending' : 'Mark as Completed'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;