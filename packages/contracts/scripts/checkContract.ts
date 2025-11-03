import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x137545F47E801026321dab1b8a1421489e438461";
  
  console.log("🔍 Checking ProphecyToken Contract on Base");
  console.log("📍 Contract:", contractAddress);
  console.log("==========================================\n");

  // Get the contract instance
  const ProphecyToken = await ethers.getContractFactory("ProphecyToken");
  const prophecyToken = ProphecyToken.attach(contractAddress);
  
  try {
    // Check contract details
    const owner = await prophecyToken.owner();
    console.log("👤 Contract Owner:", owner);
    
    const mintPrice = await prophecyToken.mintPrice();
    console.log("💵 Mint Price:", ethers.formatEther(mintPrice), "ETH");
    
    const profitRecipient = await prophecyToken.PROFIT_RECIPIENT();
    console.log("💰 Profit Recipient:", profitRecipient);
    
    const nextTokenId = await prophecyToken.getCurrentTokenId();
    console.log("🎯 Next Token ID:", nextTokenId.toString());
    console.log("📊 Total Minted:", (Number(nextTokenId) - 1).toString());
    
    // Check balance of profit recipient
    const recipientBalance = await ethers.provider.getBalance(profitRecipient);
    console.log("\n💰 Profit Recipient Balance:", ethers.formatEther(recipientBalance), "ETH");
    
    // Check contract balance
    const contractBalance = await ethers.provider.getBalance(contractAddress);
    console.log("📦 Contract Balance:", ethers.formatEther(contractBalance), "ETH");
    
  } catch (error) {
    console.error("❌ Error checking contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

