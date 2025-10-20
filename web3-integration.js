// Web3集成主文件
import { walletManager } from './web3/wallet.js';
import { contractManager } from './web3/contracts.js';
import { 
    showToast, 
    waitForTransaction, 
    formatTokenAmount,
    formatDuration,
    getPetEmoji,
    getPetStatusClass,
    LESSON_CONFIG,
    FOOD_CONFIG
} from './web3/utils.js';
import { NETWORK_CONFIG } from './web3/config.js';

// Web3应用状态
class Web3App {
    constructor() {
        this.isWeb3Enabled = false;
        this.currentPetId = null;
        this.learningSession = {
            lessonId: null,
            startTime: null,
            currentPage: 1
        };
    }

    async initialize() {
        console.log('🚀 初始化Web3应用...');
        
        // 先尝试导入配置
        let CONTRACTS;
        try {
            const config = await import('./web3/config.js');
            CONTRACTS = config.CONTRACTS;
        } catch (error) {
            console.warn('⚠️ 无法加载Web3配置，Web3功能将禁用', error);
            this.showWeb3DisabledBanner('配置未加载');
            this.isWeb3Enabled = false;
            return;
        }
        
        // 检查合约地址是否配置
        const hasValidContracts = CONTRACTS && CONTRACTS.FocusToken !== "0x0000000000000000000000000000000000000000";
        
        if (!hasValidContracts) {
            console.warn('⚠️ 合约未部署，Web3功能将禁用');
            this.showWeb3DisabledBanner('合约未部署');
            this.isWeb3Enabled = false;
            return;
        }
        
        // 设置事件监听
        this.setupEventListeners();
        
        // 检查是否之前连接过
        await this.checkPreviousConnection();
    }
    
