// Web3工具函数

/**
 * 等待交易确认的加载提示
 */
export async function waitForTransaction(txPromise, message = '交易处理中...') {
    try {
        showToast(message, 'info', 0); // 0表示不自动关闭
        
        const tx = await txPromise;
        showToast('等待区块确认...', 'info', 0);
        
        const receipt = await tx.wait();
        
        hideLoadingToast();
        
        if (receipt.status === 1) {
            showToast('交易成功！', 'success');
            return receipt;
        } else {
            showToast('交易失败', 'error');
            return null;
        }
    } catch (error) {
        hideLoadingToast();
        handleTransactionError(error);
        throw error;
    }
}

/**
 * 处理交易错误
 */
export function handleTransactionError(error) {
    console.error('交易错误:', error);
    
    let message = '交易失败';
    
    if (error.code === 4001) {
        message = '用户拒绝了交易';
    } else if (error.code === -32603) {
        message = '内部错误，请检查Gas费用';
    } else if (error.message) {
        // 尝试提取revert原因
        const revertMatch = error.message.match(/reverted with reason string '(.+)'/);
        if (revertMatch) {
            message = revertMatch[1];
        } else if (error.message.includes('insufficient funds')) {
            message = '余额不足';
        } else if (error.message.includes('user rejected')) {
            message = '用户拒绝了交易';
        }
    }
    
    showToast(message, 'error');
}

/**
 * 显示Toast提示
 */
export function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notifications') || createNotificationContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${getToastIcon(type)}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast);
    
    // 添加显示动画
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 自动关闭
    if (duration > 0) {
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    } else {
        // 保存引用以便后续关闭
        toast.dataset.persistent = 'true';
    }
    
    return toast;
}

/**
 * 隐藏加载中的Toast
 */
export function hideLoadingToast() {
    const container = document.getElementById('notifications');
    if (container) {
        const persistentToasts = container.querySelectorAll('.toast[data-persistent="true"]');
        persistentToasts.forEach(toast => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
    }
}

/**
 * 创建通知容器
 */
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notifications';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}

/**
 * 获取Toast图标
 */
function getToastIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN');
}

/**
 * 格式化持续时间（秒）
 */
export function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
        return `${minutes}分${secs}秒`;
    } else {
        return `${secs}秒`;
    }
}

/**
 * 格式化代币数量
 */
export function formatTokenAmount(amount, decimals = 2) {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(decimals) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(decimals) + 'K';
    } else {
        return num.toFixed(decimals);
    }
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板', 'success', 2000);
        return true;
    } catch (error) {
        console.error('复制失败:', error);
        showToast('复制失败', 'error');
        return false;
    }
}

/**
 * 打开区块浏览器查看交易
 */
export function viewOnExplorer(txHash, chainId = 84532) {
    const explorers = {
        84532: `https://sepolia.basescan.org/tx/${txHash}`,
        11155111: `https://sepolia.etherscan.io/tx/${txHash}`
    };
    
    const url = explorers[chainId] || explorers[84532];
    window.open(url, '_blank');
}

/**
 * 打开区块浏览器查看地址
 */
export function viewAddressOnExplorer(address, chainId = 84532) {
    const explorers = {
        84532: `https://sepolia.basescan.org/address/${address}`,
        11155111: `https://sepolia.etherscan.io/address/${address}`
    };
    
    const url = explorers[chainId] || explorers[84532];
    window.open(url, '_blank');
}

/**
 * 防抖函数
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 检查是否为有效的以太坊地址
 */
export function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * 存储到本地
 */
export function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('保存到本地存储失败:', error);
        return false;
    }
}

/**
 * 从本地读取
 */
export function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('从本地存储读取失败:', error);
        return defaultValue;
    }
}

/**
 * 获取宠物状态颜色类
 */
export function getPetStatusClass(value) {
    if (value >= 70) return 'status-good';
    if (value >= 40) return 'status-medium';
    if (value >= 20) return 'status-low';
    return 'status-critical';
}

/**
 * 获取宠物状态表情
 */
export function getPetEmoji(pet) {
    if (!pet.isAlive) return '💀';
    if (pet.health < 20) return '🤒';
    if (pet.hunger < 30) return '😿';
    if (pet.happiness > 80) return '😺';
    return '😸';
}

/**
 * 课程配置
 */
export const LESSON_CONFIG = {
    1: { name: '什么是区块链？', reward: 10, emoji: '📦', color: '#4A90E2' },
    2: { name: '加密技术', reward: 15, emoji: '🔐', color: '#7B68EE' },
    3: { name: '去中心化网络', reward: 20, emoji: '🌐', color: '#50C878' },
    4: { name: '加密货币', reward: 25, emoji: '💰', color: '#FFB347' },
    5: { name: '智能合约', reward: 30, emoji: '📜', color: '#FF6B9D' },
    6: { name: 'DeFi应用', reward: 35, emoji: '📈', color: '#20B2AA' }
};

/**
 * 食物配置
 */
export const FOOD_CONFIG = {
    1: { name: '小鱼干', cost: 5, emoji: '🐟' },
    2: { name: '高级猫粮', cost: 15, emoji: '🍖' },
    3: { name: '豪华大餐', cost: 30, emoji: '👑' }
};


