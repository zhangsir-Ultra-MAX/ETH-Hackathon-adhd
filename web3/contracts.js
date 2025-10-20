// 智能合约交互模块

import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@6.10.0/+esm';
import { CONTRACTS } from './config.js';
import { walletManager } from './wallet.js';

// 合约ABI（简化版，包含关键函数）
const FOCUS_TOKEN_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function balanceOf(address) view returns (uint256)",
    "function claimLessonReward(uint256 lessonId, uint256 studyTime)",
    "function claimFocusReward()",
    "function lessonCompleted(address, uint256) view returns (bool)",
    "function hasCompletedLesson(address user, uint256 lessonId) view returns (bool)",
    "function getTodayFocusCount(address user) view returns (uint256)",
    "event LessonCompleted(address indexed user, uint256 indexed lessonId, uint256 reward)",
    "event FocusCompleted(address indexed user, uint256 reward, uint256 streak)"
];

const ADHD_PET_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function mintPet() returns (uint256)",
    "function feed(uint256 tokenId, uint8 foodType)",
    "function play(uint256 tokenId)",
    "function groom(uint256 tokenId)",
    "function heal(uint256 tokenId)",
    "function levelUp(uint256 tokenId)",
    "function updatePetStatus(uint256 tokenId)",
    "function getPetsByOwner(address owner) view returns (uint256[])",
    "function getPetInfo(uint256 tokenId) view returns (tuple(uint8 level, uint8 hunger, uint8 happiness, uint8 health, uint256 birthTime, uint256 lastUpdate, uint256 totalFed, uint256 totalPlayed, bool isAlive))",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "event PetMinted(address indexed owner, uint256 indexed tokenId)",
    "event PetFed(uint256 indexed tokenId, uint8 foodType, uint8 newHunger)",
    "event PetLeveledUp(uint256 indexed tokenId, uint8 newLevel)",
    "event PetDied(uint256 indexed tokenId)"
];

const LEARNING_PROOF_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function getCertificatesByStudent(address student) view returns (uint256[])",
    "function hasCertificate(address student, uint256 lessonId) view returns (bool)",
    "function getCertificateInfo(uint256 tokenId) view returns (tuple(uint256 lessonId, uint256 completionTime, uint256 studyDuration, address student))",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "event CertificateIssued(address indexed student, uint256 indexed tokenId, uint256 indexed lessonId)"
];

const FOCUS_MANAGER_ABI = [
    "function startLesson(uint256 lessonId)",
    "function completeLesson(uint256 lessonId)",
    "function updateProgress(uint256 lessonId, uint256 page)",
    "function completeFocusSession()",
    "function getUserStats(address user) view returns (tuple(uint256 totalLessonsCompleted, uint256 totalStudyTime, uint256 totalFocusSessions, uint256 currentStreak, uint256 lastActivityDay))",
    "function getCurrentSession(address user) view returns (tuple(uint256 startTime, uint256 lessonId, uint256 currentPage, bool completed))",
    "function getLessonConfig(uint256 lessonId) view returns (uint256 pages, uint256 minTime)",
    "function canClaimLesson(address user, uint256 lessonId) view returns (bool)",
    "event LearningStarted(address indexed user, uint256 indexed lessonId, uint256 startTime)",
    "event LearningCompleted(address indexed user, uint256 indexed lessonId, uint256 studyTime)",
    "event CertificateEarned(address indexed user, uint256 indexed lessonId, uint256 tokenId)"
];

class ContractManager {
    constructor() {
        this.focusToken = null;
        this.adhdPet = null;
        this.learningProof = null;
        this.focusManager = null;
    }

    /**
     * 初始化合约实例
     */
    async initialize() {
        if (!walletManager.isConnected) {
            throw new Error('请先连接钱包');
        }

        try {
            this.focusToken = new ethers.Contract(
                CONTRACTS.FocusToken,
                FOCUS_TOKEN_ABI,
                walletManager.signer
            );

            this.adhdPet = new ethers.Contract(
                CONTRACTS.ADHDPet,
                ADHD_PET_ABI,
                walletManager.signer
            );

            this.learningProof = new ethers.Contract(
                CONTRACTS.LearningProof,
                LEARNING_PROOF_ABI,
                walletManager.signer
            );

            this.focusManager = new ethers.Contract(
                CONTRACTS.FocusManager,
                FOCUS_MANAGER_ABI,
                walletManager.signer
            );

            console.log('合约初始化成功');
        } catch (error) {
            console.error('合约初始化失败:', error);
            throw error;
        }
    }

    // ========== FocusToken 相关方法 ==========

    /**
     * 获取FOCUS代币余额
     */
    async getFocusBalance(address = walletManager.address) {
        const balance = await this.focusToken.balanceOf(address);
        return ethers.formatEther(balance);
    }

    /**
     * 领取课程奖励
     */
    async claimLessonReward(lessonId, studyTime) {
        const tx = await this.focusToken.claimLessonReward(lessonId, studyTime);
        const receipt = await tx.wait();
        return receipt;
    }

    /**
     * 领取番茄钟奖励
     */
    async claimFocusReward() {
        const tx = await this.focusToken.claimFocusReward();
        const receipt = await tx.wait();
        return receipt;
    }

    /**
     * 检查课程是否已完成
     */
    async hasCompletedLesson(lessonId, address = walletManager.address) {
        return await this.focusToken.hasCompletedLesson(address, lessonId);
    }

    /**
     * 获取今日专注次数
     */
    async getTodayFocusCount(address = walletManager.address) {
        const count = await this.focusToken.getTodayFocusCount(address);
        return Number(count);
    }

