/**
 * Utility functions for the CapyData marketplace
 */

// Truncate address (0x1234...5678)
export const truncateAddress = (address: string, chars = 4): string => {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

// Format price with token symbol
export const formatPrice = (
  amount: number,
  token: string = "CAPY",
  decimals: number = 2
): string => {
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${token}`;
};

// Convert CAPY to USD (mock exchange rate)
export const capyToUSD = (capy: number): number => {
  const CAPY_USD_RATE = 1.337; // Mock rate
  return capy * CAPY_USD_RATE;
};

// Format USD
export const formatUSD = (amount: number): string => {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Generate random color from string (for generative art)
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 60%)`;
};

// Generate gradient from DID
export const didToGradient = (did: string): string => {
  const color1 = stringToColor(did);
  const color2 = stringToColor(did.split("").reverse().join(""));
  return `linear-gradient(135deg, ${color1}, ${color2})`;
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// Format date
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format time ago
export const timeAgo = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    }
  }

  return "Just now";
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};

// Generate mock transaction hash
export const generateTxHash = (): string => {
  return `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("")}`;
};

// Sleep utility for mock delays
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Validate DID format
export const isValidDID = (did: string): boolean => {
  return /^did:op:0x[a-fA-F0-9]{64}$/.test(did);
};

// Generate mock DID
export const generateDID = (): string => {
  const hex = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return `did:op:0x${hex}`;
};

export const suiToMist = (sui: number): number => {
  return (Math.floor(sui * 1_000_000_000));
}

export const mistToSui = (mist: number): number => {
  return mist / 1_000_000_000;
}