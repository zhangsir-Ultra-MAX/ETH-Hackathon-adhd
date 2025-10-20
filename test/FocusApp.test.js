const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ADHD Focus DApp", function () {
  let focusToken, learningProof, adhdPet, focusManager;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // 部署FocusToken
    const FocusToken = await ethers.getContractFactory("FocusToken");
    focusToken = await FocusToken.deploy();

    // 部署LearningProof
    const LearningProof = await ethers.getContractFactory("LearningProof");
    learningProof = await LearningProof.deploy();

    // 部署ADHDPet
    const ADHDPet = await ethers.getContractFactory("ADHDPet");
    adhdPet = await ADHDPet.deploy(await focusToken.getAddress());

    // 部署FocusManager
    const FocusManager = await ethers.getContractFactory("FocusManager");
    focusManager = await FocusManager.deploy(
      await focusToken.getAddress(),
      await learningProof.getAddress()
    );

    // 配置权限
    await focusToken.addAuthorizedSpender(await adhdPet.getAddress());
    await learningProof.addAuthorizedIssuer(await focusManager.getAddress());
  });

  describe("FocusToken", function () {
    it("应该正确初始化", async function () {
      expect(await focusToken.name()).to.equal("FocusToken");
      expect(await focusToken.symbol()).to.equal("FOCUS");
    });

    it("应该允许用户完成课程并获得奖励", async function () {
      const lessonId = 1;
      const studyTime = 60; // 1分钟

      await focusToken.connect(user1).claimLessonReward(lessonId, studyTime);

      const balance = await focusToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("10")); // 10 FOCUS

      const completed = await focusToken.lessonCompleted(user1.address, lessonId);
      expect(completed).to.be.true;
    });

    it("不应允许重复领取同一课程奖励", async function () {
      const lessonId = 1;
      const studyTime = 60;

      await focusToken.connect(user1).claimLessonReward(lessonId, studyTime);

      await expect(
        focusToken.connect(user1).claimLessonReward(lessonId, studyTime)
      ).to.be.revertedWith("Lesson already completed");
    });

    it("应该拒绝学习时间过短的提交", async function () {
      const lessonId = 1;
      const studyTime = 30; // 太短

      await expect(
        focusToken.connect(user1).claimLessonReward(lessonId, studyTime)
      ).to.be.revertedWith("Study time too short");
    });

    it("应该允许用户完成番茄钟并获得奖励", async function () {
      await focusToken.connect(user1).claimFocusReward();

      const balance = await focusToken.balanceOf(user1.address);
      expect(balance).to.be.gte(ethers.parseEther("2")); // 至少2 FOCUS
      expect(balance).to.be.lte(ethers.parseEther("5")); // 最多5 FOCUS
    });

    it("应该遵守番茄钟最小间隔", async function () {
      await focusToken.connect(user1).claimFocusReward();

      await expect(
        focusToken.connect(user1).claimFocusReward()
      ).to.be.revertedWith("Focus interval too short");

      // 快进25分钟
      await time.increase(25 * 60);

      await focusToken.connect(user1).claimFocusReward();
      // 应该成功
    });

    it("应该遵守每日专注次数限制", async function () {
      for (let i = 0; i < 10; i++) {
        await focusToken.connect(user1).claimFocusReward();
        await time.increase(25 * 60); // 快进25分钟
      }

      await expect(
        focusToken.connect(user1).claimFocusReward()
      ).to.be.revertedWith("Daily focus limit reached");
    });
  });

  describe("ADHDPet", function () {
    beforeEach(async function () {
      // 给user1一些代币
      await focusToken.connect(user1).claimLessonReward(1, 60);
    });

    it("应该允许免费mint第一只宠物", async function () {
      await adhdPet.connect(user1).mintPet();

      const pet = await adhdPet.getPetInfo(0);
      expect(pet.level).to.equal(1);
      expect(pet.hunger).to.equal(100);
      expect(pet.happiness).to.equal(100);
      expect(pet.health).to.equal(100);
      expect(pet.isAlive).to.be.true;
    });

    it("第二只宠物应该消费FOCUS代币", async function () {
      await adhdPet.connect(user1).mintPet(); // 免费

      await expect(
        adhdPet.connect(user1).mintPet()
      ).to.be.revertedWith("Insufficient balance"); // 余额不足50 FOCUS
    });

    it("应该允许喂养宠物", async function () {
      await adhdPet.connect(user1).mintPet();

      const balanceBefore = await focusToken.balanceOf(user1.address);
      await adhdPet.connect(user1).feed(0, 1); // 小鱼干
      const balanceAfter = await focusToken.balanceOf(user1.address);

      expect(balanceBefore - balanceAfter).to.equal(ethers.parseEther("5"));

      const pet = await adhdPet.getPetInfo(0);
      expect(pet.totalFed).to.equal(1);
    });

    it("应该允许与宠物互动", async function () {
      await adhdPet.connect(user1).mintPet();

      await adhdPet.connect(user1).play(0);

      const pet = await adhdPet.getPetInfo(0);
      expect(pet.totalPlayed).to.equal(1);
    });

    it("宠物状态应该随时间衰减", async function () {
      await adhdPet.connect(user1).mintPet();

      // 快进1小时
      await time.increase(3600);

      await adhdPet.updatePetStatus(0);

      const pet = await adhdPet.getPetInfo(0);
      expect(pet.hunger).to.be.lt(100); // 饥饿度下降
    });

    it("宠物健康为0时应该死亡", async function () {
      await adhdPet.connect(user1).mintPet();

      // 快进很长时间让宠物死亡
      await time.increase(30 * 24 * 3600); // 30天

      await adhdPet.updatePetStatus(0);

      const pet = await adhdPet.getPetInfo(0);
      expect(pet.isAlive).to.be.false;
    });
  });

  describe("LearningProof", function () {
    it("应该拒绝未授权的发证者", async function () {
      await expect(
        learningProof.connect(user1).issueCertificate(user1.address, 1, 300)
      ).to.be.revertedWith("Not authorized issuer");
    });

    it("授权发证者应该能颁发证书", async function () {
      await learningProof.addAuthorizedIssuer(owner.address);

      await learningProof.issueCertificate(user1.address, 1, 300);

      const hasCert = await learningProof.hasCertificate(user1.address, 1);
      expect(hasCert).to.be.true;
    });

    it("证书应该是灵魂绑定的（不可转移）", async function () {
      await learningProof.addAuthorizedIssuer(owner.address);
      await learningProof.issueCertificate(user1.address, 1, 300);

      await expect(
        learningProof.connect(user1).transferFrom(user1.address, user2.address, 0)
      ).to.be.revertedWith("Soulbound: Transfer not allowed");
    });

    it("应该生成正确的tokenURI", async function () {
      await learningProof.addAuthorizedIssuer(owner.address);
      await learningProof.issueCertificate(user1.address, 1, 300);

      const tokenURI = await learningProof.tokenURI(0);
      expect(tokenURI).to.include("data:application/json;base64");
    });
  });

  describe("FocusManager", function () {
    it("应该允许用户开始学习", async function () {
      await focusManager.connect(user1).startLesson(1);

      const session = await focusManager.getCurrentSession(user1.address);
      expect(session.lessonId).to.equal(1);
      expect(session.completed).to.be.false;
    });

    it("完成课程应该发放代币和证书", async function () {
      await focusManager.connect(user1).startLesson(1);

      // 更新进度到最后一页
      await focusManager.connect(user1).updateProgress(1, 1);
      await focusManager.connect(user1).updateProgress(1, 2);
      await focusManager.connect(user1).updateProgress(1, 3);

      // 快进时间
      await time.increase(60);

      // 完成课程
      await focusManager.connect(user1).completeLesson(1);

      // 检查代币余额
      const balance = await focusToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("10"));

      // 检查证书
      const hasCert = await learningProof.hasCertificate(user1.address, 1);
      expect(hasCert).to.be.true;

      // 检查统计
      const stats = await focusManager.getUserStats(user1.address);
      expect(stats.totalLessonsCompleted).to.equal(1);
    });

    it("应该要求顺序翻页", async function () {
      await focusManager.connect(user1).startLesson(1);

      await expect(
        focusManager.connect(user1).updateProgress(1, 3) // 跳页
      ).to.be.revertedWith("Must progress sequentially");
    });

    it("应该验证学习时间", async function () {
      await focusManager.connect(user1).startLesson(1);

      // 立即完成（时间太短）
      await expect(
        focusManager.connect(user1).completeLesson(1)
      ).to.be.revertedWith("Study time too short");
    });

    it("应该更新用户连续学习天数", async function () {
      // 第一天
      await focusManager.connect(user1).startLesson(1);
      await focusManager.connect(user1).updateProgress(1, 1);
      await focusManager.connect(user1).updateProgress(1, 2);
      await focusManager.connect(user1).updateProgress(1, 3);
      await time.increase(60);
      await focusManager.connect(user1).completeLesson(1);

      let stats = await focusManager.getUserStats(user1.address);
      expect(stats.currentStreak).to.equal(1);

      // 第二天
      await time.increase(24 * 3600);
      await focusManager.connect(user1).startLesson(2);
      await focusManager.connect(user1).updateProgress(2, 1);
      await focusManager.connect(user1).updateProgress(2, 2);
      await focusManager.connect(user1).updateProgress(2, 3);
      await focusManager.connect(user1).updateProgress(2, 4);
      await time.increase(120);
      await focusManager.connect(user1).completeLesson(2);

      stats = await focusManager.getUserStats(user1.address);
      expect(stats.currentStreak).to.equal(2);
    });
  });

  describe("集成测试", function () {
    it("完整学习流程：学习 -> 获得代币 -> mint宠物 -> 喂养", async function () {
      // 1. 学习课程获得代币
      await focusManager.connect(user1).startLesson(1);
      await focusManager.connect(user1).updateProgress(1, 1);
      await focusManager.connect(user1).updateProgress(1, 2);
      await focusManager.connect(user1).updateProgress(1, 3);
      await time.increase(60);
      await focusManager.connect(user1).completeLesson(1);

      let balance = await focusToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("10"));

      // 2. Mint宠物（免费）
      await adhdPet.connect(user1).mintPet();

      let pet = await adhdPet.getPetInfo(0);
      expect(pet.isAlive).to.be.true;

      // 3. 喂养宠物
      await adhdPet.connect(user1).feed(0, 1); // 小鱼干 5 FOCUS

      balance = await focusToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("5"));

      pet = await adhdPet.getPetInfo(0);
      expect(pet.totalFed).to.equal(1);
    });

    it("多课程学习获得足够代币购买高级食物", async function () {
      // 学习多个课程
      for (let lessonId = 1; lessonId <= 3; lessonId++) {
        await focusManager.connect(user1).startLesson(lessonId);
        
        const config = await focusManager.getLessonConfig(lessonId);
        for (let page = 1; page <= config.pages; page++) {
          await focusManager.connect(user1).updateProgress(lessonId, page);
        }
        
        await time.increase(config.minTime);
        await focusManager.connect(user1).completeLesson(lessonId);
      }

      // 应该获得 10+15+20 = 45 FOCUS
      const balance = await focusToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("45"));

      // Mint宠物并购买豪华大餐
      await adhdPet.connect(user1).mintPet();
      await adhdPet.connect(user1).feed(0, 3); // 豪华大餐 30 FOCUS

      const finalBalance = await focusToken.balanceOf(user1.address);
      expect(finalBalance).to.equal(ethers.parseEther("15"));
    });
  });
});


