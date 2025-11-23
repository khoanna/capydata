# 🦫 CapyData — Decentralized Data Marketplace

CapyData is a decentralized marketplace for datasets built on the Sui blockchain. It enables dataset creators to encrypt and publish data, sell access with on-chain listings, and let buyers retrieve and decrypt purchased data — all while preserving user control, privacy, and verifiable on-chain provenance.

CapyData is designed for Web3-native AI and data workflows: client-side SEAL encryption, Walrus decentralized storage, Move-based dataset NFTs for access control, and a trusted session approval flow for secure decryption.

## ⚡ Features

- Client-side SEAL encryption: files are encrypted in the browser before leaving the user’s machine so raw data never touches the network in plaintext.
- Walrus decentralized storage: encrypted blobs are stored with Walrus for scalable, decentralized retrieval and content addressing.
- Dataset minting (Move objects): datasets and their metadata are recorded on-chain as Move objects for transparency and composability.
- NFT-based access control: purchases mint or transfer NFTs that grant decryption rights to buyers.
- Trusted session key approval flow: a lightweight server-assisted session-key flow (Seal) is used to authorize decryption only after on-chain verification.
- Marketplace listing & buying: list datasets, set prices, and buy datasets using Sui transactions and the on-chain marketplace contract.
- Secure decryption pipeline: decrypt only after on-chain approval (seal_approve) and verified session key signing.

## 🏗️ Architecture

```
Frontend (Next.js + TypeScript)
	└─ encrypt(file) (SEAL client) → encryptedObject
	└─ upload encryptedObject → Walrus (blobId)
	└─ list dataset → on-chain Move marketplace (stores blobId and metadata)

Buyer
	└─ buy_dataset() on-chain → transfer NFT / mint access
	└─ getFile(blobId) → fetch encryptedObject from Walrus
	└─ seal_approve() (call via a Transaction) → server/session allows decryption
	└─ decrypt(encryptedObject) → access plaintext locally
```

## 🔁 Data Flow

```
[User Browser] --(encrypt via Seal)--> [Encrypted Object]
			 |                                   |
			 |--(upload)--> [Walrus Storage] <---|
			 |                                   |
			 |--(list)------> [Sui Marketplace Move Object]

[Buyer Wallet] --(buy_dataset tx)--> [access::buy_dataset]
			 |                                   |
			 |--(reads blobId)--> [Walrus fetch] |
			 |--(seal_approve tx)--> [access::seal_approve]
			 |--(decrypt locally)--> [Plaintext File]
```

## 🧰 Tech Stack

- Frontend: Next.js (App Router) + TypeScript
- Blockchain: Sui (Move smart contracts)
- Storage: Walrus decentralized file storage
- Encryption & Access Control: SEAL (client-side) + Session keys
- Wallet/Signing: @mysten/dapp-kit (Sui wallet adapters)
- Tooling: pnpm, ESLint, Prettier

## 📜 Smart Contracts

The Move modules define the on-chain data model for datasets, marketplace, and NFTs. Key structs and concepts:

- Dataset (struct)
	- blob_id: string — Walrus blob id (pointer to encrypted object)
	- owner: address — publisher address
	- title, filename, filetype, description, tags
	- price: u64 (mist) — price stored in MIST
	- amount_sold: u64 — number of successful purchases
	- on_listed: bool — whether dataset is listed

- Marketplace (struct)
	- on_sale: vector<ID> — dataset object IDs listed on marketplace
	- marketplace_owner: address

- NFT (struct)
	- id: UID
	- dataset_id: ID — dataset the NFT grants access to

- seal_approve (dataset: &Dataset, nft: &NFT)
	- Verifies nft.dataset_id equals object::id(dataset)
	- Called in the client flow via a signed transaction to approve SEAL decryption

> Note: See `contract/sources/marketplace.move` and `contract/sources/access.move` for exact field names and function signatures.

## 🛠️ Installation & Setup

Requirements
- Node.js (16+), pnpm
- Sui devnet or testnet access

Clone

```bash
git clone https://github.com/<your-org>/decentralized-data-marketplace-.git
cd decentralized-data-marketplace-
```

Install dependencies

```bash
pnpm install
```

Environment variables

Create a `.env.local` in `frontend/` with at least:

```env
NEXT_PUBLIC_WALRUS_SERVERS="0x...,..."    # Walrus server object IDs (comma-separated)
NEXT_PUBLIC_SEAL_PACKAGE_ID="0x..."      # PACKAGE_ID used by SEAL and contracts
NEXT_PUBLIC_MARKETPLACE_ID="0x..."       # Marketplace Move object id (deployed)
```

Walrus setup

1. Ensure your Walrus server object IDs are set in `lib/constants.ts` or in env.
2. The frontend uses walrus client via the Sui client to write/read blobs. You must have a Sui account with enough gas to register blob epochs.

SEAL configuration

- `useSeal.ts` uses `SessionKey` and `SealClient` to create session keys and decrypt with `seal_approve` authorization. Provide `SERVER_OBJECT_ID` list and `PACKAGE_ID` in `frontend/lib/constants.ts`.

Running the frontend

```bash
pnpm --filter frontend dev
```

This starts the Next.js app (default: http://localhost:3000).

## 📝 Usage Guide (end-user flow)

1. Uploading a dataset (Publisher)
	 - On the Publish page, select a file and fill metadata (title, description, tags).
	 - The frontend uses the `SealClient` to encrypt the file in the browser. The result is an `encryptedObject` which includes encrypted bytes and SEAL metadata.
	 - The `encryptedObject` is serialized and uploaded to Walrus. The returned `blobId` is included in an on-chain `list_dataset` transaction (Move) to register the dataset.

2. How encryption works
	 - Seal creates a session-bound encrypted object with a threshold and server metadata.
	 - The encrypted blob includes information about which Walrus/SEAL servers and threshold were used. This metadata is required for correct decryption.

3. How data is stored
	 - Walrus stores the serialized `encryptedObject` content-addressed as a `blobId`.
	 - The Move dataset object stores the `blobId` and dataset metadata on Sui.

4. Listing & buying
	 - Publishers call `list_dataset` (on-chain Move call) including `blobId`, price, and metadata.
	 - Buyers call `buy_dataset` with payment. The Move logic mints/transfers an access NFT and may transfer fees.

5. Secure decryption after purchase
	 - After purchase, the buyer's client calls `getFile(blobId)` which fetches the serialized encrypted object from Walrus.
	 - The client constructs a `seal_approve` transaction (targeting `access::seal_approve`) that references the dataset and the buyer's NFT. The buyer signs a personal message to prove control of the wallet.
	 - The Seal server/session uses the built transaction bytes to verify the on-chain approval. When verified, `sealClient.decrypt()` returns plaintext bytes that are only available to the client.

## 🧩 Move Modules & Major Entry Functions

- `create_dataset` (if present): create a Dataset object (owner, metadata, blob_id)
- `list_dataset`: add dataset to marketplace listing and set price
- `buy_dataset`: accept payment, mint/transfer access NFT, increment `amount_sold`, distribute fees
- `seal_approve`: verifies NFT ownership for the dataset and allows Seal session to decrypt
- `verify_access` (helper): check if a given wallet or NFT grants access to a dataset

Refer to `contract/sources/*.move` for the exact function signatures.

## 🤝 Contributing

We welcome contributions! Please follow this workflow:

1. Fork the repository
2. Create a topic branch: `git checkout -b feat/my-feature`
3. Run tests & lint locally
4. Open a pull request describing the changes

---

If you'd like, I can also add a small `README` badge, deployment instructions (Vercel), or a quickstart script that seeds the marketplace with a test dataset.

