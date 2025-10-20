// Web3钱包连接管理模块

import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@6.10.0/+esm';
import { NETWORK_CONFIG } from './config.js';

class WalletManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.isConnected = false;
        this.chainId = null;
    }

    /**
     * 检测MetaMask是否安装
     */
    isMetaMaskInstalled() {
        return typeof window.ethereum !== 'undefined';
    }

    /**
     * 连接钱包
     */
    async connect() {
        if (!this.isMetaMaskInstalled()) {
            throw new Error('请先安装MetaMask钱包！');
        }

        try {
            // 请求账户访问
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });

            // 创建provider和signer
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.address = accounts[0];

            // 获取chainId
            const network = await this.provider.getNetwork();
            this.chainId = Number(network.chainId);

            this.isConnected = true;

            // 监听账户和网络变化
            this.setupEventListeners();

            console.log('钱包连接成功:', this.address);
            console.log('当前网络:', this.chainId);

            return {
                address: this.address,
                chainId: this.chainId
            };
        } catch (error) {
            console.error('连接钱包失败:', error);
            throw error;
        }
    }

    /**
     * 断开连接
     */
    disconnect() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.isConnected = false;
        this.chainId = null;

        console.log('钱包已断开');
    }

    /**
     * 切换网络
     */
    async switchNetwork(targetChainId) {
        if (!this.isMetaMaskInstalled()) {
            throw new Error('请先安装MetaMask');
        }

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${targetChainId.toString(16)}` }],
            });

            console.log('网络切换成功');
        } catch (error) {
            // 如果网络不存在，尝试添加
            if (error.code === 4902) {
                await this.addNetwork(targetChainId);
            } else {
                throw error;
            }
        }
    }

    /**
     * 添加网络配置
     */
    async addNetwork(chainId) {
        const networkConfigs = {
            84532: { // Base Sepolia
                chainId: '0x14a34',
                chainName: 'Base Sepolia',
                nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org']
            },
            11155111: { // Ethereum Sepolia
                chainId: '0xaa36a7',
                chainName: 'Sepolia',
                nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
            }
        };

        const config = networkConfigs[chainId];
        if (!config) {
            throw new Error('不支持的网络');
        }

        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [config],
        });
    }

    /**
     * 检查当前网络是否正确
     */
    async checkNetwork() {
        if (!this.isConnected) {
            return false;
        }

        const network = await this.provider.getNetwork();
        const currentChainId = Number(network.chainId);

        if (currentChainId !== NETWORK_CONFIG.chainId) {
            console.warn(`网络不匹配。当前: ${currentChainId}, 期望: ${NETWORK_CONFIG.chainId}`);
            return false;
        }

        return true;
    }

    /**
     * 获取ETH余额
     */
    async getBalance(address = this.address) {
        if (!this.provider) {
            throw new Error('钱包未连接');
        }

        const balance = await this.provider.getBalance(address);
        return ethers.formatEther(balance);
    }

    /**
     * 格式化地址（缩写显示）
     */
    formatAddress(address = this.address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        if (!window.ethereum) return;

        // 监听账户变化
        window.ethereum.on('accountsChanged', (accounts) => {
            console.log('账户已变化:', accounts);
            
            if (accounts.length === 0) {
                // 用户断开连接
                this.disconnect();
                window.dispatchEvent(new CustomEvent('walletDisconnected'));
            } else {
                // 账户切换
                this.address = accounts[0];
                window.dispatchEvent(new CustomEvent('accountChanged', { 
                    detail: { address: this.address } 
                }));
            }
        });

        // 监听网络变化
        window.ethereum.on('chainChanged', (chainId) => {
            console.log('网络已变化:', chainId);
            this.chainId = parseInt(chainId, 16);
            
            window.dispatchEvent(new CustomEvent('networkChanged', { 
                detail: { chainId: this.chainId } 
            }));
            
            // 网络变化后重新加载页面（推荐做法）
            window.location.reload();
        });
    }

    /**
     * 请求签名消息
     */
    async signMessage(message) {
        if (!this.signer) {
            throw new Error('钱包未连接');
        }

        return await this.signer.signMessage(message);
    }

    /**
     * 获取当前gas价格
     */
    async getGasPrice() {
        if (!this.provider) {
            throw new Error('钱包未连接');
        }

        const feeData = await this.provider.getFeeData();
        return {
            gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
            maxFeePerGas: ethers.formatUnits(feeData.maxFeePerGas, 'gwei'),
            maxPriorityFeePerGas: ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')
        };
    }
}

// 导出单例
export const walletManager = new WalletManager();


