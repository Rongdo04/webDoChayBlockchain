// services/blockchainService.js
import { Web3 } from "web3";
import blockchainConfig, {
  validateBlockchainConfig,
} from "../config/blockchain.js";

let web3 = null;
let contract = null;
let contractInstance = null;

/**
 * Khởi tạo kết nối Web3 và Smart Contract
 */
async function initializeBlockchain() {
  try {
    // Kiểm tra cấu hình (không bắt buộc contract address để test connection)
    const validation = validateBlockchainConfig(false);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    // Khởi tạo Web3 instance
    web3 = new Web3(blockchainConfig.ganacheUrl);

    // Kiểm tra kết nối
    const isConnected = await web3.eth.net.isListening();
    if (!isConnected) {
      throw new Error(
        "Cannot connect to Ganache. Make sure Ganache is running on port 8545"
      );
    }

    // Lấy account từ private key
    const account = web3.eth.accounts.privateKeyToAccount(
      blockchainConfig.privateKey
    );
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    // Khởi tạo contract instance
    if (blockchainConfig.contractAddress) {
      contract = new web3.eth.Contract(
        blockchainConfig.contractABI,
        blockchainConfig.contractAddress
      );
      contractInstance = contract;
    }

    return { success: true, account: account.address };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Đăng ký hash công thức lên blockchain
 * @param {string} recipeHash - SHA256 hash của công thức
 * @param {string} authorWalletAddress - Địa chỉ ví của tác giả
 * @returns {Promise<Object>} Transaction result với transactionHash, blockNumber, etc.
 */
export async function registerRecipeHash(recipeHash, authorWalletAddress) {
  try {
    // Khởi tạo nếu chưa có
    if (!web3 || !contractInstance) {
      const initResult = await initializeBlockchain();
      if (!initResult.success) {
        throw new Error(
          `Blockchain initialization failed: ${
            initResult.error || initResult.errors?.join(", ")
          }`
        );
      }
    }

    // Kiểm tra contract address (bắt buộc khi register)
    if (!blockchainConfig.contractAddress) {
      throw new Error(
        "Contract address not set. Please deploy contract first and set RECIPE_REGISTRY_ADDRESS in .env"
      );
    }

    if (!contractInstance) {
      throw new Error(
        "Contract instance not initialized. Please deploy contract first."
      );
    }

    // Validate inputs
    if (!recipeHash || typeof recipeHash !== "string") {
      throw new Error("Recipe hash is required and must be a string");
    }

    if (!authorWalletAddress || !web3.utils.isAddress(authorWalletAddress)) {
      throw new Error("Valid author wallet address is required");
    }

    // Gọi smart contract function
    const method = contractInstance.methods.registerRecipe(
      recipeHash,
      authorWalletAddress
    );

    // Estimate gas (this will fail if transaction would revert)
    let gasEstimate;
    try {
      gasEstimate = await method.estimateGas({
        from: web3.eth.defaultAccount,
      });
    } catch (estimateError) {
      // If gas estimation fails, the transaction would revert
      // Extract error message - check cause.message first (Web3 v4 format)
      // The actual revert message is in error.cause.message
      let errorMessage = estimateError.message || "";

      // Check error.cause.message (where the actual revert message is)
      if (estimateError.cause?.message) {
        errorMessage = estimateError.cause.message;
      } else if (estimateError.reason) {
        errorMessage = estimateError.reason;
      } else if (estimateError.data?.message) {
        errorMessage = estimateError.data.message;
      } else if (estimateError.data) {
        if (typeof estimateError.data === "string") {
          errorMessage = estimateError.data;
        } else if (estimateError.data.toString) {
          errorMessage = estimateError.data.toString();
        }
      }

      throw new Error(errorMessage);
    }

    // Gửi transaction
    const tx = await method.send({
      from: web3.eth.defaultAccount,
      gas: gasEstimate,
      gasPrice: blockchainConfig.gasPrice,
    });

    // Đợi transaction được confirm
    const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);

    if (!receipt || !receipt.status) {
      throw new Error("Transaction failed or was reverted");
    }

    return {
      success: true,
      transactionHash: tx.transactionHash,
      blockNumber: Number(receipt.blockNumber), // Convert BigInt to Number for MongoDB
      timestamp: new Date(),
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    // Extract error message from various error formats
    // IMPORTANT: Check error.cause.message first (Web3 v4 format)
    let errorMessage = error.message || "";

    // Check error.cause.message (where the actual revert message is)
    if (error.cause?.message) {
      errorMessage = error.cause.message;
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.data?.message) {
      errorMessage = error.data.message;
    } else if (error.data?.reason) {
      errorMessage = error.data.reason;
    } else if (error.data) {
      // Try to extract from error.data if it's a string
      if (typeof error.data === "string") {
        errorMessage = error.data;
      } else if (error.data.toString) {
        errorMessage = error.data.toString();
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    // Graceful degradation: return error but don't throw
    return {
      success: false,
      error: errorMessage,
      // Vẫn trả về để caller có thể xử lý
    };
  }
}

/**
 * Xác minh hash công thức trên blockchain
 * @param {string} recipeHash - Hash cần kiểm tra
 * @returns {Promise<Object>} Verification result
 */
export async function verifyRecipeHash(recipeHash) {
  try {
    // Kiểm tra contract address trước
    if (!blockchainConfig.contractAddress) {
      return {
        success: false,
        error: "Contract not deployed yet",
        exists: false,
        message: "Contract address not set. Please deploy contract first.",
      };
    }

    // Khởi tạo nếu chưa có
    if (!web3 || !contractInstance) {
      const initResult = await initializeBlockchain();
      if (!initResult.success) {
        return {
          success: false,
          error: initResult.error || initResult.errors?.join(", "),
          exists: false,
        };
      }
    }

    if (!contractInstance) {
      return {
        success: false,
        error: "Contract instance not initialized",
        exists: false,
        message:
          "Please deploy contract and set RECIPE_REGISTRY_ADDRESS in .env",
      };
    }

    if (!recipeHash || typeof recipeHash !== "string") {
      return {
        success: false,
        error: "Recipe hash is required",
        exists: false,
      };
    }

    // Gọi view function (không tốn gas)
    const result = await contractInstance.methods
      .verifyRecipe(recipeHash)
      .call();

    return {
      success: true,
      exists: result.exists,
      author: result.author,
      timestamp: result.timestamp
        ? new Date(Number(result.timestamp) * 1000)
        : null,
      blockTimestamp: result.timestamp,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      exists: false,
    };
  }
}

/**
 * Cập nhật công thức (tạo version mới với hash mới)
 * @param {string} oldHash - Hash cũ
 * @param {string} newHash - Hash mới
 * @param {string} authorWalletAddress - Địa chỉ ví của tác giả
 * @returns {Promise<Object>} Transaction result
 */
export async function updateRecipeHash(oldHash, newHash, authorWalletAddress) {
  try {
    // Khởi tạo nếu chưa có
    if (!web3 || !contractInstance) {
      const initResult = await initializeBlockchain();
      if (!initResult.success) {
        throw new Error(
          `Blockchain initialization failed: ${
            initResult.error || initResult.errors?.join(", ")
          }`
        );
      }
    }

    if (!contractInstance) {
      throw new Error("Contract instance not initialized");
    }

    // Validate inputs
    if (!oldHash || !newHash) {
      throw new Error("Both old and new hash are required");
    }

    if (!authorWalletAddress || !web3.utils.isAddress(authorWalletAddress)) {
      throw new Error("Valid author wallet address is required");
    }

    // Gọi smart contract function
    const method = contractInstance.methods.updateRecipe(
      oldHash,
      newHash,
      authorWalletAddress
    );

    // Estimate gas (this will fail if transaction would revert)
    let gasEstimate;
    try {
      gasEstimate = await method.estimateGas({
        from: web3.eth.defaultAccount,
      });
    } catch (estimateError) {
      // If gas estimation fails, the transaction would revert
      // Extract error message - check cause.message first (Web3 v4 format)
      // The actual revert message is in error.cause.message
      let errorMessage = estimateError.message || "";

      // Check error.cause.message (where the actual revert message is)
      if (estimateError.cause?.message) {
        errorMessage = estimateError.cause.message;
      } else if (estimateError.reason) {
        errorMessage = estimateError.reason;
      } else if (estimateError.data?.message) {
        errorMessage = estimateError.data.message;
      } else if (estimateError.data) {
        if (typeof estimateError.data === "string") {
          errorMessage = estimateError.data;
        } else if (estimateError.data.toString) {
          errorMessage = estimateError.data.toString();
        }
      }

      throw new Error(errorMessage);
    }

    // Gửi transaction
    const tx = await method.send({
      from: web3.eth.defaultAccount,
      gas: gasEstimate,
      gasPrice: blockchainConfig.gasPrice,
    });

    // Đợi transaction được confirm
    const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);

    if (!receipt || !receipt.status) {
      throw new Error("Transaction failed or was reverted");
    }

    return {
      success: true,
      transactionHash: tx.transactionHash,
      blockNumber: Number(receipt.blockNumber), // Convert BigInt to Number for MongoDB
      timestamp: new Date(),
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    // Extract error message from various error formats
    // IMPORTANT: Check error.cause.message first (Web3 v4 format)
    let errorMessage = error.message || "";

    // Check error.cause.message (where the actual revert message is)
    if (error.cause?.message) {
      errorMessage = error.cause.message;
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.data?.message) {
      errorMessage = error.data.message;
    } else if (error.data?.reason) {
      errorMessage = error.data.reason;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    // Graceful degradation: return error but don't throw
    return {
      success: false,
      error: errorMessage,
      // Vẫn trả về để caller có thể xử lý
    };
  }
}

/**
 * Lấy thông tin chi tiết của công thức từ blockchain
 * @param {string} recipeHash - Hash của công thức
 * @returns {Promise<Object>} Recipe info
 */
export async function getRecipeInfo(recipeHash) {
  try {
    // Kiểm tra contract address trước
    if (!blockchainConfig.contractAddress) {
      return {
        success: false,
        error: "Contract not deployed yet",
        exists: false,
        message: "Contract address not set. Please deploy contract first.",
      };
    }

    if (!web3 || !contractInstance) {
      const initResult = await initializeBlockchain();
      if (!initResult.success) {
        return {
          success: false,
          error: initResult.error || initResult.errors?.join(", "),
          exists: false,
        };
      }
    }

    if (!contractInstance) {
      return {
        success: false,
        error: "Contract instance not initialized",
        exists: false,
        message:
          "Please deploy contract and set RECIPE_REGISTRY_ADDRESS in .env",
      };
    }

    const result = await contractInstance.methods
      .getRecipeInfo(recipeHash)
      .call();

    return {
      success: true,
      exists: result.exists,
      author: result.author,
      timestamp: result.timestamp
        ? new Date(Number(result.timestamp) * 1000)
        : null,
      blockTimestamp: result.timestamp,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      exists: false,
    };
  }
}

/**
 * Kiểm tra kết nối blockchain (chỉ test connection, không cần contract)
 */
export async function checkConnection() {
  try {
    const ganacheUrl = blockchainConfig.ganacheUrl;

    if (!ganacheUrl) {
      return {
        success: false,
        error: "GANACHE_URL is not set in .env",
      };
    }

    // Tạo Web3 instance tạm để test connection
    const testWeb3 = new Web3(ganacheUrl);
    const isConnected = await testWeb3.eth.net.isListening();

    if (!isConnected) {
      return {
        success: false,
        error: `Cannot connect to Ganache at ${ganacheUrl}. Make sure Ganache is running.`,
      };
    }

    // Lấy network ID
    const networkId = await testWeb3.eth.net.getId();

    return {
      success: true,
      connected: true,
      url: ganacheUrl,
      networkId: networkId.toString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Unknown error connecting to Ganache",
    };
  }
}

// Khởi tạo khi module được load (optional - có thể lazy init)

export default {
  registerRecipeHash,
  verifyRecipeHash,
  updateRecipeHash,
  getRecipeInfo,
  checkConnection,
  initializeBlockchain,
};
