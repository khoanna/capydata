module contract::marketplace {
    use std::string::String;
    use sui::event::emit;
    use sui::package::claim_and_keep;
    
    #[error]
    const ENotOwner:vector<u8> = b"Not owner";

    #[error]
    const ENonPositivePrice:vector<u8> = b"Price should be larger than 0";

    #[error]
    const EAlreadyMarketplaceOwner: vector<u8> = b"You are already the owner of this marketplace";

    #[error]
    const EDatasetNotListed: vector<u8> = b"The dataset is not listed, so you cannot delist it";

    #[error]
    const EDataListed: vector<u8> = b"The data is listed";

    #[error]
    const EDataObjectExisted: vector<u8> = b"This data exists";

    public struct MarketplaceCreated has copy, drop{
        marketplace_id: ID,
        owner: address,
    }

    public struct DatasetListed has copy, drop{
        dataset_id: ID,
    }
    public struct DatasetDelisted has copy, drop{
        dataset_id: ID,
    }
    
    public struct MARKETPLACE has drop{}

    public struct Marketplace has key {
        id: UID,
        owner: address,
        on_sale: vector<ID>,
    }

    public struct Dataset has key, store{
        id: UID,
        // Object ID of the blob
		blob_object_id: ID,
		owner: address,
		title: String,
        filename: String,
        filetype: String,
		description: String,
		tags: vector<String>,
		price: u64,
        // Number of buyers, in interger type
		amount_sold: u64,
		release_date: u64,
        on_listed: bool
    }

    fun init (otw: MARKETPLACE, ctx: &mut TxContext) {
        claim_and_keep(otw, ctx);
        let marketplace = Marketplace {
            id: object::new(ctx),
            owner: ctx.sender(),
            on_sale: vector::empty<ID>(),
        };
        emit(MarketplaceCreated { marketplace_id: object::id(&marketplace), owner: marketplace.owner });
        transfer::share_object(marketplace);
    }

    
    #[allow(lint(self_transfer))]
    public fun list_dataset(blob_object_id: ID, title: String, description: String, tags: vector<String>, price: u64, release_date: u64, marketplace: &mut Marketplace, ctx: &mut TxContext) {
        assert!(price > 0, ENonPositivePrice);

        let mut dataset = Dataset {
            id: object::new(ctx),
            blob_object_id,
            owner: ctx.sender(),
            title,
            filename,
            filetype,
            description,
            tags,
            price,
            amount_sold: 0,
            release_date,
            on_listed: true
        };
        assert!(!marketplace.on_sale.contains(&object::id(&dataset)),EDataListed);
        // marketplace.on_sale.push_back(object::uid_to_address(dataset.id));
        marketplace.on_sale.push_back(object::id(&dataset));
        let _id = object::id(&dataset);
        transfer::public_transfer(dataset, ctx.sender());
        emit(DatasetListed{
            dataset_id: _id
        });
    }
    

    public fun delist_dataset(dataset: &mut Dataset, marketplace: &mut Marketplace, ctx: &TxContext) {
        assert!(dataset.owner == ctx.sender(), ENotOwner);
        assert!(dataset.on_listed == true, EDatasetNotListed);
        let (_, index) = vector::index_of(&marketplace.on_sale, &object::id(dataset));
        vector::remove(&mut marketplace.on_sale, index);
        let _id = object::id(dataset);
        dataset.on_listed = false;
        // let Dataset { id, .. } = dataset;
        // object::delete(id);
        emit(DatasetDelisted { 
            dataset_id: _id
         })
    }
    public fun relist(dataset: &mut Dataset, marketplace: &mut Marketplace, ctx: &TxContext){
        assert!(dataset.owner == ctx.sender(), ENotOwner);
        assert!(dataset.on_listed == false, EDataListed);
        dataset.on_listed = true;
        marketplace.on_sale.push_back(object::id(dataset));
    }

    public fun update_marketplace_owner(marketplace: &mut Marketplace, new_owner: address, ctx: &mut TxContext){
        assert!(marketplace.owner == ctx.sender(), ENotOwner);
        assert!(marketplace.owner != new_owner, EAlreadyMarketplaceOwner);
        marketplace.owner = new_owner;
    }


    // Getter functions
    public fun get_blob_object_id(dataset: &Dataset):ID{
        dataset.blob_object_id
    }
    public fun get_owner(dataset: &Dataset):address{
        dataset.owner
    }
    public fun get_title(dataset: &Dataset):String{
        dataset.title
    }
    public fun get_description(dataset: &Dataset):String{
        dataset.description
    }
    public fun get_tags(dataset: &Dataset):vector<String>{
        dataset.tags
    }
    public fun get_price(dataset: &Dataset):u64{
        dataset.price
    }
    public fun get_amount_sold(dataset: &Dataset):u64{
        dataset.amount_sold
    }
    public fun get_release_date(dataset:&Dataset):u64{
        dataset.release_date
    }
    public fun get_marketplace_owner(marketplace: &Marketplace):address{
        marketplace.owner
    }
    // Setter functions
    public fun set_title(dataset: &mut Dataset, new_title: String, ctx: &mut TxContext){
        assert!(dataset.owner == ctx.sender(), ENotOwner);
        dataset.title = new_title;
    }
    public fun set_description(dataset: &mut Dataset, new_description: String, ctx: &mut TxContext){
        assert!(dataset.owner == ctx.sender(), ENotOwner);
        dataset.description = new_description;
    }
    public fun set_tags(dataset: &mut Dataset, new_tags: vector<String>, ctx: &mut TxContext){
        assert!(dataset.owner == ctx.sender(), ENotOwner);
        dataset.tags = new_tags;
    }
    public fun set_price(dataset: &mut Dataset, new_price: u64, ctx: &mut TxContext){
        assert!(new_price > 0, ENonPositivePrice);
        assert!(dataset.owner == ctx.sender(), ENotOwner);
        dataset.price = new_price;
    }
    public fun increase_amount_sold(dataset: &mut Dataset){
        dataset.amount_sold = dataset.amount_sold + 1;
    }
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext){
        init(MARKETPLACE{}, ctx);
    }
}