import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x137545F47E801026321dab1b8a1421489e438461";
  const newMintPrice = ethers.parseEther("0.00001"); // 0.00001 ETH
  
  console.log("🔧 Updating mint price for ProphecyToken");
  console.log("📍 Contract:", contractAddress);
  console.log("💵 New Mint Price:", ethers.formatEther(newMintPrice), "ETH");
  console.log("==========================================\n");

  // Get the deployer account (must be owner)
  const [deployer] = await ethers.getSigners();
  console.log("📝 Calling from account:", deployer.address);
  
  // Get the contract instance
  const ProphecyToken = await ethers.getContractFactory("ProphecyToken");
  const prophecyToken = ProphecyToken.attach(contractAddress);
  
  // Check current owner
  const owner = await prophecyToken.owner();
  console.log("👤 Contract Owner:", owner);
  
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    throw new Error("❌ You are not the owner of this contract!");
  }
  
  // Get current mint price
  const currentPrice = await prophecyToken.mintPrice();
  console.log("💰 Current Mint Price:", ethers.formatEther(currentPrice), "ETH");
  
  // Get current nonce from the network
  const nonce = await deployer.getNonce();
  console.log("🔢 Using nonce:", nonce);
  
  // Update mint price
  console.log("\n⏳ Updating mint price...");
  const tx = await prophecyToken.setMintPrice(newMintPrice, { nonce });
  console.log("📋 Transaction Hash:", tx.hash);
  
  console.log("⏳ Waiting for confirmation...");
  await tx.wait();
  
  // Verify new price
  const updatedPrice = await prophecyToken.mintPrice();
  console.log("\n✅ Mint price updated successfully!");
  console.log("💵 New Mint Price:", ethers.formatEther(updatedPrice), "ETH");
  console.log("🔗 View on BaseScan:", `https://basescan.org/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

