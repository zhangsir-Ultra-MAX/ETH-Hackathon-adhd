// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FocusToken
 * @dev 学习奖励代币 - Learn to Earn & Focus to Earn
 * 用户通过学习课程和专注工作获得代币奖励
 */
contract FocusToken is ERC20, Ownable {
    
    // 课程奖励映射 lessonId => reward amount
    mapping(uint256 => uint256) public lessonRewards;
    
    // 用户完成课程记录 user => lessonId => completed
    mapping(address => mapping(uint256 => bool)) public lessonCompleted;
    
    // 用户每日专注次数 user => count
    mapping(address => uint256) public dailyFocusCount;
    
    // 用户上次专注时间 user => timestamp
    mapping(address => uint256) public lastFocusTime;
    
    // 用户上次重置日期 user => day
    mapping(address => uint256) public lastResetDay;
    
    // 授权消费者合约
    mapping(address => bool) public authorizedSpenders;
    
    // 常量配置
    uint256 public constant MAX_DAILY_FOCUS = 10; // 每日最多10次专注奖励
    uint256 public constant MIN_FOCUS_INTERVAL = 25 minutes; // 最小专注间隔
    uint256 public constant MIN_FOCUS_REWARD = 2 ether; // 最小奖励 2 FOCUS
    uint256 public constant MAX_FOCUS_REWARD = 5 ether; // 最大奖励 5 FOCUS
    
    // 事件
    event LessonCompleted(address indexed user, uint256 indexed lessonId, uint256 reward);
    event FocusCompleted(address indexed user, uint256 reward, uint256 streak);
    event TokensSpent(address indexed user, uint256 amount, string reason);
    event AuthorizedSpenderAdded(address indexed spender);
    event AuthorizedSpenderRemoved(address indexed spender);
    
    constructor() ERC20("FocusToken", "FOCUS") Ownable(msg.sender) {
        // 初始化课程奖励
        lessonRewards[1] = 10 ether;  // 区块链基础
        lessonRewards[2] = 15 ether;  // 加密技术
        lessonRewards[3] = 20 ether;  // 去中心化网络
        lessonRewards[4] = 25 ether;  // 加密货币
        lessonRewards[5] = 30 ether;  // 智能合约
        lessonRewards[6] = 35 ether;  // DeFi应用
    }
    
    /**
     * @dev 完成课程领取奖励
     * @param lessonId 课程ID (1-6)
     * @param studyTime 学习时长(秒) - 用于防作弊验证
     */
    function claimLessonReward(uint256 lessonId, uint256 studyTime) external {
        require(lessonId >= 1 && lessonId <= 6, "Invalid lesson ID");
        require(!lessonCompleted[msg.sender][lessonId], "Lesson already completed");
        require(lessonRewards[lessonId] > 0, "Invalid lesson reward");
        
        // 验证学习时长（防止快速点击作弊）
        uint256 minStudyTime = getMinStudyTime(lessonId);
        require(studyTime >= minStudyTime, "Study time too short");
        
        // 标记课程完成
        lessonCompleted[msg.sender][lessonId] = true;
        
        // 发放奖励
        uint256 reward = lessonRewards[lessonId];
        _mint(msg.sender, reward);
        
        emit LessonCompleted(msg.sender, lessonId, reward);
    }
    
    /**
     * @dev 完成番茄钟专注领取奖励
     * 要求：25分钟专注间隔，每日最多10次
     */
    function claimFocusReward() external {
        // 检查每日限制
        _updateDailyReset();
        require(dailyFocusCount[msg.sender] < MAX_DAILY_FOCUS, "Daily focus limit reached");
        
        // 检查时间间隔
        if (lastFocusTime[msg.sender] > 0) {
            require(
                block.timestamp >= lastFocusTime[msg.sender] + MIN_FOCUS_INTERVAL,
                "Focus interval too short"
            );
        }
        
        // 更新状态
        dailyFocusCount[msg.sender]++;
        lastFocusTime[msg.sender] = block.timestamp;
        
        // 计算奖励（随机 + streak加成）
        uint256 baseReward = _getRandomReward();
        uint256 streakBonus = _calculateStreakBonus();
        uint256 totalReward = baseReward + streakBonus;
        
        // 发放奖励
        _mint(msg.sender, totalReward);
        
        emit FocusCompleted(msg.sender, totalReward, dailyFocusCount[msg.sender]);
    }
    
    /**
     * @dev 消费代币（由授权合约调用，如宠物喂养）
     */
    function spend(address user, uint256 amount, string memory reason) external {
        require(authorizedSpenders[msg.sender], "Not authorized spender");
        require(balanceOf(user) >= amount, "Insufficient balance");
        
        _burn(user, amount);
        
        emit TokensSpent(user, amount, reason);
    }
    
    /**
     * @dev 添加授权消费者（只有owner可调用）
     */
    function addAuthorizedSpender(address spender) external onlyOwner {
        authorizedSpenders[spender] = true;
        emit AuthorizedSpenderAdded(spender);
    }
    
    /**
     * @dev 移除授权消费者
     */
    function removeAuthorizedSpender(address spender) external onlyOwner {
        authorizedSpenders[spender] = false;
        emit AuthorizedSpenderRemoved(spender);
    }
    
    /**
     * @dev 更新课程奖励金额
     */
    function updateLessonReward(uint256 lessonId, uint256 reward) external onlyOwner {
        require(lessonId >= 1 && lessonId <= 6, "Invalid lesson ID");
        lessonRewards[lessonId] = reward;
    }
    
    /**
     * @dev 检查用户是否完成课程
     */
    function hasCompletedLesson(address user, uint256 lessonId) external view returns (bool) {
        return lessonCompleted[user][lessonId];
    }
    
    /**
     * @dev 获取用户今日专注次数
     */
    function getTodayFocusCount(address user) external view returns (uint256) {
        if (_shouldResetDaily(user)) {
            return 0;
        }
        return dailyFocusCount[user];
    }
    
    // ========== 内部函数 ==========
    
    /**
     * @dev 获取课程最小学习时长（秒）
     */
    function getMinStudyTime(uint256 lessonId) internal pure returns (uint256) {
        if (lessonId == 1) return 60;    // 1分钟 (演示用，实际应该更长)
        if (lessonId == 2) return 120;   // 2分钟
        if (lessonId == 3) return 180;   // 3分钟
        if (lessonId == 4) return 240;   // 4分钟
        if (lessonId == 5) return 300;   // 5分钟
        if (lessonId == 6) return 360;   // 6分钟
        return 60;
    }
    
    /**
     * @dev 生成伪随机奖励 (2-5 FOCUS)
     * 注意：这不是真正的随机，生产环境应使用Chainlink VRF
     */
    function _getRandomReward() internal view returns (uint256) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender
        ))) % 4; // 0-3
        
        return MIN_FOCUS_REWARD + (random * 1 ether);
    }
    
    /**
     * @dev 计算连续专注加成
     */
    function _calculateStreakBonus() internal view returns (uint256) {
        uint256 count = dailyFocusCount[msg.sender];
        if (count >= 5) return 2 ether;  // 5次以上 +2 FOCUS
        if (count >= 3) return 1 ether;  // 3次以上 +1 FOCUS
        return 0;
    }
    
    /**
     * @dev 更新每日重置
     */
    function _updateDailyReset() internal {
        if (_shouldResetDaily(msg.sender)) {
            dailyFocusCount[msg.sender] = 0;
            lastResetDay[msg.sender] = _getCurrentDay();
        }
    }
    
    /**
     * @dev 检查是否应该重置每日计数
     */
    function _shouldResetDaily(address user) internal view returns (bool) {
        return _getCurrentDay() > lastResetDay[user];
    }
    
    /**
     * @dev 获取当前天数（UTC时间）
     */
    function _getCurrentDay() internal view returns (uint256) {
        return block.timestamp / 1 days;
    }
}


