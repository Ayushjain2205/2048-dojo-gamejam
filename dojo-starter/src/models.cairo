use starknet::{ContractAddress};

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Points {
    #[key]
    pub player: ContractAddress,
    pub value: u32,
}
