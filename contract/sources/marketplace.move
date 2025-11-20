module contract::marketplace {
    use std::string::String;

    public struct Marketplace has key {
        id: UID,
        on_sale: vector<ID>,
    }

    public struct Dataset has key, store{
        id: UID,
		blob_id: ID,
		owner: address,
		title: String,
		description: String,
		tags: vector<String>,
		price: u64,
		amount_sold: u64,
		release_date: u64
    }

    fun init (ctx: &mut TxContext) {
        let marketplace = Marketplace {
            id: object::new(ctx),
            on_sale: vector::empty<ID>(),
        };
        transfer::share_object(marketplace);
    }

    entry fun list_dataset(blob_id: ID, title: String, description: String, tags: vector<String>, price: u64, release_date: u64, ctx: &mut TxContext) {
        let dataset = Dataset {
            id: object::new(ctx),
            blob_id,
            owner: ctx.sender(),
            title,
            description,
            tags,
            price,
            amount_sold: 0,
            release_date
        };
        transfer::public_transfer(dataset, ctx.sender());
    }

    entry fun delist_dataset(dataset: Dataset, marketplace: &mut Marketplace) {
        let (_, index) = vector::index_of(&marketplace.on_sale, &object::id(&dataset));
        vector::remove(&mut marketplace.on_sale, index);
        let Dataset { id, .. } = dataset;
        object::delete(id);
    }

}