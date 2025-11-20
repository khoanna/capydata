/// Utility functions for the marketplace
module contract::utils;

/// Check if `prefix` is a prefix of `id`
public fun is_prefix(prefix: vector<u8>, id: vector<u8>): bool {
    let prefix_len = prefix.length();
    if (prefix_len > id.length()) {
        return false
    };

    let mut i = 0;
    while (i < prefix_len) {
        if (prefix[i] != id[i]) {
            return false
        };
        i = i + 1;
    };

    true
}

#[test]
fun test_is_prefix() {
    let prefix = vector[0x01, 0x02, 0x03];
    let id1 = vector[0x01, 0x02, 0x03, 0x04, 0x05];
    let id2 = vector[0x01, 0x02, 0x04];
    let id3 = vector[0x01, 0x02];

    assert!(is_prefix(prefix, id1), 0);
    assert!(!is_prefix(prefix, id2), 1);
    assert!(!is_prefix(prefix, id3), 2);
}
