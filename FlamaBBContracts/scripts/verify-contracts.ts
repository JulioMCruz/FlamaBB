import { run } from "hardhat";

async function main() {
  console.log("🔍 Verifying FlamaBB contracts on Basescan...");

  const contracts = [
    {
      name: "PaymentEscrowUpgradeable",
      address: "0x053F3EB75c9E78F5D53b9aEab16DfD006Cb1A08c",
      constructorArgs: []
    },
    {
      name: "ExperienceManagerUpgradeable", 
      address: "0x9E904aaf00ad1B0578588C56301319255218522D",
      constructorArgs: []
    },
    {
      name: "FlamaBBRegistryUpgradeable",
      address: "0x480b1f8aEF49c02334CA17A598bEc8dA7d5b1B28", 
      constructorArgs: []
    }
  ];

  for (const contract of contracts) {
    try {
      console.log(`\n📋 Verifying ${contract.name}...`);
      
      await run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.constructorArgs,
      });
      
      console.log(`✅ ${contract.name} verified successfully!`);
      console.log(`🔗 View on Basescan: https://sepolia.basescan.org/address/${contract.address}`);
      
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`ℹ️  ${contract.name} already verified`);
      } else {
        console.error(`❌ Failed to verify ${contract.name}:`, error.message);
      }
    }
  }

  console.log("\n🎉 Contract verification completed!");
  console.log("\n📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  contracts.forEach(contract => {
    console.log(`${contract.name}: ${contract.address}`);
  });
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });