# 如何提交到 ETHShanghai 2025 - 快速指南

## 🎯 提交概览

本指南将帮助您快速完成 ETHShanghai 2025 的项目提交。

## ⏰ 重要时间

- **提交截止**：2025-10-20 24:00（北京时间）
- **建议提交时间**：提前 2-4 小时

## 📝 提交前准备（需要您完成）

### 1. 填写团队信息

请打开 `README_ETHSHANGHAI.md` 文件，搜索并填写以下信息：

```markdown
### 团队成员
- **项目负责人**：[在这里填写您的姓名]
- **角色**：全栈开发、产品设计、UI/UX设计

### 联系方式
- **Email**：[在这里填写您的邮箱]
- **GitHub**：https://github.com/zhangsir-Ultra-MAX/ETH-Hackathon-adhd
- **可演示时段**：[例如：周一至周五 10:00-22:00 (UTC+8)]
```

### 2. 录制 Demo 视频

#### 快速录制步骤：
1. 使用 OBS Studio 或其他录屏软件
2. 参考 `DEMO_VIDEO_SCRIPT.md` 中的脚本
3. 录制时长控制在 3 分钟以内
4. 上传到 Bilibili 或 YouTube
5. 获取视频链接

#### 视频内容要点：
- 0:00-0:20：项目介绍
- 0:20-0:50：番茄计时器 + 任务管理
- 0:50-1:30：区块链学习获得代币
- 1:30-2:10：虚拟宠物喂养
- 2:10-2:40：专注游戏 + 冥想
- 2:40-3:00：进度报告

#### 视频录制完成后：
打开 `README_ETHSHANGHAI.md`，找到 Demo 视频部分，填入链接：

```markdown
## 🎥 Demo 视频

**视频链接**：[在这里粘贴您的视频链接]
```

## 🚀 提交步骤

### 方法 A：通过官方仓库提交（推荐）

#### 步骤 1：Fork 官方仓库
```bash
# 1. 访问官方仓库
浏览器打开：https://github.com/ethpanda-org/ETHShanghai-2025

# 2. 点击右上角的 Fork 按钮
# 3. 选择 Fork 到你的账号
```

#### 步骤 2：克隆你 Fork 的仓库
```bash
# 替换 [你的GitHub用户名] 为你的实际用户名
git clone https://github.com/[你的GitHub用户名]/ETHShanghai-2025.git
cd ETHShanghai-2025
```

#### 步骤 3：创建项目目录并复制文件
```bash
# 创建项目目录
mkdir -p projects/adhd-focus-assistant
cd projects/adhd-focus-assistant

# Windows PowerShell: 复制项目文件
Copy-Item D:\Projects\ETH-Hackathon-adhd\* -Destination . -Recurse

# 或者手动复制以下文件到 projects/adhd-focus-assistant/：
# - index.html
# - styles.css
# - script.js
# - README_ETHSHANGHAI.md（重命名为 README.md）
# - 使用说明.md
# - 新功能说明.md
# - 其他 HTML 文件
```

#### 步骤 4：重命名主 README
```bash
# 将 README_ETHSHANGHAI.md 重命名为 README.md
Move-Item README_ETHSHANGHAI.md README.md -Force
```

#### 步骤 5：提交到你的 Fork
```bash
# 返回到仓库根目录
cd ../..

# 添加文件
git add .

# 提交
git commit -m "Add ADHD Focus Training Assistant project"

# 推送
git push origin main
```

#### 步骤 6：创建 Pull Request
```bash
# 1. 访问你 Fork 的仓库
浏览器打开：https://github.com/[你的GitHub用户名]/ETHShanghai-2025

# 2. 点击 "Pull requests" 标签
# 3. 点击 "New pull request" 按钮
# 4. 确认配置：
#    - Base repository: ethpanda-org/ETHShanghai-2025
#    - Base: main
#    - Head repository: [你的用户名]/ETHShanghai-2025
#    - Compare: main

# 5. 填写 PR 信息
```

**PR 标题**：
```
Add ADHD Focus Training Assistant - 公共物品 × 开源建设
```

**PR 描述**：
```markdown
## 项目名称
ADHD Focus Training Assistant (ADHD专注力训练助手)

## 参赛赛道
公共物品 × 开源建设 / AI × ETH

## 项目简介
一个专为ADHD用户设计的Web3驱动的专注力训练应用，通过游戏化学习、虚拟宠物陪伴和代币激励系统，帮助用户提升专注力并学习区块链知识。

## 核心功能
- 番茄工作法计时器
- 任务管理系统
- 区块链知识学习（6个课程）
- 代币激励系统
- 虚拟宠物养成
- 专注力训练游戏
- 冥想练习
- 进度数据可视化

## Demo 视频
[您的视频链接]

## 项目仓库
https://github.com/zhangsir-Ultra-MAX/ETH-Hackathon-adhd

## 项目特色
- 完全开源，MIT License
- ADHD 友好设计
- 纯前端应用，离线可用
- 隐私保护，本地存储
- 响应式设计，多设备支持

## 运行方式
直接双击 index.html 即可运行，无需任何依赖安装。

## 团队联系
- Email: [您的邮箱]
- 可演示时段: [您的可用时间]

## 项目进度
✅ 所有核心功能已完成
✅ 已充分测试
✅ 文档完整
✅ 可立即演示
```

**第 6 步：点击 "Create pull request"**

### 方法 B：直接提供项目信息（备选）

如果您不熟悉 GitHub 操作，可以：

1. 确保您的项目仓库是公开的
2. 准备好以下信息：
   - 项目 GitHub 链接
   - Demo 视频链接
   - 项目说明（README）
   - 团队联系方式
3. 等待官方提供提交表单
4. 在表单中填写所有信息

## 📋 提交后检查清单

提交完成后，请确认：

- [ ] Pull Request 已成功创建
- [ ] PR 中可以看到所有项目文件
- [ ] README.md 显示正常
- [ ] Demo 视频链接可以访问
- [ ] 团队信息已填写
- [ ] 联系邮箱正确无误

## 🎯 评审准备

### 准备演示环境
1. 确保本地可以正常运行
2. 准备演示数据（已有任务、学习进度等）
3. 熟悉所有功能和操作流程
4. 准备回答评审问题

### 可能的评审问题
1. **技术相关**：
   - 为什么选择纯前端实现？
   - 未来如何集成真实的 Web3 功能？
   - 数据持久化方案的考虑？

2. **产品相关**：
   - 目标用户群体的需求验证？
   - 如何确保 ADHD 用户的使用体验？
   - 代币经济模型的设计思路？

3. **创新相关**：
   - 与现有专注力工具的差异？
   - Web3 元素的必要性？
   - 虚拟宠物设计的心理学依据？

### 准备材料
- [x] 项目代码（已提交）
- [x] README 文档（已完成）
- [ ] Demo 视频（需要录制）
- [ ] 演示环境（本地已可用）
- [x] 项目展示页面（adhd_reveal.html, demo_showcase.html）

## 📞 需要帮助？

### 技术问题
- 查看 `SUBMISSION_CHECKLIST.md` 详细检查清单
- 查看 `DEMO_VIDEO_SCRIPT.md` 视频录制指南

### 提交问题
- ETHShanghai 2025 官方文档
- 官方社区和讨论组
- 参考其他项目的提交格式

## ⚡ 快速命令参考

```bash
# 克隆 Fork 的仓库
git clone https://github.com/[用户名]/ETHShanghai-2025.git

# 创建项目目录
mkdir -p projects/adhd-focus-assistant

# 复制文件（Windows PowerShell）
Copy-Item D:\Projects\ETH-Hackathon-adhd\* -Destination projects\adhd-focus-assistant\ -Recurse

# 提交更改
git add .
git commit -m "Add ADHD Focus Training Assistant project"
git push origin main

# 然后在 GitHub 网页创建 Pull Request
```

## 🎉 完成提交

恭喜！完成以上步骤后，您就成功提交了项目。

### 接下来要做的：
1. 保存 PR 链接
2. 关注 PR 状态和官方通知
3. 准备演示和答辩
4. 等待评审结果
5. 准备路演（如果入围）

### 奖项设置
- 🥇 一等奖：$2,000
- 🥈 二等奖：$1,500 × 2
- 🥉 三等奖：$1,000 × 2
- 💰 Chain for Good 专项奖
- 🎤 一等奖团队将登上 ETHShanghai 2025 峰会主舞台

## 💪 相信自己

您的项目特点：
- ✅ 功能完整，8大核心模块
- ✅ 用户体验优秀，ADHD 友好设计
- ✅ 创新的 Web3 + 专注力训练结合
- ✅ 社会价值高，帮助 ADHD 群体
- ✅ 技术实现扎实，代码质量高
- ✅ 完全开源，文档完善

---

**祝您提交顺利，取得优异成绩！** 🏆🎊

如有任何问题，请参考 `SUBMISSION_CHECKLIST.md` 获取更详细的信息。

