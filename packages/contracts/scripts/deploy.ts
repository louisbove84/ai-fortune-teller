import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ProphecyToken contract to Base...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy the contract
  const ProphecyToken = await ethers.getContractFactory("ProphecyToken");
  const prophecyToken = await ProphecyToken.deploy();

  await prophecyToken.waitForDeployment();

  const address = await prophecyToken.getAddress();
  console.log("ProphecyToken deployed to:", address);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await prophecyToken.deploymentTransaction()?.wait(5);

  console.log("\n✅ Deployment complete!");
  console.log("\nContract address:", address);
  console.log("\nAdd this to your .env file:");
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${address}`);
  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network base-sepolia ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

