import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🔍 Checking deployment setup for Base Sepolia...");
  
  // Check environment variables
  const privateKey = process.env.PRIVATE_KEY;
  const basescanApiKey = process.env.BASESCAN_API_KEY;
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
  
  console.log("\n📋 Environment Variables:");
  console.log(`├─ PRIVATE_KEY: ${privateKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`├─ BASESCAN_API_KEY: ${basescanApiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`└─ BASE_SEPOLIA_RPC_URL: ${rpcUrl ? '✅ Set' : '❌ Missing'}`);
  
  if (!privateKey || privateKey === 'your-deployment-wallet-private-key-here' || privateKey === '0000000000000000000000000000000000000000000000000000000000000000') {
    console.log("\n❌ Setup incomplete: Please add your deployment wallet private key to .env");
    console.log("💡 To get Base Sepolia ETH: https://docs.base.org/tools/network-faucets/");
    return;
  }

  try {
    // Check deployer account
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    const balance = await ethers.provider.getBalance(deployer.address);
    
    console.log("\n🌐 Network Information:");
    console.log(`├─ Network: ${network.name}`);
    console.log(`├─ Chain ID: ${network.chainId}`);
    console.log(`└─ RPC URL: Connected ✅`);
    
    console.log("\n👤 Deployer Account:");
    console.log(`├─ Address: ${deployer.address}`);
    console.log(`├─ Balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`└─ Status: ${balance > BigInt(0) ? '✅ Ready' : '❌ No funds'}`);
    
    // Estimate deployment costs
    const estimatedGas = BigInt(3000000); // Rough estimate for all 3 contracts
    const gasPrice = BigInt(1000000000); // 1 gwei
    const estimatedCost = estimatedGas * gasPrice;
    
    console.log("\n💰 Deployment Cost Estimate:");
    console.log(`├─ Estimated Gas: ${estimatedGas.toString()} units`);
    console.log(`├─ Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
    console.log(`├─ Estimated Cost: ${ethers.formatEther(estimatedCost)} ETH`);
    console.log(`└─ Sufficient Funds: ${balance >= estimatedCost ? '✅ Yes' : '❌ No'}`);
    
    if (balance >= estimatedCost) {
      console.log("\n🎉 Setup complete! Ready to deploy contracts.");
      console.log("Next step: npm run deploy:base-sepolia");
    } else {
      console.log("\n⚠️  Need more ETH for deployment.");
      console.log("Get Base Sepolia ETH from: https://docs.base.org/tools/network-faucets/");
    }
    
  } catch (error) {
    console.error("\n❌ Setup check failed:", error.message);
    console.log("💡 Make sure your .env file is configured correctly");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup check failed:", error);
    process.exit(1);
  });