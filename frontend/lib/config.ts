/**
 * Application configuration
 * All environment variables and constants in one place
 */

export const config = {
  // Sui Network
  network: (process.env.NEXT_PUBLIC_SUI_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet') || 'testnet',

  // Smart Contract Package IDs
  marketplacePackageId: process.env.NEXT_PUBLIC_MARKETPLACE_PACKAGE_ID || '0x0',
  sealPackageId: process.env.NEXT_PUBLIC_SEAL_PACKAGE_ID || '0x0',

  // Seal Key Servers
  sealKeyServers: parseSealKeyServers(process.env.NEXT_PUBLIC_SEAL_KEY_SERVERS),

  // Walrus
  walrus: {
    epochs: parseInt(process.env.NEXT_PUBLIC_WALRUS_EPOCHS || '100'),
    aggregatorUrl: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space',
  },

  // Application
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'CapyData',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
} as const;

/**
 * Parse Seal key server configuration from env string
 * Format: "objectId1,weight1;objectId2,weight2"
 */
function parseSealKeyServers(envVar?: string): Array<{ objectId: string; weight: number }> {
  if (!envVar) return [];

  return envVar.split(';').map((server) => {
    const [objectId, weight] = server.split(',');
    return {
      objectId: objectId.trim(),
      weight: parseInt(weight.trim()) || 1,
    };
  });
}

/**
 * Validate configuration
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.marketplacePackageId === '0x0') {
    errors.push('NEXT_PUBLIC_MARKETPLACE_PACKAGE_ID not configured');
  }

  if (config.sealPackageId === '0x0') {
    errors.push('NEXT_PUBLIC_SEAL_PACKAGE_ID not configured');
  }

  if (config.sealKeyServers.length === 0) {
    errors.push('NEXT_PUBLIC_SEAL_KEY_SERVERS not configured');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
