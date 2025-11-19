# **Web3 Data Marketplace: UI Component & Page Specification**

## **Executive Summary**

This specification outlines the required pages and granular components for a fully functional Web3 data marketplace. Unlike Web2 counterparts, these interfaces must handle cryptographic signing, wallet states, decentralized identity (DID) resolution, and multi-chain interactions.

The architecture assumes a hybrid stack:

- **Blockchain Layer:** Ethereum/Polygon (Settlement), Ocean/Streamr (Logic), Filecoin/IPFS (Storage).
- **Middleware:** The Graph (Indexing), Aquarius (Metadata).
- **Frontend:** React/Next.js with Web3 libraries (wagmi/ethers).

---

## **1. Global Navigation & Overlay Components**

*These components persist across all pages.*

### **1.1 The "Web3" Navbar**

- **Brand/Logo:** Links to Landing Page.
- **Primary Navigation:** "Marketplace," "Publish," "Community/DAO," "Developers."
- **Search Input (Global):** Quick access to datasets by keyword or DID.
- **Wallet Connect Module:**
- **State: Disconnected:** "Connect Wallet" button triggering a modal for MetaMask, WalletConnect, Coinbase Wallet.
- **State: Connected:** Displays abbreviated address (e.g., 0x12...89) and generated "Blockie" or ENS avatar.
- **Network Switcher:** Dropdown showing current chain (e.g., "Polygon Mainnet"). Visual warning (Red Icon) if connected to the wrong network.
- **Token Balance:** Small display of native gas token (MATIC/ETH) and protocol token (OCEAN/DATA) balances.

### **1.2 System Notifications (Toast)**

- **Transaction Status:** "Transaction Submitted (Pending)," "Transaction Confirmed," "Transaction Failed."
- **Action:** "View on Etherscan" link for every transaction.

---

## **2. Landing Page (The Trust Anchor)**

*Purpose: Bridge the gap between technical complexity and user utility, establishing trust via on-chain metrics.*

### **2.1 Hero Section**

- **Value Proposition:** "Monetize your Data Sovereignty."
- **Dual Call-to-Action (CTA):**
- *Primary:* "Explore Data" (leads to Marketplace).
- *Secondary:* "Start Selling" (leads to Publish Flow).
- **Dynamic Visual:** Abstract visualization of network nodes or data waves.1

### **2.2 Live Protocol Statistics (The Trust Dashboard)**

*Real-time data fetched from Subgraphs to prove liquidity and usage.*

- **Total Value Locked (TVL):** Sum of liquidity in all data pools (e.g., "$4.2M").
- **Data Assets Published:** Counter (e.g., "12,405 Datasets").
- **Total Exchange Volume:** Cumulative volume in USD.
- **Compute Jobs Run:** (Specific to Ocean/Acentrik) Number of privacy-preserving algorithms executed.2

### **2.3 Ecosystem & Validation**

- **Backers Grid:** Logos of VCs and Partners (e.g., "Powered by Polygon," "Audited by CertiK").
- **Top Publishers:** Carousel of verified entities (e.g., Mercedes-Benz, specialized DAOs) to signal enterprise adoption.3

---

## **3. Data Marketplace Page (Discovery Engine)**

*Purpose: Allow users to filter through thousands of decentralized assets.*

### **3.1 Sidebar Filters (Faceted Search)**

- **Chain Selector:** Checkboxes for multi-chain support (Eth, Polygon, BSC, Moonriver).
- **Asset Type:**
- *Dataset:* Static files (CSV, JSON, PDF).
- *Algorithm:* Docker images for Compute-to-Data.4
- *Stream:* Real-time feeds (Streamr integration).5
- *Storage:* Filecoin storage deals.6
- **Price Model:** "Free," "Fixed Price," "Dynamic (Liquidity Pool)."
- **Tags:** Folksonomy tags (e.g., "Finance," "Healthcare," "Climate").

### **3.2 Asset Grid (The Tiles)**

