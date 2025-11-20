Implement the walrus and seal. Before getting started, I have tried to upload and download data to and from walrus and this code works:
```typescript

export async function downloadFromWalrusWithAccount(
  blobId: string,
  suiClient: SuiClient & {
    walrus?: WalrusClient;
    walrusWithRelay?: WalrusClient;
    walrusWithoutRelay?: WalrusClient;
  }
): Promise<Blob> {
  try {
    // Initialize Walrus client if not already initialized
    let walrusClient = suiClient.walrus;

    if (!walrusClient) {
      walrusClient = new WalrusClient({
        network: 'testnet',
        suiRpcUrl: getFullnodeUrl('testnet'),
        wasmUrl: walrusWasmUrl
      });
    }

    console.log("Downloading blob from Walrus using SDK:", blobId);

    // Use the Walrus SDK to read the raw blob - this properly decodes the data
    const fileData = await walrusClient.readBlob({ blobId });

    console.log("Successfully downloaded and decoded blob from Walrus");
    console.log("Blob size:", fileData.length, "bytes");

    // Convert to Blob - create a new Uint8Array to ensure type compatibility
    return new Blob([new Uint8Array(fileData)]);
  } catch (error) {
    console.error("Error downloading from Walrus with account:", error);
    throw new Error(
      `Failed to download file with account: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function uploadToWalrusWithAccount(
  file: File,
  signAndExecuteTransaction: (input: any) => Promise<any>,
  _suiClient: SuiClient & {
    walrus?: WalrusClient;
    walrusWithRelay?: WalrusClient;
    walrusWithoutRelay?: WalrusClient;
  },
  userAddress: string
): Promise<string> {
  try {
    // Normalize user address (ensure it has 0x prefix)
    const normalizedAddress = userAddress.startsWith('0x') ? userAddress : `0x${userAddress}`;

    // Initialize Walrus client
    const walrusClient = new WalrusClient({
      network: 'testnet',
      suiRpcUrl: getFullnodeUrl('testnet'),
      wasmUrl: walrusWasmUrl
    });

    // Convert file to raw bytes
    const fileData = new Uint8Array(await file.arrayBuffer());

    // Step 1: Create blob upload flow (writes raw blob, not quilt)
    console.log("Step 1: Creating blob upload flow...");
    const flow = walrusClient.writeBlobFlow({
      blob: fileData
    });

    // Step 2: Encode the blob (WASM step - prepares blob for storage)
    console.log("Step 2: Encoding blob...");
    await flow.encode();

    // Step 3: Create registration transaction (blob will be owned by user)
    console.log("Step 3: Creating registration transaction...");
    const tx = flow.register({
      epochs: EPOCHS,
      owner: normalizedAddress,
      deletable: true,
    });

    // Step 4: Sign and execute the transaction
    console.log("Step 4: Signing and executing registration transaction...");
    const txResult = await signAndExecuteTransaction({
      transaction: tx,
    });

    console.log("Transaction executed:", txResult);

    if (!txResult.digest) {
      throw new Error("No transaction digest returned");
    }

    // Step 5: Upload the blob data to storage nodes using transaction digest
    console.log("Step 5: Uploading blob data to storage nodes...");
    await flow.upload({ digest: txResult.digest });

    // Step 6: Certify the blob
    console.log("Step 6: Certifying blob...");
    const certifyTransaction = flow.certify();
    await signAndExecuteTransaction({transaction: certifyTransaction});

    // Get the blob ID from the flow
    const blobResult = await flow.getBlob();
    if (!blobResult.blobId) {
      throw new Error("Failed to get blob ID from upload");
    }

    const blobId = blobResult.blobId;
    console.log("Blob uploaded successfully with ID:", blobId);
    console.log("Blob is owned by:", normalizedAddress);

    return blobId;
  } catch (error) {
    console.error("Error uploading to Walrus with account:", error);
    throw new Error(
      `Failed to upload file with account: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
```

Ultrathink on how we can add these code to our data, and how to add the encryption/decryption layer using Seal. Also, I have written contract code to handle the ownership when using Seal:
```move
module 0x0::allowlist;

use std::string::String;
use 0x0::utils::is_prefix;
use sui::dynamic_field as df;
// use sui::clock::Clock;

const EInvalidCap: u64 = 0;
const ENoAccess: u64 = 1;
const EDuplicate: u64 = 2;
const MARKER: u64 = 3;

public struct Allowlist has key {
    id: UID,
    name: String,
    list: vector<address>,
}

public struct Cap has key {
    id: UID,
    allowlist_id: ID,
}

public fun create_allowlist(name: String, ctx: &mut TxContext): Cap {
    let allowlist = Allowlist {
        id: object::new(ctx),
        list: vector::empty(),
        name: name,
    };
    let cap = Cap {
        id: object::new(ctx),
        allowlist_id: object::id(&allowlist),
    };
    transfer::share_object(allowlist);
    cap
}

entry fun create_allowlist_entry(name: String, ctx: &mut TxContext) {
    transfer::transfer(create_allowlist(name, ctx), ctx.sender());
}

public fun add(allowlist: &mut Allowlist, cap: &Cap, account: address) {
    assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
    assert!(!allowlist.list.contains(&account), EDuplicate);
    allowlist.list.push_back(account);
}

public fun remove(allowlist: &mut Allowlist, cap: &Cap, account: address) {
    assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
    allowlist.list = allowlist.list.filter!(|x| x != account); // TODO: more efficient impl?
}

public fun namespace(allowlist: &Allowlist): vector<u8> {
    allowlist.id.to_bytes()
}

fun approve_internal(caller: address, id: vector<u8>, allowlist: &Allowlist): bool {
    // Check if the id has the right prefix
    let namespace = namespace(allowlist);
    if (!is_prefix(namespace, id)) {
        return false
    };

    // Check if user is in the allowlist
    allowlist.list.contains(&caller)
}

entry fun seal_approve(id: vector<u8>, allowlist: &Allowlist, ctx: &TxContext) {
    assert!(approve_internal(ctx.sender(), id, allowlist), ENoAccess);
}

/// Encapsulate a blob into a Sui object and attach it to the allowlist
public fun publish(allowlist: &mut Allowlist, cap: &Cap, blob_id: String) {
    assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
    df::add(&mut allowlist.id, blob_id, MARKER);
}
```

Consider and improve based on what I provide.
