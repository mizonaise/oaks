import { FormNode } from "@/lib/form/schema";
import { sources } from "./sources";

export const form: FormNode = {
  name: "CONFIGURATOR",
  render: "SECTION",
  type: "TAB",
  label: "Configurator",
  dependencies: [],
  children: [
    {
      name: "ZF_FORM",
      render: "SECTION",
      type: "NONE",
      label: "Section",
      dependencies: [],
      children: [
        {
          name: "INSTALLATION_TYPE",
          render: "FIELD",
          type: "COMBO",
          label: "Instaltion type",
          options: sources["SR-6b4b775b"],
          defaultValue: "",
          dependencies: [],
          variables: [
            {
              name: "IS_BI_L",
              path: ".data.IS_BI_L",
            },
            {
              name: "IS_BI_R",
              path: ".data.IS_BI_R",
            },
          ],
        },
        {
          name: "ZF_HEIGHT",
          render: "FIELD",
          type: "INPUT",
          label: "Height",
          max: "3000",
          min: "1800",
          defaultValue: "2500",
          dependencies: [],
          variables: [
            {
              name: "ZONE_H",
              path: ".",
            },
          ],
        },
        {
          name: "ZF_WIDTH",
          render: "FIELD",
          type: "INPUT",
          label: "Width",
          max: "6000",
          min: "400",
          defaultValue: "3000",
          dependencies: [],
          variables: [
            {
              name: "ZF_W",
              path: ".",
            },
          ],
        },
        {
          name: "ZF_DEPTH",
          render: "FIELD",
          type: "INPUT",
          label: "Depth",
          max: "800",
          min: "350",
          defaultValue: "500",
          dependencies: [],
          variables: [
            {
              name: "ZF_D",
              path: ".",
            },
          ],
        },
        {
          name: "ZF_CNT",
          render: "FIELD",
          type: "INPUT",
          label: "Number of articles",
          max: "round(@ZF_WIDTH/400)",
          min: "round(@ZF_WIDTH/500)",
          defaultValue: "2",
          dependencies: [],
          variables: [
            {
              name: "ZF_CNT",
              path: ".",
            },
          ],
        },
        {
          name: "fillers",
          render: "SECTION",
          type: "NONE",
          label: "Fillers",
          dependencies: [],
          children: [
            {
              name: "FILLER_TOP",
              render: "FIELD",
              type: "INPUT",
              label: "Top",
              max: "500",
              min: "30",
              defaultValue: "50",
              dependencies: [],
              variables: [
                {
                  name: "CROWN_HEIGHT",
                  path: ".",
                },
              ],
            },
            {
              name: "FILLER_LEFT",
              render: "FIELD",
              type: "INPUT",
              label: "Left",
              max: "200",
              min: "50",
              defaultValue: "50",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "OR",
                      roles: [
                        {
                          leftValue: "@INSTALLATION_TYPE.value",
                          comparison: "=",
                          rightValue: "BUILT_IN",
                        },
                        {
                          leftValue: "@INSTALLATION_TYPE.value",
                          comparison: "I",
                          rightValue: "BUILT_IN_LEFT",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ZFL_W",
                  path: ".",
                },
              ],
            },
            {
              name: "FILLER_RIGHT",
              render: "FIELD",
              type: "INPUT",
              label: "Right",
              max: "200",
              min: "50",
              defaultValue: "50",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "OR",
                      roles: [
                        {
                          leftValue: "@INSTALLATION_TYPE.value",
                          comparison: "=",
                          rightValue: "BUILT_IN",
                        },
                        {
                          leftValue: "@INSTALLATION_TYPE.value",
                          comparison: "=",
                          rightValue: "BUILT_IN_RIGHT",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ZFR_W",
                  path: ".",
                },
              ],
            },
            {
              name: "FILLER_BOTTOM",
              render: "FIELD",
              type: "INPUT",
              label: "Bottom",
              max: "200",
              min: "30",
              defaultValue: "100",
              dependencies: [],
              variables: [
                {
                  name: "BASE_HEIGHT",
                  path: ".",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "ZF_STYLER",
      render: "SECTION",
      type: "NONE",
      label: "Styler",
      dependencies: [],
      // variables: [
      //   {
      //     name: "MAT_VS_1",
      //     path: "$MAT_1",
      //   },
      //   {
      //     name: "MAT_BK_1",
      //     path: "$MAT_1",
      //   },
      //   {
      //     name: "MAT_AS_1",
      //     path: "$MAT_1",
      //   },
      //   {
      //     name: "MAT_FS_1",
      //     path: "$MAT_1",
      //   },
      //   {
      //     name: "MAT_BS_1",
      //     path: "$MAT_1",
      //   },
      //   {
      //     name: "MAT_TS_1",
      //     path: "$MAT_1",
      //   },
      //   {
      //     name: "MAT_RS_1",
      //     path: "$MAT_1",
      //   },
      //   {
      //     name: "MAT_LS_1",
      //     path: "$MAT_1",
      //   },
      //   {
      //     name: "SRF_VS_1_BOT",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_VS_1_TOP",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_BK_1_BOT",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_BK_1_TOP",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_AS_1_BOT",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_AS_1_TOP",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_FS_1_BOT",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_FS_1_TOP",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_BS_1_BOT",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_BS_1_TOP",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_TS_1_BOT",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_TS_1_TOP",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_RS_1_BOT",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_RS_1_TOP",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_LS_1_BOT",
      //     path: "$SRF_1_TOP",
      //   },
      //   {
      //     name: "SRF_LS_1_TOP",
      //     path: "$SRF_1_TOP",
      //   },
      // ],

      children: [
        {
          name: "ZF_COLLECTION",
          render: "FIELD",
          type: "COMBO",
          label: "Collection",
          options: sources["SR-6292d37f"],
          defaultValue: "COLLECTION_01",
          dependencies: [],
        },
        {
          name: "ZF_FRONT_TYPE",
          render: "FIELD",
          type: "COMBO",
          label: "Front",
          options: sources["SR-624566dd"],
          defaultValue: "",
          dependencies: [],
          variables: [
            {
              name: "Door_Name",
              path: ".",
            },
            {
              name: "Have_Pull",
              path: ".data.have_pull",
            },
            {
              name: "MAT_FR_1_THK",
              path: ".data.mat_1_thk",
            },
            {
              name: "SRF_FR_1_THK",
              path: ".data.srf_1_thk",
            },
            {
              name: "MAT_FR_2_THK",
              path: ".data.mat_2_thk",
            },
            {
              name: "SRF_HN_1_THK",
              path: ".data.mat_hn_thk",
            },
          ],
          filters: [
            {
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_COLLECTION.value",
                      comparison: "I",
                      rightValue: ".data.filter",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_CAT_COLOR",
          render: "FIELD",
          type: "COMBO",
          label: "Color category",
          options: sources["SR-a0322421"],
          defaultValue: "",
          dependencies: [],
          filters: [
            {
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue:
                        "CONCAT(@ZF_COLLECTION.value,@ZF_FRONT_TYPE.value)",
                      comparison: "I",
                      rightValue: ".data.filter",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_FINISH_EXT",
          render: "FIELD",

          type: "COMBO",
          label: "Color category",
          options: sources["SR-d3c27484"],
          defaultValue: "",

          dependencies: [],
          variables: [
            {
              name: "MAT_FR_1",
              path: ".data.mat_fr_1",
            },
            {
              name: "SRF_FR_1_TOP",
              path: ".data.srf_1_top",
            },
            {
              name: "SRF_FR_1_BOT",
              path: ".data.srf_1_top",
            },
            {
              name: "PRF_FR_1",
              path: ".data.prf_fr",
            },
            {
              name: "MAT_FR_2",
              path: ".data.mat_fr_2",
            },
            {
              name: "SRF_FR_2_BOT",
              path: ".data.srf_2_top",
            },
            {
              name: "SRF_FR_2_TOP",
              path: ".data.srf_2_top",
            },
          ],
          filters: [
            {
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue:
                        "CONCAT(@ZF_COLLECTION.value,@ZF_FRONT_TYPE.value,@ZF_CAT_COLOR.value)",
                      comparison: "I",
                      rightValue: ".data.filter",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_FINISH_EXT_5PD",
          render: "FIELD",

          type: "COMBO",
          label: "Exterior 02",
          options: sources["SR-a382152b"],
          defaultValue: "",

          dependencies: [],
          variables: [
            {
              name: "SRF_FR_3_TOP",
              path: ".",
            },
          ],
          filters: [
            {
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue:
                        "CONCAT(@ZF_COLLECTION.value,@ZF_FRONT_TYPE.value)",
                      comparison: "I",
                      rightValue: ".data.filter",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_FINISH_INT",
          render: "FIELD",
          type: "COMBO",
          label: "Interior",
          options: sources["SR-6e00d63d"],
          defaultValue: "",
          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@HAVE_PULL",
                      comparison: "=",
                      rightValue: "Yes",
                    },
                  ],
                },
              ],
            },
          ],
          variables: [
            {
              name: "MAT_1",
              path: ".data.mat",
            },
            {
              name: "MAT_1_THK",
              path: ".data.mat_thk",
            },
            {
              name: "MAT_DSI_1",
              path: ".data.drawer_material",
            },
            {
              name: "MAT_DSI_1_THK",
              path: ".data.drawer_mat_thk",
            },
            {
              name: "SRF_DSI_1_BOT",
              path: ".data.drawer_srf",
            },
            {
              name: "SRF_DSI_1_TOP",
              path: ".data.drawer_srf",
            },
            {
              name: "SRF_DBK_1_BOT",
              path: ".data.drawer_srf",
            },
            {
              name: "SRF_DBK_1_TOP",
              path: ".data.drawer_srf",
            },
            {
              name: "SRF_DSI_1_THK",
              path: ".data.drawer_srf_thk",
            },
            {
              name: "MAT_DBK_1",
              path: ".data.drawer_material",
            },
            {
              name: "SRF_1_TOP",
              path: ".data.srf_top",
            },
            {
              name: "SRF_1_BOT",
              path: ".data.srf_bot",
            },
            {
              name: "SRF_1_THK",
              path: ".data.srf_thk",
            },
            {
              name: "PRF_1",
              path: ".data.prf_1",
            },
          ],
          filters: [
            {
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue:
                        "CONCAT(@ZF_COLLECTION.value,@ZF_FRONT_TYPE.value,@ZF_FINISH_EXT.data.render)",
                      comparison: "I",
                      rightValue: ".data.filter",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_PULL",
          render: "FIELD",

          type: "COMBO",
          label: "Pull",
          options: sources["SR-618bcbd2"],
          defaultValue: "",
          dependencies: [],
          variables: [
            {
              name: "PULL_X",
              path: "data.pull_x",
            },
            {
              name: "PULL_Y",
              path: "data.pull_y",
            },
            {
              name: "PULL_Z",
              path: "data.pull_z",
            },
            {
              name: "PULL_GLB",
              path: "data.glb",
            },
          ],
          filters: [
            {
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue:
                        "CONCAT(@ZF_COLLECTION.value,@ZF_FRONT_TYPE.value,@ZF_FINISH_EXT.data.render)",
                      comparison: "I",
                      rightValue: ".data.filter",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "ZF_FUNCTION",
      render: "SECTION",
      type: "NONE",
      label: "Function",
      dependencies: [],
      children: [
        {
          name: "ZF_MODULE",
          render: "FIELD",

          type: "COMBO",
          label: "Column",
          options: sources["SR-64600860"],
          defaultValue: "",
          dependencies: [],
          filters: [
            {
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_CNT",
                      comparison: ">=",
                      rightValue: ".data.accumulator",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL01_SECTION",
          render: "SECTION",
          label: "Column 01",

          type: "NONE",
          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "1",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL01_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_01",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL01_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_01.DS_WACA_FR_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL01_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL01_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL01_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL01_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL01_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL01_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL01_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL01_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_01.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL01_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL01_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL01_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL01_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_01.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL01_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL01_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_01.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_01.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL01_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL02_SECTION",
          render: "SECTION",
          label: "Column 02",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "2",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL02_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_02",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL02_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_02.DS_WACA_FR_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL02_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL02_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL02_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL02_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL02_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL02_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL02_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL02_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_02.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL02_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL02_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL02_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL02_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_02.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL02_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL02_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_02.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_02.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL02_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL03_SECTION",
          render: "SECTION",
          label: "Column 03",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "3",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL03_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_03",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL03_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_03.DS_WACA_FR_ART_03",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL03_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL03_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL03_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL03_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL03_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL03_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL03_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL03_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_03.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL03_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL03_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL03_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL03_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_03.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL03_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL03_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_03.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_03.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL03_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL04_SECTION",
          render: "SECTION",
          label: "Column 04",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "4",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL04_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_04",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL04_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_04.DS_WACA_FR_ART_04",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL04_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL04_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL04_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL04_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL04_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL04_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL04_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL04_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_04.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL04_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL04_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL04_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL04_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_04.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL04_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL04_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_04.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_04.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL04_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL05_SECTION",
          render: "SECTION",
          label: "Column 05",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "5",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL05_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_05",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL05_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_05.DS_WACA_FR_ART_05",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL05_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL05_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL05_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL05_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL05_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL05_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL05_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL05_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_05.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL05_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL05_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL05_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL05_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_05.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL05_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL05_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_05.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_05.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL05_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL06_SECTION",
          render: "SECTION",
          label: "Column 06",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "6",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL06_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_06",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL06_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_06.DS_WACA_FR_ART_06",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL06_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL06_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL06_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL06_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL06_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL06_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL06_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL06_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_06.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL06_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL06_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL06_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL06_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_06.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL06_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL06_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_06.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_06.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL06_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL07_SECTION",
          render: "SECTION",
          label: "Column 07",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "7",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL07_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_07",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL07_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_07.DS_WACA_FR_ART_07",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL07_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL07_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL07_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL07_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL07_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL07_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL07_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL07_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_07.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL07_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL07_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL07_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL07_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_07.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL07_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL07_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_07.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_07.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL07_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL08_SECTION",
          render: "SECTION",
          label: "Column 08",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "8",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL08_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_08",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL08_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_08.DS_WACA_FR_ART_08",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL08_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL08_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL08_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL08_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL08_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL08_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL08_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL08_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_08.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL08_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL08_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL08_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL08_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_08.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL08_LAYOUT.data.edit_zone_count",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL08_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_08.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_08.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL08_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL09_SECTION",
          render: "SECTION",
          label: "Column 09",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "9",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL09_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_09",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL09_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_09.DS_WACA_FR_ART_09",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL09_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL09_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL09_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL09_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL09_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL09_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL09_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL09_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_09.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL09_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL09_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL09_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL09_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_09.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL09_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL09_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_09.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_09.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL09_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL10_SECTION",
          render: "SECTION",
          label: "Column 10",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "10",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL10_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_10",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL10_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_10.DS_WACA_FR_ART_10",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL10_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL10_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL10_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL10_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL10_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL10_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL10_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL10_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_10.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL10_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL10_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL10_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL10_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_10.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL10_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL10_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_10.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_10.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL10_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL11_SECTION",
          render: "SECTION",
          label: "Column 11",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "11",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL11_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_11",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL11_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_11.DS_WACA_FR_ART_11",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL11_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL11_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL11_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL11_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL11_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL11_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL11_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL11_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_11.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL11_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL11_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL11_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL11_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_11.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL11_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL11_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_11.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_11.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL11_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL12_SECTION",
          render: "SECTION",
          label: "Column 12",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "12",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL12_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_12",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL12_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_12.DS_WACA_FR_ART_12",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL12_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL12_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL12_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL12_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL12_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL12_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL12_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL12_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_12.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL12_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL12_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL12_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL12_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_12.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL12_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL12_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_12.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_12.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL12_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL13_SECTION",
          render: "SECTION",
          label: "Column 13",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "13",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL13_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_13",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL13_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_13.DS_WACA_FR_ART_13",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL13_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL13_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL13_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL13_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL13_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL13_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL13_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL13_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_13.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL13_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL13_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL13_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL13_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_13.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL13_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL13_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_13.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_13.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL13_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL14_SECTION",
          render: "SECTION",
          label: "Column 14",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "14",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL14_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_14",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL14_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_14.DS_WACA_FR_ART_14",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL14_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL14_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL14_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL14_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL14_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL14_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL14_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL14_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_14.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL14_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL14_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL14_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL14_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_14.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL14_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL14_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_14.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_14.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL14_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL15_SECTION",
          render: "SECTION",
          label: "Column 15",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "15",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL15_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_15",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL15_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_15.DS_WACA_FR_ART_15",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL15_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL15_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL15_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL15_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL15_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL15_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL15_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL15_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_15.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL15_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL15_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL15_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL15_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_15.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL15_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL15_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_15.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_15.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL15_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ZF_COL16_SECTION",
          render: "SECTION",
          label: "Column 16",
          type: "NONE",

          dependencies: [
            {
              action: "SHOW",
              roles: [
                {
                  operator: "AND",
                  roles: [
                    {
                      leftValue: "@ZF_MODULE.value",
                      comparison: "=",
                      rightValue: "16",
                    },
                  ],
                },
              ],
            },
          ],

          children: [
            {
              name: "ZF_COL16_DOOR_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Door type",
              options: sources["SR-d68f6bc6"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ZF_CNT_16",
                  path: ".data.zone_count",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.zone_count",
                          comparison: "<=",
                          rightValue:
                            "&(@ZF_CNT - @ZF_MODULE.data.accumulator + 1)",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL16_LAYOUT",
              render: "FIELD",

              type: "COMBO",
              label: "Layout",
              options: sources["SR-1a0b2c1a"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_16.DS_WACA_FR_ART_16",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL16_LAYOUT.value",
                          comparison: "!C",
                          rightValue: "WACAC",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL16_SELECTED_SUB_ZONE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone",
              options: sources["SR-0548a025"],
              defaultValue: "",

              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL16_SELECTED_SUB_ZONE.value",
                          comparison: "<=",
                          rightValue: "@ZF_COL01_LAYOUT.data.edit_zone_count",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL16_Z1_TYPE",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-zone type",
              options: sources["SR-aa554b44"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL16_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL16_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL16_Z1_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 1",
              options: sources["SR-918c28bb"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL16_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_16.WACA_SUB_ART_01",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL16_Z1_TYPE.value",
                          comparison: "I",
                          rightValue: ".data.sub_type",
                        },
                        {
                          leftValue: "@ZF_COL16_LAYOUT.value",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL16_Z2_SUB_ART",
              render: "FIELD",

              type: "COMBO",
              label: "Sub-art 2",
              options: sources["SR-cf74b8f9"],
              defaultValue: "",

              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL16_SELECTED_SUB_ZONE.value",
                          comparison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "ART_ZONE_FR_16.WACA_SUB_ART_02",
                  path: ".",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL16_LAYOUT",
                          comparison: "I",
                          rightValue: ".data.layout",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "ZF_COL16_OPENING",
              render: "FIELD",

              type: "COMBO",
              label: "Opening",
              options: sources["SR-f340fcf0"],
              defaultValue: "",

              dependencies: [],
              variables: [
                {
                  name: "ART_ZONE_FR_16.Hinge_Side_nbr",
                  path: ".data.hinge_side_nbr",
                },
                {
                  name: "ART_ZONE_FR_16.Door_Type",
                  path: ".data.door_type",
                },
              ],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COL16_DOOR_TYPE",
                          comparison: "I",
                          rightValue: ".data.allowed_door_type",
                        },
                        {
                          leftValue: ".data.door_type",
                          comparison: "!=",
                          rightValue: "NONE",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
