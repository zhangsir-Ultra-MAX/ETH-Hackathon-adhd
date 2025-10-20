// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IFocusToken {
    function claimLessonReward(uint256 lessonId, uint256 studyTime) external;
    function claimFocusReward() external;
    function hasCompletedLesson(address user, uint256 lessonId) external view returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface ILearningProof {
    function issueCertificate(address student, uint256 lessonId, uint256 studyDuration) external returns (uint256);
    function hasCertificate(address student, uint256 lessonId) external view returns (bool);
}

/**
 * @title FocusManager
 * @dev 核心管理合约 - 协调所有功能模块
 * 负责课程完成验证、奖励分发、防作弊机制
 */
contract FocusManager is Ownable, ReentrancyGuard {
    
    // 合约引用
    IFocusToken public focusToken;
    ILearningProof public learningProof;
    
    // 课程学习记录
    struct LearningSession {
        uint256 startTime;     // 开始时间
        uint256 lessonId;      // 课程ID
        uint256 currentPage;   // 当前页面
        bool completed;        // 是否完成
    }
    
    // 用户学习会话 user => session
    mapping(address => LearningSession) public learningSessions;
    
    // 课程页面数量 lessonId => pageCount
    mapping(uint256 => uint256) public lessonPages;
    
    // 课程最小学习时间（秒） lessonId => minTime
    mapping(uint256 => uint256) public minStudyTimes;
    
    // 用户统计数据
    struct UserStats {
        uint256 totalLessonsCompleted;
        uint256 totalStudyTime;
        uint256 totalFocusSessions;
        uint256 currentStreak;
        uint256 lastActivityDay;
    }
    
    mapping(address => UserStats) public userStats;
    
    // 排行榜数据
    address[] public topLearners;
    mapping(address => uint256) public leaderboardRank;
    
    // 事件
    event LearningStarted(address indexed user, uint256 indexed lessonId, uint256 startTime);
    event LearningCompleted(address indexed user, uint256 indexed lessonId, uint256 studyTime);
    event CertificateEarned(address indexed user, uint256 indexed lessonId, uint256 tokenId);
    event StreakUpdated(address indexed user, uint256 newStreak);
    
    constructor(address _focusToken, address _learningProof) Ownable(msg.sender) {
        focusToken = IFocusToken(_focusToken);
        learningProof = ILearningProof(_learningProof);
        
        // 初始化课程配置
        _initializeLessons();
    }
    
    /**
     * @dev 开始学习课程
     */
    function startLesson(uint256 lessonId) external {
        require(lessonId >= 1 && lessonId <= 6, "Invalid lesson ID");
        require(!focusToken.hasCompletedLesson(msg.sender, lessonId), "Lesson already completed");
        
        LearningSession storage session = learningSessions[msg.sender];
        require(!session.completed || session.lessonId != lessonId, "Session already active");
        
        // 创建新会话
        learningSessions[msg.sender] = LearningSession({
            startTime: block.timestamp,
            lessonId: lessonId,
            currentPage: 1,
            completed: false
        });
        
        emit LearningStarted(msg.sender, lessonId, block.timestamp);
    }
    
    /**
     * @dev 完成课程并领取奖励
     */
    function completeLesson(uint256 lessonId) external nonReentrant {
        LearningSession storage session = learningSessions[msg.sender];
        
        require(session.lessonId == lessonId, "No active session for this lesson");
        require(!session.completed, "Session already completed");
        
        // 计算学习时长
        uint256 studyTime = block.timestamp - session.startTime;
        
        // 验证学习时长
        require(studyTime >= minStudyTimes[lessonId], "Study time too short");
        
        // 验证页面进度（必须完成所有页面）
        require(session.currentPage >= lessonPages[lessonId], "Not all pages completed");
        
        // 标记完成
        session.completed = true;
        
        // 发放FOCUS代币奖励
        focusToken.claimLessonReward(lessonId, studyTime);
        
        // 颁发学习证书NFT
        uint256 certTokenId = learningProof.issueCertificate(msg.sender, lessonId, studyTime);
        
        // 更新用户统计
        _updateUserStats(msg.sender, studyTime);
        
        // 更新排行榜
        _updateLeaderboard(msg.sender);
        
        emit LearningCompleted(msg.sender, lessonId, studyTime);
        emit CertificateEarned(msg.sender, lessonId, certTokenId);
    }
    
    /**
     * @dev 更新学习进度（翻页）
     */
    function updateProgress(uint256 lessonId, uint256 page) external {
        LearningSession storage session = learningSessions[msg.sender];
        
        require(session.lessonId == lessonId, "No active session for this lesson");
        require(!session.completed, "Session already completed");
        require(page <= lessonPages[lessonId], "Invalid page number");
        
        // 只能顺序翻页
        require(page <= session.currentPage + 1, "Must progress sequentially");
        
        session.currentPage = page;
    }
    
    /**
     * @dev 完成番茄钟专注（前端调用）
     */
    function completeFocusSession() external nonReentrant {
        // 调用FocusToken发放奖励
        focusToken.claimFocusReward();
        
        // 更新统计
        UserStats storage stats = userStats[msg.sender];
        stats.totalFocusSessions++;
        
        _updateStreak(msg.sender);
    }
    
    /**
     * @dev 获取用户学习统计
     */
    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }
    
    /**
     * @dev 获取当前学习会话
     */
    function getCurrentSession(address user) external view returns (LearningSession memory) {
        return learningSessions[user];
    }
    
    /**
     * @dev 获取课程配置
     */
    function getLessonConfig(uint256 lessonId) external view returns (uint256 pages, uint256 minTime) {
        return (lessonPages[lessonId], minStudyTimes[lessonId]);
    }
    
    /**
     * @dev 获取排行榜前N名
     */
    function getTopLearners(uint256 count) external view returns (address[] memory) {
        uint256 length = count > topLearners.length ? topLearners.length : count;
        address[] memory top = new address[](length);
        
        for (uint256 i = 0; i < length; i++) {
            top[i] = topLearners[i];
        }
        
        return top;
    }
    
    /**
     * @dev 检查用户是否可以领取课程奖励
     */
    function canClaimLesson(address user, uint256 lessonId) external view returns (bool) {
        return !focusToken.hasCompletedLesson(user, lessonId) && 
               !learningProof.hasCertificate(user, lessonId);
    }
    
    // ========== 管理员函数 ==========
    
    /**
     * @dev 更新课程配置
     */
    function updateLessonConfig(
        uint256 lessonId,
        uint256 pages,
        uint256 minTime
    ) external onlyOwner {
        require(lessonId >= 1 && lessonId <= 6, "Invalid lesson ID");
        lessonPages[lessonId] = pages;
        minStudyTimes[lessonId] = minTime;
    }
    
    /**
     * @dev 更新合约地址
     */
    function updateContracts(address _focusToken, address _learningProof) external onlyOwner {
        if (_focusToken != address(0)) {
            focusToken = IFocusToken(_focusToken);
        }
        if (_learningProof != address(0)) {
            learningProof = ILearningProof(_learningProof);
        }
    }
    
    // ========== 内部函数 ==========
    
    /**
     * @dev 初始化课程配置
     */
    function _initializeLessons() internal {
        // lessonId => (页面数, 最小学习时间秒)
        lessonPages[1] = 3;
        minStudyTimes[1] = 60;   // 1分钟（演示用）
        
        lessonPages[2] = 4;
        minStudyTimes[2] = 120;  // 2分钟
        
        lessonPages[3] = 5;
        minStudyTimes[3] = 180;  // 3分钟
        
        lessonPages[4] = 5;
        minStudyTimes[4] = 240;  // 4分钟
        
        lessonPages[5] = 6;
        minStudyTimes[5] = 300;  // 5分钟
        
        lessonPages[6] = 7;
        minStudyTimes[6] = 360;  // 6分钟
    }
    
    /**
     * @dev 更新用户统计
     */
    function _updateUserStats(address user, uint256 studyTime) internal {
        UserStats storage stats = userStats[user];
        stats.totalLessonsCompleted++;
        stats.totalStudyTime += studyTime;
        
        _updateStreak(user);
    }
    
    /**
     * @dev 更新连续学习天数
     */
    function _updateStreak(address user) internal {
        UserStats storage stats = userStats[user];
        uint256 currentDay = block.timestamp / 1 days;
        
        if (stats.lastActivityDay == 0) {
            // 首次活动
            stats.currentStreak = 1;
        } else if (currentDay == stats.lastActivityDay) {
            // 同一天，不更新streak
            return;
        } else if (currentDay == stats.lastActivityDay + 1) {
            // 连续一天
            stats.currentStreak++;
        } else {
            // 中断，重置
            stats.currentStreak = 1;
        }
        
        stats.lastActivityDay = currentDay;
        emit StreakUpdated(user, stats.currentStreak);
    }
    
    /**
     * @dev 更新排行榜（简化版本）
     */
    function _updateLeaderboard(address user) internal {
        // 如果用户不在排行榜中，添加
        if (leaderboardRank[user] == 0 && topLearners.length < 100) {
            topLearners.push(user);
            leaderboardRank[user] = topLearners.length;
        }
        
        // 实际应用中应该根据学习时长排序
        // 这里简化处理
    }
}