- **Asset Card Component:**
- **Thumbnail:** Generative art based on DID or custom uploaded image.7
- **Title:** Truncated title of the dataset.
- **Price Badge:** Price in Protocol Token (e.g., "50 OCEAN") + Fiat approximation (~$15.00).
- **Type Icon:** Visual indicator for Dataset vs. Algorithm vs. Stream.
- **Network Icon:** Small logo of the hosting chain (e.g., Polygon logo).
- **Usage Metric:** "150 Sales" or "TVL: $5k" to indicate popularity.

---

## **4. Item Detail Page (The Asset Terminal)**

*Purpose: Provide comprehensive metadata and the interface for rights purchase.*

### **4.1 Asset Header**

- **Title & Description:** Markdown-supported text area.
- **Owner Identity:** Link to Publisher Profile (showing ENS/Address).
- **Did (Decentralized ID):** Copyable string (e.g., did:op:0x...).
- **Provenance Graph:** Visual timeline of asset history (Minted -> Metadata Updated -> Purchased).

### **4.2 Data Sample / Inspector**

- **Static Data:** A blurred preview or a table showing the first 10 rows (Header + Sample).
- **Stream Data:** "Live Inspector" widget connecting to the WebSocket to show real-time messages flowing through.8

### **4.3 Financial & Action Module**

- **Price Information:**
- *Fixed:* Large display of price.
- *AMM:* Bonding curve chart showing price history.
- **Swap/Buy Widget:**
- **Input:** "You Pay" (e.g., USDC).
- **Output:** "You Receive" (1.0 Datatoken/Access).
- **Button:** "Swap" or "Buy Access."
- **Compute Action (If C2D enabled):**
- **Algorithm Selector:** Dropdown to choose a whitelisted algorithm to run on this data.
- **Start Job Button:** Triggers the compute orchestration.9

### **4.4 Filecoin Storage Specifics (If applicable)**

- **Miner Info:** ID of the Storage Provider.
- **Deal Params:** Verified Deal status, Price per Epoch, Collateral.10

---

## **5. Payment & Checkout Modal**

*Purpose: Handle the complex multi-step signing process.*

This is often a modal overlay rather than a separate page to preserve context.

### **5.1 Step 1: Allowance (Approve)**

- **Explanation:** "You must allow the marketplace contract to spend your OCEAN."
- **Tx Status:** Spinner waiting for Approve transaction to be mined.

### **5.2 Step 2: Purchase (Swap)**

- **Order Summary:**
- Item: "Weather Data 2023"
- Price: 50 OCEAN
- Network Fee (Gas): ~0.01 MATIC
- **Total:** 50 OCEAN + Gas.
- **Confirm Button:** Triggers wallet signature.

### **5.3 Step 3: Receipt**

- **Success Message:** "Access Token added to wallet."
- **Next Action:** "Download Now" or "View in Profile."

---

## **6. Publish Page (The Wizard)**

*Purpose: Guide users through tokenizing and encrypting data.*

### **6.1 Step 1: Metadata**

- **Fields:** Title, Description, Tags, Author.

### **6.2 Step 2: Asset Location**

- **Input Type Selector:** URL, IPFS Hash, or Arweave Transaction ID.
- **File Pinner:** Drag-and-drop area to upload local file to IPFS (via Pinata/Infura integration).1
- **Encryption Notice:** "Your URL will be encrypted in the browser before being stored on-chain."

### **6.3 Step 3: Pricing & Licensing**

- **Pricing Type:**
- *Fixed Price:* Input field for amount.
- *Free:* Sets price to 0.
- **License:** Dropdown (CC0, CC-BY, Commercial).

### **6.4 Step 4: Advanced Settings**

- **Access Type:** "Download" or "Compute-Only" (for privacy).
- **Allow List:** (Enterprise feature) Input addresses allowed to buy this data.3

### **6.5 Step 5: Deploy (The Multi-Sig Sequence)**

- **Progress Tracker:**
1. Create Data NFT (Mint).
2. Create Datatoken (Deploy ERC20).
3. Encrypt & Publish Metadata (DDO).
4. Set Price (Create Pool/Exchange).

---

## **7. User Profile Page (The Command Center)**

*Purpose: Manage identity, inventory, and income.*

### **7.1 Identity Header**

