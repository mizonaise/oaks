import type { Option } from "@/lib/form/schema";

export const functionSources: {
  [key: string]: Option[];
} = {
  // function + drawer
  HINGE_SIDE_ITEMS: [
    {
      value: "LEFT",
      label: "Left",
      data: {
        image: "door_type/LEFT.png",
        hinge_side_nbr: "0",
      },
    },
    {
      value: "RIGHT",
      label: "Right",
      data: {
        image: "door_type/RIGHT.png",
        hinge_side_nbr: "1",
      },
    },
  ],
  SELECTED_SUB_ZONE_ITEMS: [
    {
      value: "1",
      label: "1",
      data: {
        allowed_layout: [
          "WACACL_LY_D",
          "WACACL_LY_D1",
          "WACACR_LY_D",
          "WACACR_LY_D1",
          "WACA_LY_D",
          "WACA_LY_D1",
          "WACA_LY_D1_DW",
          "WACA_LY_DB_D",
          "WACA_LY_DB_D_DW",
          "WACA_LY_DR_D",
          "WACA_LY_DR_D_DW",
          "WACA_LY_D_DW",
        ],
      },
    },
    {
      value: "2",
      label: "2",
      data: {
        allowed_layout: [
          "WACACL_LY_D",
          "WACACL_LY_D1",
          "WACACR_LY_D",
          "WACACR_LY_D1",
          "WACA_LY_D",
          "WACA_LY_DB_D",
          "WACA_LY_DB_D_DW",
          "WACA_LY_DR_D",
          "WACA_LY_DR_D_DW",
          "WACA_LY_D_DW",
        ],
      },
    },
  ],
  OPENING_ITEMS: [
    {
      value: "LEFT",
      label: "Left",
      data: {
        allowed_door_type: "SD",
        door_type: "SD",
        hinge_side_nbr: "0",
      },
    },
    {
      value: "RIGHT",
      label: "Right",
      data: {
        allowed_door_type: "SD",
        door_type: "SD",
        hinge_side_nbr: "1",
      },
    },
    {
      value: "DD",
      label: "Door",
      data: {
        allowed_door_type: "DD",
        door_type: "DD",
        hinge_side_nbr: "-1",
      },
    },
    {
      value: "NONE",
      label: "NONE",
      data: {
        allowed_door_type: ["DD", "SD"],
        door_type: "NONE",
        hinge_side_nbr: "-1",
      },
    },
  ],
  COLUMN_ITEMS: [
    {
      value: "1",
      label: "1",
      data: {},
    },
    {
      value: "2",
      label: "2",
      data: {},
    },
    {
      value: "3",
      label: "3",
      data: {},
    },
    {
      value: "4",
      label: "4",
      data: {},
    },
    {
      value: "5",
      label: "5",
      data: {},
    },
    {
      value: "6",
      label: "6",
      data: {},
    },
    {
      value: "7",
      label: "7",
      data: {},
    },
    {
      value: "8",
      label: "8",
      data: {},
    },
    {
      value: "9",
      label: "9",
      data: {},
    },
    {
      value: "10",
      label: "10",
      data: {},
    },
    {
      value: "11",
      label: "11",
      data: {},
    },
    {
      value: "12",
      label: "12",
      data: {},
    },
    {
      value: "13",
      label: "13",
      data: {},
    },
    {
      value: "14",
      label: "14",
      data: {},
    },
  ],
  DOOR_TYPE_ITEMS: [
    {
      value: "SD",
      label: "SD",
      data: {
        DOOR_TYPE_ITEMS: "DR_BL_RUN_SYS_THIN_INT",
        zone_count: "1",
      },
    },
    {
      value: "DD",
      label: "DD",
      data: {
        zone_count: "2",
      },
    },
  ],
  TC_COLUMN_LAYOUT_ITEMS: [
    {
      value: "WACA_LY_DB_D_DW",
      label: "WACA_LY_DB_D_DW",
      data: {
        IS_DR_EXT: "0",
        layout_type: "MD",
        image: "oaksome/layout/WACA_LY_DB_D_DW.svg/public",
        edit_zone_count: "1_2",
      },
    },
    {
      value: "WACA_LY_DB_D",
      label: "WACA_LY_DB_D",
      data: {
        IS_DR_EXT: "0",
        layout_type: "MD",
        image: "oaksome/layout/WACA_LY_DB_D.svg/public",
        edit_zone_count: "1_2",
      },
    },
    {
      value: "WACA_LY_D",
      label: "WACA_LY_D",
      data: {
        IS_DR_EXT: "0",
        layout_type: "MD",
        image: "oaksome/layout/WACA_LY_D.svg/public",
        edit_zone_count: "1_2",
      },
    },
    {
      value: "WACA_LY_D_DW",
      label: "WACA_LY_D_DW",
      data: {
        IS_DR_EXT: "0",
        layout_type: "MD",
        image: "oaksome/layout/WACA_LY_D_DW.svg/public",
        edit_zone_count: "1_2",
      },
    },
    {
      value: "WACA_LY_D1",
      label: "WACA_LY_D1",
      data: {
        IS_DR_EXT: "0",
        layout_type: "MD",
        image: "oaksome/layout/WACA_LY_D1.svg/public",
        edit_zone_count: "1",
      },
    },
    {
      value: "WACA_LY_D1_DW",
      label: "WACA_LY_D1_DW",
      data: {
        IS_DR_EXT: "0",
        layout_type: "MD",
        image: "oaksome/layout/WACA_LY_D1_DW.svg/public",
        edit_zone_count: "1",
      },
    },
    {
      value: "WACA_LY_DR_D_DW",
      label: "WACA_LY_DR_D_DW",
      data: {
        TC_COLUMN_LAYOUT_ITEMS: "DR_BL_RUN_SYS_THIN_INT",
        IS_DR_EXT: "1",
        layout_type: "MD",
        image: "oaksome/layout/WACA_LY_DR_D_DW.svg/public",
        edit_zone_count: "1_2",
      },
    },
    {
      value: "WACA_LY_DR_D",
      label: "WACA_LY_DR_D",
      data: {
        IS_DR_EXT: "1",
        layout_type: "MD",
        image: "oaksome/layout/WACA_LY_DR_D.svg/public",
        edit_zone_count: "1_2",
      },
    },
    {
      value: "WACACL_LY_D",
      label: "WACACL_LY_D",
      data: {
        IS_DR_EXT: "0",
        layout_type: "CL",
        image: "oaksome/layout/WACACL_LY_D.svg/public",
        edit_zone_count: "1_2",
      },
    },
    {
      value: "WACACL_LY_D1",
      label: "WACACL_LY_D1",
      data: {
        IS_DR_EXT: "0",
        layout_type: "CL",
        image: "oaksome/layout/WACACL_LY_D1.svg/public",
        edit_zone_count: "1",
      },
    },
    {
      value: "WACACR_LY_D",
      label: "WACACR_LY_D",
      data: {
        IS_DR_EXT: "0",
        layout_type: "CR",
        image: "oaksome/layout/WACACR_LY_D.svg/public",
        edit_zone_count: "1_2",
      },
    },
    {
      value: "WACACR_LY_D1",
      label: "WACACR_LY_D1",
      data: {
        IS_DR_EXT: "0",
        layout_type: "CR",
        image: "oaksome/layout/WACACR_LY_D1.svg/public",
        edit_zone_count: "1",
      },
    },
  ],
  TC_SUB_ZONE_1_TYPE_ITEMS: [
    {
      value: "X",
      label: "X",
      data: {
        layout: [
          "WACACL_LY_D",
          "WACACL_LY_D1",
          "WACACR_LY_D",
          "WACACR_LY_D1",
          "WACA_LY_D1",
          "WACA_LY_D1_DW",
          "WACA_LY_DB_D",
          "WACA_LY_DB_D_DW",
        ],
        image: "oaksome/zone_type/X.svg/public",
      },
    },
    {
      value: "DR",
      label: "DR",
      data: {
        TC_SUB_ZONE_1_TYPE_ITEMS: "DR_BL_RUN_SYS_THIN_INT",
        layout: [
          "WACA_LY_D",
          "WACA_LY_DR_D",
          "WACA_LY_DR_D_DW",
          "WACA_LY_D_DW",
        ],
        image: "oaksome/zone_type/DR.svg/public",
      },
    },
    {
      value: "OP_DR",
      label: "OP_DR",
      data: {
        layout: ["WACA_LY_D", "WACA_LY_D_DW"],
        image: "oaksome/zone_type/OP_DR.svg/public",
      },
    },
    {
      value: "AS",
      label: "AS",
      data: {
        layout: ["WACA_LY_D", "WACA_LY_D_DW"],
        image: "oaksome/zone_type/AS.svg/public",
      },
    },
    {
      value: "HC",
      label: "HC",
      data: {
        layout: ["WACA_LY_D", "WACA_LY_D_DW"],
        image: "oaksome/zone_type/HC.svg/public",
      },
    },
  ],
  TC_SUB_ART_1_ITEMS: [
    {
      value: "4IDR",
      label: "4IDR",
      data: {
        zone_count: ["1", "2"],
        layout: [
          "WACA_LY_D",
          "WACA_LY_DB_D",
          "WACA_LY_DB_D_DW",
          "WACA_LY_D_DW",
        ],
        layout_type: "MD",
        sub_type: ["DR", "X"],
        image: "oaksome/tc_sub_art/4IDR.svg/public",
      },
    },
    {
      value: "IOP_2IDR",
      label: "IOP_2IDR",
      data: {
        zone_count: ["1", "2"],
        layout: [
          "WACA_LY_D",
          "WACA_LY_DB_D",
          "WACA_LY_DB_D_DW",
          "WACA_LY_D_DW",
        ],
        layout_type: "MD",
        sub_type: ["OP_DR", "X"],
        image: "oaksome/tc_sub_art/IOP_2IDR.svg/public",
      },
    },
    {
      value: "IOP_1IDR",
      label: "IOP_1IDR",
      data: {
        zone_count: ["1", "2"],
        layout: [
          "WACA_LY_D",
          "WACA_LY_DB_D",
          "WACA_LY_DB_D_DW",
          "WACA_LY_D_DW",
        ],
        layout_type: "MD",
        sub_type: ["OP_DR", "X"],
        image: "oaksome/tc_sub_art/IOP_1IDR.svg/public",
      },
    },
    {
      value: "IAS",
      label: "IAS",
      data: {
        zone_count: ["1", "2"],
        layout: [
          "WACACL_LY_D",
          "WACACL_LY_D1",
          "WACACR_LY_D",
          "WACACR_LY_D1",
          "WACA_LY_D",
          "WACA_LY_D1",
          "WACA_LY_D1_DW",
          "WACA_LY_DB_D",
          "WACA_LY_DB_D_DW",
          "WACA_LY_D_DW",
        ],
        layout_type: ["CL", "CR", "MD"],
        sub_type: ["AS", "X"],
        image: "oaksome/tc_sub_art/IAS.svg/public",
      },
    },
    {
      value: "6IDR",
      label: "6IDR",
      data: {
        zone_count: ["1", "2"],
        layout: ["WACA_LY_D", "WACA_LY_D_DW"],
        layout_type: "MD",
        sub_type: "DR",
        image: "oaksome/tc_sub_art/6IDR.svg/public",
      },
    },
    {
      value: "5IDR",
      label: "5IDR",
      data: {
        zone_count: ["1", "2"],
        layout: ["WACA_LY_D", "WACA_LY_D_DW"],
        layout_type: "MD",
        sub_type: "DR",
        image: "oaksome/tc_sub_art/5IDR.svg/public",
      },
    },
    {
      value: "3IDR",
      label: "3IDR",
      data: {
        zone_count: ["1", "2"],
        layout: ["WACA_LY_D", "WACA_LY_D_DW"],
        layout_type: "MD",
        sub_type: "DR",
        image: "oaksome/tc_sub_art/3IDR.svg/public",
      },
    },
    {
      value: "2IDR",
      label: "2IDR",
      data: {
        zone_count: ["1", "2"],
        layout: ["WACA_LY_D", "WACA_LY_D_DW"],
        layout_type: "MD",
        sub_type: "DR",
        image: "oaksome/tc_sub_art/2IDR.svg/public",
      },
    },
    {
      value: "1IDR",
      label: "1IDR",
      data: {
        zone_count: ["1", "2"],
        layout: ["WACA_LY_D", "WACA_LY_D_DW"],
        layout_type: "MD",
        sub_type: "DR",
        image: "oaksome/tc_sub_art/1IDR.svg/public",
      },
    },
    {
      value: "IOP_3IDR",
      label: "IOP_3IDR",
      data: {
        zone_count: ["1", "2"],
        layout: ["WACA_LY_D", "WACA_LY_D_DW"],
        layout_type: "MD",
        sub_type: "OP_DR",
        image: "oaksome/tc_sub_art/IOP_3IDR.svg/public",
      },
    },
    {
      value: "IOP_4IDR",
      label: "IOP_4IDR",
      data: {
        zone_count: ["1", "2"],
        layout: ["WACA_LY_D", "WACA_LY_D_DW"],
        layout_type: "MD",
        sub_type: "OP_DR",
        image: "oaksome/tc_sub_art/IOP_4IDR.svg/public",
      },
    },
    {
      value: "IHC",
      label: "IHC",
      data: {
        zone_count: ["1", "2"],
        layout: [
          "WACACL_LY_D",
          "WACACL_LY_D1",
          "WACACR_LY_D",
          "WACACR_LY_D1",
          "WACA_LY_D",
          "WACA_LY_D1",
          "WACA_LY_D1_DW",
          "WACA_LY_D_DW",
        ],
        layout_type: ["CL", "CR", "MD"],
        sub_type: ["HC", "X"],
        image: "oaksome/tc_sub_art/IHC.svg/public",
      },
    },
    {
      value: "2DR1_DR2",
      label: "2DR1_DR2",
      data: {
        zone_count: ["1", "2"],
        layout: ["WACA_LY_DR_D", "WACA_LY_DR_D_DW"],
        layout_type: "MD",
        sub_type: "DR",
        image: "oaksome/tc_sub_art/2DR1_DR2.svg/public",
      },
    },
    {
      value: "DR2_2DR1",
      label: "DR2_2DR1",
      data: {
        TC_SUB_ART_1_ITEMS: "DR_BL_RUN_SYS_THIN_INT",
        zone_count: ["1", "2"],
        layout: ["WACA_LY_DR_D", "WACA_LY_DR_D_DW"],
        layout_type: "MD",
        sub_type: "DR",
        image: "oaksome/tc_sub_art/DR2_2DR1.svg/public",
      },
    },
    {
      value: "DR1_DR2_DR1",
      label: "DR1_DR2_DR1",
      data: {
        zone_count: ["1", "2"],
        layout: ["WACA_LY_DR_D", "WACA_LY_DR_D_DW"],
        layout_type: "MD",
        sub_type: "DR",
        image: "oaksome/tc_sub_art/DR1_DR2_DR1.svg/public",
      },
    },
    {
      value: "2DR2",
      label: "2DR2",
      data: {
        zone_count: ["1", "2"],
        layout: ["WACA_LY_DR_D", "WACA_LY_DR_D_DW"],
        layout_type: "MD",
        sub_type: "DR",
        image: "oaksome/tc_sub_art/2DR2.svg/public",
      },
    },
    {
      value: "4DR1",
      label: "4DR1",
      data: {
        zone_count: ["1", "2"],
        layout: ["WACA_LY_DR_D", "WACA_LY_DR_D_DW"],
        layout_type: "MD",
        sub_type: "DR",
        image: "oaksome/tc_sub_art/4DR1.svg/public",
      },
    },
  ],
  TC_SUB_ART_2_ITEMS: [
    {
      value: "IHC",
      label: "IHC",
      data: {
        layout: [
          "WACACL_LY_D",
          "WACACR_LY_D",
          "WACA_LY_D",
          "WACA_LY_DB_D",
          "WACA_LY_DB_D_DW",
          "WACA_LY_DR_D",
          "WACA_LY_DR_D_DW",
          "WACA_LY_D_DW",
        ],
        image: "oaksome/tc_sub_art/IHC.svg/public",
      },
    },
    {
      value: "1IDR_IHC",
      label: "1IDR_IHC",
      data: {
        TC_SUB_ART_2_ITEMS: "DR_BL_RUN_SYS_THIN_INT",
        layout: [
          "WACA_LY_DB_D",
          "WACA_LY_DB_D_DW",
          "WACA_LY_DR_D",
          "WACA_LY_DR_D_DW",
        ],
        image: "oaksome/tc_sub_art/1IDR_IHC.svg/public",
      },
    },
    {
      value: "2IDR_IHC",
      label: "2IDR_IHC",
      data: {
        layout: [
          "WACA_LY_DB_D",
          "WACA_LY_DB_D_DW",
          "WACA_LY_DR_D",
          "WACA_LY_DR_D_DW",
        ],
        image: "oaksome/tc_sub_art/2IDR_IHC.svg/public",
      },
    },
    {
      value: "IAS",
      label: "IAS",
      data: {
        layout: [
          "WACACL_LY_D",
          "WACACR_LY_D",
          "WACA_LY_D",
          "WACA_LY_DB_D",
          "WACA_LY_DB_D_DW",
          "WACA_LY_DR_D",
          "WACA_LY_DR_D_DW",
          "WACA_LY_D_DW",
        ],
        image: "oaksome/tc_sub_art/IAS.svg/public",
      },
    },
    {
      value: "1IDR_IAS",
      label: "1IDR_IAS",
      data: {
        layout: [
          "WACA_LY_DB_D",
          "WACA_LY_DB_D_DW",
          "WACA_LY_DR_D",
          "WACA_LY_DR_D_DW",
        ],
        image: "oaksome/tc_sub_art/1IDR_IAS.svg/public",
      },
    },
    {
      value: "2IDR_IAS",
      label: "2IDR_IAS",
      data: {
        layout: [
          "WACA_LY_DB_D",
          "WACA_LY_DB_D_DW",
          "WACA_LY_DR_D",
          "WACA_LY_DR_D_DW",
        ],
        image: "oaksome/tc_sub_art/2IDR_IAS.svg/public",
      },
    },
  ],
};
