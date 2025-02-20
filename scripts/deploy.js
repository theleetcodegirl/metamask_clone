const fs = require("fs");
const path = require("path");
const { ethers, artifacts } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy PaymentToken (ERC20)
  const PaymentToken = await ethers.getContractFactory("PaymentToken");
  const paymentToken = await PaymentToken.deploy();
  await paymentToken.waitForDeployment();
  const paymentTokenAddress = await paymentToken.getAddress();
  console.log("PaymentToken deployed to:", paymentTokenAddress);

  // Deploy PaymentReceipt (ERC721)
  const PaymentReceipt = await ethers.getContractFactory("PaymentReceipt");
  const paymentReceipt = await PaymentReceipt.deploy(deployer.address);
  await paymentReceipt.waitForDeployment();
  const paymentReceiptAddress = await paymentReceipt.getAddress();
  console.log("PaymentReceipt deployed to:", paymentReceiptAddress);

  // Deploy PaymentGateway
  const uniswapRouterAddress= '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
  const PaymentGateway = await ethers.getContractFactory("PaymentGateway");
  const paymentGateway = await PaymentGateway.deploy(
    paymentTokenAddress,
    uniswapRouterAddress,
    paymentReceiptAddress,
    deployer.address, // Fee address
    100 // 1% fee (100 basis points)
  );
  await paymentGateway.waitForDeployment();
  const paymentGatewayAddress = await paymentGateway.getAddress();
  console.log("PaymentGateway deployed to:", paymentGatewayAddress);

  // Transfer PaymentReceipt ownership to PaymentGateway
  await paymentReceipt.transferOwnership(paymentGatewayAddress);

  // Save contract addresses and ABIs to frontend
  saveFrontendFiles({
    PaymentToken: paymentTokenAddress,
    PaymentReceipt: paymentReceiptAddress,
    PaymentGateway: paymentGatewayAddress,
  });
}

function saveFrontendFiles(contractAddresses) {
  const contractsDir = path.join(__dirname, "..", "frontend", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Save contract addresses
  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify(contractAddresses, null, 2)
  );

  // Save ABIs
  const contractNames = ["PaymentToken", "PaymentReceipt", "PaymentGateway"];
  contractNames.forEach((contract) => {
    const artifact = artifacts.readArtifactSync(contract);
    fs.writeFileSync(
      path.join(contractsDir, `${contract}.json`),
      JSON.stringify(artifact, null, 2)
    );
  });

  console.log("Contracts and ABIs saved to frontend/contracts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
