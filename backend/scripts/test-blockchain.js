// scripts/test-blockchain.js
// Script để test kết nối blockchain và Smart Contract
// Usage: node scripts/test-blockchain.js

import blockchainService from "../services/blockchainService.js";
import { generateRecipeHash } from "../utils/hashUtils.js";

async function testBlockchain() {
  console.log("🧪 Testing Blockchain Connection...\n");

  try {
    // Test 1: Check connection
    console.log("1️⃣ Testing Ganache connection...");
    const connectionResult = await blockchainService.checkConnection();

    if (connectionResult.success) {
      console.log("   ✅ Connected to Ganache");
    } else {
      console.log("   ❌ Connection failed:", connectionResult.error);
      console.log("\n📝 Make sure:");
      console.log("   - Ganache is running (GUI: port 7545, CLI: port 8545)");
      console.log(
        "   - GANACHE_URL in .env is correct (http://127.0.0.1:7545)"
      );
      return;
    }

    // Test 2: Initialize blockchain
    console.log("\n2️⃣ Initializing blockchain service...");
    const initResult = await blockchainService.initializeBlockchain();

    if (initResult.success) {
      console.log("   ✅ Blockchain service initialized");
      console.log("   📍 Account:", initResult.account);
    } else {
      console.log(
        "   ❌ Initialization failed:",
        initResult.error || initResult.errors
      );
      console.log("\n📝 Check your .env file:");
      console.log(
        "   - GANACHE_URL=http://127.0.0.1:7545 (or your Ganache port)"
      );
      console.log("   - GANACHE_PRIVATE_KEY=0x... (get from Ganache UI)");
      if (
        initResult.errors?.some((e) => e.includes("RECIPE_REGISTRY_ADDRESS"))
      ) {
        console.log(
          "   - RECIPE_REGISTRY_ADDRESS=0x... (optional for connection test)"
        );
      }
      return;
    }

    // Test 3: Generate test hash
    console.log("\n3️⃣ Testing hash generation...");
    const testRecipe = {
      title: "Test Recipe",
      summary: "This is a test recipe",
      content: "Test content",
      ingredients: [{ name: "Test ingredient", amount: "1", unit: "cup" }],
      steps: [{ order: 1, description: "Test step", duration: 10 }],
      tags: ["test"],
      category: "test",
      prepTime: 10,
      cookTime: 20,
      servings: 2,
    };

    const hash = generateRecipeHash(testRecipe);
    console.log("   ✅ Hash generated:", hash);

    // Test 4: Verify contract (if address is set)
    console.log("\n4️⃣ Testing contract verification...");
    const verifyResult = await blockchainService.verifyRecipeHash(hash);

    if (verifyResult.success) {
      if (verifyResult.exists) {
        console.log("   ✅ Hash exists on blockchain");
        console.log("   📍 Author:", verifyResult.author);
        console.log("   🕐 Timestamp:", verifyResult.timestamp);
      } else {
        console.log(
          "   ℹ️  Hash not found on blockchain (this is normal for new hash)"
        );
      }
    } else {
      if (
        verifyResult.error === "Contract not deployed yet" ||
        verifyResult.error?.includes("Contract instance not initialized")
      ) {
        console.log("   ℹ️  Contract not deployed yet (this is expected)");
        console.log("   💡 Deploy contract to enable verification");
      } else {
        console.log("   ⚠️  Verification failed:", verifyResult.error);
      }
    }

    // Test 5: Register hash (optional - only if you want to test)
    console.log("\n5️⃣ Testing hash registration...");
    console.log(
      "   ℹ️  Skipping registration test (use actual recipe creation to test)"
    );
    console.log("   💡 To test registration:");
    console.log("      - Create a recipe via API with MetaMask connected");
    console.log("      - Check if transactionHash is saved in recipe");

    console.log("\n✅ All tests completed!");
    console.log("\n📋 Summary:");
    console.log("   - Ganache connection: OK");
    console.log("   - Blockchain service: OK");
    console.log("   - Hash generation: OK");
    console.log(
      "   - Contract verification: " +
        (verifyResult.success ? "OK" : "Not configured")
    );
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Run tests
testBlockchain();
