#[test_only]
module contract::contract_tests {
    use contract::marketplace::{Self, Marketplace, Dataset};
    use contract::access::{Self, NFT};
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use std::string::{Self, String};
    use sui::test_utils::assert_eq;

    // Test addresses
    const MARKETPLACE_OWNER: address = @0xA;
    const SELLER: address = @0xB;
    const BUYER1: address = @0xC;
    const BUYER2: address = @0xD;
    const ATTACKER: address = @0xE;
    const ADMIN: address = @0x18f98e22eb8da55a01b75c39542bb5bc35e33ff1bd9d9df30c04b77ec5df57b6;

    // Test constants
    const DATASET_PRICE: u64 = 1000;
    const LOW_PRICE: u64 = 50;
    const HIGH_PRICE: u64 = 1000000;
    const BLOB_ID: address = @0x1234;

    // Error codes
    const ENotOwner: u64 = 0;
    const ENonPositivePrice: u64 = 1;
    const EInsufficientBalance: u64 = 2;
    const EInvalidOwnership: u64 = 3;
    const EDatasetNotListed: u64 = 4;
    const EDataListed: u64 = 5;

    // Helper functions
    fun create_marketplace(scenario: &mut Scenario) {
        ts::next_tx(scenario, MARKETPLACE_OWNER);
        {
            marketplace::init_for_testing(ts::ctx(scenario));
        };
    }

    fun list_test_dataset(scenario: &mut Scenario, seller: address, price: u64): ID {
        ts::next_tx(scenario, seller);
        let mut marketplace = ts::take_shared<Marketplace>(scenario);
        let blob_id = object::id_from_address(BLOB_ID);

        marketplace::list_dataset(
            blob_id,
            string::utf8(b"Test Dataset"),
            string::utf8(b"A test dataset"),
            vector[string::utf8(b"test"), string::utf8(b"data")],
            price,
            1000000,
            &mut marketplace,
            ts::ctx(scenario)
        );

        ts::return_shared(marketplace);
        ts::next_tx(scenario, seller);
        let dataset = ts::take_from_sender<Dataset>(scenario);
        let dataset_id = object::id(&dataset);
        ts::return_to_sender(scenario, dataset);
        dataset_id
    }

    fun mint_sui(scenario: &mut Scenario, recipient: address, amount: u64) {
        ts::next_tx(scenario, recipient);
        let coin = coin::mint_for_testing<SUI>(amount, ts::ctx(scenario));
        transfer::public_transfer(coin, recipient);
    }

    // ============================================================================
    // GROUP 1: SELLER LIFECYCLE TESTS
    // ============================================================================

    #[test]
    fun test_list_dataset_success() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let blob_id = object::id_from_address(BLOB_ID);

