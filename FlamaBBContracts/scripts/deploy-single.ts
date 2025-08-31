import { ethers, upgrades } from "hardhat";

async function main() {
  // Get contract name from environment or default to Registry
  const contractName = process.env.CONTRACT_NAME || "FlamaBBRegistryUpgradeable";
  
  console.log("Available contracts: PaymentEscrowUpgradeable, ExperienceManagerUpgradeable, FlamaBBRegistryUpgradeable");
  console.log(`Selected contract: ${contractName}`);

  console.log(`🚀 Deploying ${contractName}...`);
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log(`📍 Network: ${network.name} (${network.chainId})`);
  console.log(`👤 Deploying with account: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);

  try {
    let contract;
    let args: any[] = [];

    if (contractName === "PaymentEscrowUpgradeable") {
      const Contract = await ethers.getContractFactory("PaymentEscrowUpgradeable");
      const platformFeeRate = 50; // 0.5%
      const platformFeeRecipient = deployer.address;
      args = [platformFeeRate, platformFeeRecipient];
      
      contract = await upgrades.deployProxy(Contract, args, { 
        kind: "uups",
        initializer: "initialize"
      });
    } else if (contractName === "ExperienceManagerUpgradeable") {
      const Contract = await ethers.getContractFactory("ExperienceManagerUpgradeable");
      const escrowAddress = "0x053F3EB75c9E78F5D53b9aEab16DfD006Cb1A08c"; // From previous deployment
      const platformFeeRate = 50;
      const platformFeeRecipient = deployer.address;
      args = [escrowAddress, platformFeeRate, platformFeeRecipient];
      
      contract = await upgrades.deployProxy(Contract, args, { 
        kind: "uups",
        initializer: "initialize"
      });
    } else if (contractName === "FlamaBBRegistryUpgradeable") {
      const Contract = await ethers.getContractFactory("FlamaBBRegistryUpgradeable");
      args = [];
      
      contract = await upgrades.deployProxy(Contract, args, { 
        kind: "uups",
        initializer: "initialize"
      });
    } else {
      throw new Error(`Unknown contract: ${contractName}`);
    }

    await contract.waitForDeployment();
    const address = await contract.getAddress();
    const txHash = contract.deploymentTransaction()?.hash;
    
    console.log(`✅ ${contractName} deployed successfully!`);
    console.log(`📍 Proxy Address: ${address}`);
    console.log(`🔗 Transaction: ${txHash}`);
    console.log(`🔍 View on Basescan: https://sepolia.basescan.org/address/${address}`);

  } catch (error) {
    console.error(`❌ Failed to deploy ${contractName}:`, error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });