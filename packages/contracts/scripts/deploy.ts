import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const network = await ethers.provider.getNetwork();
  const isMainnet = Number(network.chainId) === 8453;
  const networkName = isMainnet ? "Base Mainnet (L2)" : "Base Sepolia Testnet";
  
  console.log("🔮 Deploying ProphecyToken to", networkName);
  console.log("==========================================\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (isMainnet && balance < ethers.parseEther("0.001")) {
    console.warn("⚠️  WARNING: Low balance! Make sure you have enough ETH for gas fees.\n");
  }

  // Get the contract factory
  const ProphecyToken = await ethers.getContractFactory("ProphecyToken");
  
  console.log("📦 Deploying ProphecyToken contract...");

  // Get current nonce from the network to avoid nonce issues
  const nonce = await deployer.getNonce();
  console.log("🔢 Using nonce:", nonce);

  // Deploy the contract with explicit nonce
  const prophecyToken = await ProphecyToken.deploy({ nonce });
  
  console.log("⏳ Waiting for deployment confirmation...");
  await prophecyToken.waitForDeployment();

  const contractAddress = await prophecyToken.getAddress();
  console.log("\n✅ ProphecyToken deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  
  // Display network info (already fetched at the start)
  console.log("🔗 Network:", network.name);
  console.log("🔢 Chain ID:", Number(network.chainId));
  
  // Get deployment transaction details
  const deploymentTx = prophecyToken.deploymentTransaction();
  if (deploymentTx) {
    console.log("📋 Deployment Transaction:", deploymentTx.hash);
    console.log("⛽ Gas Limit:", deploymentTx.gasLimit?.toString());
    console.log("💰 Gas Price:", ethers.formatUnits(deploymentTx.gasPrice || 0, "gwei"), "gwei");
  }
  
  // Verify the contract owner
  const owner = await prophecyToken.owner();
  console.log("👤 Contract Owner:", owner);
  
  // Get current token ID (should be 1 for fresh deployment)
  const currentTokenId = await prophecyToken.getCurrentTokenId();
  console.log("🎯 Next Token ID:", currentTokenId.toString());
  
  // Get mint price
  const mintPrice = await prophecyToken.mintPrice();
  console.log("💵 Mint Price:", ethers.formatEther(mintPrice), "ETH");
  console.log("💰 All Profits Go To:", await prophecyToken.PROFIT_RECIPIENT());
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deploymentTx: deploymentTx?.hash || "",
    network: network.name,
    chainId: Number(network.chainId),
    owner: owner,
    timestamp: new Date().toISOString(),
    environment: network.name === "base" ? "production" : "testnet",
  };
  
  // Write to file for easy reference
  const deploymentFile = path.join(__dirname, "../deployment-info.json");
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n💾 Deployment info saved to deployment-info.json");
  
  // Display next steps
  console.log("\n🎉 Deployment Complete!");
  console.log("📝 Next Steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Add it to your root .env.local file:");
  console.log(`   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("3. (Optional) Verify the contract:");
  const networkFlag = isMainnet ? "base" : "base-sepolia";
  console.log(`   npm run verify -- --network ${networkFlag} ${contractAddress}`);
  console.log("4. Check on BaseScan:");
  const basescanUrl = isMainnet
    ? `https://basescan.org/address/${contractAddress}`
    : `https://sepolia.basescan.org/address/${contractAddress}`;
  console.log(`   ${basescanUrl}`);
  console.log("\n⚠️  IMPORTANT:");
  if (isMainnet) {
    console.log("- You deployed to Base Mainnet (L2) - real ETH!");
    console.log("- Keep your PRIVATE_KEY secure and never commit it");
    console.log("- Make sure you have ETH on Base for gas fees");
  } else {
    console.log("- This is a testnet deployment");
    console.log("- Test thoroughly before deploying to mainnet");
  }
  
  return contractAddress;
}

// Handle errors
main()
  .then((address) => {
    console.log("\n✅ Deployment script completed successfully!");
    console.log(`📍 Contract deployed at: ${address}`);
    console.log("🎯 Ready for NFT minting!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

