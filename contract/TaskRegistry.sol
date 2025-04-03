// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TaskRegistry
 * @dev Stores tasks with USDT bounties to incentivize completion on time.
 */
contract TaskRegistry {
    // USDT token interface
    IERC20 public usdtToken;
    
    // Task structure
    struct Task {
        address owner;
        uint256 bounty;
        bool completed;
        bool exists;
    }
    
    // Mapping from task hash to Task struct
    mapping(bytes32 => Task) public tasks;
    
    // Events
    event TaskCreated(address indexed owner, bytes32 indexed taskHash, uint256 bounty);
    event TaskCompleted(address indexed owner, bytes32 indexed taskHash, uint256 bounty);
    
    
    constructor(address _usdtAddress) {
        usdtToken = IERC20(_usdtAddress);
    }
    
    /**
     * @dev Modifier to ensure only the task owner can call certain functions
     */
    modifier onlyTaskOwner(bytes32 _taskHash) {
        require(tasks[_taskHash].exists, "Task does not exist");
        require(tasks[_taskHash].owner == msg.sender, "Only task owner can perform this action");
        _;
    }
    
    /**
     * @dev Creates a new task with a USDT bounty
     * @param _taskHash The SHA-256 hash representing the task details
     * @param _bounty The USDT amount for the bounty
     */
    function createTask(bytes32 _taskHash, uint256 _bounty) external {
        require(!tasks[_taskHash].exists, "Task already exists");
        require(_bounty > 0, "Bounty must be greater than zero");
        
        require(usdtToken.transferFrom(msg.sender, address(this), _bounty), "USDT transfer failed");
        
        tasks[_taskHash] = Task({
            owner: msg.sender,
            bounty: _bounty,
            completed: false,
            exists: true
        });
        
        emit TaskCreated(msg.sender, _taskHash, _bounty);
    }
    
    /**
     * @dev Marks a task as completed and returns the bounty to the task owner
     * @param _taskHash The task hash to mark as completed
     */
    function completeTask(bytes32 _taskHash) external onlyTaskOwner(_taskHash) {
        require(!tasks[_taskHash].completed, "Task already completed");
        
        Task storage task = tasks[_taskHash];
        task.completed = true;
        
        // Return the bounty to the task owner
        require(usdtToken.transfer(task.owner, task.bounty), "Bounty return failed");
        
        emit TaskCompleted(task.owner, _taskHash, task.bounty);
    }
    
    
    function getTaskDetails(bytes32 _taskHash) external view returns (
        address owner,
        uint256 bounty,
        bool completed,
        bool exists
    ) {
        Task storage task = tasks[_taskHash];
        return (task.owner, task.bounty, task.completed, task.exists);
    }
    
    
    function getContractBalance() external view returns (uint256) {
        return usdtToken.balanceOf(address(this));
    }
}