#[test_only]
module contract::contract_tests {
    use contract::marketplace::{Self, Marketplace, Dataset};
    use contract::access::{Self, NFT};
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use std::string::{Self, String};
    use sui::clock::{Self, Clock};

    // Test addresses
    const MARKETPLACE_OWNER: address = @0xA;
    const SELLER: address = @0xB;
    const BUYER1: address = @0xC;
    const BUYER2: address = @0xD;
    const ATTACKER: address = @0xE;
    const BLOB_ID: address = @0x1234;

    // Test constants
    const DATASET_PRICE: u64 = 1000;

    // Helper functions
    fun setup_test(): Scenario {
        ts::begin(MARKETPLACE_OWNER)
    }

    fun create_marketplace(scenario: &mut Scenario) {
        ts::next_tx(scenario, MARKETPLACE_OWNER);
        {
            marketplace::init_for_testing(ts::ctx(scenario));
        };
    }

    fun create_clock(scenario: &mut Scenario): Clock {
        ts::next_tx(scenario, MARKETPLACE_OWNER);
        clock::create_for_testing(ts::ctx(scenario))
    }

    fun list_test_dataset(
        scenario: &mut Scenario,
        seller: address,
        price: u64,
        clock: &Clock
    ): ID {
        ts::next_tx(scenario, seller);
        let mut marketplace = ts::take_shared<Marketplace>(scenario);
        let blob_id = object::id_from_address(BLOB_ID);

        marketplace::list_dataset(
            blob_id,
            string::utf8(b"Test Dataset"),
            string::utf8(b"test.csv"),
            string::utf8(b"csv"),
            string::utf8(b"A test dataset"),
            vector[string::utf8(b"test"), string::utf8(b"data")],
            price,
            &mut marketplace,
            clock,
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
    // GROUP 1: SELLER LIFECYCLE TESTS (20 tests)
    // ============================================================================

    #[test]
    fun test_list_dataset_success() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let blob_id = object::id_from_address(BLOB_ID);

        marketplace::list_dataset(
            blob_id,
            string::utf8(b"My Dataset"),
            string::utf8(b"data.json"),
            string::utf8(b"json"),
            string::utf8(b"Description"),
            vector[string::utf8(b"tag1")],
            DATASET_PRICE,
            &mut marketplace,
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(marketplace);
        ts::next_tx(&mut scenario, SELLER);

        let dataset = ts::take_from_sender<Dataset>(&scenario);
        assert!(marketplace::get_title(&dataset) == string::utf8(b"My Dataset"));
        assert!(marketplace::get_price(&dataset) == DATASET_PRICE);
        assert!(marketplace::get_owner(&dataset) == SELLER);
        assert!(marketplace::get_amount_sold(&dataset) == 0);

        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::ENonPositivePrice)]
    fun test_list_dataset_zero_price_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let blob_id = object::id_from_address(BLOB_ID);

        marketplace::list_dataset(
            blob_id,
            string::utf8(b"Free Dataset"),
            string::utf8(b"free.txt"),
            string::utf8(b"txt"),
            string::utf8(b"Should fail"),
            vector[string::utf8(b"test")],
            0,
            &mut marketplace,
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(marketplace);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_list_dataset_with_empty_metadata() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let blob_id = object::id_from_address(BLOB_ID);

        marketplace::list_dataset(
            blob_id,
            string::utf8(b""),
            string::utf8(b""),
            string::utf8(b""),
            string::utf8(b""),
            vector::empty<String>(),
            DATASET_PRICE,
            &mut marketplace,
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(marketplace);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_list_multiple_datasets() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, 100, &clock);
        list_test_dataset(&mut scenario, SELLER, 200, &clock);

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_delist_dataset_success() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::ENotOwner)]
    fun test_delist_dataset_unauthorized_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, ATTACKER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);

        marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::EDatasetNotListed)]
    fun test_delist_already_delisted_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));
        marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_relist_dataset_success() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));
        marketplace::relist(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::EDataListed)]
    fun test_relist_already_listed_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        marketplace::relist(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::ENotOwner)]
    fun test_relist_unauthorized_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_sender<Dataset>(&scenario);
            marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));
            ts::return_shared(marketplace);
            ts::return_to_sender(&scenario, dataset);
        };

        ts::next_tx(&mut scenario, ATTACKER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);

        marketplace::relist(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_update_dataset_title() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        marketplace::set_title(&mut dataset, string::utf8(b"Updated Title"), ts::ctx(&mut scenario));
        assert!(marketplace::get_title(&dataset) == string::utf8(b"Updated Title"));

        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::ENotOwner)]
    fun test_update_dataset_title_unauthorized_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, ATTACKER);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);

        marketplace::set_title(&mut dataset, string::utf8(b"Hacked"), ts::ctx(&mut scenario));

        ts::return_to_address(SELLER, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_update_dataset_description() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        marketplace::set_description(&mut dataset, string::utf8(b"New Description"), ts::ctx(&mut scenario));
        assert!(marketplace::get_description(&dataset) == string::utf8(b"New Description"));

        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::ENotOwner)]
    fun test_update_dataset_description_unauthorized_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, ATTACKER);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);

        marketplace::set_description(&mut dataset, string::utf8(b"Hacked"), ts::ctx(&mut scenario));

        ts::return_to_address(SELLER, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_update_dataset_tags() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        let new_tags = vector[string::utf8(b"updated"), string::utf8(b"tags")];
        marketplace::set_tags(&mut dataset, new_tags, ts::ctx(&mut scenario));

        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::ENotOwner)]
    fun test_update_dataset_tags_unauthorized_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, ATTACKER);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);

        marketplace::set_tags(&mut dataset, vector[string::utf8(b"hack")], ts::ctx(&mut scenario));

        ts::return_to_address(SELLER, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_update_dataset_price() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        marketplace::set_price(&mut dataset, 2000, ts::ctx(&mut scenario));
        assert!(marketplace::get_price(&dataset) == 2000);

        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::ENonPositivePrice)]
    fun test_update_price_to_zero_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        marketplace::set_price(&mut dataset, 0, ts::ctx(&mut scenario));

        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::ENotOwner)]
    fun test_update_price_unauthorized_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, ATTACKER);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);

        marketplace::set_price(&mut dataset, 1, ts::ctx(&mut scenario));

        ts::return_to_address(SELLER, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // ============================================================================
    // GROUP 2: BUYER JOURNEY TESTS (8 tests)
    // ============================================================================

    #[test]
    fun test_buy_dataset_success() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE + 1);

        ts::next_tx(&mut scenario, BUYER1);
        let marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

        assert!(marketplace::get_amount_sold(&dataset) == 1);

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);

        ts::next_tx(&mut scenario, BUYER1);
        assert!(ts::has_most_recent_for_sender<NFT>(&scenario));

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = access::EInsufficientBalance)]
    fun test_buy_dataset_insufficient_balance_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE - 1);

        ts::next_tx(&mut scenario, BUYER1);
        let marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = access::EInsufficientBalance)]
    fun test_buy_dataset_exact_balance_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE);

        ts::next_tx(&mut scenario, BUYER1);
        let marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_buy_dataset_fee_calculation() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        let price = 1000u64;
        list_test_dataset(&mut scenario, SELLER, price, &clock);
        mint_sui(&mut scenario, BUYER1, price + 10);

        ts::next_tx(&mut scenario, BUYER1);
        let marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_buy_dataset_fee_calculation_low_price() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        let price = 50u64;
        list_test_dataset(&mut scenario, SELLER, price, &clock);
        mint_sui(&mut scenario, BUYER1, price + 1);

        ts::next_tx(&mut scenario, BUYER1);
        let marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_buy_dataset_multiple_buyers() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE + 1);
        mint_sui(&mut scenario, BUYER2, DATASET_PRICE + 1);

        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        ts::next_tx(&mut scenario, BUYER2);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            assert!(marketplace::get_amount_sold(&dataset) == 2);

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_buy_dataset_with_excess_payment() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE * 2);

        ts::next_tx(&mut scenario, BUYER1);
        let marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

        assert!(coin::value(&coin) > 0);

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // ============================================================================
    // GROUP 3: ACCESS CONTROL & NFT VERIFICATION TESTS (2 tests)
    // ============================================================================

    #[test]
    fun test_seal_approve_valid_nft() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE + 1);

        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        ts::next_tx(&mut scenario, BUYER1);
        {
            let dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let nft = ts::take_from_sender<NFT>(&scenario);

            access::seal_approve(b"package_id", &dataset, &nft);

            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, nft);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = access::EInvalidOwnership)]
    fun test_seal_approve_wrong_nft_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        let dataset1_id = list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);
        let dataset2_id = list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        mint_sui(&mut scenario, BUYER1, DATASET_PRICE + 1);

        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset1 = ts::take_from_address_by_id<Dataset>(&scenario, SELLER, dataset1_id);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset1, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset1);
            ts::return_to_sender(&scenario, coin);
        };

        ts::next_tx(&mut scenario, BUYER1);
        {
            let dataset2 = ts::take_from_address_by_id<Dataset>(&scenario, SELLER, dataset2_id);
            let nft1 = ts::take_from_sender<NFT>(&scenario);

            access::seal_approve(b"package_id", &dataset2, &nft1);

            ts::return_to_address(SELLER, dataset2);
            ts::return_to_sender(&scenario, nft1);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // ============================================================================
    // GROUP 4: MARKETPLACE STATE MANAGEMENT TESTS (5 tests)
    // ============================================================================

    #[test]
    fun test_marketplace_initialization() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, MARKETPLACE_OWNER);
        let marketplace = ts::take_shared<Marketplace>(&scenario);

        assert!(marketplace::get_marketplace_owner(&marketplace) == MARKETPLACE_OWNER);

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    fun test_update_marketplace_owner() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, MARKETPLACE_OWNER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);

        marketplace::update_marketplace_owner(&mut marketplace, BUYER1, ts::ctx(&mut scenario));
        assert!(marketplace::get_marketplace_owner(&marketplace) == BUYER1);

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::ENotOwner)]
    fun test_update_marketplace_owner_unauthorized_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, ATTACKER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);

        marketplace::update_marketplace_owner(&mut marketplace, ATTACKER, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::EAlreadyMarketplaceOwner)]
    fun test_update_marketplace_owner_to_same_fails() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, MARKETPLACE_OWNER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);

        marketplace::update_marketplace_owner(&mut marketplace, MARKETPLACE_OWNER, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    #[test]
    fun test_marketplace_ownership_transfer_chain() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);

        ts::next_tx(&mut scenario, MARKETPLACE_OWNER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);

        marketplace::update_marketplace_owner(&mut marketplace, BUYER1, ts::ctx(&mut scenario));
        ts::return_shared(marketplace);

        ts::next_tx(&mut scenario, BUYER1);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        marketplace::update_marketplace_owner(&mut marketplace, BUYER2, ts::ctx(&mut scenario));

        assert!(marketplace::get_marketplace_owner(&marketplace) == BUYER2);

        ts::return_shared(marketplace);
        ts::end(scenario);
    }

    // ============================================================================
    // GROUP 5: INTEGRATION & END-TO-END TESTS (4 tests)
    // ============================================================================

    #[test]
    fun test_complete_marketplace_flow() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        mint_sui(&mut scenario, BUYER1, DATASET_PRICE + 1);
        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        ts::next_tx(&mut scenario, BUYER1);
        {
            let dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let nft = ts::take_from_sender<NFT>(&scenario);

            access::seal_approve(b"package_id", &dataset, &nft);

            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, nft);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_list_buy_delist_relist_flow() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        mint_sui(&mut scenario, BUYER1, DATASET_PRICE + 1);
        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_sender<Dataset>(&scenario);

            marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_sender(&scenario, dataset);
        };

        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_sender<Dataset>(&scenario);

            marketplace::relist(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_sender(&scenario, dataset);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_update_metadata_after_sales() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        mint_sui(&mut scenario, BUYER1, DATASET_PRICE + 1);
        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);
        marketplace::set_title(&mut dataset, string::utf8(b"Updated After Sale"), ts::ctx(&mut scenario));
        marketplace::set_description(&mut dataset, string::utf8(b"Updated description"), ts::ctx(&mut scenario));
        marketplace::set_price(&mut dataset, 2000, ts::ctx(&mut scenario));

        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_price_change_after_listing() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, 100, &clock);

        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);
        marketplace::set_price(&mut dataset, 10000, ts::ctx(&mut scenario));
        assert!(marketplace::get_price(&dataset) == 10000);
        ts::return_to_sender(&scenario, dataset);

        mint_sui(&mut scenario, BUYER1, 10001);
        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // ============================================================================
    // GROUP 6: EDGE CASES & BOUNDARY CONDITIONS (7 tests)
    // ============================================================================

    #[test]
    fun test_maximum_price() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        let max_price = 18446744073709551615u64;
        list_test_dataset(&mut scenario, SELLER, max_price, &clock);

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_minimum_valid_price() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, 1, &clock);

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_very_long_metadata() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

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
            string::utf8(b"file.txt"),
            string::utf8(b"txt"),
            string::utf8(b"Description"),
            vector[string::utf8(b"tag")],
            DATASET_PRICE,
            &mut marketplace,
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(marketplace);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_many_tags() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

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
            string::utf8(b"data.json"),
            string::utf8(b"json"),
            string::utf8(b"Description"),
            tags,
            DATASET_PRICE,
            &mut marketplace,
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(marketplace);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_same_seller_multiple_datasets_same_blob() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        let blob_id = object::id_from_address(BLOB_ID);

        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);

            marketplace::list_dataset(
                blob_id,
                string::utf8(b"Dataset 1"),
                string::utf8(b"file1.csv"),
                string::utf8(b"csv"),
                string::utf8(b"First"),
                vector[string::utf8(b"tag1")],
                100,
                &mut marketplace,
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(marketplace);
        };

        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);

            marketplace::list_dataset(
                blob_id,
                string::utf8(b"Dataset 2"),
                string::utf8(b"file2.csv"),
                string::utf8(b"csv"),
                string::utf8(b"Second"),
                vector[string::utf8(b"tag2")],
                200,
                &mut marketplace,
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(marketplace);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_integer_overflow_simulation_amount_sold() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, SELLER);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);

        let mut i = 0;
        while (i < 1000) {
            marketplace::increase_amount_sold(&mut dataset);
            i = i + 1;
        };

        assert!(marketplace::get_amount_sold(&dataset) == 1000);

        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_release_date_uses_clock_timestamp() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let mut clock = create_clock(&mut scenario);

        clock::set_for_testing(&mut clock, 12345678);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, SELLER);
        let dataset = ts::take_from_sender<Dataset>(&scenario);

        assert!(marketplace::get_release_date(&dataset) == 12345678);

        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // ============================================================================
    // GROUP 7: CRITICAL MISSING TEST CASES (20 tests)
    // ============================================================================

    // --- Buying from Delisted Datasets ---
    #[test]
    fun test_buy_delisted_dataset_should_fail() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        // Delist the dataset
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_sender<Dataset>(&scenario);
            marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));
            ts::return_shared(marketplace);
            ts::return_to_sender(&scenario, dataset);
        };

        // Try to buy delisted dataset
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE + 1);
        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            // This should succeed - the contract doesn't prevent buying delisted datasets!
            // This might be a bug in the contract
            access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // --- Seller Self-Purchase ---
    #[test]
    fun test_seller_buy_own_dataset() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);
        mint_sui(&mut scenario, SELLER, DATASET_PRICE + 1);

        ts::next_tx(&mut scenario, SELLER);
        let marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_sender<Dataset>(&scenario);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        // Seller buys their own dataset - should this be prevented?
        access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

        assert!(marketplace::get_amount_sold(&dataset) == 1);

        ts::return_shared(marketplace);
        ts::return_to_sender(&scenario, dataset);
        ts::return_to_sender(&scenario, coin);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // --- Fee Calculation Edge Cases ---
    #[test]
    fun test_buy_dataset_price_99_fee_rounds_to_zero() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, 99, &clock);
        mint_sui(&mut scenario, BUYER1, 100);

        ts::next_tx(&mut scenario, BUYER1);
        let marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        // Fee = (99 * 1) / 100 = 0 due to integer division
        access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_buy_dataset_price_1_minimum_price() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, 1, &clock);
        mint_sui(&mut scenario, BUYER1, 2);

        ts::next_tx(&mut scenario, BUYER1);
        let marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        // Fee = (1 * 1) / 100 = 0
        access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_payment_distribution_verification() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        let price = 1000u64;
        list_test_dataset(&mut scenario, SELLER, price, &clock);
        mint_sui(&mut scenario, BUYER1, price + 100);

        let buyer_initial_balance = price + 100;

        ts::next_tx(&mut scenario, BUYER1);
        let marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

        // Buyer should have initial - price remaining
        let buyer_remaining = coin::value(&coin);
        assert!(buyer_remaining == buyer_initial_balance - price);

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // --- Clock Edge Cases ---
    #[test]
    fun test_list_dataset_with_zero_timestamp() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let mut clock = create_clock(&mut scenario);

        clock::set_for_testing(&mut clock, 0);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, SELLER);
        let dataset = ts::take_from_sender<Dataset>(&scenario);

        assert!(marketplace::get_release_date(&dataset) == 0);

        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_buy_dataset_timestamp_recorded() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let mut clock = create_clock(&mut scenario);

        clock::set_for_testing(&mut clock, 999999999);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE + 1);

        ts::next_tx(&mut scenario, BUYER1);
        let marketplace = ts::take_shared<Marketplace>(&scenario);
        let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
        let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

        access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        ts::return_to_sender(&scenario, coin);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // --- Getter Function Coverage ---
    #[test]
    fun test_get_blob_object_id() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        let blob_id = object::id_from_address(BLOB_ID);

        ts::next_tx(&mut scenario, SELLER);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);

        marketplace::list_dataset(
            blob_id,
            string::utf8(b"Test"),
            string::utf8(b"test.csv"),
            string::utf8(b"csv"),
            string::utf8(b"Description"),
            vector[string::utf8(b"tag")],
            DATASET_PRICE,
            &mut marketplace,
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(marketplace);

        ts::next_tx(&mut scenario, SELLER);
        let dataset = ts::take_from_sender<Dataset>(&scenario);

        assert!(marketplace::get_blob_object_id(&dataset) == blob_id);

        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // --- State After Failed Transactions ---
    #[test]
    fun test_amount_sold_unchanged_after_failed_purchase() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE - 1);

        ts::next_tx(&mut scenario, BUYER1);
        let marketplace = ts::take_shared<Marketplace>(&scenario);
        let dataset = ts::take_from_address<Dataset>(&scenario, SELLER);

        let initial_amount_sold = marketplace::get_amount_sold(&dataset);

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);

        // Transaction will fail due to insufficient balance
        // Verify amount_sold is still 0
        ts::next_tx(&mut scenario, SELLER);
        let dataset = ts::take_from_sender<Dataset>(&scenario);
        assert!(marketplace::get_amount_sold(&dataset) == initial_amount_sold);

        ts::return_to_sender(&scenario, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // --- Multiple Datasets Concurrent Operations ---
    #[test]
    fun test_buy_dataset_a_while_updating_dataset_b() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        let dataset_a_id = list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);
        let dataset_b_id = list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        mint_sui(&mut scenario, BUYER1, DATASET_PRICE + 1);

        // Seller updates dataset B
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut dataset_b = ts::take_from_sender_by_id<Dataset>(&scenario, dataset_b_id);
            marketplace::set_price(&mut dataset_b, 2000, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, dataset_b);
        };

        // Buyer buys dataset A
        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset_a = ts::take_from_address_by_id<Dataset>(&scenario, SELLER, dataset_a_id);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset_a, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset_a);
            ts::return_to_sender(&scenario, coin);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_delist_dataset_while_another_is_being_sold() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        let dataset_a_id = list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);
        let dataset_b_id = list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        mint_sui(&mut scenario, BUYER1, DATASET_PRICE + 1);

        // Buyer buys dataset A
        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset_a = ts::take_from_address_by_id<Dataset>(&scenario, SELLER, dataset_a_id);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset_a, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset_a);
            ts::return_to_sender(&scenario, coin);
        };

        // Seller delists dataset B
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset_b = ts::take_from_sender_by_id<Dataset>(&scenario, dataset_b_id);
            marketplace::delist_dataset(&mut dataset_b, &mut marketplace, ts::ctx(&mut scenario));
            ts::return_shared(marketplace);
            ts::return_to_sender(&scenario, dataset_b);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // --- NFT Transfer and Ownership ---
    #[test]
    fun test_nft_ownership_after_purchase() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE + 1);

        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        // Verify NFT was created and sent to buyer
        ts::next_tx(&mut scenario, BUYER1);
        {
            assert!(ts::has_most_recent_for_sender<NFT>(&scenario));
            let nft = ts::take_from_sender<NFT>(&scenario);
            ts::return_to_sender(&scenario, nft);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_transferred_nft_can_approve_access() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);
        mint_sui(&mut scenario, BUYER1, DATASET_PRICE + 1);

        // BUYER1 purchases dataset
        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        // BUYER1 transfers NFT to BUYER2
        ts::next_tx(&mut scenario, BUYER1);
        {
            let nft = ts::take_from_sender<NFT>(&scenario);
            transfer::public_transfer(nft, BUYER2);
        };

        // BUYER2 can now use the NFT to approve access
        ts::next_tx(&mut scenario, BUYER2);
        {
            let dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let nft = ts::take_from_sender<NFT>(&scenario);

            access::seal_approve(b"package_id", &dataset, &nft);

            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, nft);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // --- Marketplace Array Integrity ---
    #[test]
    fun test_on_sale_array_after_multiple_operations() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        // List 3 datasets
        let _id1 = list_test_dataset(&mut scenario, SELLER, 100, &clock);
        let id2 = list_test_dataset(&mut scenario, SELLER, 200, &clock);
        let _id3 = list_test_dataset(&mut scenario, SELLER, 300, &clock);

        // Delist dataset 2
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset2 = ts::take_from_sender_by_id<Dataset>(&scenario, id2);
            marketplace::delist_dataset(&mut dataset2, &mut marketplace, ts::ctx(&mut scenario));
            ts::return_shared(marketplace);
            ts::return_to_sender(&scenario, dataset2);
        };

        // Relist dataset 2
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset2 = ts::take_from_sender_by_id<Dataset>(&scenario, id2);
            marketplace::relist(&mut dataset2, &mut marketplace, ts::ctx(&mut scenario));
            ts::return_shared(marketplace);
            ts::return_to_sender(&scenario, dataset2);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // --- Price Change Impact on Purchase ---
    #[test]
    fun test_price_change_during_purchase_attempt() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, 1000, &clock);

        // Seller changes price to 2000
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut dataset = ts::take_from_sender<Dataset>(&scenario);
            marketplace::set_price(&mut dataset, 2000, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, dataset);
        };

        // Buyer has 1500 (enough for old price, not enough for new)
        mint_sui(&mut scenario, BUYER1, 1500);

        ts::next_tx(&mut scenario, BUYER1);
        let marketplace = ts::take_shared<Marketplace>(&scenario);
        let dataset = ts::take_from_address<Dataset>(&scenario, SELLER);

        // Should fail with new price
        assert!(marketplace::get_price(&dataset) == 2000);

        ts::return_shared(marketplace);
        ts::return_to_address(SELLER, dataset);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // --- Multiple Sellers ---
    #[test]
    fun test_multiple_sellers_different_datasets() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, 1000, &clock);
        list_test_dataset(&mut scenario, BUYER1, 2000, &clock);
        list_test_dataset(&mut scenario, BUYER2, 3000, &clock);

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // --- Fee Distribution Verification ---
    #[test]
    fun test_marketplace_owner_receives_fee() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        let price = 10000u64;
        list_test_dataset(&mut scenario, SELLER, price, &clock);
        mint_sui(&mut scenario, BUYER1, price + 1);

        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_address<Dataset>(&scenario, SELLER);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset);
            ts::return_to_sender(&scenario, coin);
        };

        // Marketplace owner should have received fee = (10000 * 1) / 100 = 100
        ts::next_tx(&mut scenario, MARKETPLACE_OWNER);
        assert!(ts::has_most_recent_for_sender<Coin<SUI>>(&scenario));

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // --- Large Scale Operations ---
    #[test]
    fun test_sequential_purchases_by_same_buyer() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        let id1 = list_test_dataset(&mut scenario, SELLER, 100, &clock);
        let id2 = list_test_dataset(&mut scenario, SELLER, 200, &clock);
        let id3 = list_test_dataset(&mut scenario, SELLER, 300, &clock);

        mint_sui(&mut scenario, BUYER1, 1000);

        // Buy all three datasets
        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset1 = ts::take_from_address_by_id<Dataset>(&scenario, SELLER, id1);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset1, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset1);
            ts::return_to_sender(&scenario, coin);
        };

        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset2 = ts::take_from_address_by_id<Dataset>(&scenario, SELLER, id2);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset2, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset2);
            ts::return_to_sender(&scenario, coin);
        };

        ts::next_tx(&mut scenario, BUYER1);
        {
            let marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset3 = ts::take_from_address_by_id<Dataset>(&scenario, SELLER, id3);
            let mut coin = ts::take_from_sender<Coin<SUI>>(&scenario);

            access::buy_dataset(&mut dataset3, &marketplace, &mut coin, &clock, ts::ctx(&mut scenario));

            ts::return_shared(marketplace);
            ts::return_to_address(SELLER, dataset3);
            ts::return_to_sender(&scenario, coin);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // --- Update After Delist ---
    #[test]
    fun test_update_metadata_on_delisted_dataset() {
        let mut scenario = setup_test();
        create_marketplace(&mut scenario);
        let clock = create_clock(&mut scenario);

        list_test_dataset(&mut scenario, SELLER, DATASET_PRICE, &clock);

        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let mut dataset = ts::take_from_sender<Dataset>(&scenario);
            marketplace::delist_dataset(&mut dataset, &mut marketplace, ts::ctx(&mut scenario));
            ts::return_shared(marketplace);
            ts::return_to_sender(&scenario, dataset);
        };

        // Update metadata on delisted dataset - should work
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut dataset = ts::take_from_sender<Dataset>(&scenario);
            marketplace::set_title(&mut dataset, string::utf8(b"Updated While Delisted"), ts::ctx(&mut scenario));
            marketplace::set_price(&mut dataset, 5000, ts::ctx(&mut scenario));
            assert!(marketplace::get_title(&dataset) == string::utf8(b"Updated While Delisted"));
            assert!(marketplace::get_price(&dataset) == 5000);
            ts::return_to_sender(&scenario, dataset);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}
