// 合约配置文件（临时）
// 部署后将自动生成

export const CONTRACTS = {
  FocusToken: "0x0000000000000000000000000000000000000000", // 部署后更新
  LearningProof: "0x0000000000000000000000000000000000000000", // 部署后更新
  ADHDPet: "0x0000000000000000000000000000000000000000", // 部署后更新
  FocusManager: "0x0000000000000000000000000000000000000000" // 部署后更新
};

export const NETWORK_CONFIG = {
  chainId: 84532, // Base Sepolia
  networkName: "Base Sepolia",
  rpcUrl: "https://sepolia.base.org"
};

// 本地测试网络配置（npm run node后使用）
export const LOCAL_NETWORK_CONFIG = {
  chainId: 31337,
  networkName: "Hardhat Local",
  rpcUrl: "http://127.0.0.1:8545"
};


