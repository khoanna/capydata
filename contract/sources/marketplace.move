/// Marketplace module for trading encrypted datasets
module contract::marketplace;

use std::string::String;
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::event;
use contract::allowlist::{Self, Allowlist, Cap};

// Error codes
const EInsufficientPayment: u64 = 0;
const ENotOwner: u64 = 1;
const EInvalidPrice: u64 = 2;

/// Dataset represents an encrypted data asset
public struct Dataset has key, store {
    id: UID,
    /// Title of the dataset
    title: String,
    /// Description
    description: String,
    /// ID of the associated allowlist for access control
    allowlist_id: ID,
    /// Walrus blob ID where encrypted data is stored
    walrus_blob_id: String,
    /// Price in MIST (1 SUI = 1_000_000_000 MIST)
    price: u64,
    /// Seller's address
    seller: address,
    /// Number of sales
    sales_count: u64,
    /// Epoch when created
    created_at: u64,
    /// Seal encryption metadata
    seal_threshold: u64,
    seal_kem_type: u64,
    seal_dem_type: u64,
}

/// Event emitted when dataset is published
public struct DatasetPublished has copy, drop {
    dataset_id: ID,
    seller: address,
    allowlist_id: ID,
    walrus_blob_id: String,
    price: u64,
}

/// Event emitted when dataset is purchased
public struct Purchase has copy, drop {
    dataset_id: ID,
    buyer: address,
    seller: address,
    price: u64,
}

/// Create and publish a new encrypted dataset
public fun publish_dataset(
    title: String,
    description: String,
    allowlist: &mut Allowlist,
    cap: &Cap,
    walrus_blob_id: String,
    price: u64,
    seal_threshold: u64,
    seal_kem_type: u64,
    seal_dem_type: u64,
    ctx: &mut TxContext
): Dataset {
    assert!(price > 0, EInvalidPrice);

    let dataset = Dataset {
        id: object::new(ctx),
        title,
        description,
        allowlist_id: object::id(allowlist),
        walrus_blob_id,
        price,
        seller: ctx.sender(),
        sales_count: 0,
        created_at: ctx.epoch(),
        seal_threshold,
        seal_kem_type,
        seal_dem_type,
    };

    // Attach blob to allowlist
    allowlist::publish(allowlist, cap, walrus_blob_id);

    // Emit event
    event::emit(DatasetPublished {
        dataset_id: object::id(&dataset),
        seller: ctx.sender(),
        allowlist_id: object::id(allowlist),
        walrus_blob_id,
        price,
    });

    dataset
}

/// Entry function to publish dataset as shared object
entry fun publish_dataset_entry(
    title: String,
    description: String,
    allowlist: &mut Allowlist,
    cap: &Cap,
    walrus_blob_id: String,
    price: u64,
    seal_threshold: u64,
    seal_kem_type: u64,
    seal_dem_type: u64,
    ctx: &mut TxContext
) {
    let dataset = publish_dataset(
        title,
        description,
        allowlist,
        cap,
        walrus_blob_id,
        price,
        seal_threshold,
        seal_kem_type,
        seal_dem_type,
        ctx
    );
    transfer::share_object(dataset);
}

/// Purchase dataset and get added to allowlist
public fun purchase_dataset(
    dataset: &mut Dataset,
    allowlist: &mut Allowlist,
    cap: &Cap,
    mut payment: Coin<SUI>,
    ctx: &mut TxContext
): Coin<SUI> {
    // Verify payment
    assert!(coin::value(&payment) >= dataset.price, EInsufficientPayment);

    let buyer = ctx.sender();

    // Split exact payment amount
    let payment_coin = coin::split(&mut payment, dataset.price, ctx);

    // Transfer payment to seller
    transfer::public_transfer(payment_coin, dataset.seller);

    // Add buyer to allowlist (grants decryption permission)
    allowlist::add(allowlist, cap, buyer);

    // Update stats
    dataset.sales_count = dataset.sales_count + 1;

    // Emit event
    event::emit(Purchase {
        dataset_id: object::id(dataset),
        buyer,
        seller: dataset.seller,
        price: dataset.price,
    });

    // Return remaining payment (if any)
    payment
}

