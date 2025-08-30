import { run } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";
import { network } from "hardhat";

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
  console.log("🔍 Starting contract verification...");
  console.log(`📍 Network: ${network.name}`);
  
  // Load deployment info
  const deploymentPath = join(__dirname, `../deployments/${network.name}-${network.chainId}.json`);
  
  let deploymentInfo: DeploymentInfo;
  try {
    const deploymentData = readFileSync(deploymentPath, 'utf8');
    deploymentInfo = JSON.parse(deploymentData);
  } catch (error) {
    console.error(`❌ Could not load deployment info from ${deploymentPath}`);
    console.error("Please run deployment first with: npm run deploy:<network>");
    process.exit(1);
  }
  
  console.log(`📁 Loaded deployment info for ${deploymentInfo.contracts ? Object.keys(deploymentInfo.contracts).length : 0} contracts`);
  
  // Verify each contract
  for (const [contractName, contractInfo] of Object.entries(deploymentInfo.contracts)) {
    console.log(`\n🔍 Verifying ${contractName}...`);
    console.log(`📍 Address: ${contractInfo.address}`);
    
    try {
      await run("verify:verify", {
        address: contractInfo.address,
        constructorArguments: contractInfo.args || [],
      });
      
      console.log(`✅ ${contractName} verified successfully!`);
      
      // Log explorer link based on network
      const explorerUrl = getExplorerUrl(network.name, contractInfo.address);
      if (explorerUrl) {
        console.log(`🔗 View on explorer: ${explorerUrl}`);
      }
      
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log(`ℹ️  ${contractName} is already verified`);
      } else {
        console.error(`❌ Failed to verify ${contractName}:`, error.message);
      }
    }
  }
  
  console.log("\n🎉 Verification process completed!");
  console.log("\n📋 Verification Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Object.entries(deploymentInfo.contracts).forEach(([name, info]) => {
    const explorerUrl = getExplorerUrl(network.name, info.address);
    console.log(`${name}: ${explorerUrl || info.address}`);
  });
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

function getExplorerUrl(networkName: string, address: string): string | null {
  const explorers: { [key: string]: string } = {
    "base": `https://basescan.org/address/${address}`,
    "base-sepolia": `https://sepolia.basescan.org/address/${address}`,
    "mainnet": `https://etherscan.io/address/${address}`,
    "sepolia": `https://sepolia.etherscan.io/address/${address}`,
  };
  
  return explorers[networkName] || null;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });