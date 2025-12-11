// config/blockchain.js
import dotenv from "dotenv";

dotenv.config();

/**
 * Cấu hình kết nối blockchain (Ganache)
 *
 * Lưu ý:
 * - Ganache GUI chạy trên port 7545 (mặc định)
 * - Ganache CLI chạy trên port 8545
 * - Lấy private key từ Ganache UI (Accounts tab)
 * - Contract address sẽ được lưu sau khi deploy
 */

export const blockchainConfig = {
  // URL kết nối Ganache (Ganache GUI: 7545, Ganache CLI: 8545)
  ganacheUrl: process.env.GANACHE_URL || "http://127.0.0.1:7545",

  // Network ID của Ganache (mặc định là 5777)
  networkId: process.env.GANACHE_NETWORK_ID || 5777,

  // Private key của account dùng để deploy và gửi transaction
  // Lấy từ Ganache UI > Accounts tab > Key icon
  // Lưu trong .env file: GANACHE_PRIVATE_KEY=0x...
  privateKey: process.env.GANACHE_PRIVATE_KEY || "",

  // Contract address (sẽ được set sau khi deploy)
  // Lưu trong .env file: RECIPE_REGISTRY_ADDRESS=0x...
  contractAddress: process.env.RECIPE_REGISTRY_ADDRESS || "",

  // Contract ABI (sẽ được generate sau khi compile)
  // Hoặc copy từ Remix IDE sau khi compile
  contractABI: [
    {
      inputs: [
        { internalType: "string", name: "hash", type: "string" },
        { internalType: "address", name: "author", type: "address" },
      ],
      name: "registerRecipe",
      outputs: [{ internalType: "bool", name: "success", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "string", name: "hash", type: "string" }],
      name: "verifyRecipe",
      outputs: [
        { internalType: "bool", name: "exists", type: "bool" },
        { internalType: "address", name: "author", type: "address" },
        { internalType: "uint256", name: "timestamp", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "string", name: "oldHash", type: "string" },
        { internalType: "string", name: "newHash", type: "string" },
        { internalType: "address", name: "author", type: "address" },
      ],
      name: "updateRecipe",
      outputs: [{ internalType: "bool", name: "success", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "string", name: "hash", type: "string" },
        {
          indexed: true,
          internalType: "address",
          name: "author",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "blockNumber",
          type: "uint256",
        },
      ],
      name: "RecipeRegistered",
      type: "event",
    },
  ],

  // Gas limit cho transaction (Ganache không giới hạn, nhưng set để an toàn)
  gasLimit: 300000,

  // Gas price (Ganache không cần, nhưng set để tương thích)
  gasPrice: "20000000000", // 20 gwei
};

/**
 * Kiểm tra cấu hình blockchain có đầy đủ không
 * @param {boolean} requireContract - Nếu true, yêu cầu contract address (mặc định: false)
 */
export function validateBlockchainConfig(requireContract = false) {
  const errors = [];
  const warnings = [];

  if (!blockchainConfig.ganacheUrl) {
    errors.push("GANACHE_URL is not set");
  }

  if (!blockchainConfig.privateKey) {
    errors.push("GANACHE_PRIVATE_KEY is not set in .env file");
  }

  if (!blockchainConfig.contractAddress) {
    if (requireContract) {
      errors.push(
        "RECIPE_REGISTRY_ADDRESS is not set. Contract needs to be deployed first."
      );
    } else {
      warnings.push(
        "RECIPE_REGISTRY_ADDRESS is not set. Contract functions will not work until deployed."
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export default blockchainConfig;