    showWeb3DisabledBanner(reason) {
        // 创建友好的Web3禁用提示横幅
        const banner = document.createElement('div');
        banner.className = 'web3-disabled-banner';
        banner.innerHTML = `
            <div class="banner-content">
                <i class="fas fa-info-circle"></i>
                <span>Web3功能暂未启用（${reason}），您仍可使用所有本地功能</span>
                <button class="banner-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // 插入到页面顶部
        document.body.insertBefore(banner, document.body.firstChild);
        
        // 隐藏Web3相关按钮
        const connectBtn = document.getElementById('connectWalletBtn');
        if (connectBtn) {
            connectBtn.style.display = 'none';
        }
    }

    setupEventListeners() {
        // 钱包连接按钮
        document.getElementById('connectWalletBtn')?.addEventListener('click', async () => {
            await this.connectWallet();
        });

        // 钱包地址按钮（点击复制或断开）
        document.getElementById('walletAddressBtn')?.addEventListener('click', () => {
            this.showWalletMenu();
        });

        // 监听钱包事件
        window.addEventListener('accountChanged', (e) => {
            console.log('账户已变化:', e.detail.address);
            this.onAccountChanged(e.detail.address);
        });

        window.addEventListener('networkChanged', (e) => {
            console.log('网络已变化:', e.detail.chainId);
            this.checkNetwork();
        });

        window.addEventListener('walletDisconnected', () => {
            console.log('钱包已断开');
            this.onWalletDisconnected();
        });

        // 将Web3功能暴露给全局（供script.js调用）
        window.web3App = this;
    }

    async checkPreviousConnection() {
        // 检查是否之前连接过MetaMask
        if (walletManager.isMetaMaskInstalled() && localStorage.getItem('walletConnected') === 'true') {
            try {
                await this.connectWallet();
            } catch (error) {
                console.log('自动连接失败:', error);
            }
        }
    }

    async connectWallet() {
        try {
            showToast('正在连接钱包...', 'info');
            
            const result = await walletManager.connect();
            
            // 检查网络
            const isCorrectNetwork = await walletManager.checkNetwork();
            if (!isCorrectNetwork) {
                showToast(`请切换到 ${NETWORK_CONFIG.networkName}`, 'warning');
                await walletManager.switchNetwork(NETWORK_CONFIG.chainId);
                return;
            }

            // 初始化合约
            await contractManager.initialize();

            // 更新UI
            this.updateWalletUI(result.address);
            
            // 加载数据
            await this.loadUserData();

            this.isWeb3Enabled = true;
            localStorage.setItem('walletConnected', 'true');
            
            showToast('钱包连接成功！', 'success');
            
            console.log('✅ Web3已启用');
        } catch (error) {
            console.error('连接钱包失败:', error);
            showToast(error.message || '连接钱包失败', 'error');
        }
    }

    updateWalletUI(address) {
        // 隐藏连接按钮，显示钱包信息
        document.getElementById('connectWalletBtn').style.display = 'none';
        document.getElementById('walletInfo').style.display = 'flex';
        
        // 更新地址显示
        document.getElementById('walletAddress').textContent = walletManager.formatAddress(address);
        
        // 更新网络状态
        const networkName = NETWORK_CONFIG.networkName;
        document.getElementById('networkName').textContent = networkName;
        document.querySelector('.network-dot').classList.add('connected');
    }

    async loadUserData() {
        try {
            // 加载FOCUS余额
            await this.updateFocusBalance();
            
            // 加载用户宠物
            await this.loadUserPets();
            
            // 加载用户证书
            await this.loadUserCertificates();
            
            // 加载用户统计
            await this.loadUserStats();
        } catch (error) {
            console.error('加载用户数据失败:', error);
        }
    }

    async updateFocusBalance() {
        try {
            const balance = await contractManager.getFocusBalance();
            document.getElementById('focusBalance').textContent = formatTokenAmount(balance);
            
            // 同时更新区块链学习页面的代币显示
            const tokenAmount = document.getElementById('tokenAmount');
            if (tokenAmount) {
                tokenAmount.textContent = formatTokenAmount(balance);
            }
        } catch (error) {
            console.error('更新余额失败:', error);
        }
    }

    async loadUserPets() {
        try {
            const petIds = await contractManager.getUserPets();
            
            if (petIds.length > 0) {
                this.currentPetId = petIds[0]; // 使用第一只宠物
                await this.updatePetDisplay(this.currentPetId);
            } else {
                // 显示Mint宠物提示
                this.showMintPetHint();
            }
        } catch (error) {
            console.error('加载宠物失败:', error);
        }
    }

    async updatePetDisplay(tokenId) {
        try {
            const petInfo = await contractManager.getPetInfo(tokenId);
            
            // 更新宠物UI
            const petAvatar = document.getElementById('petAvatar');
            if (petAvatar) {
                petAvatar.innerHTML = `<span style="font-size: 5rem;">${getPetEmoji(petInfo)}</span>`;
            }
            
            // 更新属性条
            this.updatePetStat('hunger', petInfo.hunger);
            this.updatePetStat('happiness', petInfo.happiness);
            this.updatePetStat('health', petInfo.health);
            
            // 更新等级
            const petLevel = document.getElementById('petLevel');
            if (petLevel) {
                petLevel.textContent = petInfo.level;
            }
        } catch (error) {
            console.error('更新宠物显示失败:', error);
        }
    }

    updatePetStat(statName, value) {
        const bar = document.getElementById(`${statName}Bar`);
        const valueEl = document.getElementById(`${statName}Value`);
        
        if (bar) {
            bar.style.width = `${value}%`;
            bar.className = `bar-fill ${statName}-bar ${getPetStatusClass(value)}`;
        }
        
        if (valueEl) {
            valueEl.textContent = `${value}%`;
        }
    }

    showMintPetHint() {
        const petLog = document.getElementById('petLog');
        if (petLog) {
            petLog.innerHTML = `
                <div class="log-entry hint">
                    <i class="fas fa-star"></i>
                    <p>你还没有宠物！点击"Mint宠物"按钮获取你的第一只免费宠物🐱</p>
                </div>
            `;
        }
    }

    async loadUserCertificates() {
        try {
            const certIds = await contractManager.getUserCertificates();
            console.log('用户证书:', certIds);
            
            // 更新已完成课程的显示
            for (let lessonId = 1; lessonId <= 6; lessonId++) {
                const hasCert = await contractManager.hasCertificate(lessonId);
                if (hasCert) {
                    this.markLessonCompleted(lessonId);
                }
            }
        } catch (error) {
            console.error('加载证书失败:', error);
        }
    }

    markLessonCompleted(lessonId) {
        const lessonCard = document.querySelector(`[data-lesson="${lessonId}"]`);
        if (lessonCard) {
            lessonCard.classList.add('completed');
            const btn = lessonCard.querySelector('.start-lesson-btn');
            if (btn) {
                btn.textContent = '已完成';
                btn.disabled = true;
            }
        }
    }

    async loadUserStats() {
        try {
            const stats = await contractManager.getUserStats();
            console.log('用户统计:', stats);
            
            // 更新统计显示
            const completedLessons = document.getElementById('completedLessons');
            if (completedLessons) {
                completedLessons.textContent = stats.totalLessonsCompleted;
            }
            
            const studyStreak = document.getElementById('studyStreak');
            if (studyStreak) {
                studyStreak.textContent = stats.currentStreak;
            }
        } catch (error) {
            console.error('加载统计失败:', error);
        }
    }

    // ========== 课程学习功能 ==========

    async startLesson(lessonId) {
        if (!this.isWeb3Enabled) {
            showToast('请先连接钱包', 'warning');
            return false;
        }

        try {
            // 检查是否已完成
            const canClaim = await contractManager.canClaimLesson(lessonId);
            if (!canClaim) {
                showToast('你已经完成过这个课程了', 'info');
                return false;
            }

            // 调用合约开始学习
            showToast('正在记录学习开始...', 'info');
            await waitForTransaction(
                contractManager.startLesson(lessonId),
                '记录学习开始...'
            );

            // 记录本地学习会话
            this.learningSession = {
                lessonId,
                startTime: Date.now(),
                currentPage: 1
            };

            showToast('学习已开始，加油！', 'success');
            return true;
        } catch (error) {
            console.error('开始学习失败:', error);
            return false;
        }
    }

    async updateLearningProgress(lessonId, page) {
        if (!this.isWeb3Enabled || this.learningSession.lessonId !== lessonId) {
            return;
        }

        try {
            // 更新链上进度（可选，节省Gas可以只在完成时提交）
            // await contractManager.updateProgress(lessonId, page);
            
            // 更新本地记录
            this.learningSession.currentPage = page;
        } catch (error) {
            console.error('更新进度失败:', error);
        }
    }

    async completeLesson(lessonId) {
        if (!this.isWeb3Enabled) {
            showToast('请先连接钱包', 'warning');
            return false;
        }

        if (this.learningSession.lessonId !== lessonId) {
            showToast('请先开始学习', 'warning');
            return false;
        }

        try {
            // 计算学习时长
            const studyTime = Math.floor((Date.now() - this.learningSession.startTime) / 1000);
            
            // 获取课程配置
            const config = await contractManager.getLessonConfig(lessonId);
            
            if (studyTime < config.minTime) {
                showToast('学习时间太短，请认真学习', 'warning');
                return false;
            }

            // 更新所有页面进度
            for (let page = 1; page <= config.pages; page++) {
                await contractManager.updateProgress(lessonId, page);
            }

            // 完成课程并领取奖励
            showToast('正在提交学习证明...', 'info');
            const receipt = await waitForTransaction(
                contractManager.completeLesson(lessonId),
                '提交学习证明中...'
            );

            // 重置学习会话
            this.learningSession = {
                lessonId: null,
                startTime: null,
                currentPage: 1
            };

            // 刷新数据
            await this.updateFocusBalance();
            await this.loadUserCertificates();
            await this.loadUserStats();

            const reward = LESSON_CONFIG[lessonId].reward;
            showToast(`🎉 恭喜完成课程！获得 ${reward} FOCUS 代币和学习证书！`, 'success', 5000);
            
            return true;
        } catch (error) {
            console.error('完成课程失败:', error);
            return false;
        }
    }

    // ========== 番茄钟功能 ==========

    async completeFocusSession() {
        if (!this.isWeb3Enabled) {
            return false;
        }

        try {
            // 检查今日次数
            const todayCount = await contractManager.getTodayFocusCount();
            if (todayCount >= 10) {
                showToast('今日专注次数已达上限（10次）', 'warning');
                return false;
            }

            showToast('正在领取专注奖励...', 'info');
            await waitForTransaction(
                contractManager.completeFocusSession(),
                '领取专注奖励中...'
            );

            // 刷新余额
            await this.updateFocusBalance();

            showToast('🎉 专注奖励已到账！', 'success');
            return true;
        } catch (error) {
            console.error('领取专注奖励失败:', error);
            return false;
        }
    }

    // ========== 宠物功能 ==========

    async mintPet() {
        if (!this.isWeb3Enabled) {
            showToast('请先连接钱包', 'warning');
            return;
        }

        try {
            showToast('正在Mint宠物...', 'info');
            const tokenId = await waitForTransaction(
                contractManager.mintPet(),
                'Mint宠物中...'
            );

            if (tokenId !== null) {
                this.currentPetId = tokenId;
                await this.updatePetDisplay(tokenId);
                showToast(`🎉 恭喜获得宠物 #${tokenId}！`, 'success');
            }
        } catch (error) {
            console.error('Mint宠物失败:', error);
        }
    }

    async feedPet(foodType) {
        if (!this.isWeb3Enabled || this.currentPetId === null) {
            showToast('请先连接钱包并获取宠物', 'warning');
            return;
        }

        try {
            const foodName = FOOD_CONFIG[foodType].name;
            showToast(`正在喂食${foodName}...`, 'info');
            
            await waitForTransaction(
                contractManager.feedPet(this.currentPetId, foodType),
                `喂食${foodName}中...`
            );

            // 刷新数据
            await this.updateFocusBalance();
            await this.updatePetDisplay(this.currentPetId);

            showToast(`已喂食${foodName}！`, 'success');
        } catch (error) {
            console.error('喂食失败:', error);
        }
    }

    async playWithPet() {
        if (!this.isWeb3Enabled || this.currentPetId === null) {
            return;
        }

        try {
            await waitForTransaction(
                contractManager.playWithPet(this.currentPetId),
                '与宠物玩耍中...'
            );

            await this.updateFocusBalance();
            await this.updatePetDisplay(this.currentPetId);
            showToast('玩耍成功！', 'success');
        } catch (error) {
            console.error('玩耍失败:', error);
        }
    }

    async groomPet() {
        if (!this.isWeb3Enabled || this.currentPetId === null) {
            return;
        }

        try {
            await waitForTransaction(
                contractManager.groomPet(this.currentPetId),
                '梳毛中...'
            );

            await this.updateFocusBalance();
            await this.updatePetDisplay(this.currentPetId);
            showToast('梳毛成功！', 'success');
        } catch (error) {
            console.error('梳毛失败:', error);
        }
    }

    async healPet() {
        if (!this.isWeb3Enabled || this.currentPetId === null) {
            return;
        }

        try {
            await waitForTransaction(
                contractManager.healPet(this.currentPetId),
                '治疗中...'
            );

            await this.updateFocusBalance();
            await this.updatePetDisplay(this.currentPetId);
            showToast('治疗成功！', 'success');
        } catch (error) {
            console.error('治疗失败:', error);
        }
    }

    showWalletMenu() {
        // 简化版：直接复制地址
        const address = walletManager.address;
        navigator.clipboard.writeText(address);
        showToast('地址已复制', 'success', 2000);
    }

    onAccountChanged(newAddress) {
        this.updateWalletUI(newAddress);
        this.loadUserData();
    }

    checkNetwork() {
        walletManager.checkNetwork().then(isCorrect => {
            if (!isCorrect) {
                showToast(`请切换到 ${NETWORK_CONFIG.networkName}`, 'warning');
            }
        });
    }

    onWalletDisconnected() {
        this.isWeb3Enabled = false;
        localStorage.removeItem('walletConnected');
        
        document.getElementById('connectWalletBtn').style.display = 'block';
        document.getElementById('walletInfo').style.display = 'none';
        
        showToast('钱包已断开', 'info');
    }
}

// 初始化应用
const web3App = new Web3App();
web3App.initialize();

// 导出供其他模块使用
window.web3App = web3App;