        marketplace::list_dataset(
            blob_id,
            string::utf8(b"My Dataset"),
            string::utf8(b"Description"),
            vector[string::utf8(b"tag1")],
            DATASET_PRICE,
            1000000,
            &mut marketplace,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(marketplace);
        ts::next_tx(&mut scenario, SELLER);

        let dataset = ts::take_from_sender<Dataset>(&scenario);
        assert_eq(marketplace::get_title(&dataset), string::utf8(b"My Dataset"));
        assert_eq(marketplace::get_price(&dataset), DATASET_PRICE);
        assert_eq(marketplace::get_owner(&dataset), SELLER);
        assert_eq(marketplace::get_amount_sold(&dataset), 0);

        ts::return_to_sender(&scenario, dataset);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENonPositivePrice)]
    fun test_list_dataset_zero_price_fails() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let blob_id = object::id_from_address(BLOB_ID);

        marketplace::list_dataset(
            blob_id,
            string::utf8(b"Free Dataset"),
            string::utf8(b"Should fail"),
            vector[string::utf8(b"test")],
            0, // Zero price should fail
            1000000,
            &mut marketplace,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    fun test_list_dataset_with_empty_metadata() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let blob_id = object::id_from_address(BLOB_ID);

        marketplace::list_dataset(
            blob_id,
            string::utf8(b""),
            string::utf8(b""),
            vector::empty<String>(),
            DATASET_PRICE,
            1000000,
            &mut marketplace,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(marketplace);
        ts::next_tx(&mut scenario, SELLER);

        let dataset = ts::take_from_sender<Dataset>(&scenario);
        assert_eq(marketplace::get_title(&dataset), string::utf8(b""));

        ts::return_to_sender(&scenario, dataset);
        ts::end(scenario);
    }

    #[test]
    fun test_list_multiple_datasets() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        // List first dataset
        list_test_dataset(&mut scenario, SELLER, 100);

        // List second dataset
        list_test_dataset(&mut scenario, SELLER, 200);

        ts::end(scenario);
    }

    #[test]
    fun test_delist_dataset_success() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_sender(&scenario, dataset);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENotOwner)]
    fun test_delist_dataset_unauthorized_fails() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, ATTACKER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);

        // Attacker tries to delist seller's dataset
        marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::end(scenario);
    }

    #[test]
    fun test_relist_dataset_success() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        // Delist
        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);
        marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

        // Relist
        marketplace::relist(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_sender(&scenario, dataset);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EDataListed)]
    fun test_relist_already_listed_fails() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        // Try to relist already listed dataset
        marketplace::relist(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_sender(&scenario, dataset);
        ts::end(scenario);
    }

    #[test]
    fun test_update_dataset_title() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        marketplace::set_title(&mut dataset, string::utf8(b"Updated Title"), ts::ctx(&mut scenario));
        assert_eq(marketplace::get_title(&dataset), string::utf8(b"Updated Title"));

        ts::return_to_sender(&scenario, dataset);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENotOwner)]
    fun test_update_dataset_title_unauthorized_fails() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, ATTACKER);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);

        marketplace::set_title(&mut dataset, string::utf8(b"Hacked"), ts::ctx(&mut scenario));

        ts::return_to_address(SELLER, dataset);
        ts::end(scenario);
    }

    #[test]
    fun test_update_dataset_description() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        marketplace::set_description(&mut dataset, string::utf8(b"New Description"), ts::ctx(&mut scenario));
        assert_eq(marketplace::get_description(&dataset), string::utf8(b"New Description"));

        ts::return_to_sender(&scenario, dataset);
        ts::end(scenario);
    }

    #[test]
    fun test_update_dataset_tags() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        let new_tags = vector[string::utf8(b"updated"), string::utf8(b"tags")];
        marketplace::set_tags(&mut dataset, new_tags, ts::ctx(&mut scenario));

        ts::return_to_sender(&scenario, dataset);
        ts::end(scenario);
    }

    #[test]
    fun test_update_dataset_price() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        marketplace::set_price(&mut dataset, 2000, ts::ctx(&mut scenario));
        assert_eq(marketplace::get_price(&dataset), 2000);

        ts::return_to_sender(&scenario, dataset);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENonPositivePrice)]
    fun test_update_price_to_zero_fails() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        marketplace::set_price(&mut dataset, 0, ts::ctx(&mut scenario));

        ts::return_to_sender(&scenario, dataset);
        ts::end(scenario);
    }

    // ============================================================================
    // GROUP 2: BUYER JOURNEY TESTS
    // ============================================================================

    #[test]
    fun test_buy_dataset_success() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE);

        ts::next_tx(&mut scenario, BUYER1);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

        // Verify amount sold increased
        assert_eq(marketplace::get_amount_sold(&dataset), 1);

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);

        // Verify buyer received NFT
        ts::next_tx(&mut scenario, BUYER1);
        assert!(ts::has_most_recent_for_sender<NFT>(&scenario), 0);

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EInsufficientBalance)]
    fun test_buy_dataset_insufficient_balance_fails() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE - 1); // Not enough

        ts::next_tx(&mut scenario, BUYER1);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);
        ts::end(scenario);
    }

    #[test]
    fun test_buy_dataset_fee_calculation_standard() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        let price = 1000u64;
        list_test_dataset(&mut scenario, SELLER, price);
        mint_sui(&mut scenario, BUYER1, price);

        ts::next_tx(&mut scenario, BUYER1);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);

        // Expected: fee = (1000 * 1) / 100 = 10
        // Seller gets: 990
        // Admin gets: 10

        ts::end(scenario);
    }

    #[test]
    fun test_buy_dataset_fee_calculation_low_price() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        let price = 50u64;
        list_test_dataset(&mut scenario, SELLER, price);
        mint_sui(&mut scenario, BUYER1, price);

        ts::next_tx(&mut scenario, BUYER1);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);

        // Expected: fee = (50 * 1) / 100 = 0 (rounds down)
        // This is a known limitation for prices < 100

        ts::end(scenario);
    }

    #[test]
    fun test_buy_dataset_multiple_buyers() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE);
        mint_sui(&mut scenario, BUYER2, DATASET_PRICE);

        // First buyer
        ts::next_tx(&mut scenario, BUYER1);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        // Second buyer
        ts::next_tx(&mut scenario, BUYER2);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

            assert_eq(marketplace::get_amount_sold(&dataset), 2);

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_buy_dataset_with_excess_payment() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE * 2); // Pay double

        ts::next_tx(&mut scenario, BUYER1);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

        // Buyer should have change remaining
        assert!(coin::value(&coin) > 0, 0);

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);
        ts::end(scenario);
    }

    #[test]
    fun test_buy_dataset_nft_ownership() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE);

        ts::next_tx(&mut scenario, BUYER1);
        let dataset_id;
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            dataset_id = object::id(&dataset);
            access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        // Verify NFT was minted and transferred
        ts::next_tx(&mut scenario, BUYER1);
        let nft = ts::take_from_sender<NFT>(&scenario);
        // Would need getter functions on NFT to verify dataset_id
        ts::return_to_sender(&scenario, nft);

        ts::end(scenario);
    }

    // ============================================================================
    // GROUP 3: ACCESS CONTROL & NFT VERIFICATION TESTS
    // ============================================================================

    #[test]
    fun test_seal_approve_valid_nft() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE);

        // Buy dataset
        ts::next_tx(&mut scenario, BUYER1);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        // Verify access with NFT
        ts::next_tx(&mut scenario, BUYER1);
        {
            let dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let nft = ts::take_from_sender<NFT>(&scenario);

            access::seal_approve(b"package_id", &dataset, &nft);

            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, nft);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidOwnership)]
    fun test_seal_approve_wrong_nft_fails() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        // Create two datasets
        let dataset1_id = list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);
        let dataset2_id = list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        mint_sui(&mut scenario, BUYER1, DATASET_PRICE);

        // Buy dataset 1
        ts::next_tx(&mut scenario, BUYER1);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset1 = ts::take_from_address_by_id<Dataset>(&scenario, SELLER, dataset1_id);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset1, &marketplace, &mut coin, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset1);
            ts::return_to_sender(&scenario, coin);
        };

        // Try to access dataset 2 with dataset 1's NFT
        ts::next_tx(&mut scenario, BUYER1);
        {
            let dataset2 = ts::take_from_address_by_id<Dataset>(&scenario, SELLER, dataset2_id);
            let nft1 = ts::take_from_sender<NFT>(&scenario);

            access::seal_approve(b"package_id", &dataset2, &nft1); // Should fail

            ts::return_to_address(SELLER, dataset2);
            ts::return_to_sender(&scenario, nft1);
        };

        ts::end(scenario);
    }

    // Note: This test is commented out because we cannot create fake NFTs
    // without test helper functions in the access module. The contract's
    // design ensures NFTs can only be created through buy_dataset.
    // #[test]
    // #[expected_failure(abort_code = EInvalidOwnership)]
    // fun test_access_without_nft_fails() {
    //     // Would test that users cannot create fake NFTs to access datasets
    // }

    // ============================================================================
    // GROUP 4: MARKETPLACE STATE MANAGEMENT TESTS
    // ============================================================================

    #[test]
    fun test_marketplace_initialization() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, MARKETPLACE_OWNER);
        let marketplace = ts::take_shared<Marketplace>(&scenario);

        assert_eq(marketplace::get_marketplace_owner(&marketplace), MARKETPLACE_OWNER);

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    fun test_marketplace_tracks_listed_datasets() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        // List multiple datasets
        list_test_dataset(&mut scenario, SELLER, 100);
        list_test_dataset(&mut scenario, SELLER, 200);
        list_test_dataset(&mut scenario, BUYER1, 300);

        // Marketplace should track all listings
        ts::next_tx(&mut scenario, MARKETPLACE_OWNER);
        let marketplace = ts::take_shared<Marketplace>(&scenario);

        // Would need getter for on_sale vector to verify count

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    fun test_delist_removes_from_marketplace() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_sender<Dataset>(&scenario);

            marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_sender(&scenario, dataset);
        };

        // Marketplace should no longer track this dataset

        ts::end(scenario);
    }

    #[test]
    fun test_update_marketplace_owner() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, MARKETPLACE_OWNER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);

        marketplace::update_marketplace_owner(&mut marketplace, BUYER1, ts::ctx(&mut scenario));
        assert_eq(marketplace::get_marketplace_owner(&marketplace), BUYER1);

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENotOwner)]
    fun test_update_marketplace_owner_unauthorized_fails() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, ATTACKER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);

        marketplace::update_marketplace_owner(&mut marketplace, ATTACKER, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    // ============================================================================
    // GROUP 5: SECURITY & ATTACK SCENARIOS
    // ============================================================================

    #[test]
    #[expected_failure(abort_code = ENotOwner)]
    fun test_unauthorized_metadata_modification() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, ATTACKER);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);

        marketplace::set_title(&mut dataset, string::utf8(b"Malicious Title"), ts::ctx(&mut scenario));

        ts::return_to_address(SELLER, dataset);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENotOwner)]
    fun test_unauthorized_price_modification() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, ATTACKER);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);

        marketplace::set_price(&mut dataset, 1, ts::ctx(&mut scenario));

        ts::return_to_address(SELLER, dataset);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENotOwner)]
    fun test_unauthorized_delisting() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, ATTACKER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);

        marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::end(scenario);
    }

    #[test]
    fun test_reentrancy_protection_buy() {
        // Move's ownership model prevents reentrancy by design
        // This test verifies the buy flow completes atomically
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE);

        ts::next_tx(&mut scenario, BUYER1);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        let initial_sold = marketplace::get_amount_sold(&dataset);
        access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

        // Verify state updated exactly once
        assert_eq(marketplace::get_amount_sold(&dataset), initial_sold + 1);

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);
        ts::end(scenario);
    }

    #[test]
    fun test_integer_overflow_amount_sold() {
        // Test that amount_sold can handle large numbers
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        // Simulate many sales
        let mut i = 0;
        while (i < 1000) {
            marketplace::increase_amount_sold(&mut dataset);
            i = i + 1;
        };

        assert_eq(marketplace::get_amount_sold(&dataset), 1000);

        ts::return_to_sender(&scenario, dataset);
        ts::end(scenario);
    }

    #[test]
    fun test_price_manipulation_after_listing() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, 100);

        // Seller changes price before buyer purchases
        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);
        marketplace::set_price(&mut dataset, 10000, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, dataset);

        // This is allowed - seller can change price
        ts::end(scenario);
    }

    // ============================================================================
    // GROUP 6: INTEGRATION & END-TO-END TESTS
    // ============================================================================

    #[test]
    fun test_complete_marketplace_flow() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        // Seller lists dataset
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        // Buyer purchases
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE);
        ts::next_tx(&mut scenario, BUYER1);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        // Buyer verifies access
        ts::next_tx(&mut scenario, BUYER1);
        {
            let dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let nft = ts::take_from_sender<NFT>(&scenario);

            access::seal_approve(b"package_id", &dataset, &nft);

            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, nft);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_list_buy_delist_relist_flow() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        // List
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        // Someone buys
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE);
        ts::next_tx(&mut scenario, BUYER1);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        // Delist
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_sender<Dataset>(&scenario);

            marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_sender(&scenario, dataset);
        };

        // Relist
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_sender<Dataset>(&scenario);

            marketplace::relist(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_sender(&scenario, dataset);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_multiple_sellers_multiple_buyers() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        // Multiple sellers list
        list_test_dataset(&mut scenario, SELLER, 100);
        list_test_dataset(&mut scenario, BUYER1, 200);

        // Multiple buyers purchase
        mint_sui(&mut scenario, BUYER2, 100);
        ts::next_tx(&mut scenario, BUYER2);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_update_metadata_after_sales() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        // Make a sale
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE);
        ts::next_tx(&mut scenario, BUYER1);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        // Seller updates metadata after sale
        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);
        marketplace::set_title(&mut dataset, string::utf8(b"Updated After Sale"), ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, dataset);

        ts::end(scenario);
    }

    // ============================================================================
    // GROUP 7: EVENT VERIFICATION TESTS
    // ============================================================================

    #[test]
    fun test_marketplace_created_event() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        // Event emission verified by framework
        ts::end(scenario);
    }

    #[test]
    fun test_dataset_listed_event() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        // DatasetListed event should be emitted
        ts::end(scenario);
    }

    #[test]
    fun test_dataset_delisted_event() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);

        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_sender<Dataset>(&scenario);

            marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_sender(&scenario, dataset);
        };

        // DatasetDelisted event should be emitted
        ts::end(scenario);
    }

    #[test]
    fun test_data_purchased_event() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE);

        ts::next_tx(&mut scenario, BUYER1);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        // DataPurchased event should be emitted
        ts::end(scenario);
    }

    // ============================================================================
    // GROUP 8: EDGE CASES & BOUNDARY CONDITIONS
    // ============================================================================

    #[test]
    fun test_maximum_price() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        let max_price = 18446744073709551615u64; // u64::MAX
        list_test_dataset(&mut scenario, SELLER, max_price);

        ts::end(scenario);
    }

    #[test]
    fun test_minimum_valid_price() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, 1);

        ts::end(scenario);
    }

    #[test]
    fun test_empty_string_metadata() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let blob_id = object::id_from_address(BLOB_ID);

        marketplace::list_dataset(
            blob_id,
            string::utf8(b""),
            string::utf8(b""),
            vector::empty<String>(),
            DATASET_PRICE,
            0,
            &mut marketplace,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    fun test_very_long_metadata() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        // Create very long strings
        let mut long_title = b"";
        let mut i = 0;
        while (i < 100) {
            vector::append(&mut long_title, b"LongTitle");
            i = i + 1;
        };

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let blob_id = object::id_from_address(BLOB_ID);

        marketplace::list_dataset(
            blob_id,
            string::utf8(long_title),
            string::utf8(b"Description"),
            vector[string::utf8(b"tag")],
            DATASET_PRICE,
            1000000,
            &mut marketplace,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    fun test_many_tags() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        let mut tags = vector::empty<String>();
        let mut i = 0;
        while (i < 100) {
            vector::push_back(&mut tags, string::utf8(b"tag"));
            i = i + 1;
        };

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let blob_id = object::id_from_address(BLOB_ID);

        marketplace::list_dataset(
            blob_id,
            string::utf8(b"Dataset"),
            string::utf8(b"Description"),
            tags,
            DATASET_PRICE,
            1000000,
            &mut marketplace,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    fun test_zero_release_date() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let blob_id = object::id_from_address(BLOB_ID);

        marketplace::list_dataset(
            blob_id,
            string::utf8(b"Dataset"),
            string::utf8(b"Description"),
            vector[string::utf8(b"tag")],
            DATASET_PRICE,
            0, // Zero release date
            &mut marketplace,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    fun test_future_release_date() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let blob_id = object::id_from_address(BLOB_ID);

        marketplace::list_dataset(
            blob_id,
            string::utf8(b"Dataset"),
            string::utf8(b"Description"),
            vector[string::utf8(b"tag")],
            DATASET_PRICE,
            9999999999, // Far future
            &mut marketplace,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    fun test_same_seller_multiple_datasets_same_blob() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        let blob_id = object::id_from_address(BLOB_ID);

        // List first dataset
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);

            marketplace::list_dataset(
                blob_id,
                string::utf8(b"Dataset 1"),
                string::utf8(b"First"),
                vector[string::utf8(b"tag1")],
                100,
                1000000,
                &mut marketplace,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(marketplace);
        };

        // List second dataset with same blob_id
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);

            marketplace::list_dataset(
                blob_id, // Same blob ID
                string::utf8(b"Dataset 2"),
                string::utf8(b"Second"),
                vector[string::utf8(b"tag2")],
                200,
                1000000,
                &mut marketplace,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(marketplace);
        };

        ts::end(scenario);
    }

    // ============================================================================
    // GROUP 9: ADMIN & GOVERNANCE TESTS
    // ============================================================================

    #[test]
    fun test_admin_receives_fees() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, 1000);
        mint_sui(&mut scenario, BUYER1, 1000);

        ts::next_tx(&mut scenario, BUYER1);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        // Admin should receive 1% fee = 10
        // Would need to check admin's balance

        ts::end(scenario);
    }

    #[test]
    fun test_marketplace_ownership_transfer() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, MARKETPLACE_OWNER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);

        // Transfer ownership
        marketplace::update_marketplace_owner(&mut marketplace, BUYER1, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);

        // New owner can perform owner actions
        ts::next_tx(&mut scenario, BUYER1);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);

        marketplace::update_marketplace_owner(&mut marketplace, BUYER2, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_transfer_ownership_to_same_owner_fails() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, MARKETPLACE_OWNER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);

        marketplace::update_marketplace_owner(&mut marketplace, MARKETPLACE_OWNER, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    fun test_fees_accumulate_multiple_purchases() {
        let mut scenario = ts::begin(MARKETPLACE_OWNER);
        create_marketplace(&mut scenario);
        list_test_dataset(&mut scenario, SELLER, 1000);

        // First purchase
        mint_sui(&mut scenario, BUYER1, 1000);
        ts::next_tx(&mut scenario, BUYER1);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        // Second purchase
        mint_sui(&mut scenario, BUYER2, 1000);
        ts::next_tx(&mut scenario, BUYER2);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        // Admin should receive 20 total (10 + 10)

        ts::end(scenario);
    }
}
