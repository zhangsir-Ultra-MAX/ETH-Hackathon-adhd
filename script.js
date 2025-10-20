// ADHD专注力训练助手 - JavaScript功能实现

class ADHDFocusApp {
    constructor() {
        this.currentSection = 'timer';
        this.timer = null;
        this.tasks = JSON.parse(localStorage.getItem('adhd_tasks') || '[]');
        this.settings = JSON.parse(localStorage.getItem('adhd_settings') || '{}');
        this.progress = JSON.parse(localStorage.getItem('adhd_progress') || '{}');
        
        // 新增数据
        this.tokens = parseInt(localStorage.getItem('adhd_tokens') || '0');
        this.lessons = JSON.parse(localStorage.getItem('adhd_lessons') || '{}');
        this.pet = JSON.parse(localStorage.getItem('adhd_pet') || '{"name":"小咪","level":1,"hunger":100,"happiness":100,"health":100,"lastFed":null,"lastPlayed":null,"status":"healthy"}');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.updateUI();
        this.loadProgress();
        this.setupNotifications();
    }

    // 事件监听器设置
    setupEventListeners() {
        // 导航切换
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.switchSection(section);
            });
        });

        // 主题切换
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // 设置面板
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.toggleSettings();
        });

        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            this.toggleSettings();
        });

        // 番茄计时器
        this.setupTimerEvents();

        // 任务管理
        this.setupTaskEvents();

        // 游戏功能
        this.setupGameEvents();

        // 冥想功能
        this.setupMeditationEvents();

        // 区块链学习功能
        this.setupBlockchainEvents();

        // 虚拟宠物功能
        this.setupPetEvents();

        // 设置保存
        this.setupSettingsEvents();

        // 启动宠物状态更新
        this.startPetStatusUpdate();
    }

    // 番茄计时器功能
    setupTimerEvents() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');

        startBtn.addEventListener('click', () => this.startTimer());
        pauseBtn.addEventListener('click', () => this.pauseTimer());
        resetBtn.addEventListener('click', () => this.resetTimer());

        // 设置变化监听
        ['focusTime', 'breakTime', 'longBreakTime'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateTimerDisplay();
            });
        });
    }

    startTimer() {
        if (!this.timer) {
            const focusTime = parseInt(document.getElementById('focusTime').value) * 60;
            const breakTime = parseInt(document.getElementById('breakTime').value) * 60;
            const longBreakTime = parseInt(document.getElementById('longBreakTime').value) * 60;
            
            this.timer = new PomodoroTimer(focusTime, breakTime, longBreakTime, this);
        }

        this.timer.start();
        this.updateTimerButtons();
    }

    pauseTimer() {
        if (this.timer) {
            this.timer.pause();
            this.updateTimerButtons();
        }
    }

    resetTimer() {
        if (this.timer) {
            this.timer.reset();
            this.timer = null;
            this.updateTimerButtons();
            this.updateTimerDisplay();
        }
    }

    updateTimerButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (!this.timer) {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
        } else if (this.timer.isRunning) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            resetBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
        }
    }

    updateTimerDisplay() {
        const minutes = document.getElementById('timerMinutes');
        const seconds = document.getElementById('timerSeconds');
        const mode = document.getElementById('timerMode');
        
        if (this.timer) {
            const time = this.timer.getTimeRemaining();
            minutes.textContent = Math.floor(time / 60).toString().padStart(2, '0');
            seconds.textContent = (time % 60).toString().padStart(2, '0');
            mode.textContent = this.timer.getCurrentMode();
            
            // 更新进度圆环
            this.updateTimerProgress();
        } else {
            const focusTime = parseInt(document.getElementById('focusTime').value);
            minutes.textContent = focusTime.toString().padStart(2, '0');
            seconds.textContent = '00';
            mode.textContent = '专注时间';
        }
    }

    updateTimerProgress() {
        if (!this.timer) return;
        
        const progressCircle = document.querySelector('.timer-progress');
        const totalTime = this.timer.getTotalTime();
        const remainingTime = this.timer.getTimeRemaining();
        const progress = ((totalTime - remainingTime) / totalTime) * 100;
        
        const circumference = 2 * Math.PI * 90;
        const offset = circumference - (progress / 100) * circumference;
        
        progressCircle.style.strokeDashoffset = offset;
    }

    // 任务管理功能
    setupTaskEvents() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        const taskPriority = document.getElementById('taskPriority');
        const taskCategory = document.getElementById('taskCategory');

        addTaskBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // 过滤器
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterTasks(e.target.dataset.filter);
            });
        });
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const priority = document.getElementById('taskPriority').value;
        const category = document.getElementById('taskCategory').value;
        
        if (!input.value.trim()) {
            this.showNotification('请输入任务内容', 'warning');
            return;
        }

        const task = {
            id: Date.now(),
            title: input.value.trim(),
            priority: priority,
            category: category,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskStats();
        
        input.value = '';
        this.showNotification('任务添加成功', 'success');
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateTaskStats();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskStats();
        this.showNotification('任务已删除', 'info');
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        const currentFilter = document.querySelector('.filter-btn.active').dataset.filter;
        
        let filteredTasks = this.tasks;
        if (currentFilter === 'pending') {
            filteredTasks = this.tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = this.tasks.filter(t => t.completed);
        } else if (currentFilter === 'high') {
            filteredTasks = this.tasks.filter(t => t.priority === 'high');
        }

        taskList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.priority}-priority ${task.completed ? 'completed' : ''}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="app.toggleTask(${task.id})">
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        ${this.getPriorityText(task.priority)} • ${this.getCategoryText(task.category)} • 
                        ${new Date(task.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn" onclick="app.deleteTask(${task.id})" title="删除任务">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterTasks(filter) {
        this.renderTasks();
    }

    updateTaskStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('completionRate').textContent = completionRate + '%';
    }

    getPriorityText(priority) {
        const priorities = {
            'low': '低优先级',
            'medium': '中优先级',
            'high': '高优先级'
        };
        return priorities[priority] || '未知';
    }

    getCategoryText(category) {
        const categories = {
            'work': '工作',
            'study': '学习',
            'personal': '个人',
            'health': '健康'
        };
        return categories[category] || '其他';
    }

    // 游戏功能
    setupGameEvents() {
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameType = e.target.closest('.game-card').dataset.game;
                this.startGame(gameType);
            });
        });

        document.getElementById('closeGameBtn').addEventListener('click', () => {
            this.closeGame();
        });
    }

    startGame(gameType) {
        const gameArea = document.getElementById('gameArea');
        const gameTitle = document.getElementById('gameTitle');
        const gameContent = document.getElementById('gameContent');

        const gameTitles = {
            'breathing': '呼吸练习',
            'focus': '专注点训练',
            'memory': '记忆训练',
            'reaction': '反应训练'
        };

        gameTitle.textContent = gameTitles[gameType];
        gameContent.innerHTML = this.getGameContent(gameType);
        gameArea.style.display = 'block';

        // 启动游戏
        this.initGame(gameType);
    }

    getGameContent(gameType) {
        const gameContents = {
            'breathing': `
                <div class="breathing-game">
                    <div class="breathing-circle" id="breathingCircle">
                        <div class="breathing-center"></div>
                    </div>
                    <div class="breathing-instructions">
                        <h3>跟随圆圈呼吸</h3>
                        <p>圆圈放大时吸气，缩小时呼气</p>
                        <div class="breathing-timer">00:00</div>
                    </div>
                </div>
            `,
            'focus': `
                <div class="focus-game">
                    <div class="focus-target" id="focusTarget"></div>
                    <div class="focus-score">
                        <div>得分: <span id="focusScore">0</span></div>
                        <div>时间: <span id="focusTime">30</span>s</div>
                    </div>
                </div>
            `,
            'memory': `
                <div class="memory-game">
                    <div class="memory-grid" id="memoryGrid"></div>
                    <div class="memory-controls">
                        <button id="startMemoryGame">开始游戏</button>
                        <div class="memory-score">得分: <span id="memoryScore">0</span></div>
                    </div>
                </div>
            `,
            'reaction': `
                <div class="reaction-game">
                    <div class="reaction-area" id="reactionArea">
                        <div class="reaction-target" id="reactionTarget"></div>
                    </div>
                    <div class="reaction-stats">
                        <div>反应时间: <span id="reactionTime">0</span>ms</div>
                        <div>平均反应: <span id="avgReaction">0</span>ms</div>
                    </div>
                </div>
            `
        };
        return gameContents[gameType] || '<p>游戏内容加载中...</p>';
    }

    initGame(gameType) {
        switch (gameType) {
            case 'breathing':
                this.initBreathingGame();
                break;
            case 'focus':
                this.initFocusGame();
                break;
            case 'memory':
                this.initMemoryGame();
                break;
            case 'reaction':
                this.initReactionGame();
                break;
        }
    }

    initBreathingGame() {
        const circle = document.getElementById('breathingCircle');
        const timer = document.querySelector('.breathing-timer');
        let timeLeft = 300; // 5分钟
        let isRunning = true;

        const breathingAnimation = () => {
            if (isRunning) {
                circle.style.animation = 'breathe 4s ease-in-out infinite';
            } else {
                circle.style.animation = 'none';
            }
        };

        const countdown = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                this.showNotification('呼吸练习完成！', 'success');
                this.recordGameProgress('breathing', 5);
            }
        }, 1000);

        breathingAnimation();
    }

    initFocusGame() {
        const target = document.getElementById('focusTarget');
        const scoreElement = document.getElementById('focusScore');
        const timeElement = document.getElementById('focusTime');
        let score = 0;
        let timeLeft = 30;

        const moveTarget = () => {
            const x = Math.random() * (400 - 50);
            const y = Math.random() * (300 - 50);
            target.style.left = x + 'px';
            target.style.top = y + 'px';
        };

        target.addEventListener('click', () => {
            score++;
            scoreElement.textContent = score;
            moveTarget();
        });

        const gameTimer = setInterval(() => {
            timeLeft--;
            timeElement.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(gameTimer);
                this.showNotification(`专注训练完成！得分: ${score}`, 'success');
                this.recordGameProgress('focus', score);
            }
        }, 1000);

        moveTarget();
    }

    initMemoryGame() {
        const grid = document.getElementById('memoryGrid');
        const startBtn = document.getElementById('startMemoryGame');
        const scoreElement = document.getElementById('memoryScore');
        let sequence = [];
        let userSequence = [];
        let score = 0;

        startBtn.addEventListener('click', () => {
            this.startMemorySequence();
        });
    }

    startMemorySequence() {
        // 记忆游戏逻辑实现
        this.showNotification('记忆游戏开始！', 'info');
    }

    initReactionGame() {
        const area = document.getElementById('reactionArea');
        const target = document.getElementById('reactionTarget');
        const timeElement = document.getElementById('reactionTime');
        const avgElement = document.getElementById('avgReaction');
        let reactionTimes = [];
        let startTime = 0;

        const showTarget = () => {
            const delay = Math.random() * 3000 + 1000; // 1-4秒随机延迟
            setTimeout(() => {
                target.style.display = 'block';
                startTime = Date.now();
            }, delay);
        };

        target.addEventListener('click', () => {
            const reactionTime = Date.now() - startTime;
            reactionTimes.push(reactionTime);
            timeElement.textContent = reactionTime;
            
            const avg = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
            avgElement.textContent = Math.round(avg);
            
            target.style.display = 'none';
            showTarget();
        });

        showTarget();
    }

    closeGame() {
        document.getElementById('gameArea').style.display = 'none';
    }

    recordGameProgress(gameType, score) {
        if (!this.progress.games) this.progress.games = {};
        if (!this.progress.games[gameType]) this.progress.games[gameType] = [];
        
        this.progress.games[gameType].push({
            score: score,
            date: new Date().toISOString()
        });
        
        this.saveProgress();
    }

    // 冥想功能
    setupMeditationEvents() {
        document.querySelectorAll('.start-meditation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.closest('.meditation-card').dataset.type;
                this.startMeditation(type);
            });
        });

        document.getElementById('closeMeditationBtn').addEventListener('click', () => {
            this.closeMeditation();
        });
    }

    startMeditation(type) {
        const player = document.getElementById('meditationPlayer');
        const title = document.getElementById('meditationTitle');
        
        const titles = {
            'mindfulness': '正念冥想',
            'breathing': '呼吸冥想',
            'body-scan': '身体扫描'
        };
        
        title.textContent = titles[type];
        player.style.display = 'block';
        
        this.initMeditation(type);
    }

    initMeditation(type) {
        // 冥想功能实现
        this.showNotification('冥想练习开始', 'info');
    }

    closeMeditation() {
        document.getElementById('meditationPlayer').style.display = 'none';
    }

    // 设置功能
    setupSettingsEvents() {
        // 主题设置
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        // 通知设置
        ['timerNotifications', 'taskReminders', 'breakReminders'].forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                this.settings[id] = e.target.checked;
                this.saveSettings();
            });
        });

        // 声音设置
        ['timerSounds', 'backgroundMusic'].forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                this.settings[id] = e.target.checked;
                this.saveSettings();
            });
        });

        // 无障碍设置
        ['highContrast', 'largeText', 'screenReader'].forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                this.settings[id] = e.target.checked;
                this.saveSettings();
                this.applyAccessibilitySettings();
            });
        });
    }

    // 界面切换
    switchSection(section) {
        // 隐藏所有section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        // 显示目标section
        document.getElementById(section).classList.add('active');
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        this.currentSection = section;
        
        // 加载对应数据
        if (section === 'tasks') {
            this.renderTasks();
            this.updateTaskStats();
        } else if (section === 'progress') {
            this.loadProgress();
            this.renderCharts();
        }
    }

    // 主题切换
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.settings.theme = theme;
        this.saveSettings();
        
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    toggleSettings() {
        const panel = document.getElementById('settingsPanel');
        panel.classList.toggle('active');
    }

    applyAccessibilitySettings() {
        const body = document.body;
        
        if (this.settings.highContrast) {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }
        
        if (this.settings.largeText) {
            body.classList.add('large-text');
        } else {
            body.classList.remove('large-text');
        }
    }

    // 通知系统
    setupNotifications() {
        this.notificationContainer = document.getElementById('notifications');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // 数据持久化
    saveTasks() {
        localStorage.setItem('adhd_tasks', JSON.stringify(this.tasks));
    }

    saveSettings() {
        localStorage.setItem('adhd_settings', JSON.stringify(this.settings));
    }

    saveProgress() {
        localStorage.setItem('adhd_progress', JSON.stringify(this.progress));
    }

    loadSettings() {
        const theme = this.settings.theme || 'light';
        this.setTheme(theme);
        
        // 应用其他设置
        Object.keys(this.settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else {
                    element.value = this.settings[key];
                }
            }
        });
    }

    loadProgress() {
        // 更新进度统计
        this.updateProgressStats();
    }

    updateProgressStats() {
        // 更新今日专注时间
        const todayFocusTime = this.progress.todayFocusTime || 0;
        document.getElementById('todayFocusTime').textContent = todayFocusTime + '分钟';
        
        // 更新连续天数
        const currentStreak = this.progress.currentStreak || 0;
        document.getElementById('currentStreakOverview').textContent = currentStreak + '天';
        
        // 更新完成任务数
        const completedTasks = this.tasks.filter(t => t.completed).length;
        document.getElementById('completedTasksOverview').textContent = completedTasks + '个';
        
        // 更新专注力评分
        const focusScore = this.calculateFocusScore();
        document.getElementById('focusScore').textContent = focusScore + '分';
    }

    calculateFocusScore() {
        // 基于多个因素计算专注力评分
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalTasks = this.tasks.length;
        const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 40 : 0;
        
        const gameScore = this.progress.games ? Object.keys(this.progress.games).length * 10 : 0;
        const meditationScore = this.progress.meditation ? this.progress.meditation.length * 5 : 0;
        
        return Math.min(100, Math.round(taskScore + gameScore + meditationScore));
    }

    renderCharts() {
        // 使用Chart.js渲染图表
        this.renderFocusTimeChart();
        this.renderTaskCompletionChart();
        this.renderGameProgressChart();
        this.renderMeditationChart();
    }

    renderFocusTimeChart() {
        const ctx = document.getElementById('focusTimeChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [{
                    label: '专注时间(分钟)',
                    data: [25, 30, 20, 35, 40, 15, 30],
                    borderColor: '#4A90E2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderTaskCompletionChart() {
        const ctx = document.getElementById('taskCompletionChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['已完成', '待完成'],
                datasets: [{
                    data: [
                        this.tasks.filter(t => t.completed).length,
                        this.tasks.filter(t => !t.completed).length
                    ],
                    backgroundColor: ['#50C878', '#FFC107']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderGameProgressChart() {
        const ctx = document.getElementById('gameProgressChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['呼吸练习', '专注训练', '记忆训练', '反应训练'],
                datasets: [{
                    label: '游戏次数',
                    data: [5, 8, 3, 6],
                    backgroundColor: '#4A90E2'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderMeditationChart() {
        const ctx = document.getElementById('meditationChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                datasets: [{
                    label: '冥想次数',
                    data: [8, 12, 6, 15, 10, 18],
                    borderColor: '#50C878',
                    backgroundColor: 'rgba(80, 200, 120, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateUI() {
        // 更新界面元素
        this.updateTimerDisplay();
        this.updateTimerButtons();
        this.renderTasks();
        this.updateTaskStats();
        this.updateProgressStats();
        this.updateTokenDisplay();
        this.updatePetDisplay();
        this.renderPetLog();
    }

    // 区块链学习功能
    setupBlockchainEvents() {
        // 课程开始按钮
        document.querySelectorAll('.start-lesson-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lessonId = e.target.dataset.lesson;
                this.startLesson(lessonId);
            });
        });

        // 关闭课程按钮
        document.getElementById('closeLessonBtn').addEventListener('click', () => {
            this.closeLesson();
        });

        // 课程导航按钮
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.prevLessonPage();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextLessonPage();
        });
    }

    startLesson(lessonId) {
        const lessonData = this.getLessonData(lessonId);
        if (!lessonData) return;

        const interface = document.getElementById('learningInterface');
        const title = document.getElementById('lessonTitle');
        const content = document.getElementById('lessonContent');

        title.textContent = lessonData.title;
        content.innerHTML = lessonData.pages[0];
        
        this.currentLesson = {
            id: lessonId,
            data: lessonData,
            currentPage: 0,
            startTime: Date.now()
        };

        this.updateLessonNavigation();
        interface.style.display = 'block';
    }

    closeLesson() {
        document.getElementById('learningInterface').style.display = 'none';
        if (this.currentLesson) {
            const timeSpent = Math.floor((Date.now() - this.currentLesson.startTime) / 1000);
            if (timeSpent >= 60) { // 至少学习1分钟
                this.completeLesson(this.currentLesson.id);
            }
            this.currentLesson = null;
        }
    }

    prevLessonPage() {
        if (this.currentLesson && this.currentLesson.currentPage > 0) {
            this.currentLesson.currentPage--;
            this.updateLessonContent();
            this.updateLessonNavigation();
        }
    }

    nextLessonPage() {
        if (this.currentLesson && this.currentLesson.currentPage < this.currentLesson.data.pages.length - 1) {
            this.currentLesson.currentPage++;
            this.updateLessonContent();
            this.updateLessonNavigation();
        } else if (this.currentLesson && this.currentLesson.currentPage === this.currentLesson.data.pages.length - 1) {
            // 最后一页，完成课程
            this.completeLesson(this.currentLesson.id);
            this.closeLesson();
        }
    }

    updateLessonContent() {
        const content = document.getElementById('lessonContent');
        content.innerHTML = this.currentLesson.data.pages[this.currentLesson.currentPage];
    }

    updateLessonNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const currentPage = document.getElementById('currentPage');
        const totalPages = document.getElementById('totalPages');

        prevBtn.disabled = this.currentLesson.currentPage === 0;
        nextBtn.textContent = this.currentLesson.currentPage === this.currentLesson.data.pages.length - 1 ? '完成课程' : '下一页';
        
        currentPage.textContent = this.currentLesson.currentPage + 1;
        totalPages.textContent = this.currentLesson.data.pages.length;
    }

    completeLesson(lessonId) {
        if (this.lessons[lessonId]) return; // 已经完成过

        const lessonData = this.getLessonData(lessonId);
        this.lessons[lessonId] = {
            completed: true,
            completedAt: new Date().toISOString(),
            tokensEarned: lessonData.tokens
        };

        this.tokens += lessonData.tokens;
        this.saveData();
        this.updateTokenDisplay();
        this.updateLearningProgress();
        this.renderLessons();
        
        this.showNotification(`课程完成！获得 ${lessonData.tokens} 代币`, 'success');
    }

    getLessonData(lessonId) {
        const lessons = {
            '1': {
                title: '什么是区块链？',
                tokens: 10,
                pages: [
                    `<h3>区块链的基本概念</h3>
                    <p>区块链是一种分布式账本技术，它通过密码学方法将数据块按时间顺序链接在一起，形成一个不可篡改的数据链。</p>
                    <h3>核心特点</h3>
                    <ul>
                        <li><strong>去中心化</strong>：没有中央权威机构控制</li>
                        <li><strong>不可篡改</strong>：一旦记录，难以修改</li>
                        <li><strong>透明性</strong>：所有交易公开可查</li>
                        <li><strong>安全性</strong>：通过密码学保证安全</li>
                    </ul>`,
                    `<h3>区块链的工作原理</h3>
                    <p>区块链由多个区块组成，每个区块包含：</p>
                    <ul>
                        <li><strong>区块头</strong>：包含前一个区块的哈希值</li>
                        <li><strong>交易数据</strong>：记录的交易信息</li>
                        <li><strong>时间戳</strong>：区块创建的时间</li>
                    </ul>
                    <h3>哈希函数</h3>
                    <p>哈希函数将任意长度的数据转换为固定长度的字符串，具有以下特点：</p>
                    <ul>
                        <li>单向性：难以从哈希值反推原始数据</li>
                        <li>确定性：相同输入总是产生相同输出</li>
                        <li>雪崩效应：微小变化导致完全不同的哈希值</li>
                    </ul>`
                ]
            },
            '2': {
                title: '加密技术',
                tokens: 15,
                pages: [
                    `<h3>哈希函数</h3>
                    <p>哈希函数是区块链安全的基础，它将任意长度的数据转换为固定长度的字符串。</p>
                    <h3>SHA-256算法</h3>
                    <p>比特币使用SHA-256算法，具有以下特点：</p>
                    <ul>
                        <li>输出长度：256位（32字节）</li>
                        <li>计算速度：相对较快</li>
                        <li>安全性：目前被认为是安全的</li>
                    </ul>`,
                    `<h3>数字签名</h3>
                    <p>数字签名用于验证交易的真实性和完整性。</p>
                    <h3>数字签名过程</h3>
                    <ol>
                        <li>使用私钥对交易数据进行签名</li>
                        <li>将签名附加到交易中</li>
                        <li>其他节点使用公钥验证签名</li>
                    </ol>
                    <h3>公钥和私钥</h3>
                    <p>非对称加密使用一对密钥：</p>
                    <ul>
                        <li><strong>私钥</strong>：用于签名，必须保密</li>
                        <li><strong>公钥</strong>：用于验证，可以公开</li>
                    </ul>`
                ]
            },
            '3': {
                title: '去中心化网络',
                tokens: 20,
                pages: [
                    `<h3>P2P网络</h3>
                    <p>区块链使用点对点（P2P）网络架构，所有节点地位平等。</p>
                    <h3>P2P网络特点</h3>
                    <ul>
                        <li><strong>去中心化</strong>：没有中央服务器</li>
                        <li><strong>容错性</strong>：部分节点故障不影响整体</li>
                        <li><strong>扩展性</strong>：容易添加新节点</li>
                    </ul>`,
                    `<h3>共识机制</h3>
                    <p>共识机制确保网络中的节点就交易的有效性达成一致。</p>
                    <h3>工作量证明（PoW）</h3>
                    <p>比特币使用的共识机制：</p>
                    <ul>
                        <li>矿工通过计算哈希值竞争记账权</li>
                        <li>需要大量计算资源</li>
                        <li>安全性高但能耗大</li>
                    </ul>
                    <h3>权益证明（PoS）</h3>
                    <p>以太坊2.0使用的共识机制：</p>
                    <ul>
                        <li>根据持币量选择验证者</li>
                        <li>能耗较低</li>
                        <li>可能存在中心化风险</li>
                    </ul>`
                ]
            },
            '4': {
                title: '加密货币',
                tokens: 25,
                pages: [
                    `<h3>比特币</h3>
                    <p>比特币是第一个成功的加密货币，由中本聪在2009年创建。</p>
                    <h3>比特币特点</h3>
                    <ul>
                        <li><strong>总量固定</strong>：2100万枚</li>
                        <li><strong>去中心化</strong>：无中央机构控制</li>
                        <li><strong>匿名性</strong>：交易地址不直接关联身份</li>
                        <li><strong>全球流通</strong>：24/7交易</li>
                    </ul>`,
                    `<h3>以太坊</h3>
                    <p>以太坊是一个支持智能合约的区块链平台。</p>
                    <h3>以太坊特点</h3>
                    <ul>
                        <li><strong>智能合约</strong>：可编程的合约</li>
                        <li><strong>DApp平台</strong>：支持去中心化应用</li>
                        <li><strong>Gas费用</strong>：执行操作需要支付费用</li>
                        <li><strong>EVM</strong>：以太坊虚拟机</li>
                    </ul>
                    <h3>其他主流加密货币</h3>
                    <ul>
                        <li><strong>莱特币</strong>：比特币的轻量版</li>
                        <li><strong>瑞波币</strong>：专注于跨境支付</li>
                        <li><strong>币安币</strong>：币安交易所代币</li>
                    </ul>`
                ]
            },
            '5': {
                title: '智能合约',
                tokens: 30,
                pages: [
                    `<h3>智能合约概念</h3>
                    <p>智能合约是运行在区块链上的自动执行程序，当预设条件满足时自动执行。</p>
                    <h3>智能合约特点</h3>
                    <ul>
                        <li><strong>自动执行</strong>：无需人工干预</li>
                        <li><strong>透明性</strong>：代码公开可查</li>
                        <li><strong>不可篡改</strong>：部署后无法修改</li>
                        <li><strong>去中心化</strong>：在区块链上运行</li>
                    </ul>`,
                    `<h3>智能合约应用</h3>
                    <p>智能合约在各个领域都有应用：</p>
                    <ul>
                        <li><strong>DeFi</strong>：去中心化金融</li>
                        <li><strong>NFT</strong>：非同质化代币</li>
                        <li><strong>DAO</strong>：去中心化自治组织</li>
                        <li><strong>供应链</strong>：商品溯源</li>
                    </ul>
                    <h3>Solidity语言</h3>
                    <p>以太坊智能合约主要使用Solidity语言编写：</p>
                    <ul>
                        <li>类似JavaScript的语法</li>
                        <li>静态类型语言</li>
                        <li>支持继承和库</li>
                        <li>内置安全特性</li>
                    </ul>`
                ]
            },
            '6': {
                title: 'DeFi应用',
                tokens: 35,
                pages: [
                    `<h3>DeFi概述</h3>
                    <p>DeFi（去中心化金融）是基于区块链的金融服务，无需传统金融机构。</p>
                    <h3>DeFi核心组件</h3>
                    <ul>
                        <li><strong>DEX</strong>：去中心化交易所</li>
                        <li><strong>借贷协议</strong>：如Compound、Aave</li>
                        <li><strong>稳定币</strong>：如USDT、USDC、DAI</li>
                        <li><strong>流动性挖矿</strong>：提供流动性获得奖励</li>
                    </ul>`,
                    `<h3>DeFi优势</h3>
                    <ul>
                        <li><strong>无许可</strong>：任何人都可以参与</li>
                        <li><strong>透明性</strong>：所有操作公开可查</li>
                        <li><strong>可组合性</strong>：不同协议可以组合使用</li>
                        <li><strong>全球化</strong>：无地域限制</li>
                    </ul>
                    <h3>DeFi风险</h3>
                    <ul>
                        <li><strong>智能合约风险</strong>：代码漏洞</li>
                        <li><strong>流动性风险</strong>：资金不足</li>
                        <li><strong>监管风险</strong>：政策变化</li>
                        <li><strong>技术风险</strong>：网络拥堵</li>
                    </ul>`
                ]
            }
        };
        return lessons[lessonId];
    }

    updateLearningProgress() {
        const completedLessons = Object.keys(this.lessons).length;
        const totalTokensEarned = Object.values(this.lessons).reduce((sum, lesson) => sum + lesson.tokensEarned, 0);
        const progress = (completedLessons / 6) * 100;

        document.getElementById('completedLessons').textContent = completedLessons;
        document.getElementById('totalTokensEarned').textContent = totalTokensEarned;
        document.getElementById('learningProgressFill').style.width = progress + '%';
        document.getElementById('learningProgressText').textContent = Math.round(progress) + '%';
    }

    renderLessons() {
        document.querySelectorAll('.lesson-card').forEach(card => {
            const lessonId = card.dataset.lesson;
            if (this.lessons[lessonId]) {
                card.classList.add('completed');
                const btn = card.querySelector('.start-lesson-btn');
                btn.textContent = '已完成';
                btn.disabled = true;
            }
        });
    }

    updateTokenDisplay() {
        document.getElementById('tokenAmount').textContent = this.tokens;
    }

    // 虚拟宠物功能
    setupPetEvents() {
        // 喂养按钮
        document.querySelectorAll('.feed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const foodType = e.target.dataset.food;
                this.feedPet(foodType);
            });
        });

        // 互动按钮
        document.querySelectorAll('.interact-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.interactWithPet(action);
            });
        });
    }

    feedPet(foodType) {
        const foodCosts = {
            'basic': 5,
            'premium': 15,
            'luxury': 30
        };

        const foodEffects = {
            'basic': { hunger: 20, happiness: 5 },
            'premium': { hunger: 40, happiness: 15, health: 10 },
            'luxury': { hunger: 60, happiness: 30, health: 20 }
        };

        const cost = foodCosts[foodType];
        if (this.tokens < cost) {
            this.showNotification('代币不足！', 'warning');
            return;
        }

        this.tokens -= cost;
        const effect = foodEffects[foodType];
        
        this.pet.hunger = Math.min(100, this.pet.hunger + effect.hunger);
        this.pet.happiness = Math.min(100, this.pet.happiness + (effect.happiness || 0));
        this.pet.health = Math.min(100, this.pet.health + (effect.health || 0));
        this.pet.lastFed = Date.now();

        this.saveData();
        this.updateTokenDisplay();
        this.updatePetDisplay();
        this.addPetLog('feed', `喂食了${this.getFoodName(foodType)}，消耗${cost}代币`);
        
        this.showNotification(`宠物很开心！消耗${cost}代币`, 'success');
    }

    interactWithPet(action) {
        const actionCosts = {
            'play': 10,
            'groom': 8,
            'medicine': 20
        };

        const actionEffects = {
            'play': { happiness: 25, hunger: -5 },
            'groom': { health: 15, happiness: 10 },
            'medicine': { health: 40, happiness: 5 }
        };

        const cost = actionCosts[action];
        if (this.tokens < cost) {
            this.showNotification('代币不足！', 'warning');
            return;
        }

        this.tokens -= cost;
        const effect = actionEffects[action];
        
        this.pet.happiness = Math.min(100, this.pet.happiness + (effect.happiness || 0));
        this.pet.hunger = Math.max(0, this.pet.hunger + (effect.hunger || 0));
        this.pet.health = Math.min(100, this.pet.health + (effect.health || 0));
        this.pet.lastPlayed = Date.now();

        this.saveData();
        this.updateTokenDisplay();
        this.updatePetDisplay();
        this.addPetLog('play', `进行了${this.getActionName(action)}，消耗${cost}代币`);
        
        this.showNotification(`互动成功！消耗${cost}代币`, 'success');
    }

    getFoodName(foodType) {
        const names = {
            'basic': '小鱼干',
            'premium': '高级猫粮',
            'luxury': '豪华大餐'
        };
        return names[foodType];
    }

    getActionName(action) {
        const names = {
            'play': '玩耍',
            'groom': '梳毛',
            'medicine': '治疗'
        };
        return names[action];
    }

    updatePetDisplay() {
        // 更新宠物头像状态
        const avatar = document.getElementById('petAvatar');
        avatar.className = 'pet-avatar';
        
        if (this.pet.hunger < 30) {
            avatar.classList.add('hungry');
        }
        if (this.pet.health < 20) {
            avatar.classList.add('sick');
        }

        // 更新宠物信息
        document.getElementById('petName').textContent = this.pet.name;
        document.getElementById('petLevel').textContent = this.pet.level;

        // 更新状态条
        document.getElementById('hungerBar').style.width = this.pet.hunger + '%';
        document.getElementById('happinessBar').style.width = this.pet.happiness + '%';
        document.getElementById('healthBar').style.width = this.pet.health + '%';

        document.getElementById('hungerValue').textContent = this.pet.hunger + '%';
        document.getElementById('happinessValue').textContent = this.pet.happiness + '%';
        document.getElementById('healthValue').textContent = this.pet.health + '%';

        // 更新按钮状态
        this.updatePetButtons();
    }

    updatePetButtons() {
        document.querySelectorAll('.feed-btn, .interact-btn').forEach(btn => {
            const cost = parseInt(btn.closest('[data-cost]').dataset.cost);
            btn.disabled = this.tokens < cost;
        });
    }

    startPetStatusUpdate() {
        // 每分钟更新一次宠物状态
        setInterval(() => {
            this.updatePetStatus();
        }, 60000);

        // 立即更新一次
        this.updatePetStatus();
    }

    updatePetStatus() {
        const now = Date.now();
        const timeSinceLastFed = this.pet.lastFed ? now - this.pet.lastFed : Infinity;
        const timeSinceLastPlayed = this.pet.lastPlayed ? now - this.pet.lastPlayed : Infinity;

        // 饥饿度下降
        if (timeSinceLastFed > 30 * 60 * 1000) { // 30分钟
            this.pet.hunger = Math.max(0, this.pet.hunger - 5);
        }

        // 快乐度下降
        if (timeSinceLastPlayed > 60 * 60 * 1000) { // 1小时
            this.pet.happiness = Math.max(0, this.pet.happiness - 3);
        }

        // 健康度下降
        if (this.pet.hunger < 20) {
            this.pet.health = Math.max(0, this.pet.health - 2);
        }
        if (this.pet.happiness < 20) {
            this.pet.health = Math.max(0, this.pet.health - 1);
        }

        // 检查宠物状态
        if (this.pet.health <= 0) {
            this.pet.status = 'dead';
            this.addPetLog('error', '宠物因为缺乏照顾而死亡...');
            this.showNotification('宠物死亡了！请重新开始', 'error');
        } else if (this.pet.hunger < 30) {
            this.pet.status = 'hungry';
            this.addPetLog('warning', '宠物饿了，需要喂食');
        } else if (this.pet.happiness < 30) {
            this.pet.status = 'sad';
            this.addPetLog('warning', '宠物不开心，需要陪伴');
        } else {
            this.pet.status = 'healthy';
        }

        // 升级检查
        this.checkPetLevelUp();

        this.saveData();
        this.updatePetDisplay();
    }

    checkPetLevelUp() {
        const totalStats = this.pet.hunger + this.pet.happiness + this.pet.health;
        const requiredStats = this.pet.level * 250; // 每级需要更多总属性

        if (totalStats >= requiredStats && this.pet.status === 'healthy') {
            this.pet.level++;
            this.pet.hunger = Math.min(100, this.pet.hunger + 20);
            this.pet.happiness = Math.min(100, this.pet.happiness + 20);
            this.pet.health = Math.min(100, this.pet.health + 20);
            
            this.addPetLog('play', `宠物升级到${this.pet.level}级！`);
            this.showNotification(`宠物升级到${this.pet.level}级！`, 'success');
        }
    }

    addPetLog(type, message) {
        const logContainer = document.getElementById('petLog');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        
        const time = new Date().toLocaleTimeString();
        logEntry.innerHTML = `<span class="log-time">${time}</span>${message}`;
        
        logContainer.insertBefore(logEntry, logContainer.firstChild);
        
        // 限制日志数量
        while (logContainer.children.length > 20) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }

    renderPetLog() {
        const logContainer = document.getElementById('petLog');
        logContainer.innerHTML = '';
        
        // 添加一些初始日志
        this.addPetLog('play', '欢迎来到虚拟宠物世界！');
        this.addPetLog('feed', '宠物需要你的照顾，学习获得代币来喂养它吧！');
    }

    // 数据持久化更新
    saveData() {
        localStorage.setItem('adhd_tokens', this.tokens.toString());
        localStorage.setItem('adhd_lessons', JSON.stringify(this.lessons));
        localStorage.setItem('adhd_pet', JSON.stringify(this.pet));
    }
}

