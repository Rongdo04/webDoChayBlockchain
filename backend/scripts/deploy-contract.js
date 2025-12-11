// scripts/deploy-contract.js
// Script để deploy Smart Contract lên Ganache
// Usage: node scripts/deploy-contract.js

import { Web3 } from "web3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đọc contract bytecode (sẽ được generate sau khi compile)
// Nếu chưa có, script sẽ hướng dẫn compile
async function deployContract() {
  try {
    console.log("Starting contract deployment...\n");

    // Kiểm tra Ganache connection
    const ganacheUrl = process.env.GANACHE_URL || "http://localhost:8545";
    const privateKey = process.env.GANACHE_PRIVATE_KEY;

    if (!privateKey) {
      console.error("❌ Error: GANACHE_PRIVATE_KEY not found in .env file");
      console.log("\n📝 Please add to .env file:");
      console.log(
        "   GANACHE_PRIVATE_KEY=0x... (get from Ganache UI > Accounts tab)"
      );
      process.exit(1);
    }

    const web3 = new Web3(ganacheUrl);

    // Kiểm tra kết nối
    try {
      const isListening = await web3.eth.net.isListening();
      if (!isListening) {
        throw new Error("Cannot connect to Ganache");
      }
      console.log("✅ Connected to Ganache at", ganacheUrl);
    } catch (error) {
      console.error("❌ Error: Cannot connect to Ganache");
      console.log("\n📝 Please make sure:");
      console.log("   1. Ganache is running on port 8545");
      console.log("   2. GANACHE_URL in .env is correct");
      process.exit(1);
    }

    // Lấy account từ private key
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    console.log("✅ Using account:", account.address);

    // Lấy balance
    const balance = await web3.eth.getBalance(account.address);
    console.log(
      "💰 Account balance:",
      web3.utils.fromWei(balance, "ether"),
      "ETH\n"
    );

    // Đọc contract ABI và bytecode
    // Note: Bytecode cần được compile từ Solidity
    // Có thể dùng Remix IDE hoặc solc compiler
    const contractPath = path.join(
      __dirname,
      "../contracts/RecipeRegistry.sol"
    );

    if (!fs.existsSync(contractPath)) {
      console.error("❌ Contract file not found:", contractPath);
      process.exit(1);
    }

    console.log("⚠️  Note: This script requires compiled bytecode.");
    console.log("📝 To compile the contract:");
    console.log("   1. Use Remix IDE (https://remix.ethereum.org/)");
    console.log("   2. Copy RecipeRegistry.sol to Remix");
    console.log("   3. Compile and copy the bytecode");
    console.log("   4. Or use solc compiler: npm install -g solc");
    console.log(
      "\n💡 Alternative: Deploy via Remix IDE and copy the contract address to .env"
    );
    console.log("   RECIPE_REGISTRY_ADDRESS=0x...\n");

    // Nếu có bytecode trong file riêng, có thể đọc và deploy
    const bytecodePath = path.join(
      __dirname,
      "../contracts/RecipeRegistry.bytecode"
    );

    if (fs.existsSync(bytecodePath)) {
      const bytecode = fs.readFileSync(bytecodePath, "utf8").trim();
      const contractABI = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "../contracts/RecipeRegistry.abi.json"),
          "utf8"
        )
      );

      console.log("📦 Deploying contract...");

      // Tạo contract instance
      const contract = new web3.eth.Contract(contractABI);

      // Deploy
      const deployTx = contract.deploy({
        data: bytecode,
      });

      // Estimate gas
      const gasEstimate = await deployTx.estimateGas();
      console.log("⛽ Estimated gas:", gasEstimate);

      // Send transaction
      const deployedContract = await deployTx.send({
        from: account.address,
        gas: gasEstimate,
      });

      console.log("\n✅ Contract deployed successfully!");
      console.log("📍 Contract Address:", deployedContract.options.address);
      console.log(
        "📝 Transaction Hash:",
        deployedContract.options.transactionHash
      );

      // Lưu address vào .env
      const envPath = path.join(__dirname, "../.env");
      let envContent = "";

      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8");
      }

      // Update hoặc thêm RECIPE_REGISTRY_ADDRESS
      if (envContent.includes("RECIPE_REGISTRY_ADDRESS")) {
        envContent = envContent.replace(
          /RECIPE_REGISTRY_ADDRESS=.*/,
          `RECIPE_REGISTRY_ADDRESS=${deployedContract.options.address}`
        );
      } else {
        envContent += `\nRECIPE_REGISTRY_ADDRESS=${deployedContract.options.address}\n`;
      }

      fs.writeFileSync(envPath, envContent);
      console.log("\n✅ Contract address saved to .env file");

      console.log("\n📋 Next steps:");
      console.log("   1. Restart your backend server");
      console.log("   2. Test by creating a recipe with MetaMask connected");
    } else {
      console.log(
        "ℹ️  Bytecode file not found. Please compile the contract first."
      );
      console.log("   Expected location:", bytecodePath);
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run deployment
deployContract();