/// Entry function for purchasing dataset
entry fun purchase_dataset_entry(
    dataset: &mut Dataset,
    allowlist: &mut Allowlist,
    cap: &Cap,
    payment: Coin<SUI>,
    ctx: &mut TxContext
) {
    let remaining = purchase_dataset(dataset, allowlist, cap, payment, ctx);

    // Return remaining to buyer
    if (coin::value(&remaining) > 0) {
        transfer::public_transfer(remaining, ctx.sender());
    } else {
        coin::destroy_zero(remaining);
    };
}

/// Update dataset price (seller only)
public fun update_price(
    dataset: &mut Dataset,
    new_price: u64,
    ctx: &TxContext
) {
    assert!(ctx.sender() == dataset.seller, ENotOwner);
    assert!(new_price > 0, EInvalidPrice);
    dataset.price = new_price;
}

/// Entry function to update price
entry fun update_price_entry(
    dataset: &mut Dataset,
    new_price: u64,
    ctx: &TxContext
) {
    update_price(dataset, new_price, ctx);
}

// ===== Getters =====

public fun get_title(dataset: &Dataset): String {
    dataset.title
}

public fun get_description(dataset: &Dataset): String {
    dataset.description
}

public fun get_allowlist_id(dataset: &Dataset): ID {
    dataset.allowlist_id
}

public fun get_blob_id(dataset: &Dataset): String {
    dataset.walrus_blob_id
}

public fun get_price(dataset: &Dataset): u64 {
    dataset.price
}

public fun get_seller(dataset: &Dataset): address {
    dataset.seller
}

public fun get_sales_count(dataset: &Dataset): u64 {
    dataset.sales_count
}

public fun get_created_at(dataset: &Dataset): u64 {
    dataset.created_at
}

public fun get_seal_metadata(dataset: &Dataset): (u64, u64, u64) {
    (dataset.seal_threshold, dataset.seal_kem_type, dataset.seal_dem_type)
}

#[test_only]
use sui::test_scenario::{Self as test, next_tx, ctx};
use contract::allowlist;

#[test]
fun test_publish_and_purchase() {
    let seller = @0xA;
    let buyer = @0xB;

    let mut scenario = test::begin(seller);

    // Seller creates allowlist
    {
        allowlist::create_allowlist_entry(b"Dataset Allowlist".to_string(), ctx(&mut scenario));
    };

    // Seller publishes dataset
    next_tx(&mut scenario, seller);
    {
        let cap = test::take_from_sender<Cap>(&scenario);
        let mut allowlist = test::take_shared<Allowlist>(&scenario);

        publish_dataset_entry(
            b"Test Dataset".to_string(),
            b"A test dataset".to_string(),
            &mut allowlist,
            &cap,
            b"0xblobid123".to_string(),
            1000000000, // 1 SUI
            2,
            0,
            0,
            ctx(&mut scenario)
        );

        test::return_to_sender(&scenario, cap);
        test::return_shared(allowlist);
    };

    // Buyer purchases dataset
    next_tx(&mut scenario, buyer);
    {
        let cap = test::take_from_address<Cap>(&scenario, seller);
        let mut allowlist = test::take_shared<Allowlist>(&scenario);
        let mut dataset = test::take_shared<Dataset>(&scenario);

        let payment = coin::mint_for_testing<SUI>(1000000000, ctx(&mut scenario));

        purchase_dataset_entry(
            &mut dataset,
            &mut allowlist,
            &cap,
            payment,
            ctx(&mut scenario)
        );

        assert!(allowlist::has_access(&allowlist, buyer), 0);
        assert!(get_sales_count(&dataset) == 1, 1);

        test::return_to_address(seller, cap);
        test::return_shared(allowlist);
        test::return_shared(dataset);
    };

    test::end(scenario);
}