// 番茄计时器类
class PomodoroTimer {
    constructor(focusTime, breakTime, longBreakTime, app) {
        this.focusTime = focusTime;
        this.breakTime = breakTime;
        this.longBreakTime = longBreakTime;
        this.app = app;
        this.currentTime = focusTime;
        this.isRunning = false;
        this.isPaused = false;
        this.mode = 'focus'; // focus, break, longBreak
        this.interval = null;
        this.completedPomodoros = 0;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.interval = setInterval(() => {
                this.tick();
            }, 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            clearInterval(this.interval);
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.interval);
        this.currentTime = this.focusTime;
        this.mode = 'focus';
        this.app.updateTimerDisplay();
    }

    tick() {
        this.currentTime--;
        this.app.updateTimerDisplay();
        
        if (this.currentTime <= 0) {
            this.completeSession();
        }
    }

    completeSession() {
        clearInterval(this.interval);
        this.isRunning = false;
        
        if (this.mode === 'focus') {
            this.completedPomodoros++;
            this.app.showNotification('专注时间结束！该休息了', 'success');
            
            // 每4个番茄后长休息
            if (this.completedPomodoros % 4 === 0) {
                this.mode = 'longBreak';
                this.currentTime = this.longBreakTime;
            } else {
                this.mode = 'break';
                this.currentTime = this.breakTime;
            }
        } else {
            this.app.showNotification('休息时间结束！继续专注工作', 'info');
            this.mode = 'focus';
            this.currentTime = this.focusTime;
        }
        
        this.app.updateTimerDisplay();
        this.app.updateTimerButtons();
        
        // 播放通知音效
        this.playNotificationSound();
    }

    playNotificationSound() {
        if (this.app.settings.timerSounds) {
            // 创建音频上下文播放提示音
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    }

    getTimeRemaining() {
        return this.currentTime;
    }

    getTotalTime() {
        switch (this.mode) {
            case 'focus': return this.focusTime;
            case 'break': return this.breakTime;
            case 'longBreak': return this.longBreakTime;
            default: return this.focusTime;
        }
    }

    getCurrentMode() {
        const modes = {
            'focus': '专注时间',
            'break': '短休息',
            'longBreak': '长休息'
        };
        return modes[this.mode] || '专注时间';
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ADHDFocusApp();
});

// 导出到全局作用域
window.app = app;
