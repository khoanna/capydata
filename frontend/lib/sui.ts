import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

// Define supported Sui networks
const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        explorerUrl: "https://suiscan.xyz/mainnet",
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        explorerUrl: "https://suiscan.xyz/testnet",
      },
    },
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        explorerUrl: "https://suiscan.xyz/devnet",
      },
    },
    localnet: {
      url: getFullnodeUrl("localnet"),
      variables: {
        explorerUrl: "http://localhost:9001",
      },
    },
  });

export { networkConfig, useNetworkVariable, useNetworkVariables };

// SUI Token configuration
export const SUI_TOKEN = {
  symbol: "SUI",
  decimals: 9,
  // Native SUI token type
  coinType: "0x2::sui::SUI",
};

// Helper to format SUI amount
export const formatSUI = (amount: bigint | number, decimals: number = 9): string => {
  const value = typeof amount === "bigint" ? Number(amount) : amount;
  return (value / Math.pow(10, decimals)).toFixed(4);
};

// Helper to get explorer URL for transaction
export const getTxExplorerUrl = (txHash: string, network: string = "testnet"): string => {
  const explorerUrls: Record<string, string> = {
    mainnet: "https://suiscan.xyz/mainnet/tx",
    testnet: "https://suiscan.xyz/testnet/tx",
    devnet: "https://suiscan.xyz/devnet/tx",
    localnet: "http://localhost:9001/tx",
  };
  return `${explorerUrls[network] || explorerUrls.testnet}/${txHash}`;
};

// Helper to get explorer URL for address
export const getAddressExplorerUrl = (
  address: string,
  network: string = "testnet"
): string => {
  const explorerUrls: Record<string, string> = {
    mainnet: "https://suiscan.xyz/mainnet/account",
    testnet: "https://suiscan.xyz/testnet/account",
    devnet: "https://suiscan.xyz/devnet/account",
    localnet: "http://localhost:9001/account",
  };
  return `${explorerUrls[network] || explorerUrls.testnet}/${address}`;
};
