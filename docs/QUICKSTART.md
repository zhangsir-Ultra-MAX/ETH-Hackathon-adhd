# ⚡ 快速开始指南

> 5分钟内启动并运行ADHD Focus DApp

## 🎯 目标

完成本指南后，你将能够：
- ✅ 在本地运行完整的DApp
- ✅ 部署智能合约到测试网
- ✅ 连接MetaMask钱包
- ✅ 完成一个学习课程并获得代币
- ✅ Mint并喂养NFT宠物

## 📋 前置要求

- [x] Node.js v16+ 和 npm
- [x] Git
- [x] MetaMask浏览器扩展
- [x] 基本的终端/命令行知识

## 🚀 5步启动

### Step 1: 克隆和安装 (1分钟)

```bash
# 克隆项目
git clone <your-repo-url>
cd ETH-Hackathon-adhd

# 安装依赖
npm install
```

### Step 2: 编译合约 (30秒)

```bash
npm run compile
```

看到"Compiled successfully"就成功了！

### Step 3: 本地测试（可选）(1分钟)

```bash
# 运行测试
npm test
```

应该看到75个测试全部通过 ✅

### Step 4: 部署到测试网 (2分钟)

```bash
# 配置环境变量
cp .env.example .env
# 编辑.env文件，填入你的私钥

# 部署到Base Sepolia
npm run deploy:basesepolia
```

**需要测试ETH？** 访问 [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

### Step 5: 启动前端 (30秒)

```bash
# 启动本地服务器
python -m http.server 8000

# 或使用npx
npx http-server -p 8000
```

打开浏览器访问：`http://localhost:8000`

## 🎮 第一次使用

### 1. 连接钱包

1. 打开MetaMask
2. 切换到"Base Sepolia"网络
3. 点击网站上的"连接钱包"
4. 在MetaMask中点击"连接"

✅ 成功后会显示你的地址和FOCUS余额

### 2. 学习第一个课程

1. 点击"区块链学习"标签
2. 选择"什么是区块链？"
3. 点击"开始学习"
4. 等待1分钟（可以实际阅读内容）
5. 点击"完成课程"
6. 在MetaMask中确认交易

🎉 恭喜！你获得了10 FOCUS代币和一个学习证书NFT！

### 3. 获得你的第一只宠物

1. 点击"虚拟宠物"标签
2. 点击"Mint宠物"（首次免费）
3. 在MetaMask中确认交易
4. 等待交易确认

😺 你现在有一只可爱的NFT宠物了！

### 4. 喂养宠物

1. 选择"小鱼干"（5 FOCUS）
2. 点击"喂养"
3. 确认交易

🐟 宠物吃饱了，属性提升！

## 📚 下一步

现在你已经掌握了基础操作，可以：

- 🎓 完成更多课程获得更多代币
- 🍅 使用番茄钟获得额外奖励
- 🐱 升级你的宠物
- 📊 查看进度报告
- 🎮 尝试专注力训练游戏

## 🔧 开发模式

如果你想修改合约或添加功能：

### 本地开发网络

```bash
# 终端1: 启动本地Hardhat节点
npm run node

# 终端2: 部署到本地网络
npm run deploy

# 配置MetaMask连接到 localhost:8545
```

### 修改代码后

```bash
# 重新编译
npm run compile

# 运行测试
npm test

# 重新部署
npm run deploy:basesepolia
```

## 💡 快速技巧

### 快速获得代币

```bash
# 完成所有6个课程
# 每个课程奖励不同：10, 15, 20, 25, 30, 35 FOCUS
# 总计：135 FOCUS
```

### 快速测试宠物

```javascript
// 在浏览器控制台
// 查看当前宠物
await window.web3App.contractManager.getPetInfo(0)

// 快速更新宠物状态
await window.web3App.contractManager.updatePetStatus(0)
```

### 查看合约地址

```bash
# 查看部署的合约地址
cat web3/deployed-contracts.json
```

## ⚠️ 常见问题快速解决

### 问题：交易失败

**解决：** 
1. 检查账户是否有足够的测试ETH
2. 检查是否连接到正确的网络
3. 刷新页面重试

### 问题：余额不更新

**解决：** 刷新页面，重新连接钱包

### 问题：合约地址错误

**解决：** 
```bash
# 重新生成配置
npm run deploy:basesepolia
```

### 问题：MetaMask没有Base Sepolia网络

**解决：** 手动添加网络：
- 网络名称: `Base Sepolia`
- RPC URL: `https://sepolia.base.org`
- Chain ID: `84532`
- 货币符号: `ETH`
- 区块浏览器: `https://sepolia.basescan.org`

## 📖 进阶阅读

- [完整README](README-WEB3.md) - 详细的项目文档
- [部署指南](DEPLOYMENT.md) - 详细的部署说明
- [合约文档](contracts/) - 智能合约源代码
- [测试文档](test/) - 测试代码

## 🆘 需要帮助？

1. 查看[FAQ](#常见问题快速解决)
2. 检查浏览器控制台的错误信息
3. 查看[详细部署指南](DEPLOYMENT.md)
4. 提交Issue到GitHub

## 🎉 准备演示？

### 演示检查清单

- [ ] 合约已部署并验证
- [ ] 前端可以正常访问
- [ ] 钱包可以连接
- [ ] 至少完成一个课程
- [ ] 已Mint宠物
- [ ] 余额显示正常
- [ ] 准备好演讲稿
- [ ] 录制演示视频（可选）

### 演示脚本建议

1. **介绍** (30秒)
   - 项目背景：为ADHD用户设计
   - 核心理念：Learn to Earn + NFT宠物

2. **演示** (2分钟)
   - 连接钱包
   - 完成学习课程获得代币
   - Mint宠物NFT
   - 喂养宠物
   - 展示动态NFT

3. **技术亮点** (1分钟)
   - 完整Web3技术栈
   - 动态NFT
   - 灵魂绑定证书
   - 防作弊机制

4. **总结** (30秒)
   - 社会价值
   - 商业潜力
   - 未来展望

---

**现在开始吧！** 🚀

如果遇到任何问题，不要慌张，检查错误信息并参考文档。祝你在黑客松中取得好成绩！🏆


