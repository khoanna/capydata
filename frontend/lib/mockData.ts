import { generateDID } from "./utils";

export type AssetType = "dataset" | "algorithm" | "stream" | "storage";
export type PriceModel = "free" | "fixed" | "dynamic";
export type Chain = "polygon" | "ethereum" | "bsc" | "moonriver" | "sui";

export interface Asset {
  id: string;
  did: string;
  title: string;
  description: string;
  type: AssetType;
  chain: Chain;
  priceModel: PriceModel;
  price: number; // in CAPY
  owner: {
    address: string;
    ens?: string;
    avatar?: string;
  };
  tags: string[];
  sales: number;
  tvl?: number; // Total Value Locked (for dynamic pricing)
  fileSize?: string;
  lastUpdated: string;
  createdAt: string;
  featured?: boolean;
  c2dEnabled?: boolean;
  sampleAvailable?: boolean;
}

export const mockAssets: Asset[] = [
  {
    id: "1",
    did: generateDID(),
    title: "Global Weather Patterns 2024",
    description:
      "Comprehensive weather data from 10,000+ stations worldwide. Real-time temperature, precipitation, wind speed, and pressure readings.",
    type: "dataset",
    chain: "polygon",
    priceModel: "fixed",
    price: 50,
    owner: {
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      ens: "weatherdao.eth",
    },
    tags: ["Climate", "Weather", "IoT", "Real-time"],
    sales: 243,
    fileSize: "15.3 GB",
    lastUpdated: "2024-11-15",
    createdAt: "2024-01-10",
    featured: true,
    c2dEnabled: true,
    sampleAvailable: true,
  },
  {
    id: "2",
    did: generateDID(),
    title: "DeFi Transaction Analytics",
    description:
      "Anonymized DEX transaction data across major protocols. Includes swap volumes, liquidity changes, and price impacts.",
    type: "dataset",
    chain: "ethereum",
    priceModel: "dynamic",
    price: 125,
    tvl: 12500,
    owner: {
      address: "0x8e23Ee67d1332aD560396042c72f32d0bcC4c4f",
    },
    tags: ["Finance", "DeFi", "Analytics"],
    sales: 89,
    fileSize: "8.7 GB",
    lastUpdated: "2024-11-18",
    createdAt: "2024-03-22",
    featured: true,
    c2dEnabled: false,
    sampleAvailable: true,
  },
  {
    id: "3",
    did: generateDID(),
    title: "Medical Imaging - Chest X-Rays",
    description:
      "Anonymized chest X-ray dataset with 50,000+ images labeled for pneumonia detection. Suitable for ML training.",
    type: "dataset",
    chain: "polygon",
    priceModel: "fixed",
    price: 200,
    owner: {
      address: "0x91c987bf62D25945dB517BDAa840A6c661374402",
      ens: "meddata.eth",
    },
    tags: ["Healthcare", "AI/ML", "Medical"],
    sales: 156,
    fileSize: "42.1 GB",
    lastUpdated: "2024-10-30",
    createdAt: "2023-12-05",
    c2dEnabled: true,
    sampleAvailable: false,
  },
  {
    id: "4",
    did: generateDID(),
    title: "Urban Traffic Flow Analysis",
    description:
      "Real-time traffic sensor data from 500+ intersections in major cities. Includes vehicle counts, speeds, and congestion metrics.",
    type: "stream",
    chain: "sui",
    priceModel: "fixed",
    price: 30,
    owner: {
      address: "0xd59a5ce2589a94C7e23f82e99b7C4D5e1f5B8e3a",
    },
    tags: ["Transportation", "IoT", "Smart Cities"],
    sales: 67,
    lastUpdated: "2024-11-19",
    createdAt: "2024-06-15",
    c2dEnabled: false,
    sampleAvailable: true,
  },
  {
    id: "5",
    did: generateDID(),
    title: "Sentiment Analysis Algorithm",
    description:
      "Pre-trained transformer model for financial news sentiment analysis. Achieves 94% accuracy on market data.",
    type: "algorithm",
    chain: "polygon",
    priceModel: "fixed",
    price: 80,
    owner: {
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      ens: "aimodels.eth",
    },
    tags: ["AI/ML", "NLP", "Finance"],
    sales: 201,
    fileSize: "1.2 GB",
    lastUpdated: "2024-11-10",
    createdAt: "2024-05-20",
    c2dEnabled: true,
    sampleAvailable: true,
  },
  {
    id: "6",
    did: generateDID(),
    title: "Cryptocurrency Price Feeds",
    description:
      "Live price data for 500+ cryptocurrencies from multiple exchanges. Updated every 30 seconds with OHLCV data.",
    type: "stream",
    chain: "ethereum",
    priceModel: "fixed",
    price: 25,
    owner: {
      address: "0x5e349b69a5E67A59D6e3b3c4F5e1c5f5a5e5a5e5",
    },
    tags: ["Finance", "Crypto", "Real-time"],
    sales: 412,
    lastUpdated: "2024-11-19",
    createdAt: "2024-02-14",
    featured: true,
    c2dEnabled: false,
    sampleAvailable: true,
  },
  {
    id: "7",
    did: generateDID(),
    title: "Social Media Engagement Metrics",
    description:
      "Aggregated social media data from public posts. Includes engagement rates, sentiment scores, and trending topics.",
    type: "dataset",
    chain: "bsc",
    priceModel: "free",
    price: 0,
    owner: {
      address: "0x9a5c8b8e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e",
    },
    tags: ["Social Media", "Analytics", "Marketing"],
    sales: 1024,
    fileSize: "3.8 GB",
    lastUpdated: "2024-11-12",
    createdAt: "2024-04-08",
    c2dEnabled: false,
    sampleAvailable: true,
  },
  {
    id: "8",
    did: generateDID(),
    title: "Genomic Sequence Database",
    description:
      "Anonymized human genomic sequences for rare disease research. Privacy-preserving compute-to-data enabled.",
    type: "dataset",
    chain: "polygon",
    priceModel: "fixed",
    price: 500,
    owner: {
      address: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      ens: "genomics.eth",
    },
    tags: ["Healthcare", "Genomics", "Research"],
    sales: 34,
    fileSize: "128 GB",
    lastUpdated: "2024-09-25",
    createdAt: "2023-11-11",
    c2dEnabled: true,
    sampleAvailable: false,
  },
  {
    id: "9",
    did: generateDID(),
    title: "Energy Grid Consumption Data",
    description:
      "Hourly energy consumption data from smart meters across residential and commercial properties.",
    type: "dataset",
    chain: "moonriver",
    priceModel: "dynamic",
    price: 60,
    tvl: 8400,
    owner: {
      address: "0xabcdef1234567890abcdef1234567890abcdef12",
    },
    tags: ["Energy", "IoT", "Sustainability"],
    sales: 78,
    fileSize: "5.2 GB",
    lastUpdated: "2024-11-05",
    createdAt: "2024-07-19",
    c2dEnabled: false,
    sampleAvailable: true,
  },
  {
    id: "10",
    did: generateDID(),
    title: "Satellite Imagery - Agriculture",
    description:
      "High-resolution satellite images of agricultural land with crop health indices (NDVI). Updated monthly.",
    type: "dataset",
    chain: "polygon",
    priceModel: "fixed",
    price: 150,
    owner: {
      address: "0x1234abcd5678efgh9012ijkl3456mnop7890qrst",
      ens: "agrisat.eth",
    },
    tags: ["Agriculture", "Satellite", "Remote Sensing"],
    sales: 92,
    fileSize: "67.5 GB",
    lastUpdated: "2024-11-01",
    createdAt: "2024-01-30",
    featured: true,
    c2dEnabled: true,
    sampleAvailable: true,
  },
];

// Featured datasets (for landing page)
export const featuredAssets = mockAssets.filter((asset) => asset.featured);

// Get asset by ID
export const getAssetById = (id: string): Asset | undefined => {
  return mockAssets.find((asset) => asset.id === id);
};

// Filter assets
export interface FilterOptions {
  chains?: Chain[];
  types?: AssetType[];
  priceModels?: PriceModel[];
  tags?: string[];
  search?: string;
}

export const filterAssets = (options: FilterOptions): Asset[] => {
  return mockAssets.filter((asset) => {
    if (options.chains && !options.chains.includes(asset.chain)) return false;
    if (options.types && !options.types.includes(asset.type)) return false;
    if (options.priceModels && !options.priceModels.includes(asset.priceModel))
      return false;
    if (
      options.tags &&
      !asset.tags.some((tag) => options.tags!.includes(tag))
    )
      return false;
    if (
      options.search &&
      !asset.title.toLowerCase().includes(options.search.toLowerCase()) &&
      !asset.description.toLowerCase().includes(options.search.toLowerCase())
    )
      return false;

    return true;
  });
};

// Get all unique tags
export const getAllTags = (): string[] => {
  const tags = new Set<string>();
  mockAssets.forEach((asset) => asset.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
};
