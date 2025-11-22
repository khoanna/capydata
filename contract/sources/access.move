module contract::access {
    
    use contract::marketplace::{Dataset, Marketplace};
    use sui::coin::Coin;
    use sui::sui::SUI;
    use sui::coin::balance;
    use sui::transfer::public_transfer;
    use sui::event::emit;
    use sui::clock::Clock;

    

    // Fee rate in basis points (1 basis point = 0.01%)
    // 100 basis points = 1%
    const FEE_RATE_BPS:u64 = 100;

    // Price threshold for fee tier (100 SUI)
    const PRICE_THRESHOLD:u64 = 100;

    #[error]
    const EInsufficientBalance:vector<u8> = b"Insufficient balance";

    #[error]
    const EInvalidOwnership:vector<u8> = b"Cannot get access to this dataset";

    // Events
    public struct DataPurchased has copy, drop{
        buyer: address,
        seller: address,
        price: u64,
        dataset_id: ID,
        timestamp: u64
    }
   
    public struct NFT has key, store{
        id: UID,
        dataset_id: ID
    }
    // When calling this function, pass clock = '0x6'
    #[allow(lint(self_transfer))]
    public fun buy_dataset(
        dataset: &mut Dataset, 
        marketplace: &Marketplace, 
        coin: &mut Coin<SUI>, 
        clock: &Clock, 
        ctx: &mut TxContext
    ){

        assert!(balance(coin).value() > dataset.get_price(), EInsufficientBalance);

        let mut paid = coin.split(dataset.get_price(), ctx);

        // Tiered fee structure:
        // - If price <= 100: marketplace takes 100% (entire payment)
        // - If price > 100: marketplace takes 1% fee
        let fee_amount = if (dataset.get_price() <= PRICE_THRESHOLD) {
            dataset.get_price()  // 100% fee for cheap items
        } else {
            (dataset.get_price() * FEE_RATE_BPS) / 10000  // 1% fee for expensive items
        };

        let fee = paid.split(fee_amount, ctx);

        public_transfer(paid, dataset.get_owner());

        let new_NFT = NFT{
            id: object::new(ctx),
            dataset_id: object::id(dataset)
        };

        dataset.increase_amount_sold();

        transfer::transfer(new_NFT, ctx.sender());
        transfer::public_transfer(fee, marketplace.get_marketplace_owner());

        emit(DataPurchased{
            buyer: ctx.sender(),
            seller: dataset.get_owner(),
            price: dataset.get_price(),
            dataset_id: object::id(dataset),
            timestamp: clock.timestamp_ms(),
        });
    }
    
    // _id is the package id. Called in frontend when we decrypt the data
    public fun seal_approve(_id: vector<u8> ,dataset: &Dataset, nft: &NFT){
        assert!(object::id(dataset) == nft.dataset_id, EInvalidOwnership);
    }

}