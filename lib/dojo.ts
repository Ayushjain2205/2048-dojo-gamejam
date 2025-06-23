export const WORLD_ADDRESS =
  "0x4a8ed1a46118db416888f6b98caf1e4c64bb33a20f89d98cbc59da46856fb7e";

export const ACTIONS_ABI = [
  {
    type: "interface",
    name: "dojo_starter::systems::actions::IActions",
    items: [
      {
        type: "function",
        name: "combine_tiles",
        inputs: [
          {
            name: "points_to_add",
            type: "core::integer::u32",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
    ],
  },
];

export const WORLD_ABI = [
  {
    type: "impl",
    name: "World",
    interface_name: "dojo::world::iworld::IWorld",
  },
  {
    type: "interface",
    name: "dojo::world::iworld::IWorld",
    items: [
      {
        type: "function",
        name: "entity",
        inputs: [
          {
            name: "model",
            type: "core::felt252",
          },
          {
            name: "keys",
            type: "core::array::Span::<core::felt252>",
          },
          {
            name: "layout",
            type: "dojo::meta::layout::Layout",
          },
        ],
        outputs: [
          {
            type: "core::array::Span::<core::felt252>",
          },
        ],
        state_mutability: "view",
      },
    ],
  },
];
