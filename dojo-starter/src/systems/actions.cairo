use dojo_starter::models::{Points};

#[starknet::interface]
pub trait IActions<T> {
    fn combine_tiles(ref self: T, points_to_add: u32);
}

#[dojo::contract]
pub mod actions {
    use super::{IActions, Points};
    use starknet::{get_caller_address};
    use dojo::model::{ModelStorage};

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn combine_tiles(ref self: ContractState, points_to_add: u32) {
            let mut world = self.world_default();
            let player = get_caller_address();

            let mut points: Points = world.read_model(player);
            
            points.value += points_to_add;

            world.write_model(@points);
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"dojo_starter")
        }
    }
}

