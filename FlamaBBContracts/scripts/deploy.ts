import { ethers, upgrades } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  contracts: {
    [key: string]: {
      address: string;
      implementationAddress?: string;
      txHash: string;
      deployer: string;
      timestamp: number;
      args?: any[];
    };
  };
}

async function main() {
  console.log("🚀 Starting FlamaBB OpenZeppelin upgradeable contracts deployment...");
  
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

  // Deploy PaymentEscrow first (dependency for ExperienceManager)
  console.log("\n📦 Deploying PaymentEscrowUpgradeable...");
  const PaymentEscrow = await ethers.getContractFactory("PaymentEscrowUpgradeable");
  
  const platformFeeRate = 50; // 0.5% in basis points
  const platformFeeRecipient = deployer.address; // Can be updated later
  
  const paymentEscrow = await upgrades.deployProxy(
    PaymentEscrow,
    [platformFeeRate, platformFeeRecipient],
    { 
      kind: "uups",
      initializer: "initialize"
    }
  );
  
  await paymentEscrow.waitForDeployment();
  const escrowAddress = await paymentEscrow.getAddress();
  
  console.log(`✅ PaymentEscrowUpgradeable proxy deployed to: ${escrowAddress}`);
  
  deploymentInfo.contracts.PaymentEscrowUpgradeable = {
    address: escrowAddress,
    txHash: paymentEscrow.deploymentTransaction()?.hash || "",
    deployer: deployer.address,
    timestamp: Date.now(),
    args: [platformFeeRate, platformFeeRecipient],
  };

  // Deploy ExperienceManager
  console.log("\n📦 Deploying ExperienceManagerUpgradeable...");
  const ExperienceManager = await ethers.getContractFactory("ExperienceManagerUpgradeable");
  
  const experienceManager = await upgrades.deployProxy(
    ExperienceManager,
    [escrowAddress, platformFeeRate, platformFeeRecipient],
    { 
      kind: "uups",
      initializer: "initialize"
    }
  );
  
  await experienceManager.waitForDeployment();
  const managerAddress = await experienceManager.getAddress();
  
  console.log(`✅ ExperienceManagerUpgradeable proxy deployed to: ${managerAddress}`);
  
  deploymentInfo.contracts.ExperienceManagerUpgradeable = {
    address: managerAddress,
    txHash: experienceManager.deploymentTransaction()?.hash || "",
    deployer: deployer.address,
    timestamp: Date.now(),
    args: [escrowAddress, platformFeeRate, platformFeeRecipient],
  };

  // Deploy FlamaBBRegistry
  console.log("\n📦 Deploying FlamaBBRegistryUpgradeable...");
  const FlamaBBRegistry = await ethers.getContractFactory("FlamaBBRegistryUpgradeable");
  
  const registry = await upgrades.deployProxy(
    FlamaBBRegistry,
    [],
    { 
      kind: "uups",
      initializer: "initialize"
    }
  );
  
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  
  console.log(`✅ FlamaBBRegistryUpgradeable proxy deployed to: ${registryAddress}`);
  
  deploymentInfo.contracts.FlamaBBRegistryUpgradeable = {
    address: registryAddress,
    txHash: registry.deploymentTransaction()?.hash || "",
    deployer: deployer.address,
    timestamp: Date.now(),
    args: [],
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