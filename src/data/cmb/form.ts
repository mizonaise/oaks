import { FormNode } from "@/lib/form/schema";
import { sources } from "./sources";

export const form: FormNode = {
  name: "CONFIGURATOR",
  render: "SECTION",
  type: "TAB",
  label: "",
  dependencies: [],
  children: [
    {
      name: "OV_SECTION",
      render: "SECTION",
      type: "TAB",
      label: "Overview",
      dependencies: [],

      children: [
        {
          name: "OV_FORM",
          render: "SECTION",
          type: "NONE",
          label: "Form",
          dependencies: [],
          children: [
            {
              type: "COMBO",
              name: "INSTALLATION_TYPE",
              render: "FIELD",
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
              type: "INPUT",
              name: "OV_HEIGHT",
              render: "FIELD",
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
              name: "fillers",
              render: "SECTION",
              type: "NONE",
              label: "Fillers",
              dependencies: [],

              children: [
                {
                  type: "INPUT",
                  name: "FILLER_TOP",
                  render: "FIELD",
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
                  type: "INPUT",
                  name: "FILLER_LEFT",
                  render: "FIELD",
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
                              comparaison: "=",
                              rightValue: "BUILT_IN",
                            },
                            {
                              leftValue: "@INSTALLATION_TYPE.value",
                              comparaison: "I",
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
                  type: "INPUT",
                  name: "FILLER_RIGHT",
                  render: "FIELD",
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
                              comparaison: "=",
                              rightValue: "BUILT_IN",
                            },
                            {
                              leftValue: "@INSTALLATION_TYPE.value",
                              comparaison: "=",
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
                  type: "INPUT",
                  name: "FILLER_BOTTOM",
                  render: "FIELD",
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
          name: "OV_STYLER",
          render: "SECTION",
          type: "NONE",
          label: "Styler",
          children: [
            {
              type: "COMBO",
              name: "OV_COLLECTION",
              render: "FIELD",

              label: "Collection",
              options: sources["SR-6292d37f"],
              defaultValue: "COLLECTION_01",

              dependencies: [],
            },
            {
              type: "COMBO",
              name: "OV_FRONT_TYPE",
              render: "FIELD",
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
                          leftValue: "@OV_COLLECTION.value",
                          comparaison: "I",
                          rightValue: ".data.filter",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: "COMBO",
              name: "OV_CAT_COLOR",
              render: "FIELD",

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
                            "CONCAT(@OV_COLLECTION.value,@OV_FRONT_TYPE.value)",
                          comparaison: "I",
                          rightValue: ".data.filter",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: "COMBO",
              name: "OV_FINISH_EXT",
              render: "FIELD",

              label: "Color category",
              options: sources["SR-d3c27484"],
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
                            "CONCAT(@OV_COLLECTION.value,@OV_FRONT_TYPE.value,@OV_CAT_COLOR.value)",
                          comparaison: "I",
                          rightValue: ".data.filter",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: "COMBO",
              name: "OV_FINISH_EXT_5PD",
              render: "FIELD",

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
                            "CONCAT(@OV_COLLECTION.value,@OV_FRONT_TYPE.value)",
                          comparaison: "I",
                          rightValue: ".data.filter",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: "COMBO",
              name: "OV_FINISH_INT",
              render: "FIELD",
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
                          comparaison: "=",
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
                            "CONCAT(@OV_COLLECTION.value,@OV_FRONT_TYPE.value,@OV_FINISH_EXT.data.render)",
                          comparaison: "I",
                          rightValue: ".data.filter",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: "COMBO",
              name: "OV_PULL",
              render: "FIELD",
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
                            "CONCAT(@OV_COLLECTION.value,@OV_FRONT_TYPE.value,@OV_FINISH_EXT.data.render)",
                          comparaison: "I",
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
      ],
    },
    {
      name: "Z10_SECTION",
      render: "SECTION",

      type: "TAB",
      label: "Left",
      dependencies: [],

      children: [
        {
          name: "Z10_FORM",
          render: "SECTION",
          type: "NONE",
          label: "Form",
          dependencies: [],
          children: [
            {
              name: "Z10_WIDTH",
              render: "FIELD",
              type: "INPUT",
              label: "Width",
              max: "6000",
              min: "400",
              defaultValue: "3000",
              dependencies: [],
              variables: [
                {
                  name: "Z10_W",
                  path: ".",
                },
              ],
            },
            {
              name: "Z10_DEPTH",
              render: "FIELD",
              type: "INPUT",

              label: "Depth",
              max: "800",
              min: "350",
              defaultValue: "500",
              dependencies: [],
              variables: [
                {
                  name: "Z10_D",
                  path: ".",
                },
              ],
            },
            {
              name: "Z10_CNT",
              render: "FIELD",
              type: "INPUT",
              label: "Number of articles",
              max: "round(@Z10_WIDTH/400)",
              min: "round(@Z10_WIDTH/500)",
              defaultValue: "2",
              dependencies: [],
              variables: [
                {
                  name: "Z10_CNT",
                  path: ".",
                },
              ],
            },
          ],
        },
        {
          name: "Z10_STYLER",
          render: "SECTION",
          type: "NONE",
          label: "Styler",
          dependencies: [],
          children: [
            {
              name: "Z10_COLLECTION",
              render: "FIELD",
              type: "COMBO",
              label: "Collection",
              options: sources["SR-6292d37f"],
              defaultValue: "COLLECTION_01",
            },
            {
              name: "Z10_FRONT_TYPE",
              render: "FIELD",
              type: "COMBO",
              label: "Front",
              options: sources["SR-624566dd"],
              defaultValue: "",
              dependencies: [],
              variables: [
                {
                  name: "Z10_SELECTABLE_0.Door_Name",
                  path: ".",
                },
                {
                  name: "Z10_SELECTABLE_0.Have_Pull",
                  path: ".data.have_pull",
                },
                {
                  name: "Z10_SELECTABLE_0.MAT_FR_1_THK",
                  path: ".data.mat_1_thk",
                },
                {
                  name: "Z10_SELECTABLE_0.SRF_FR_1_THK",
                  path: ".data.srf_1_thk",
                },
                {
                  name: "Z10_SELECTABLE_0.MAT_FR_2_THK",
                  path: ".data.mat_2_thk",
                },
                {
                  name: "Z10_SELECTABLE_0.SRF_HN_1_THK",
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
                          leftValue: "@Z10_COLLECTION.value",
                          comparaison: "I",
                          rightValue: ".data.filter",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "Z10_CAT_COLOR",
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
                            "CONCAT(@Z10_COLLECTION.value,@Z10_FRONT_TYPE.value)",
                          comparaison: "I",
                          rightValue: ".data.filter",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "Z10_FINISH_EXT",
              render: "FIELD",
              type: "COMBO",
              label: "Color category",
              options: sources["SR-d3c27484"],
              defaultValue: "",
              dependencies: [],
              variables: [
                {
                  name: "Z10_SELECTABLE_0.MAT_FR_1",
                  path: ".data.mat_fr_1",
                },
                {
                  name: "Z10_SELECTABLE_0.SRF_FR_1_TOP",
                  path: ".data.srf_1_top",
                },
                {
                  name: "Z10_SELECTABLE_0.SRF_FR_1_BOT",
                  path: ".data.srf_1_top",
                },
                {
                  name: "Z10_SELECTABLE_0.PRF_FR_1",
                  path: ".data.prf_fr",
                },
                {
                  name: "Z10_SELECTABLE_0.MAT_FR_2",
                  path: ".data.mat_fr_2",
                },
                {
                  name: "Z10_SELECTABLE_0.SRF_FR_2_BOT",
                  path: ".data.srf_2_top",
                },
                {
                  name: "Z10_SELECTABLE_0.SRF_FR_2_TOP",
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
                            "CONCAT(@Z10_COLLECTION.value,@Z10_FRONT_TYPE.value,@Z10_CAT_COLOR.value)",
                          comparaison: "I",
                          rightValue: ".data.filter",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "Z10_FINISH_EXT_5PD",
              render: "FIELD",
              type: "COMBO",

              label: "Exterior 02",
              options: sources["SR-a382152b"],
              defaultValue: "",
              dependencies: [],
              variables: [
                {
                  name: "Z10_SELECTABLE_0.SRF_FR_3_TOP",
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
                            "CONCAT(@Z10_COLLECTION.value,@Z10_FRONT_TYPE.value)",
                          comparaison: "I",
                          rightValue: ".data.filter",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "Z10_FINISH_INT",
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
                          comparaison: "=",
                          rightValue: "Yes",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "Z10_SELECTABLE_0.MAT_1",
                  path: ".data.mat",
                },
                {
                  name: "Z10_SELECTABLE_0.MAT_1_THK",
                  path: ".data.mat_thk",
                },
                {
                  name: "Z10_SELECTABLE_0.MAT_DSI_1",
                  path: ".data.drawer_material",
                },
                {
                  name: "Z10_SELECTABLE_0.MAT_DSI_1_THK",
                  path: ".data.drawer_mat_thk",
                },
                {
                  name: "Z10_SELECTABLE_0.SRF_DSI_1_BOT",
                  path: ".data.drawer_srf",
                },
                {
                  name: "Z10_SELECTABLE_0.SRF_DSI_1_TOP",
                  path: ".data.drawer_srf",
                },
                {
                  name: "Z10_SELECTABLE_0.SRF_DBK_1_BOT",
                  path: ".data.drawer_srf",
                },
                {
                  name: "Z10_SELECTABLE_0.SRF_DBK_1_TOP",
                  path: ".data.drawer_srf",
                },
                {
                  name: "Z10_SELECTABLE_0.SRF_DSI_1_THK",
                  path: ".data.drawer_srf_thk",
                },
                {
                  name: "Z10_SELECTABLE_0.MAT_DBK_1",
                  path: ".data.drawer_material",
                },
                {
                  name: "Z10_SELECTABLE_0.SRF_1_TOP",
                  path: ".data.srf_top",
                },
                {
                  name: "Z10_SELECTABLE_0.SRF_1_BOT",
                  path: ".data.srf_bot",
                },
                {
                  name: "Z10_SELECTABLE_0.SRF_1_THK",
                  path: ".data.srf_thk",
                },
                {
                  name: "Z10_SELECTABLE_0.PRF_1",
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
                            "CONCAT(@Z10_COLLECTION.value,@Z10_FRONT_TYPE.value,@Z10_FINISH_EXT.data.render)",
                          comparaison: "I",
                          rightValue: ".data.filter",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "Z10_PULL",
              render: "FIELD",
              type: "COMBO",
              label: "Pull",
              options: sources["SR-618bcbd2"],
              defaultValue: "",
              dependencies: [],
              variables: [
                {
                  name: "Z10_SELECTABLE_0.PULL_X",
                  path: "data.pull_x",
                },
                {
                  name: "Z10_SELECTABLE_0.PULL_Y",
                  path: "data.pull_y",
                },
                {
                  name: "Z10_SELECTABLE_0.PULL_Z",
                  path: "data.pull_z",
                },
                {
                  name: "Z10_SELECTABLE_0.PULL_GLB",
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
                            "CONCAT(@Z10_COLLECTION.value,@Z10_FRONT_TYPE.value,@Z10_FINISH_EXT.data.render)",
                          comparaison: "I",
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
          name: "Z10_FUNCTION",
          render: "SECTION",

          type: "NONE",
          label: "Function",
          dependencies: [],

          children: [
            {
              name: "Z10_MODULE",
              render: "FIELD",
              type: "COMBO",

              label: "Column",
              options: sources["SR-4600f627"],
              defaultValue: "",
              dependencies: [],

              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: ".data.accumulator",
                          comparaison: "<=",
                          rightValue: "@Z10_CNT",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "Z10_COL01_SECTION",
              render: "SECTION",
              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "1",
                        },
                      ],
                    },
                  ],
                },
              ],
              // filters: [
              //   {
              //     roles: [
              //       {
              //         operator: "AND",
              //         roles: [
              //           {
              //             leftValue: ".data.zone_count",
              //             comparaison: "<=",
              //             rightValue:
              //               "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
              //           },
              //         ],
              //       },
              //     ],
              //   },
              // ],
              children: [
                {
                  name: "Z10_COL01_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_01",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL01_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_01.Z10_ART_01",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL01_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL01_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL01_Z1_TYPE",
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
                              leftValue: "@Z10_COL01_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL01_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL01_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL01_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_01.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL01_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL01_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL01_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL01_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_01.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL01_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL01_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_01.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_01.Door_Type",
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
                              leftValue: "@Z10_COL01_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL02_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "2",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL02_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_02",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL02_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_02.Z10_ART_02",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL02_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL02_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL02_Z1_TYPE",
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
                              leftValue: "@Z10_COL02_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL02_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL02_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL02_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_02.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL02_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL02_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL02_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL02_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_02.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL02_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL02_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_02.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_02.Door_Type",
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
                              leftValue: "@Z10_COL02_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL03_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "3",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL03_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_03",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL03_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_03.Z10_ART_03",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL03_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL03_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL03_Z1_TYPE",
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
                              leftValue: "@Z10_COL03_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL03_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL03_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL03_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_03.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL03_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL03_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL03_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL03_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_03.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL03_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL03_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_03.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_03.Door_Type",
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
                              leftValue: "@Z10_COL03_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL04_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "4",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL04_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_04",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL04_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_04.Z10_ART_04",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL04_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL04_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL04_Z1_TYPE",
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
                              leftValue: "@Z10_COL04_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL04_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL04_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL04_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_04.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL04_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL04_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL04_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL04_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_04.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL04_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL04_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_04.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_04.Door_Type",
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
                              leftValue: "@Z10_COL04_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL05_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "5",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL05_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_05",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL05_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_05.Z10_ART_05",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL05_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL05_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL05_Z1_TYPE",
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
                              leftValue: "@Z10_COL05_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL05_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL05_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL05_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_05.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL05_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL05_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL05_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL05_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_05.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL05_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL05_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_05.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_05.Door_Type",
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
                              leftValue: "@Z10_COL05_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL06_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "6",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL06_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_06",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL06_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_06.Z10_ART_06",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL06_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL06_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL06_Z1_TYPE",
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
                              leftValue: "@Z10_COL06_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL06_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL06_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL06_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_06.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL06_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL06_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL06_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL06_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_06.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL06_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL06_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_06.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_06.Door_Type",
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
                              leftValue: "@Z10_COL06_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL07_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "7",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL07_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_07",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL07_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_07.Z10_ART_07",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL07_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL07_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL07_Z1_TYPE",
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
                              leftValue: "@Z10_COL07_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL07_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL07_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL07_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_07.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL07_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL07_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL07_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL07_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_07.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL07_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL07_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_07.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_07.Door_Type",
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
                              leftValue: "@Z10_COL07_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL08_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "8",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL08_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_08",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL08_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_08.Z10_ART_08",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL08_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL08_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL08_Z1_TYPE",
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
                              leftValue: "@Z10_COL08_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL08_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL08_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL08_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_08.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL08_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL08_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL08_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL08_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_08.WACA_SUB_ART_02",
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
                                "@Z10_COL08_LAYOUT.data.edit_zone_count",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL08_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_08.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_08.Door_Type",
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
                              leftValue: "@Z10_COL08_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL09_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "9",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL09_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_09",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL09_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_09.Z10_ART_09",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL09_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL09_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL09_Z1_TYPE",
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
                              leftValue: "@Z10_COL09_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL09_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL09_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL09_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_09.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL09_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL09_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL09_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL09_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_09.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL09_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL09_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_09.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_09.Door_Type",
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
                              leftValue: "@Z10_COL09_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL10_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "10",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL10_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_10",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL10_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_10.Z10_ART_10",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL10_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL10_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL10_Z1_TYPE",
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
                              leftValue: "@Z10_COL10_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL10_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL10_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL10_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_10.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL10_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL10_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL10_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL10_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_10.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL10_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL10_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_10.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_10.Door_Type",
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
                              leftValue: "@Z10_COL10_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL11_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "11",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL11_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_11",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL11_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_11.Z10_ART_11",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL11_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL11_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL11_Z1_TYPE",
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
                              leftValue: "@Z10_COL11_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL11_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL11_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL11_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_11.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL11_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL11_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL11_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL11_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_11.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL11_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL11_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_11.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_11.Door_Type",
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
                              leftValue: "@Z10_COL11_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL12_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "12",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL12_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_12",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL12_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_12.Z10_ART_12",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL12_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL12_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL12_Z1_TYPE",
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
                              leftValue: "@Z10_COL12_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL12_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL12_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL12_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_12.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL12_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL12_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL12_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL12_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_12.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL12_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL12_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_12.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_12.Door_Type",
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
                              leftValue: "@Z10_COL12_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL13_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "13",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL13_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_13",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL13_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_13.Z10_ART_13",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL13_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL13_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL13_Z1_TYPE",
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
                              leftValue: "@Z10_COL13_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL13_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL13_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL13_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_13.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL13_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL13_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL13_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL13_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_13.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL13_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL13_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_13.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_13.Door_Type",
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
                              leftValue: "@Z10_COL13_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL14_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "14",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL14_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_14",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL14_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_14.Z10_ART_14",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL14_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL14_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL14_Z1_TYPE",
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
                              leftValue: "@Z10_COL14_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL14_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL14_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL14_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_14.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL14_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL14_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL14_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL14_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_14.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL14_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL14_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_14.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_14.Door_Type",
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
                              leftValue: "@Z10_COL14_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL15_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "15",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL15_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_15",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL15_LAYOUT",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_15.Z10_ART_15",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL15_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL15_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL15_Z1_TYPE",
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
                              leftValue: "@Z10_COL15_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL15_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL15_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL15_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_15.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL15_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL15_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL15_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL15_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_15.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL15_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL15_OPENING",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_15.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_15.Door_Type",
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
                              leftValue: "@Z10_COL15_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
              name: "Z10_COL16_SECTION",
              render: "SECTION",

              type: "NONE",
              label: "",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@Z10_MODULE.value",
                          comparaison: "=",
                          rightValue: "16",
                        },
                      ],
                    },
                  ],
                },
              ],

              children: [
                {
                  name: "Z10_COL16_DOOR_TYPE",
                  render: "FIELD",

                  type: "COMBO",
                  label: "Door type",
                  options: sources["SR-d68f6bc6"],
                  defaultValue: "",

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_MCNT_16",
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
                              comparaison: "<=",
                              rightValue:
                                "&(@Z10_CNT - @Z10_MODULE.data.accumulator + 1)",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL16_LAYOUT",
                  render: "FIELD",
                  type: "COMBO",
                  label: "Layout",
                  options: sources["SR-1a0b2c1a"],

                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_16.Z10_ART_16",
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
                              leftValue: ".value",
                              comparaison: "C",
                              rightValue: "WACA_",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL16_SELECTED_SUB_ZONE",
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
                              leftValue: "@Z10_COL16_SELECTED_SUB_ZONE.value",
                              comparaison: "<=",
                              rightValue:
                                "@Z10_COL01_LAYOUT.data.edit_zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL16_Z1_TYPE",
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
                              leftValue: "@Z10_COL16_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
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
                              leftValue: "@Z10_COL16_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL16_Z1_SUB_ART",
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
                              leftValue: "@Z10_COL16_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "1",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_16.WACA_SUB_ART_01",
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
                              leftValue: "@Z10_COL16_Z1_TYPE.value",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@Z10_COL16_LAYOUT.value",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL16_Z2_SUB_ART",
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
                              leftValue: "@Z10_COL16_SELECTED_SUB_ZONE.value",
                              comparaison: "=",
                              rightValue: "2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_16.WACA_SUB_ART_02",
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
                              leftValue: "@Z10_COL16_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Z10_COL16_OPENING",
                  render: "FIELD",
                  type: "COMBO",
                  label: "Opening",
                  options: sources["SR-f340fcf0"],
                  defaultValue: "",
                  dependencies: [],
                  variables: [
                    {
                      name: "Z10_ART_ZONE_16.Hinge_Side_nbr",
                      path: ".data.hinge_side_nbr",
                    },
                    {
                      name: "Z10_ART_ZONE_16.Door_Type",
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
                              leftValue: "@Z10_COL16_DOOR_TYPE",
                              comparaison: "I",
                              rightValue: ".data.allowed_door_type",
                            },
                            {
                              leftValue: ".data.door_type",
                              comparaison: "!=",
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
    },
  ],
};
