// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MeditationStaking {
    struct User {
        uint256 stakeAmount;
        uint256 habitStartTime;
        uint256 lastCheckInTime; 
        uint256 adherenceCount; 
        bool hasStaked;
        address userAddress;
        uint256 numberOfSteps;
    }

    mapping(address => User) public users;
    address public owner;

    event Staked(address indexed user, uint256 amount);
    event CheckIn(address indexed user, uint256 count);
    event Withdrawn(address indexed user, uint256 amount, bool success);
    event PenaltyDeducted(address indexed user, uint256 penaltyAmount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyStaker() {
        require(users[msg.sender].hasStaked, "You have not staked yet");
        _;
    }
    function register() public {
        require(users[msg.sender].userAddress!=msg.sender, "User is already registered");
        users[msg.sender].userAddress = msg.sender;
    }

    function stake() external payable {
        require(users[msg.sender].userAddress==msg.sender, "User must be registered");
        require(msg.value > 0, "Stake amount must be greater than zero");
        require(!users[msg.sender].hasStaked, "You already have an active stake");
        users[msg.sender].stakeAmount = msg.value;
        users[msg.sender].hasStaked = true;
        users[msg.sender].habitStartTime = block.timestamp;
        users[msg.sender].lastCheckInTime=block.timestamp;
        users[msg.sender].adherenceCount=0;
    }

    function checkIn() external onlyStaker {
        User storage user = users[msg.sender];
        uint256 currentDay = (block.timestamp - user.habitStartTime) / 1 days + 1;
        require(currentDay > user.adherenceCount, "You have already checked in today");
        changeStakeRewards(user);
        user.adherenceCount++;
        user.lastCheckInTime = block.timestamp;
    }

    function withdraw() external onlyStaker {
        User storage user = users[msg.sender];
        require(block.timestamp >= user.habitStartTime + 30 days, "Cannot withdraw before 30 days");
        require(user.stakeAmount >= 0.1 ether, "Stake amount is less than the minimum required");
        changeStakeRewards(user);
        uint256 stakeAmount = user.stakeAmount;
        user.stakeAmount = 0;
        user.hasStaked = false;
        payable(msg.sender).transfer(stakeAmount);

    }
    function addRewards(uint256 _steps)external {
        users[msg.sender].stakeAmount-=(users[msg.sender].stakeAmount/1000);
        users[msg.sender].numberOfSteps=_steps;
        users[msg.sender].stakeAmount+=users[msg.sender].numberOfSteps/1000;
    }
    function changeStakeRewards(User storage user) internal {
        if (user.stakeAmount == 0) {
            return;
        }
        uint256 daysSinceLastCheckIn = (block.timestamp - user.lastCheckInTime) / 1 days;
        if (daysSinceLastCheckIn > 1) {
            uint256 penalty = (user.stakeAmount * daysSinceLastCheckIn) / 100;
            if (penalty > user.stakeAmount) {
                penalty = user.stakeAmount;
            }
            user.stakeAmount -= penalty;
        }else if(daysSinceLastCheckIn==1){
             uint256 reward = (user.stakeAmount) / 300;
             user.stakeAmount += reward;
        }
    }

    function getUser(address _user) external view returns (User memory) {
        return users[_user];
    }
}
