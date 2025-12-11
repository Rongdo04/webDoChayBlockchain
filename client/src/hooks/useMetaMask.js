// hooks/useMetaMask.js
import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook để quản lý kết nối MetaMask
 * @returns {Object} MetaMask state và functions
 */
export function useMetaMask() {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Kiểm tra MetaMask có được cài đặt không
  const isMetaMaskInstalled = typeof window !== "undefined" && typeof window.ethereum !== "undefined";

  // Kiểm tra kết nối hiện tại khi component mount
  useEffect(() => {
    if (isMetaMaskInstalled) {
      checkConnection();
      // Lắng nghe thay đổi account
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      // Lắng nghe thay đổi network
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (isMetaMaskInstalled) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  // Xử lý khi account thay đổi
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      setAccount(null);
      setIsConnected(false);
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
    }
    setError(null);
  }, []);

  // Xử lý khi network thay đổi
  const handleChainChanged = useCallback((chainId) => {
    setChainId(chainId);
    // Reload page để đảm bảo state đồng bộ
    window.location.reload();
  }, []);

  // Kiểm tra kết nối hiện tại
  const checkConnection = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      }

      const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(currentChainId);
    } catch (error) {
      console.error("Error checking MetaMask connection:", error);
      setError(error.message);
    }
  }, [isMetaMaskInstalled]);

  // Kết nối MetaMask
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      const errorMsg = "MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask extension.";
      setError(errorMsg);
      // Mở link tải MetaMask
      window.open("https://metamask.io/download/", "_blank");
      return { success: false, error: errorMsg };
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Yêu cầu kết nối
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);

        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
        setChainId(currentChainId);

        return { success: true, account: accounts[0] };
      } else {
        throw new Error("Không có account nào được chọn");
      }
    } catch (error) {
      let errorMessage = "Không thể kết nối MetaMask";
      
      if (error.code === 4001) {
        errorMessage = "Người dùng đã từ chối kết nối";
      } else if (error.code === -32002) {
        errorMessage = "Yêu cầu kết nối đang chờ xử lý";
      } else {
        errorMessage = error.message || errorMessage;
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled]);

  // Ngắt kết nối (chỉ xóa state, không thể disconnect MetaMask programmatically)
  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
  }, []);

  // Chuyển đổi network (ví dụ: chuyển sang Ganache local network)
  const switchNetwork = useCallback(async (targetChainId = "0x539") => {
    // 0x539 = 1337 in decimal (Ganache default)
    if (!isMetaMaskInstalled) {
      return { success: false, error: "MetaMask chưa được cài đặt" };
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      });
      return { success: true };
    } catch (switchError) {
      // Nếu chain chưa được thêm vào MetaMask, thêm nó
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: targetChainId,
                chainName: "Ganache Local",
                rpcUrls: ["http://localhost:8545"],
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
              },
            ],
          });
          return { success: true };
        } catch (addError) {
          return { success: false, error: addError.message };
        }
      }
      return { success: false, error: switchError.message };
    }
  }, [isMetaMaskInstalled]);

  return {
    account,
    isConnected,
    isConnecting,
    isMetaMaskInstalled,
    error,
    chainId,
    connect,
    disconnect,
    switchNetwork,
    checkConnection,
  };
}

export default useMetaMask;

