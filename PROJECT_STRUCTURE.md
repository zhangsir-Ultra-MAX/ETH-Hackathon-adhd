# 📁 PubFi: ADHD 项目结构

最后更新：2025-10-20

## 📂 文件夹结构

```
ETH-Hackathon-adhd/
│
├── 📄 README.md                    # 项目主文档
├── 📄 .gitignore                   # Git忽略配置
├── 📄 package.json                 # Node.js依赖配置
├── 📄 yarn.lock                    # Yarn锁定文件
├── 📄 hardhat.config.js            # Hardhat配置
│
├── 🎨 前端文件
│   ├── index.html                  # 主页面
│   ├── script.js                   # 主逻辑 (1900+行)
│   ├── styles.css                  # 样式 (2700+行)
│   └── web3-integration.js         # Web3集成
│
├── 📚 docs/                        # 所有文档
│   ├── README.md                   # 文档导航
│   ├── QUICKSTART.md               # 快速开始指南
│   ├── DEPLOYMENT.md               # 部署指南
│   ├── 完成功能总结.md             # 功能总结
│   ├── 演示指南.md                 # 演示脚本
│   └── 项目完成报告.md             # 完成报告
│
├── 📜 contracts/                   # 智能合约
│   ├── FocusToken.sol              # ERC-20代币
│   ├── ADHDPet.sol                 # ERC-721 NFT宠物
│   ├── LearningProof.sol           # Soulbound学习证书
│   └── FocusManager.sol            # 核心管理合约
│
├── 🔧 scripts/                     # 部署脚本
│   └── deploy.js                   # 智能合约部署脚本
│
├── 🧪 test/                        # 测试文件
│   └── FocusApp.test.js            # 合约测试
│
├── 🌐 web3/                        # Web3模块
│   ├── config.js                   # 配置
│   ├── wallet.js                   # 钱包管理
│   ├── contracts.js                # 合约交互
│   └── utils.js                    # 工具函数
│
└── 📦 node_modules/                # 依赖包 (git忽略)
```

## 📝 核心文件说明

### 前端文件

| 文件 | 行数 | 说明 |
|------|------|------|
| `index.html` | 830+ | 主页面结构，包含所有UI组件 |
| `script.js` | 1900+ | 核心逻辑，包含所有功能模块 |
| `styles.css` | 2700+ | 完整样式，包含动画和响应式设计 |
| `web3-integration.js` | 600+ | Web3集成，优雅降级 |

### 智能合约

| 合约 | 行数 | 说明 |
|------|------|------|
| `FocusToken.sol` | 228 | ERC-20代币合约，奖励系统 |
| `ADHDPet.sol` | 411 | ERC-721 NFT合约，虚拟宠物 |
| `LearningProof.sol` | 277 | SBT证书合约，学习证明 |
| `FocusManager.sol` | 311 | 核心管理合约，游戏逻辑 |

### 文档文件

| 文档 | 用途 |
|------|------|
| `docs/README.md` | 文档导航 |
| `docs/QUICKSTART.md` | 5分钟快速开始 |
| `docs/DEPLOYMENT.md` | 智能合约部署 |
| `docs/完成功能总结.md` | 功能详细列表 |
| `docs/演示指南.md` | 黑客松演示脚本 |
| `docs/项目完成报告.md` | 完整项目报告 |

## 🗂️ 文件夹用途

### `/docs` - 文档中心
存放所有项目文档，包括快速开始、部署、演示等指南。

### `/contracts` - 智能合约
存放所有Solidity智能合约文件。

### `/scripts` - 脚本
存放部署和工具脚本。

### `/test` - 测试
存放智能合约测试文件。

### `/web3` - Web3模块
存放Web3相关的JavaScript模块，按功能分离。

## 📊 代码统计

```
总计：
- 前端代码：~5,000行 (HTML + JS + CSS)
- 智能合约：~1,227行 (Solidity)
- Web3模块：~600行 (JavaScript)
- 文档：~2,000行 (Markdown)
```

## 🎯 快速导航

### 想要运行项目？
👉 根目录运行：`python -m http.server 8000`

### 想要部署合约？
👉 查看：`docs/DEPLOYMENT.md`

### 想要了解功能？
👉 查看：`docs/完成功能总结.md`

### 想要演示项目？
👉 查看：`docs/演示指南.md`

## 🔧 配置文件

- **`package.json`** - Node.js依赖和脚本
- **`hardhat.config.js`** - Hardhat开发环境配置
- **`.gitignore`** - Git忽略规则
- **`yarn.lock`** - Yarn依赖锁定

## 🌟 特色

### 清晰的模块化结构
- ✅ 前端文件在根目录，易于访问
- ✅ 文档集中在 `docs/` 文件夹
- ✅ 合约按类型分类在 `contracts/`
- ✅ Web3功能模块化在 `web3/`

### 完整的文档体系
- ✅ 快速开始指南
- ✅ 详细功能文档
- ✅ 部署指南
- ✅ 演示脚本

### 专业的代码组织
- ✅ 按功能分离模块
- ✅ 清晰的命名规范
- ✅ 完整的注释
- ✅ 易于维护

## 📦 依赖管理

主要依赖：
- **Hardhat** - 智能合约开发框架
- **ethers.js** - Web3库
- **OpenZeppelin** - 智能合约库
- **Chart.js** - 图表可视化

开发依赖：
- **TypeScript** - 类型支持
- **Chai** - 测试框架
- **Mocha** - 测试运行器

## 🎨 设计原则

1. **简洁明了** - 文件夹层级不超过3层
2. **按功能分类** - 相关文件放在一起
3. **易于查找** - 清晰的命名和结构
4. **便于维护** - 模块化和文档化

---

**项目仓库**: https://github.com/zhangsir-Ultra-MAX/ETH-Hackathon-adhd

**最后更新**: 2025-10-20