    // ========== ADHDPet 相关方法 ==========

    /**
     * Mint新宠物
     */
    async mintPet() {
        const tx = await this.adhdPet.mintPet();
        const receipt = await tx.wait();
        
        // 从事件中获取tokenId
        const event = receipt.logs.find(log => {
            try {
                return this.adhdPet.interface.parseLog(log).name === 'PetMinted';
            } catch { return false; }
        });
        
        if (event) {
            const parsed = this.adhdPet.interface.parseLog(event);
            return Number(parsed.args.tokenId);
        }
        
        return null;
    }

    /**
     * 喂养宠物
     */
    async feedPet(tokenId, foodType) {
        const tx = await this.adhdPet.feed(tokenId, foodType);
        const receipt = await tx.wait();
        return receipt;
    }

    /**
     * 与宠物玩耍
     */
    async playWithPet(tokenId) {
        const tx = await this.adhdPet.play(tokenId);
        const receipt = await tx.wait();
        return receipt;
    }

    /**
     * 给宠物梳毛
     */
    async groomPet(tokenId) {
        const tx = await this.adhdPet.groom(tokenId);
        const receipt = await tx.wait();
        return receipt;
    }

    /**
     * 治疗宠物
     */
    async healPet(tokenId) {
        const tx = await this.adhdPet.heal(tokenId);
        const receipt = await tx.wait();
        return receipt;
    }

    /**
     * 宠物升级
     */
    async levelUpPet(tokenId) {
        const tx = await this.adhdPet.levelUp(tokenId);
        const receipt = await tx.wait();
        return receipt;
    }

    /**
     * 更新宠物状态
     */
    async updatePetStatus(tokenId) {
        const tx = await this.adhdPet.updatePetStatus(tokenId);
        const receipt = await tx.wait();
        return receipt;
    }

    /**
     * 获取用户的所有宠物
     */
    async getUserPets(address = walletManager.address) {
        const tokenIds = await this.adhdPet.getPetsByOwner(address);
        return tokenIds.map(id => Number(id));
    }

    /**
     * 获取宠物信息
     */
    async getPetInfo(tokenId) {
        const info = await this.adhdPet.getPetInfo(tokenId);
        return {
            level: Number(info.level),
            hunger: Number(info.hunger),
            happiness: Number(info.happiness),
            health: Number(info.health),
            birthTime: Number(info.birthTime),
            lastUpdate: Number(info.lastUpdate),
            totalFed: Number(info.totalFed),
            totalPlayed: Number(info.totalPlayed),
            isAlive: info.isAlive
        };
    }

    // ========== LearningProof 相关方法 ==========

    /**
     * 获取用户的所有证书
     */
    async getUserCertificates(address = walletManager.address) {
        const tokenIds = await this.learningProof.getCertificatesByStudent(address);
        return tokenIds.map(id => Number(id));
    }

    /**
     * 检查是否有某课程证书
     */
    async hasCertificate(lessonId, address = walletManager.address) {
        return await this.learningProof.hasCertificate(address, lessonId);
    }

    /**
     * 获取证书信息
     */
    async getCertificateInfo(tokenId) {
        const info = await this.learningProof.getCertificateInfo(tokenId);
        return {
            lessonId: Number(info.lessonId),
            completionTime: Number(info.completionTime),
            studyDuration: Number(info.studyDuration),
            student: info.student
        };
    }

    // ========== FocusManager 相关方法 ==========

    /**
     * 开始学习课程
     */
    async startLesson(lessonId) {
        const tx = await this.focusManager.startLesson(lessonId);
        const receipt = await tx.wait();
        return receipt;
    }

    /**
     * 完成课程
     */
    async completeLesson(lessonId) {
        const tx = await this.focusManager.completeLesson(lessonId);
        const receipt = await tx.wait();
        return receipt;
    }

    /**
     * 更新学习进度
     */
    async updateProgress(lessonId, page) {
        const tx = await this.focusManager.updateProgress(lessonId, page);
        const receipt = await tx.wait();
        return receipt;
    }

    /**
     * 完成番茄钟
     */
    async completeFocusSession() {
        const tx = await this.focusManager.completeFocusSession();
        const receipt = await tx.wait();
        return receipt;
    }

    /**
     * 获取用户统计
     */
    async getUserStats(address = walletManager.address) {
        const stats = await this.focusManager.getUserStats(address);
        return {
            totalLessonsCompleted: Number(stats.totalLessonsCompleted),
            totalStudyTime: Number(stats.totalStudyTime),
            totalFocusSessions: Number(stats.totalFocusSessions),
            currentStreak: Number(stats.currentStreak),
            lastActivityDay: Number(stats.lastActivityDay)
        };
    }

    /**
     * 获取当前学习会话
     */
    async getCurrentSession(address = walletManager.address) {
        const session = await this.focusManager.getCurrentSession(address);
        return {
            startTime: Number(session.startTime),
            lessonId: Number(session.lessonId),
            currentPage: Number(session.currentPage),
            completed: session.completed
        };
    }

    /**
     * 获取课程配置
     */
    async getLessonConfig(lessonId) {
        const config = await this.focusManager.getLessonConfig(lessonId);
        return {
            pages: Number(config.pages),
            minTime: Number(config.minTime)
        };
    }

    /**
     * 检查是否可以领取课程奖励
     */
    async canClaimLesson(lessonId, address = walletManager.address) {
        return await this.focusManager.canClaimLesson(address, lessonId);
    }
}

// 导出单例
export const contractManager = new ContractManager();


