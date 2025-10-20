const hre = require("hardhat");

async function main() {
  console.log("🚀 开始部署ADHD Focus DApp智能合约...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. 部署FocusToken
  console.log("1️⃣  部署FocusToken...");
  const FocusToken = await hre.ethers.getContractFactory("FocusToken");
  const focusToken = await FocusToken.deploy();
  await focusToken.waitForDeployment();
  const focusTokenAddress = await focusToken.getAddress();
  console.log("✅ FocusToken deployed to:", focusTokenAddress, "\n");

  // 2. 部署LearningProof
  console.log("2️⃣  部署LearningProof...");
  const LearningProof = await hre.ethers.getContractFactory("LearningProof");
  const learningProof = await LearningProof.deploy();
  await learningProof.waitForDeployment();
  const learningProofAddress = await learningProof.getAddress();
  console.log("✅ LearningProof deployed to:", learningProofAddress, "\n");

  // 3. 部署ADHDPet
  console.log("3️⃣  部署ADHDPet...");
  const ADHDPet = await hre.ethers.getContractFactory("ADHDPet");
  const adhdPet = await ADHDPet.deploy(focusTokenAddress);
  await adhdPet.waitForDeployment();
  const adhdPetAddress = await adhdPet.getAddress();
  console.log("✅ ADHDPet deployed to:", adhdPetAddress, "\n");

  // 4. 部署FocusManager
  console.log("4️⃣  部署FocusManager...");
  const FocusManager = await hre.ethers.getContractFactory("FocusManager");
  const focusManager = await FocusManager.deploy(focusTokenAddress, learningProofAddress);
  await focusManager.waitForDeployment();
  const focusManagerAddress = await focusManager.getAddress();
  console.log("✅ FocusManager deployed to:", focusManagerAddress, "\n");

  // 5. 配置权限
  console.log("5️⃣  配置合约权限...");
  
  // 授权ADHDPet可以消费FOCUS代币
  console.log("   - 授权ADHDPet为FOCUS代币消费者...");
  let tx = await focusToken.addAuthorizedSpender(adhdPetAddress);
  await tx.wait();
  console.log("   ✓ ADHDPet已授权");

  // 授权FocusManager可以颁发学习证书
  console.log("   - 授权FocusManager为证书发行者...");
  tx = await learningProof.addAuthorizedIssuer(focusManagerAddress);
  await tx.wait();
  console.log("   ✓ FocusManager已授权\n");

  // 6. 验证部署
  console.log("6️⃣  验证部署...");
  const tokenName = await focusToken.name();
  const tokenSymbol = await focusToken.symbol();
  console.log("   - FocusToken:", tokenName, "(", tokenSymbol, ")");
  
  const certName = await learningProof.name();
  const certSymbol = await learningProof.symbol();
  console.log("   - LearningProof:", certName, "(", certSymbol, ")");
  
  const petName = await adhdPet.name();
  const petSymbol = await adhdPet.symbol();
  console.log("   - ADHDPet:", petName, "(", petSymbol, ")\n");

  // 7. 保存部署信息
  console.log("📄 部署摘要:");
  console.log("=" .repeat(70));
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      FocusToken: focusTokenAddress,
      LearningProof: learningProofAddress,
      ADHDPet: adhdPetAddress,
      FocusManager: focusManagerAddress
    }
  };

  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("=" .repeat(70));

  // 保存到文件
  const fs = require('fs');
  const deploymentPath = './web3/deployed-contracts.json';
  
  // 确保web3目录存在
  if (!fs.existsSync('./web3')) {
    fs.mkdirSync('./web3');
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n✅ 部署信息已保存到:", deploymentPath);

  // 8. 生成前端配置
  console.log("\n🔧 生成前端配置文件...");
  const frontendConfig = `// 自动生成的合约配置文件
// 生成时间: ${new Date().toISOString()}
// 网络: ${hre.network.name}

export const CONTRACTS = {
  FocusToken: "${focusTokenAddress}",
  LearningProof: "${learningProofAddress}",
  ADHDPet: "${adhdPetAddress}",
  FocusManager: "${focusManagerAddress}"
};

export const NETWORK_CONFIG = {
  chainId: ${(await hre.ethers.provider.getNetwork()).chainId},
  networkName: "${hre.network.name}",
  rpcUrl: "${hre.network.config.url || ''}"
};
`;

  fs.writeFileSync('./web3/config.js', frontendConfig);
  console.log("✅ 前端配置已生成: ./web3/config.js");

  // 9. 下一步提示
  console.log("\n" + "=".repeat(70));
  console.log("🎉 部署完成！");
  console.log("=".repeat(70));
  console.log("\n📌 下一步:");
  console.log("   1. 验证合约 (可选):");
  console.log(`      npx hardhat verify --network ${hre.network.name} ${focusTokenAddress}`);
  console.log(`      npx hardhat verify --network ${hre.network.name} ${learningProofAddress}`);
  console.log(`      npx hardhat verify --network ${hre.network.name} ${adhdPetAddress} ${focusTokenAddress}`);
  console.log(`      npx hardhat verify --network ${hre.network.name} ${focusManagerAddress} ${focusTokenAddress} ${learningProofAddress}`);
  console.log("\n   2. 更新前端代码，使用新的合约地址");
  console.log("   3. 测试完整功能流程");
  console.log("\n💡 提示: 确保MetaMask连接到正确的网络！\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });


