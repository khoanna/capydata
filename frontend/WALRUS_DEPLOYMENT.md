# Comprehensive Guide: Deploying CapyData to Walrus Sites

This guide provides complete, step-by-step instructions for deploying the CapyData Next.js application to Walrus Sites - a fully decentralized web hosting platform built on Sui blockchain and Walrus storage.

## Table of Contents

1. [What is Walrus Sites?](#1-what-is-walrus-sites)
2. [Prerequisites](#2-prerequisites)
3. [Building Next.js for Static Export](#3-building-nextjs-for-static-export)
4. [Installing Walrus Site Builder](#4-installing-walrus-site-builder)
5. [Configuration Files](#5-configuration-files)
6. [Deployment Process](#6-deployment-process)
7. [Custom Domain Setup](#7-custom-domain-setup-with-suins)
8. [Updating Your Site](#8-updating-and-redeploying)
9. [Troubleshooting](#9-common-issues-and-troubleshooting)
10. [Cost Considerations](#10-cost-considerations)
11. [Complete Workflow](#11-complete-deployment-workflow)

---

## 1. What is Walrus Sites?

**Walrus Sites** are fully decentralized websites that combine Sui blockchain for metadata and Walrus for resource storage.

### Architecture Overview

- **Static assets** (HTML, CSS, JS, images) → Stored on Walrus decentralized storage
- **Metadata and routing** → Stored as Sui blockchain objects
- **No traditional backend** → Fully static sites (with blockchain wallet integration)
- **Domain isolation** → Each site gets a unique subdomain for security

### How It Works

```
┌─────────────────┐
│  Build Next.js  │ → Static files (HTML/CSS/JS)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Upload to       │ → Returns blob IDs
│ Walrus Storage  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Create Sui      │ → Site object with blob ID references
│ Object          │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Portal          │ → Resolves domain → Sui object → Walrus blobs
│ (wal.app)       │ → Serves your site
└─────────────────┘
```

### Key Benefits

✅ **Censorship-resistant** - No central authority can take down your site
✅ **Always available** - Distributed across Walrus storage nodes
✅ **Blockchain integration** - Native Sui wallet connectivity
✅ **No hosting fees** - Pay once for storage epochs
✅ **True ownership** - You control the site object on Sui

---

## 2. Prerequisites

### Required Software

- **Node.js** ≥ 18 (already in your project)
- **pnpm** (already configured)
- **Sui CLI** (for wallet management)
- **site-builder** or **walrus-sites-deploy** package

### Required Accounts and Tokens

#### Sui Wallet Setup

1. **Install Sui CLI** (if not already installed):
   ```bash
   curl -fsSL https://get.sui.io | sh
   ```

2. **Create or import a wallet**:
   ```bash
   # Create new wallet
   sui client new-address ed25519

   # Or import existing wallet
   sui client import <PRIVATE_KEY> ed25519
   ```

3. **Switch to testnet** (for testing):
   ```bash
   sui client switch --env testnet
   ```

4. **Check your address**:
   ```bash
   sui client active-address
   ```

#### Get Tokens

**For Testnet:**
- **SUI tokens**: Get from [Sui Testnet Faucet](https://faucet.testnet.sui.io/)
  ```bash
  sui client faucet
  ```
- **WAL tokens**: Required for storage - swap SUI to WAL or use `-b` flag in deployment

**For Mainnet:**
- **SUI tokens**: Buy from exchanges (Binance, OKX, etc.)
- **WAL tokens**: Swap SUI → WAL on Sui DEXs (Cetus, Turbos)

#### Verify Wallet Balance

```bash
# Check SUI balance
sui client balance

# Check gas objects
sui client gas
```

---

## 3. Building Next.js for Static Export

Walrus Sites only support static HTML/CSS/JS. You need to configure Next.js for static export.

### Step 1: Update `next.config.ts`

Modify `/home/huy-pham/Workspace/decentralized-data-marketplace/frontend/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Enable static HTML export
  output: 'export',

  // ✅ Add trailing slashes for cleaner URLs
  trailingSlash: true,

  // ✅ Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },

  // Optional: Change output directory (default is 'out')
  // distDir: 'build',
};

export default nextConfig;
```

### Step 2: Check for Incompatible Features

Since Walrus Sites are **fully static**, the following features are NOT supported:

❌ **Server-Side Rendering** (`getServerSideProps`)
❌ **API Routes** (`/app/api/*`)
❌ **Incremental Static Regeneration** (ISR)
❌ **Server Actions**
❌ **Middleware** (except for static redirects)

✅ **Supported features:**
- Client-side rendering
- Static generation (`getStaticProps`, `getStaticPaths`)
- Dynamic imports (`next/dynamic`)
- Client-side routing
- Blockchain wallet integration (client-side)

### Step 3: Environment Variables

Only `NEXT_PUBLIC_*` variables are included in static builds.

Update `/home/huy-pham/Workspace/decentralized-data-marketplace/frontend/.env.local`:

```bash
# Sui Network
NEXT_PUBLIC_SUI_NETWORK=testnet  # or mainnet

# Contract Package IDs (update after contract deployment)
NEXT_PUBLIC_MARKETPLACE_PACKAGE_ID=0x...
NEXT_PUBLIC_MARKETPLACE_OBJECT_ID=0x...
NEXT_PUBLIC_SEAL_PACKAGE_ID=0x...

# Seal Key Servers (format: objectId1,weight1;objectId2,weight2)
NEXT_PUBLIC_SEAL_KEY_SERVERS=0x...,1;0x...,1

# Walrus Storage
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator-testnet.walrus.space
NEXT_PUBLIC_WALRUS_EPOCHS=100
```

**Important:** All environment variables used in your app MUST have the `NEXT_PUBLIC_` prefix, or they won't be available in the static build.

### Step 4: Test the Build

```bash
cd /home/huy-pham/Workspace/decentralized-data-marketplace/frontend

# Build static export
pnpm build

# Output should be in ./out directory
ls -la out/
```

Expected output structure:
```
out/
├── index.html
├── _next/
│   ├── static/
│   │   ├── chunks/
│   │   └── css/
├── publish/
│   └── index.html
├── marketplace/
│   └── index.html
└── ... (other pages)
```

### Step 5: Test Locally (Optional)

```bash
# Serve the static build locally
npx serve out

# Open http://localhost:3000
```

---

## 4. Installing Walrus Site Builder

There are three methods to install the site builder. Choose one:

### Method A: Direct Binary Installation (Recommended)

This is the official method from Mysten Labs.

**For Linux (Ubuntu):**

```bash
# Set your system type
export SYSTEM=ubuntu-x86_64
# Or for older/virtualized CPUs: export SYSTEM=ubuntu-x86_64-generic

# Download for Testnet
curl https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-$SYSTEM -o site-builder
chmod +x site-builder

# Or for Mainnet
curl https://storage.googleapis.com/mysten-walrus-binaries/site-builder-mainnet-latest-$SYSTEM -o site-builder
chmod +x site-builder

# Move to PATH (system-wide)
sudo mv site-builder /usr/local/bin/

# Or for user-only installation
mkdir -p ~/.local/bin
mv site-builder ~/.local/bin/
# Add to PATH in ~/.bashrc or ~/.zshrc:
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**For macOS:**

```bash
# For Apple Silicon (M1/M2/M3)
export SYSTEM=macos-arm64

# For Intel Macs
# export SYSTEM=macos-x86_64

# Download for Testnet
curl https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-$SYSTEM -o site-builder
chmod +x site-builder

# Move to PATH
sudo mv site-builder /usr/local/bin/
```

**For Windows:**

```powershell
# Download for Testnet
curl https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-windows-x86_64.exe -o site-builder.exe

# Move to a directory in PATH (e.g., C:\Program Files\Sui\)
```

**Verify Installation:**

```bash
site-builder --version
```

### Method B: Using suiup

```bash
# Install suiup (if not already installed)
curl -fsSL https://get.sui.io | sh

# Install site-builder for mainnet
suiup install site-builder@mainnet

# Or for testnet
suiup install site-builder@testnet

# Verify
site-builder --version
```

### Method C: Using NPM Package (No Installation Required)

```bash
# Use pnpx to run without installing globally
pnpx walrus-sites-deploy --help

# This downloads and runs the package on-demand
```

---

## 5. Configuration Files

### 5.1 sites-config.yaml

This file tells the site-builder which Walrus and Sui packages to use.

**Location:** `~/.walrus/sites-config.yaml` or project root

**For Testnet:**

```yaml
contexts:
  testnet:
    # Walrus Sites package on Sui testnet
    package: 0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799

    # Staking object for storage payments
    staking_object: 0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3

    general:
      wallet_env: testnet
      walrus_context: testnet
      # Walrus storage package on Sui testnet
      walrus_package: 0xd84704c17fc870b8764832c535aa6b11f21a95cd6f5bb38a9b07d2cf42220c66

default_context: testnet
```

**For Mainnet:**

```yaml
contexts:
  mainnet:
    # Walrus Sites package on Sui mainnet
    package: 0x26eb7ee8688da02c5f671679524e379f0b837a12f1d1d799f255b7eea260ad27

    # Staking object for storage payments
    staking_object: 0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904

    general:
      wallet_env: mainnet
      walrus_context: mainnet
      # Walrus storage package on Sui mainnet
      walrus_package: 0xfdc88f7d7cf30afab2f82e8380d11ee8f70efb90e863d1de8616fae1bb09ea77

default_context: mainnet
```

**Create the config file:**

```bash
mkdir -p ~/.walrus

# For Testnet
cat > ~/.walrus/sites-config.yaml << 'EOF'
contexts:
  testnet:
    package: 0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799
    staking_object: 0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3
    general:
      wallet_env: testnet
      walrus_context: testnet
      walrus_package: 0xd84704c17fc870b8764832c535aa6b11f21a95cd6f5bb38a9b07d2cf42220c66

default_context: testnet
EOF
```

### 5.2 ws-resources.json

This file is **auto-generated** after your first deployment. It stores your site's object ID and metadata.

**Location:** Project root (next to `package.json`)

**Example structure:**

```json
{
  "object_id": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "site_name": "CapyData",
  "metadata": {
    "description": "The Chillest Data Marketplace on Sui",
    "project_url": "https://github.com/yourusername/capydata",
    "version": "1.0.0"
  },
  "routes": {
    "/": {
      "headers": {
        "Cache-Control": "public, max-age=3600"
      }
    },
    "/item/*": {
      "headers": {
        "Cache-Control": "public, max-age=86400"
      }
    }
  }
}
```

**Important:** This file is created automatically on first deployment. Keep it in version control so you can update your site later.

---

## 6. Deployment Process

Now you're ready to deploy!

### Method 1: Using site-builder CLI (Official)

**Initial Deployment:**

```bash
cd /home/huy-pham/Workspace/decentralized-data-marketplace/frontend

# Build Next.js static export
pnpm build

# Deploy to Walrus Sites (Testnet)
site-builder --context=testnet deploy ./out --epochs 100

# Or for Mainnet
site-builder --context=mainnet deploy ./out --epochs 100
```

**Understanding Epochs:**

Epochs determine how long your site stays on Walrus storage:

- **Testnet**: 1 epoch = **1 day** (max 53 epochs ≈ 53 days)
- **Mainnet**: 1 epoch = **~2 weeks** (max 53 epochs ≈ 2 years)

For testnet testing, use 10-100 epochs. For mainnet production, use the maximum (53 epochs).

**Expected Output:**

```
Parsing site contents...
Uploading resources to Walrus...
  ✓ Uploaded index.html (blob ID: 0xabc123...)
  ✓ Uploaded _next/static/chunks/main.js (blob ID: 0xdef456...)
  ✓ Uploaded ... (40 more files)
Creating site object on Sui...
Transaction digest: HqK7YqT9ZmbABCDEFG12345...

🎉 Site created successfully!
Object ID: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

Browse your site at:
https://2meo8y4d3abbccdd.wal.app

SuiNS name (if configured):
https://yourdomain.wal.app
```

**What happens:**
1. Site-builder reads all files in `./out`
2. Uploads each file to Walrus storage → gets blob IDs
3. Creates a Sui object mapping routes to blob IDs
4. Saves the object ID to `ws-resources.json`

### Method 2: Using walrus-sites-deploy NPM Package

This is a simpler alternative that handles everything automatically.

```bash
cd /home/huy-pham/Workspace/decentralized-data-marketplace/frontend

# Build Next.js
pnpm build

# Deploy with pnpx (no installation needed)
pnpx walrus-sites-deploy ./out -n testnet -e 100 -o .env.local

# Options:
# -n testnet/mainnet     : Network to deploy to
# -e 100                 : Number of epochs
# -o .env.local          : Save NEXT_PUBLIC_SITE_OBJECT_ID to this file
# -b                     : Auto-swap SUI to WAL if needed
# -f                     : Force override existing files
```

**For Mainnet (with auto-swap):**

```bash
pnpx walrus-sites-deploy ./out -n mainnet -e 53 -o .env.local -b
```

The `-b` flag automatically swaps SUI for WAL tokens if you don't have enough.

### Method 3: Add to package.json Scripts (Recommended)

For easier deployment, add scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "deploy:walrus:testnet": "pnpm build && pnpx walrus-sites-deploy ./out -n testnet -e 100 -o .env.local -b",
    "deploy:walrus:mainnet": "pnpm build && pnpx walrus-sites-deploy ./out -n mainnet -e 53 -o .env.local -b"
  }
}
```

**Then deploy with:**

```bash
# Deploy to testnet
pnpm deploy:walrus:testnet

# Deploy to mainnet (when ready for production)
pnpm deploy:walrus:mainnet
```

---

## 7. Custom Domain Setup with SuiNS

By default, your site is accessible via a long subdomain like `https://2meo8y4d3abbccdd.wal.app`. You can get a human-readable domain using **SuiNS** (Sui Name Service).

### Step 1: Purchase a SuiNS Name

**For Testnet:**
1. Visit [https://testnet.suins.io](https://testnet.suins.io)
2. Connect your Sui wallet
3. Search for an available name (e.g., `capydata`)
4. Purchase the domain (costs SUI tokens)

**For Mainnet:**
1. Visit [https://suins.io](https://suins.io)
2. Connect your wallet
3. Purchase your domain (e.g., `capydata.sui`)

**Naming Rules:**
- Only lowercase letters (a-z) and numbers (0-9)
- No special characters or spaces
- Minimum 3 characters
- Prices vary by length (shorter = more expensive)

### Step 2: Link SuiNS to Your Walrus Site

1. Go to **"Names you own"** on the SuiNS website
2. Click the **three dots menu** (⋮) next to your domain
3. Select **"Link To Walrus Site"**
4. Paste your **site's object ID** (from `ws-resources.json` or deployment output)
5. Click **"Apply"** and confirm the transaction

### Step 3: Access Your Site

After linking (may take a few minutes):

- **With SuiNS**: `https://capydata.wal.app`
- **Without SuiNS**: `https://2meo8y4d3abbccdd.wal.app` (Base36-encoded object ID)

### Custom Headers and Routing

You can customize headers and routing in `ws-resources.json`:

```json
{
  "object_id": "0x...",
  "routes": {
    "/api/*": {
      "path": "/404.html",
      "headers": {
        "Content-Type": "text/html"
      }
    },
    "/static/*": {
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    }
  },
  "headers": {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff"
  }
}
```

After updating `ws-resources.json`, redeploy to apply changes.

---

## 8. Updating and Redeploying

When you make changes to your app, simply rebuild and redeploy.

### Update Existing Site

```bash
cd /home/huy-pham/Workspace/decentralized-data-marketplace/frontend

# 1. Make your changes to the code

# 2. Build the new version
pnpm build

# 3. Deploy (automatically updates existing site)
site-builder --context=testnet deploy ./out --epochs 100

# Or with npm package
pnpx walrus-sites-deploy ./out -n testnet -e 100 -o .env.local
```

The tool automatically detects the `object_id` from `ws-resources.json` and **updates** the existing site instead of creating a new one.

### Other Useful Commands

**View all resources in your site:**
```bash
site-builder sitemap <SITE_OBJECT_ID>
```

**Update a single resource:**
```bash
site-builder update-resource <SITE_OBJECT_ID> /path/to/file.html --epochs 100
```

**Convert object ID to Base36 subdomain:**
```bash
site-builder convert <OBJECT_ID>
```

**Destroy a site (remove from blockchain and Walrus):**
```bash
site-builder destroy <SITE_OBJECT_ID>
```

**Get help:**
```bash
site-builder --help
site-builder deploy --help
```

---

## 9. Common Issues and Troubleshooting

### Issue 1: "The specified Walrus system object does not exist"

**Cause:** Wallet is on wrong network or config file is outdated.

**Solution:**
```bash
# Check current Sui network
sui client active-env

# Switch to testnet
sui client switch --env testnet

# Or switch to mainnet
sui client switch --env mainnet

# Update sites-config.yaml with latest package IDs (see Section 5.1)
```

### Issue 2: "Illegal instruction (core dumped)"

**Cause:** CPU doesn't support instructions in the standard binary.

**Solution:** Use the generic binary:
```bash
export SYSTEM=ubuntu-x86_64-generic
curl https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-$SYSTEM -o site-builder
chmod +x site-builder
sudo mv site-builder /usr/local/bin/
```

### Issue 3: "Could not retrieve enough confirmations to certify the blob"

**Cause:** Outdated configuration or network issues.

**Solution:**
1. Update to the latest site-builder binary
2. Update `sites-config.yaml` with latest package IDs
3. Check your internet connection
4. Retry deployment

### Issue 4: Next.js Image Optimization Errors

**Cause:** Static export doesn't support automatic image optimization.

**Solution:** Add to `next.config.ts`:
```typescript
images: {
  unoptimized: true,
}
```

Or use a custom image loader for external CDN.

### Issue 5: API Routes Return 404

**Cause:** API routes (`/app/api/*`) are not supported in static export.

**Solution:**
- Remove API routes
- Use Sui Move contracts for backend logic
- Implement all logic client-side with wallet interactions

### Issue 6: Environment Variables Undefined

**Cause:** Variables without `NEXT_PUBLIC_` prefix are not included in static builds.

**Solution:** Rename all client-side variables:
```bash
# ❌ Wrong
WALRUS_AGGREGATOR_URL=https://...

# ✅ Correct
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://...
```

### Issue 7: Dynamic Routes Return 404

**Cause:** Dynamic routes need pre-generation with `getStaticPaths`.

**Solution:** In `app/item/[id]/page.tsx`:
```typescript
export async function generateStaticParams() {
  // Return all possible IDs
  return [
    { id: '1' },
    { id: '2' },
    // ... all dataset IDs
  ];
}
```

Or implement client-side routing.

### Issue 8: "Insufficient gas"

**Cause:** Not enough SUI tokens for deployment transaction.

**Solution:**
```bash
# Check balance
sui client balance

# Get testnet SUI
sui client faucet

# For mainnet, buy SUI from exchanges
```

### Issue 9: "Not enough WAL tokens"

**Cause:** Need WAL tokens for storage payment.

**Solution:**
```bash
# Use auto-swap flag
pnpx walrus-sites-deploy ./out -n testnet -e 100 -b

# Or manually swap SUI → WAL on Sui DEXs (Cetus, Turbos)
```

### Debug Tips

```bash
# Check which site-builder is being used
which site-builder
site-builder --version

# Check Sui wallet configuration
sui client active-address
sui client active-env
sui client gas

# View wallet balances
sui client balance

# Test Next.js build locally
pnpm build
npx serve out

# View site-builder logs (add -v for verbose)
site-builder -v deploy ./out --epochs 100
```

---

## 10. Cost Considerations

### Storage Pricing (WAL Tokens)

- **Base price**: ~55,000 FROST per MB per epoch (1 WAL = 1 billion FROST)
- **Protocol subsidy**: 80% discount (effective price ≈ 11,000 FROST/MB/epoch)
- **Cost formula**: `encoded_size × epochs × 11,000 FROST`

### Example Calculations

**Small site (5 MB) for 100 epochs (testnet):**
```
Cost = 5 MB × 100 epochs × 11,000 FROST/MB/epoch
     = 5,500,000 FROST
     = 0.0055 WAL
     ≈ Very low cost on testnet
```

**Medium site (50 MB) for 53 epochs (mainnet - 2 years):**
```
Cost = 50 MB × 53 epochs × 11,000 FROST/MB/epoch
     = 29,150,000 FROST
     = 0.029 WAL
     ≈ $0.50-2 USD (depending on WAL price)
```

**Large site (500 MB) for 53 epochs:**
```
Cost = 500 MB × 53 epochs × 11,000 FROST/MB/epoch
     = 291,500,000 FROST
     = 0.29 WAL
     ≈ $5-20 USD
```

### Gas Fees (SUI Tokens)

- **Site creation**: ~0.005-0.01 SUI
- **Site updates**: ~0.005-0.01 SUI per update
- Very affordable compared to traditional hosting

### Cost Optimization Tips

1. **Optimize build size**:
   ```bash
   # Check build size
   du -sh out/

   # Minimize JS/CSS
   pnpm build

   # Remove unnecessary files
   rm -rf out/unused-folder
   ```

2. **Use longer epochs on mainnet** (max 53) to avoid re-uploading

3. **Compress images** before deployment

4. **Remove source maps** in production:
   ```typescript
   // next.config.ts
   productionBrowserSourceMaps: false,
   ```

5. **Enable tree shaking** (automatic in Next.js)

---

## 11. Complete Deployment Workflow

Here's the complete, copy-paste workflow for deploying CapyData to Walrus Sites:

### One-Time Setup

```bash
# 1. Install Sui CLI
curl -fsSL https://get.sui.io | sh

# 2. Create wallet (or import existing)
sui client new-address ed25519

# 3. Switch to testnet
sui client switch --env testnet

# 4. Get testnet SUI
sui client faucet

# 5. Install site-builder
export SYSTEM=ubuntu-x86_64  # or macos-arm64 for M1/M2 Macs
curl https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-$SYSTEM -o site-builder
chmod +x site-builder
sudo mv site-builder /usr/local/bin/

# 6. Create config file
mkdir -p ~/.walrus
cat > ~/.walrus/sites-config.yaml << 'EOF'
contexts:
  testnet:
    package: 0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799
    staking_object: 0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3
    general:
      wallet_env: testnet
      walrus_context: testnet
      walrus_package: 0xd84704c17fc870b8764832c535aa6b11f21a95cd6f5bb38a9b07d2cf42220c66

default_context: testnet
EOF
```

### Update Next.js Configuration

```bash
cd /home/huy-pham/Workspace/decentralized-data-marketplace/frontend

# Edit next.config.ts (add these lines):
cat > next.config.ts << 'EOF'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
EOF
```

### Add Deployment Scripts to package.json

```bash
# Add these scripts to your package.json:
#
# "scripts": {
#   "deploy:walrus:testnet": "pnpm build && pnpx walrus-sites-deploy ./out -n testnet -e 100 -o .env.local -b",
#   "deploy:walrus:mainnet": "pnpm build && pnpx walrus-sites-deploy ./out -n mainnet -e 53 -o .env.local -b"
# }
```

### Deploy to Testnet

```bash
cd /home/huy-pham/Workspace/decentralized-data-marketplace/frontend

# Option 1: Using package.json script (easiest)
pnpm deploy:walrus:testnet

# Option 2: Manual deployment
pnpm build
pnpx walrus-sites-deploy ./out -n testnet -e 100 -o .env.local -b

# Option 3: Using site-builder CLI
pnpm build
site-builder --context=testnet deploy ./out --epochs 100
```

### Deploy to Mainnet (Production)

```bash
# 1. Switch to mainnet
sui client switch --env mainnet

# 2. Ensure you have SUI and WAL tokens

# 3. Update config for mainnet
cat > ~/.walrus/sites-config.yaml << 'EOF'
contexts:
  mainnet:
    package: 0x26eb7ee8688da02c5f671679524e379f0b837a12f1d1d799f255b7eea260ad27
    staking_object: 0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904
    general:
      wallet_env: mainnet
      walrus_context: mainnet
      walrus_package: 0xfdc88f7d7cf30afab2f82e8380d11ee8f70efb90e863d1de8616fae1bb09ea77

default_context: mainnet
EOF

# 4. Deploy
pnpm deploy:walrus:mainnet
```

### Setup Custom Domain (Optional)

```bash
# 1. Buy SuiNS domain
# Visit: https://testnet.suins.io (testnet) or https://suins.io (mainnet)

# 2. Link domain to site
# On SuiNS website:
#   - Go to "Names you own"
#   - Click menu (⋮) → "Link To Walrus Site"
#   - Paste your site object ID (from ws-resources.json)
#   - Confirm transaction

# 3. Access your site
# https://yourdomain.wal.app
```

### Update Site (After Changes)

```bash
# Make your code changes...

# Then redeploy
pnpm deploy:walrus:testnet

# The tool automatically updates the existing site
```

---

## Quick Reference

### Essential Commands

```bash
# Build Next.js static export
pnpm build

# Deploy to testnet (easiest)
pnpm deploy:walrus:testnet

# Deploy to mainnet
pnpm deploy:walrus:mainnet

# Check Sui wallet
sui client active-address
sui client balance

# View site resources
site-builder sitemap <SITE_OBJECT_ID>

# Update single file
site-builder update-resource <SITE_OBJECT_ID> /path/to/file --epochs 100

# Get testnet SUI
sui client faucet
```

### Important Files

- `next.config.ts` - Next.js configuration (set `output: 'export'`)
- `~/.walrus/sites-config.yaml` - Walrus network configuration
- `ws-resources.json` - Your site's object ID and metadata (auto-generated)
- `.env.local` - Environment variables (only `NEXT_PUBLIC_*` included in build)

### Key URLs

- **Testnet Portal**: https://wal.app
- **Mainnet Portal**: https://wal.app
- **Testnet SuiNS**: https://testnet.suins.io
- **Mainnet SuiNS**: https://suins.io
- **Testnet Faucet**: https://faucet.testnet.sui.io
- **Walrus Docs**: https://docs.wal.app
- **Sui Explorer**: https://suiscan.xyz

---

## Additional Resources

### Official Documentation

- [Walrus Sites Overview](https://docs.wal.app/walrus-sites/overview.html)
- [Installation Guide](https://docs.wal.app/walrus-sites/tutorial-install.html)
- [Publishing Tutorial](https://docs.wal.app/walrus-sites/tutorial-publish.html)
- [Site Builder Commands](https://docs.wal.app/walrus-sites/commands.html)
- [SuiNS Setup](https://docs.walrus.site/walrus-sites/tutorial-suins.html)
- [Walrus Storage Costs](https://docs.wal.app/dev-guide/costs.html)

### Community Resources

- [GitHub: walrus-sites](https://github.com/MystenLabs/walrus-sites)
- [NPM: walrus-sites-deploy](https://www.npmjs.com/package/walrus-sites-deploy)
- [Sui Discord](https://discord.gg/sui)
- [Walrus Documentation](https://docs.wal.app)

### Example Walrus Sites

- https://flatland.wal.app (demo site)
- https://walrus.wal.app (Walrus documentation)
- Browse more at https://wal.app

---

## Conclusion

You now have everything needed to deploy CapyData to Walrus Sites! The key advantages are:

✅ **Fully decentralized** - No single point of failure
✅ **Censorship-resistant** - No one can take down your site
✅ **Blockchain-native** - Perfect for Web3 apps
✅ **Cost-effective** - Pay once for storage epochs
✅ **Always available** - Distributed across Walrus nodes

For questions or issues, refer to the [troubleshooting section](#9-common-issues-and-troubleshooting) or check the [official documentation](https://docs.wal.app).

Happy deploying! 🎉
