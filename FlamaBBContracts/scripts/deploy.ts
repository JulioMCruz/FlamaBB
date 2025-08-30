import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  contracts: {
    [key: string]: {
      address: string;
      txHash: string;
      deployer: string;
      timestamp: number;
      args?: any[];
    };
  };
}

async function main() {
  console.log("🚀 Starting FlamaBB contracts deployment...");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log(`📍 Network: ${network.name} (${network.chainId})`);
  console.log(`👤 Deploying with account: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance === BigInt(0)) {
    throw new Error("❌ Deployer account has no ETH balance");
  }

  const deploymentInfo: DeploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    contracts: {},
  };

  // Example: Deploy FlamaBB Token Contract
  console.log("\n📦 Deploying FlamaBBToken...");
  const FlamaBBToken = await ethers.getContractFactory("FlamaBBToken");
  const flamaBBToken = await FlamaBBToken.deploy(
    "FlamaBB Token", // name
    "FLAMA", // symbol
    ethers.parseEther("1000000") // initial supply: 1M tokens
  );
  
  await flamaBBToken.waitForDeployment();
  const tokenAddress = await flamaBBToken.getAddress();
  const tokenTx = flamaBBToken.deploymentTransaction();
  
  console.log(`✅ FlamaBBToken deployed to: ${tokenAddress}`);
  console.log(`🔗 Transaction hash: ${tokenTx?.hash}`);
  
  deploymentInfo.contracts.FlamaBBToken = {
    address: tokenAddress,
    txHash: tokenTx?.hash || "",
    deployer: deployer.address,
    timestamp: Date.now(),
    args: ["FlamaBB Token", "FLAMA", ethers.parseEther("1000000").toString()],
  };

  // Example: Deploy Experiences Contract
  console.log("\n📦 Deploying FlamaBBExperiences...");
  const FlamaBBExperiences = await ethers.getContractFactory("FlamaBBExperiences");
  const flamaBBExperiences = await FlamaBBExperiences.deploy(tokenAddress);
  
  await flamaBBExperiences.waitForDeployment();
  const experiencesAddress = await flamaBBExperiences.getAddress();
  const experiencesTx = flamaBBExperiences.deploymentTransaction();
  
  console.log(`✅ FlamaBBExperiences deployed to: ${experiencesAddress}`);
  console.log(`🔗 Transaction hash: ${experiencesTx?.hash}`);
  
  deploymentInfo.contracts.FlamaBBExperiences = {
    address: experiencesAddress,
    txHash: experiencesTx?.hash || "",
    deployer: deployer.address,
    timestamp: Date.now(),
    args: [tokenAddress],
  };

  // Save deployment info
  const deploymentPath = join(__dirname, `../deployments/${network.name}-${network.chainId}.json`);
  writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log(`📁 Deployment info saved to: ${deploymentPath}`);
  
  console.log("\n📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Object.entries(deploymentInfo.contracts).forEach(([name, info]) => {
    console.log(`${name}: ${info.address}`);
  });
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  console.log("\n🔍 Next steps:");
  console.log("1. Verify contracts with: npm run verify:<network>");
  console.log("2. Update frontend contract addresses");
  console.log("3. Configure contract permissions if needed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });