/// Allowlist module for access control
/// Based on the provided implementation with improvements
module contract::allowlist;

use std::string::String;
use contract::utils::is_prefix;
use sui::dynamic_field as df;

// Error codes
const EInvalidCap: u64 = 0;
const ENoAccess: u64 = 1;
const EDuplicate: u64 = 2;

// Marker value for published blobs
const MARKER: u64 = 3;

/// Allowlist for managing access to encrypted data
public struct Allowlist has key {
    id: UID,
    name: String,
    list: vector<address>,
}

/// Capability for managing an allowlist
public struct Cap has key {
    id: UID,
    allowlist_id: ID,
}

/// Create a new allowlist and return the capability
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

/// Entry function to create allowlist
entry fun create_allowlist_entry(name: String, ctx: &mut TxContext) {
    transfer::transfer(create_allowlist(name, ctx), ctx.sender());
}

/// Add an address to the allowlist
public fun add(allowlist: &mut Allowlist, cap: &Cap, account: address) {
    assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
    assert!(!allowlist.list.contains(&account), EDuplicate);
    allowlist.list.push_back(account);
}

/// Remove an address from the allowlist
public fun remove(allowlist: &mut Allowlist, cap: &Cap, account: address) {
    assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
    let (contains, idx) = allowlist.list.index_of(&account);
    if (contains) {
        allowlist.list.remove(idx);
    };
}

/// Get the namespace for this allowlist (the UID bytes)
public fun namespace(allowlist: &Allowlist): vector<u8> {
    allowlist.id.to_bytes()
}

/// Internal approval function
fun approve_internal(caller: address, id: vector<u8>, allowlist: &Allowlist): bool {
    // Check if the id has the right prefix
    let namespace = namespace(allowlist);
    if (!is_prefix(namespace, id)) {
        return false
    };

    // Check if user is in the allowlist
    allowlist.list.contains(&caller)
}

/// Seal approve entry function - called by Seal key servers
entry fun seal_approve(id: vector<u8>, allowlist: &Allowlist, ctx: &TxContext) {
    assert!(approve_internal(ctx.sender(), id, allowlist), ENoAccess);
}

/// Attach a blob to the allowlist (publish a dataset)
public fun publish(allowlist: &mut Allowlist, cap: &Cap, blob_id: String) {
    assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
    df::add(&mut allowlist.id, blob_id, MARKER);
}

/// Check if an address has access
public fun has_access(allowlist: &Allowlist, account: address): bool {
    allowlist.list.contains(&account)
}

/// Get allowlist size
public fun size(allowlist: &Allowlist): u64 {
    allowlist.list.length()
}

/// Get allowlist name
public fun name(allowlist: &Allowlist): String {
    allowlist.name
}

#[test_only]
use sui::test_scenario::{Self as test, Scenario, next_tx, ctx};

#[test]
fun test_create_and_add() {
    let owner = @0xA;
    let user1 = @0xB;

    let mut scenario = test::begin(owner);

    // Create allowlist
    {
        create_allowlist_entry(b"Test Allowlist".to_string(), ctx(&mut scenario));
    };

    // Get cap and allowlist
    next_tx(&mut scenario, owner);
    {
        let cap = test::take_from_sender<Cap>(&scenario);
        let mut allowlist = test::take_shared<Allowlist>(&scenario);

        // Add user
        add(&mut allowlist, &cap, user1);
        assert!(has_access(&allowlist, user1), 0);
        assert!(size(&allowlist) == 1, 1);

        test::return_to_sender(&scenario, cap);
        test::return_shared(allowlist);
    };

    test::end(scenario);
}

#[test]
#[expected_failure(abort_code = EDuplicate)]
fun test_duplicate_add() {
    let owner = @0xA;
    let user1 = @0xB;

    let mut scenario = test::begin(owner);

    create_allowlist_entry(b"Test".to_string(), ctx(&mut scenario));

    next_tx(&mut scenario, owner);
    {
        let cap = test::take_from_sender<Cap>(&scenario);
        let mut allowlist = test::take_shared<Allowlist>(&scenario);

        add(&mut allowlist, &cap, user1);
        add(&mut allowlist, &cap, user1); // Should fail

        test::return_to_sender(&scenario, cap);
        test::return_shared(allowlist);
    };

    test::end(scenario);
}