- **Avatar:** 3Box/Ceramic profile image.
- **Stats:** "Total Sales," "Total Published," "Wallet Balance."

### **7.2 Tab: Published (Seller View)**

- **Asset List:** Card view of items created by the user.
- **Edit Button:** Allows updating metadata or changing price (requires wallet signature).

### **7.3 Tab: Downloads (Buyer View)**

- **Purchased Assets:** List of assets where the user holds a valid Datatoken.
- **Action:** "Get File" (Triggers decryption and download).2
- **Compute History:** Logs of algorithms run (Status: "Completed", "View Logs").9

### **7.4 Tab: Financials**

- **Earnings Table:** Historical list of sales.
- **Claim Button:** If using a vault or staking mechanism, a button to harvest rewards.

---

## **8. Governance & Staking Page (Community Layer)**

*Purpose: Incentivize curation and govern the protocol.*

### **8.1 Data Farming / Staking**

- **Allocations:** UI to lock tokens against high-quality datasets to earn yield.11
- **Rewards:** "Claimable Rewards" counter with a "Harvest" button.

### **8.2 DAO Voting**

- **Proposals:** List of active improvement proposals (SIPs/OIPs).
- **Vote Interface:** "For/Against" toggle with voting power calculation based on token holdings.12

---

## **9. Infrastructure Requirements (Under the Hood)**

- **Subgraphs (The Graph):** Required to populate the Marketplace and Profile pages efficiently without hammering the blockchain node.
- **Metadata Cache (Aquarius):** Stores the DDOs (Decentralized Data Objects) off-chain for fast search, indexed by tags and text.
- **Provider Service:** The backend API that handles the actual file decryption and streaming when a user clicks "Download".13

### **Works cited**

1. Creating a Product for the Streamr Data Marketplace (3 of 3), accessed November 19, 2025, https://blog.streamr.network/creating-a-product-for-the-streamr-data-marketplace-3-of-3/
2. Quickstart Guides - Streamr Docs, accessed November 19, 2025, https://docs.streamr.network/guides
3. Acentrik, Decentralized Data Marketplace Now in Enterprise ..., accessed November 19, 2025, https://polygon.technology/blog/acentrik-decentralized-data-marketplace-now-in-enterprise-release-is-on-polygon-mainnet
4. Filecoin Saturn - Filecoin Ecosystem Project, accessed November 19, 2025, https://fil.org/ecosystem-explorer/filecoin-saturn
5. What Is Streamr (DATA) And How Does It Work? - CoinMarketCap, accessed November 19, 2025, https://coinmarketcap.com/cmc-ai/streamr/what-is/
6. Tutorial | Algorithms and Compute Jobs live on Ocean Market - YouTube, accessed November 19, 2025, https://www.youtube.com/watch?v=RxrkUd9pds0
7. Buy & Sell Data | Opendatabay AI Data Marketplace & Exchange, accessed November 19, 2025, https://www.opendatabay.com/
8. Acentrik, a decentralized data marketplace for enterprises, built on Ocean Protocol — is now in, accessed November 19, 2025, https://blog.oceanprotocol.com/acentrik-a-decentralized-data-marketplace-for-enterprises-built-on-ocean-protocol-is-now-in-7fb7371e57d4
9. Ocean Protocol: Tools for the Web3 Data Economy - Trent McConaghy, accessed November 19, 2025, https://trent.st/content/20201029%20Ocean%20Protocol%20Technical%20Whitepaper.pdf
10. lagrangedao/docs - GitHub, accessed November 19, 2025, https://github.com/lagrangedao/docs
11. Valuable Datasets Being Stored through Filecoin Slingshot, accessed November 19, 2025, https://filecoin.io/blog/posts/valuable-datasets-being-stored-through-filecoin-slingshot/
12. Ocean Data Farming Examples: DF1, accessed November 19, 2025, https://blog.oceanprotocol.com/ocean-data-farming-examples-c2d67a17b5f5
13. Compute-to-Data is now available in Ocean Market | Ocean Protocol, accessed November 19, 2025, https://blog.oceanprotocol.com/compute-to-data-is-now-available-in-ocean-market-58868be52ef7