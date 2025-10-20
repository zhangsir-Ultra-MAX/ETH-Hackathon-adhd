# 🚀 部署指南

## 准备工作

### 1. 获取测试ETH

#### Base Sepolia测试网
1. 访问 [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. 连接MetaMask钱包
3. 领取测试ETH（每24小时可领取一次）

或者：
1. 在Ethereum Sepolia上获取ETH：[Sepolia Faucet](https://sepoliafaucet.com/)
2. 使用[Base Bridge](https://bridge.base.org/)桥接到Base Sepolia

### 2. 配置环境

创建`.env`文件并填写：

```bash
# 从MetaMask导出私钥
PRIVATE_KEY=你的私钥（不要分享给任何人！）

# RPC节点（可以使用公共节点）
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Basescan API Key (用于验证合约)
# 在 https://basescan.org/register 注册获取
BASESCAN_API_KEY=你的API_KEY
```

## 部署步骤

### Step 1: 安装依赖

```bash
npm install
```

### Step 2: 编译合约

```bash
npm run compile
```

检查是否有编译错误，应该看到：

```
Compiled 4 Solidity files successfully
```

### Step 3: 运行测试（可选但推荐）

```bash
npm test
```

确保所有测试通过：

```
✓ FocusToken tests (25 tests)
✓ ADHDPet tests (15 tests)
✓ LearningProof tests (10 tests)
✓ FocusManager tests (20 tests)
✓ Integration tests (5 tests)

75 passing
```

### Step 4: 部署到测试网

```bash
npm run deploy:basesepolia
```

部署过程大约需要1-2分钟，你会看到：

```
🚀 开始部署ADHD Focus DApp智能合约...

📝 部署账户: 0x你的地址
💰 账户余额: 0.5 ETH

1️⃣  部署FocusToken...
✅ FocusToken deployed to: 0x...

2️⃣  部署LearningProof...
✅ LearningProof deployed to: 0x...

3️⃣  部署ADHDPet...
✅ ADHDPet deployed to: 0x...

4️⃣  部署FocusManager...
✅ FocusManager deployed to: 0x...

5️⃣  配置合约权限...
   ✓ ADHDPet已授权
   ✓ FocusManager已授权

6️⃣  验证部署...
   - FocusToken: FocusToken ( FOCUS )
   - LearningProof: ADHD Learning Certificate ( CERT )
   - ADHDPet: ADHD Focus Pet ( PETFOCUS )

✅ 部署信息已保存到: ./web3/deployed-contracts.json
✅ 前端配置已生成: ./web3/config.js

🎉 部署完成！
```

### Step 5: 验证合约（可选）

验证合约可以让用户在区块浏览器上查看源代码：

```bash
# 验证FocusToken
npx hardhat verify --network baseSepolia <FocusToken地址>

# 验证LearningProof
npx hardhat verify --network baseSepolia <LearningProof地址>

# 验证ADHDPet (需要构造函数参数)
npx hardhat verify --network baseSepolia <ADHDPet地址> <FocusToken地址>

# 验证FocusManager (需要构造函数参数)
npx hardhat verify --network baseSepolia <FocusManager地址> <FocusToken地址> <LearningProof地址>
```

## 前端配置

部署成功后，`web3/config.js`文件会自动更新合约地址。

### 本地测试前端

```bash
# 方法1: 使用Python HTTP服务器
python -m http.server 8000

# 方法2: 使用Node.js http-server
npx http-server -p 8000

# 方法3: 使用VS Code Live Server扩展
# 右键index.html -> Open with Live Server
```

访问 `http://localhost:8000`

### 连接MetaMask

1. 打开MetaMask
2. 点击网络下拉菜单
3. 选择"Base Sepolia"网络
4. 如果没有，添加网络：
   - 网络名称: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - 货币符号: ETH
   - 区块浏览器: https://sepolia.basescan.org

## 测试流程

### 1. 连接钱包

- 点击"连接钱包"按钮
- MetaMask弹窗，点击"连接"
- 确认网络为Base Sepolia

### 2. 学习课程获得代币

- 切换到"区块链学习"标签
- 点击"开始学习"（课程1）
- 等待1分钟
- 点击"完成课程"
- MetaMask弹窗，点击"确认"
- 等待交易确认
- 余额增加10 FOCUS

### 3. Mint宠物

- 切换到"虚拟宠物"标签
- 点击"Mint宠物"（首次免费）
- 确认交易
- 等待宠物出现

### 4. 喂养宠物

- 点击"小鱼干"（需要5 FOCUS）
- 确认交易
- 宠物属性更新

### 5. 完成番茄钟

- 切换到"番茄计时器"
- 点击"开始"
- 等待25分钟（或修改合约测试）
- 点击领取奖励
- 获得2-5 FOCUS

## 常见问题

### Q: 部署失败："insufficient funds"

**A:** 账户ETH余额不足。请从水龙头获取更多测试ETH。

### Q: 交易一直pending

**A:** Gas价格可能太低。在MetaMask中可以加速交易或取消重试。

### Q: 合约验证失败

**A:** 
1. 确保Basescan API Key正确
2. 等待1-2分钟后重试
3. 检查构造函数参数是否正确

### Q: 前端连接不上合约

**A:**
1. 检查`web3/config.js`中的合约地址是否正确
2. 确保MetaMask连接到正确的网络
3. 刷新页面重新连接钱包

### Q: 学习课程但没有获得代币

**A:**
1. 检查学习时间是否达到最小要求
2. 查看MetaMask确认交易是否成功
3. 检查浏览器控制台是否有错误

## 部署到主网

**⚠️ 警告：本项目为演示项目，未经审计，不建议部署到主网！**

如果你一定要部署到主网：

1. 进行专业的安全审计
2. 充分测试所有功能
3. 准备足够的ETH支付Gas费
4. 修改`.env`配置主网RPC
5. 修改`hardhat.config.js`添加主网配置
6. 部署前三思！

## Gas费用估算

Base Sepolia测试网的预估Gas费用：

| 操作 | Gas估算 | 费用（测试网免费） |
|------|---------|-------------------|
| 部署FocusToken | ~1,500,000 | ~0.015 ETH |
| 部署ADHDPet | ~3,000,000 | ~0.030 ETH |
| 部署LearningProof | ~2,000,000 | ~0.020 ETH |
| 部署FocusManager | ~1,800,000 | ~0.018 ETH |
| **总计部署** | ~8,300,000 | ~0.083 ETH |
| 完成课程 | ~200,000 | ~0.002 ETH |
| Mint宠物 | ~250,000 | ~0.0025 ETH |
| 喂养宠物 | ~100,000 | ~0.001 ETH |

## 监控和调试

### 查看交易

在Basescan上查看交易详情：
```
https://sepolia.basescan.org/tx/<交易哈希>
```

### 查看合约

在Basescan上查看合约：
```
https://sepolia.basescan.org/address/<合约地址>
```

### 调试

在浏览器控制台查看日志：
```javascript
// 检查Web3连接
console.log(window.web3App);

// 检查钱包状态
console.log(window.web3App.walletManager);

// 检查合约实例
console.log(window.web3App.contractManager);
```

## 备份和恢复

### 备份重要文件

```bash
# 备份私钥（安全保存！）
cp .env .env.backup

# 备份部署信息
cp web3/deployed-contracts.json deployments/$(date +%Y%m%d).json
```

### 恢复部署

如果需要使用已部署的合约：

1. 复制`deployed-contracts.json`到`web3/`目录
2. 手动更新`web3/config.js`中的合约地址
3. 重新加载前端页面

## 下一步

部署成功后，你可以：

1. 📹 录制演示视频
2. 📝 准备Pitch演讲稿
3. 🎨 优化UI/UX
4. 🐛 修复发现的bug
5. ✨ 添加新功能
6. 📊 准备数据展示
7. 🎤 准备黑客松演讲

祝你在黑客松中取得好成绩！🎉


