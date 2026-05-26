import type { FormNode, Option } from "@/lib/form/schema";
import { functionSources } from "./functionData";
import { stylerSources } from "./stylerData";

const sources: {
  [key: string]: Option[];
} = {
  INSTALLATION_TYPE_ITEMS: [
    {
      value: "BUILT_IN",
      label: "Built-in",
      data: {
        IS_BI_L: "1",
        IS_BI_R: "1",
      },
    },
    {
      value: "FREE_STANDING",
      label: "Free standing",
      data: {
        IS_BI_L: "0",
        IS_BI_R: "0",
      },
    },
    {
      value: "BUILT_IN_LEFT",
      label: "Built-In left",
      data: {
        IS_BI_L: "1",
        IS_BI_R: "0",
      },
    },
    {
      value: "BUILT_IN_RIGHT",
      label: "Built-In right",
      data: {
        IS_BI_L: "0",
        IS_BI_R: "1",
      },
    },
  ],
  ...stylerSources,
  ...functionSources,
};

export const form: FormNode = {
  type: "TAB",
  render: "SECTION",
  name: "configurator",
  label: "Configurator",
  defaultValue: "overview",
  children: [
    {
      type: "TAB",
      render: "SECTION",
      name: "overview",
      label: "Overview",
      children: [
        {
          type: "NONE",
          render: "SECTION",
          name: "form",
          label: "Form",
          children: [
            {
              type: "COMBO",
              render: "FIELD",
              name: "INSTALLATION_TYPE",
              label: "Installation type",
              defaultValue: "FREE_ANDING",
              options: sources["INSTALLATION_TYPE_ITEMS"],
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
              render: "FIELD",
              name: "HEIGHT",
              label: "Height",
              defaultValue: "2700",
              min: "1800",
              max: "3200",
              variables: [{ name: "ZONE_H", path: "." }],
            },
            {
              type: "INPUT",
              render: "FIELD",
              name: "WIDTH",
              label: "Width",
              defaultValue: "400",
              min: "400",
              max: "6000",
              variables: [{ name: "ZF_W", path: "." }],
            },
            {
              type: "INPUT",
              render: "FIELD",
              name: "DEPTH",
              label: "Depth",
              defaultValue: "500",
              min: "350",
              max: "800",
              variables: [{ name: "ZF_D", path: "." }],
            },
            {
              type: "INPUT",
              render: "FIELD",
              name: "ZF_CNT",
              label: "Number of articles",
              defaultValue: "10",
              min: "round(@WIDTH/500)",
              max: "round(@WIDTH/400)",
              variables: [
                {
                  name: "ZF_CNT",
                  path: ".",
                },
              ],
            },
            {
              type: "ACCORDION",
              name: "fillers",
              label: "Fillers",
              render: "SECTION",
              children: [
                {
                  type: "INPUT",
                  render: "FIELD",
                  label: "Top",
                  name: "FILLER_TOP",
                  min: "30",
                  max: "500",
                  defaultValue: "100",
                  variables: [
                    {
                      name: "CROWN_HEIGHT",
                      path: ".",
                    },
                  ],
                },
                {
                  type: "INPUT",
                  render: "FIELD",
                  label: "Left",
                  name: "FILLER_LEFT",
                  min: "50",
                  max: "1000",
                  defaultValue: "100",
                  variables: [
                    {
                      name: "ZFL_W",
                      path: ".",
                    },
                  ],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "OR",
                          roles: [
                            {
                              leftValue: "@INSTALLATION_TYPE",
                              comparaison: "=",
                              rightValue: "BUILT_IN",
                            },
                            {
                              leftValue: "@INSTALLATION_TYPE",
                              comparaison: "=",
                              rightValue: "BUILT_IN_LEFT",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "INPUT",
                  render: "FIELD",
                  label: "Right",
                  name: "FILLER_RIGHT",
                  min: "50",
                  max: "1000",
                  defaultValue: "100",
                  variables: [
                    {
                      name: "ZFR_W",
                      path: ".",
                    },
                  ],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "OR",
                          roles: [
                            {
                              leftValue: "@INSTALLATION_TYPE",
                              comparaison: "=",
                              rightValue: "BUILT_IN",
                            },
                            {
                              leftValue: "@INSTALLATION_TYPE",
                              comparaison: "=",
                              rightValue: "BUILT_IN_RIGHT",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "INPUT",
                  render: "FIELD",
                  label: "Bottom",
                  name: "FILLER_BOTTOM",
                  min: "30",
                  max: "200",
                  defaultValue: "100",

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
          type: "NONE",
          render: "SECTION",
          name: "styler",
          label: "Styler",
          children: [
            {
              type: "COMBO",
              render: "FIELD",
              name: "ZF_COLLECTION",
              label: "Design collection",
              defaultValue: "STYLE_01",

              options: sources["COLLECTION_ITEMS"],
            },
            {
              type: "COMBO",
              render: "FIELD",
              name: "ZF_FRONT_TYPE",
              label: "Front",
              defaultValue: "FRONT_01",
              options: sources["FRONT_TYPE_ITEMS"],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_COLLECTION",
                          comparison: "I",
                          rightValue: ".data.filter",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "Door_Name",
                  path: ".data.door_name",
                },
                {
                  name: "Have_Pull",
                  path: ".data.have_pull",
                },
              ],
            },
            {
              type: "COMBO",
              render: "FIELD",
              name: "ZF_CAT_COLOR",
              label: "Color category",
              defaultValue: "",

              options: sources["CAT_COLOR_ITEMS"],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "CONCAT(@ZF_COLLECTION,@ZF_FRONT_TYPE)",
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
              render: "FIELD",
              name: "ZF_FINISH_EXT",
              label: "Exterior",
              defaultValue:
                "MDF18_Prepeint_BO_COAT_WD_BT_1230_BOM_BO_COAT_WD_BT_1230_BOM",
              options: sources["FINISH_EXT_ITEMS"],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue:
                            "CONCAT(@ZF_COLLECTION,@ZF_FRONT_TYPE,@ZF_CAT_COLOR)",
                          comparaison: "I",
                          rightValue: ".data.filter",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "MAT_FR_1",
                  path: ".data.mat_fr_1",
                },
                {
                  name: "MAT_FR_1_THK",
                  path: ".data.mat_fr_1_thk",
                },
                {
                  name: "SRF_FR_1_TOP",
                  path: ".data.srf_1_top",
                },
                {
                  name: "SRF_FR_1_BOT",
                  path: ".data.srf_1_bot",
                },
                {
                  name: "SRF_FR_1_THK",
                  path: ".data.srf_1_thk",
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
                  name: "MAT_FR_2_THK",
                  path: ".data.mat_fr_2_thk",
                },
                {
                  name: "SRF_FR_2_TOP",
                  path: ".data.srf_2_top",
                },
                {
                  name: "SRF_FR_2_BOT",
                  path: ".data.srf_2_bot",
                },
                {
                  name: "SRF_FR_2_thk",
                  path: ".data.srf_2_thk",
                },
              ],
            },
            {
              type: "COMBO",
              render: "FIELD",
              name: "ZF_FINISH_EXT_5PD",
              label: "Exterior 02",
              options: sources["FINISH_EXT_5PD_ITEMS"],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "CONCAT(@ZF_COLLECTION,@ZF_FRONT_TYPE)",
                          comparaison: "I",
                          rightValue: ".data.filter",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "SRF_03_THK",
                  path: ".data.thk",
                },
                {
                  name: "SRF_FR_3_TOP",
                  path: ".data.surface_top",
                },
              ],
            },
            {
              type: "COMBO",
              render: "FIELD",
              name: "ZF_FINISH_INT",
              label: "Interior",
              defaultValue: "DE_VN_HGS_MDF_S4_01_19",
              options: sources["FINISH_INT_ITEMS"],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue:
                            "CONCAT(@ZF_COLLECTION,@ZF_FRONT_TYPE,@ZF_FINISH_EXT.data.render)",
                          comparaison: "I",
                          rightValue: ".data.filter",
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
            },
            {
              type: "COMBO",
              render: "FIELD",
              name: "ZF_PULL_TYPE",
              label: "Pull",

              options: sources["PULL_ITEMS"],
              filters: [
                {
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue:
                            "CONCAT(@ZF_COLLECTION,@ZF_FRONT_TYPE,@ZF_FINISH_EXT.data.render)",
                          comparaison: "I",
                          rightValue: ".data.filter",
                        },
                      ],
                    },
                  ],
                },
              ],
              variables: [
                {
                  name: "Handle_Type",
                  path: ".data.handle_type",
                },
                {
                  name: "HINGE_OPTION",
                  path: ".data.hinge_option",
                },
                {
                  name: "DR_EXT_SLIDE_TYPE_01",
                  path: ".data.drawer_slide_type",
                },
                {
                  name: "PULL_PATH",
                  path: ".data.pull_path",
                },
                {
                  name: "PULL_W",
                  path: ".data.x",
                },
                {
                  name: "PULL_H",
                  path: ".data.y",
                },
                {
                  name: "PULL_D",
                  path: ".data.z",
                },
                {
                  name: "PULL_GLB",
                  path: ".data.glb",
                },
              ],
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "OR",
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
            },
          ],
        },
        {
          name: "ZF_FUNCTION",
          label: "Function",
          type: "NONE",
          render: "SECTION",
          children: [
            {
              type: "COMBO",
              render: "FIELD",
              name: "ZF_MODULE",
              label: "Column",
              defaultValue: "1",
              options: sources["COLUMN_ITEMS"],
            },
            {
              name: "ZF_COL01_SECTION",
              label: "COL01",
              type: "NONE",
              render: "SECTION",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_MODULE",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL01_DOOR_TYPE",
                  label: "Door type",
                  defaultValue: "SD",
                  options: sources["DOOR_TYPE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_CNT - $ZF_CNT_ACC_01 + 1",
                              comparaison: ">",
                              rightValue: ".data.zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "ZF_CNT_01", path: ".data.zone_count" }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL01_LAYOUT",
                  label: "Layout",
                  options: sources["TC_COLUMN_LAYOUT_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "MD",
                              comparaison: "=",
                              rightValue: ".data.layout_type",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "DS_WACA_FR_ART_01", path: "." }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL01_SELECTED_SUB_ZONE",
                  label: "Sub-zone",
                  defaultValue: "1",
                  options: sources["SELECTED_SUB_ZONE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL01_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.allowed_layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL01_Z1_TYPE",
                  label: "Sub-zone type",
                  defaultValue: "1",
                  options: sources["TC_SUB_ZONE_1_TYPE_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL01_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL01_LAYOUT",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL01_Z1_SUB_ART",
                  label: "Sub-art 1",
                  defaultValue: "1",
                  options: sources["TC_SUB_ART_1_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL01_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL01_Z1_TYPE",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@ZF_COL01_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL01_Z2_SUB_ART",
                  label: "Sub-art 2",
                  defaultValue: "1",
                  options: sources["TC_SUB_ART_2_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL01_SELECTED_SUB_ZONE",
                              comparison: "=",
                              rightValue: "2",
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
                              leftValue: "@ZF_COL01_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                            {
                              leftValue: "@ZF_COL01_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL01_OPENING",
                  label: "selected article",
                  defaultValue: "1",
                  options: sources["OPENING_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL01_DOOR_TYPE",
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
                },
              ],
            },
            {
              name: "ZF_COL02_SECTION",
              label: "COL02",
              type: "NONE",
              render: "SECTION",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_MODULE",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL02_DOOR_TYPE",
                  label: "Door type",
                  defaultValue: "SD",
                  options: sources["DOOR_TYPE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_CNT - $ZF_CNT_ACC_02 + 1",
                              comparaison: ">=",
                              rightValue: ".data.zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "ZF_CNT_02", path: ".data.zone_count" }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL02_LAYOUT",
                  label: "Layout",

                  options: sources["TC_COLUMN_LAYOUT_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "MD",
                              comparaison: "=",
                              rightValue: ".data.layout_type",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "DS_WACA_FR_ART_02", path: "." }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL02_SELECTED_SUB_ZONE",
                  label: "Sub-zone",
                  defaultValue: "1",

                  options: sources["SELECTED_SUB_ZONE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL02_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.allowed_layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL02_Z1_TYPE",
                  label: "Sub-zone type",
                  defaultValue: "1",

                  options: sources["TC_SUB_ZONE_1_TYPE_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL02_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL02_LAYOUT",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL02_Z1_SUB_ART",
                  label: "Sub-art 1",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_1_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL02_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL02_Z1_TYPE",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@ZF_COL02_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL02_Z2_SUB_ART",
                  label: "Sub-art 2",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_2_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL02_SELECTED_SUB_ZONE",
                              comparison: "=",
                              rightValue: "2",
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
                              leftValue: "@ZF_COL02_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                            {
                              leftValue: "@ZF_COL02_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL02_OPENING",
                  label: "selected article",
                  defaultValue: "1",

                  options: sources["OPENING_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL02_DOOR_TYPE",
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
                },
              ],
            },
            {
              name: "ZF_COL03_SECTION",
              label: "COL03",
              type: "NONE",
              render: "SECTION",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_MODULE",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL03_DOOR_TYPE",
                  label: "Door type",
                  defaultValue: "SD",

                  options: sources["DOOR_TYPE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_CNT - $ZF_CNT_ACC_03 + 1",
                              comparaison: ">=",
                              rightValue: ".data.zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "ZF_CNT_03", path: ".data.zone_count" }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL03_LAYOUT",
                  label: "Layout",

                  options: sources["TC_COLUMN_LAYOUT_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "MD",
                              comparaison: "=",
                              rightValue: ".data.layout_type",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "DS_WACA_FR_ART_03", path: "." }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL03_SELECTED_SUB_ZONE",
                  label: "Sub-zone",
                  defaultValue: "1",

                  options: sources["SELECTED_SUB_ZONE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL03_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.allowed_layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL03_Z1_TYPE",
                  label: "Sub-zone type",
                  defaultValue: "1",

                  options: sources["TC_SUB_ZONE_1_TYPE_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL03_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL03_LAYOUT",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL03_Z1_SUB_ART",
                  label: "Sub-art 1",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_1_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL03_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL03_Z1_TYPE",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@ZF_COL03_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL03_Z2_SUB_ART",
                  label: "Sub-art 2",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_2_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL03_SELECTED_SUB_ZONE",
                              comparison: "=",
                              rightValue: "2",
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
                              leftValue: "@ZF_COL03_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                            {
                              leftValue: "@ZF_COL03_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL03_OPENING",
                  label: "selected article",
                  defaultValue: "1",

                  options: sources["OPENING_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL03_DOOR_TYPE",
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
                },
              ],
            },
            {
              name: "ZF_COL04_SECTION",
              label: "COL04",
              type: "NONE",
              render: "SECTION",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_MODULE",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL04_DOOR_TYPE",
                  label: "Door type",
                  defaultValue: "SD",

                  options: sources["DOOR_TYPE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_CNT - $ZF_CNT_ACC_04 + 1",
                              comparaison: ">=",
                              rightValue: ".data.zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "ZF_CNT_04", path: ".data.zone_count" }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL04_LAYOUT",
                  label: "Layout",

                  options: sources["TC_COLUMN_LAYOUT_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "MD",
                              comparaison: "=",
                              rightValue: ".data.layout_type",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "DS_WACA_FR_ART_04", path: "." }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL04_SELECTED_SUB_ZONE",
                  label: "Sub-zone",
                  defaultValue: "1",

                  options: sources["SELECTED_SUB_ZONE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL04_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.allowed_layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL04_Z1_TYPE",
                  label: "Sub-zone type",
                  defaultValue: "1",

                  options: sources["TC_SUB_ZONE_1_TYPE_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL04_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL04_LAYOUT",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL04_Z1_SUB_ART",
                  label: "Sub-art 1",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_1_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL04_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL04_Z1_TYPE",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@ZF_COL04_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL04_Z2_SUB_ART",
                  label: "Sub-art 2",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_2_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL04_SELECTED_SUB_ZONE",
                              comparison: "=",
                              rightValue: "2",
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
                              leftValue: "@ZF_COL04_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                            {
                              leftValue: "@ZF_COL04_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL04_OPENING",
                  label: "selected article",
                  defaultValue: "1",

                  options: sources["OPENING_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL04_DOOR_TYPE",
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
                },
              ],
            },
            {
              name: "ZF_COL05_SECTION",
              label: "COL05",
              type: "NONE",
              render: "SECTION",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_MODULE",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL05_DOOR_TYPE",
                  label: "Door type",
                  defaultValue: "SD",

                  options: sources["DOOR_TYPE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_CNT - $ZF_CNT_ACC_05 + 1",
                              comparaison: ">=",
                              rightValue: ".data.zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "ZF_CNT_05", path: ".data.zone_count" }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL05_LAYOUT",
                  label: "Layout",

                  options: sources["TC_COLUMN_LAYOUT_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "MD",
                              comparaison: "=",
                              rightValue: ".data.layout_type",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "DS_WACA_FR_ART_05", path: "." }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL05_SELECTED_SUB_ZONE",
                  label: "Sub-zone",
                  defaultValue: "1",

                  options: sources["SELECTED_SUB_ZONE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL05_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.allowed_layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL05_Z1_TYPE",
                  label: "Sub-zone type",
                  defaultValue: "1",

                  options: sources["TC_SUB_ZONE_1_TYPE_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL05_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL05_LAYOUT",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL05_Z1_SUB_ART",
                  label: "Sub-art 1",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_1_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL05_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL05_Z1_TYPE",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@ZF_COL05_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL05_Z2_SUB_ART",
                  label: "Sub-art 2",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_2_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL05_SELECTED_SUB_ZONE",
                              comparison: "=",
                              rightValue: "2",
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
                              leftValue: "@ZF_COL05_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                            {
                              leftValue: "@ZF_COL05_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL05_OPENING",
                  label: "selected article",
                  defaultValue: "1",

                  options: sources["OPENING_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL05_DOOR_TYPE",
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
                },
              ],
            },
            {
              name: "ZF_COL06_SECTION",
              label: "COL06",
              type: "NONE",
              render: "SECTION",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_MODULE",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL06_DOOR_TYPE",
                  label: "Door type",
                  defaultValue: "SD",

                  options: sources["DOOR_TYPE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_CNT - $ZF_CNT_ACC_06 + 1",
                              comparaison: ">=",
                              rightValue: ".data.zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "ZF_CNT_06", path: ".data.zone_count" }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL06_LAYOUT",
                  label: "Layout",

                  options: sources["TC_COLUMN_LAYOUT_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "MD",
                              comparaison: "=",
                              rightValue: ".data.layout_type",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "DS_WACA_FR_ART_06", path: "." }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL06_SELECTED_SUB_ZONE",
                  label: "Sub-zone",
                  defaultValue: "1",

                  options: sources["SELECTED_SUB_ZONE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL06_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.allowed_layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL06_Z1_TYPE",
                  label: "Sub-zone type",
                  defaultValue: "1",

                  options: sources["TC_SUB_ZONE_1_TYPE_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL06_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL06_LAYOUT",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL06_Z1_SUB_ART",
                  label: "Sub-art 1",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_1_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL06_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL06_Z1_TYPE",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@ZF_COL06_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL06_Z2_SUB_ART",
                  label: "Sub-art 2",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_2_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL06_SELECTED_SUB_ZONE",
                              comparison: "=",
                              rightValue: "2",
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
                              leftValue: "@ZF_COL06_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                            {
                              leftValue: "@ZF_COL06_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL06_OPENING",
                  label: "selected article",
                  defaultValue: "1",

                  options: sources["OPENING_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL06_DOOR_TYPE",
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
                },
              ],
            },
            {
              name: "ZF_COL07_SECTION",
              label: "COL07",
              type: "NONE",
              render: "SECTION",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_MODULE",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL07_DOOR_TYPE",
                  label: "Door type",
                  defaultValue: "SD",

                  options: sources["DOOR_TYPE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_CNT - $ZF_CNT_ACC_07 + 1",
                              comparaison: ">=",
                              rightValue: ".data.zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "ZF_CNT_07", path: ".data.zone_count" }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL07_LAYOUT",
                  label: "Layout",

                  options: sources["TC_COLUMN_LAYOUT_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "MD",
                              comparaison: "=",
                              rightValue: ".data.layout_type",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "DS_WACA_FR_ART_07", path: "." }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL07_SELECTED_SUB_ZONE",
                  label: "Sub-zone",
                  defaultValue: "1",

                  options: sources["SELECTED_SUB_ZONE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL07_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.allowed_layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL07_Z1_TYPE",
                  label: "Sub-zone type",
                  defaultValue: "1",

                  options: sources["TC_SUB_ZONE_1_TYPE_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL07_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL07_LAYOUT",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL07_Z1_SUB_ART",
                  label: "Sub-art 1",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_1_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL07_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL07_Z1_TYPE",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@ZF_COL07_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL07_Z2_SUB_ART",
                  label: "Sub-art 2",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_2_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL07_SELECTED_SUB_ZONE",
                              comparison: "=",
                              rightValue: "2",
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
                              leftValue: "@ZF_COL07_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                            {
                              leftValue: "@ZF_COL07_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL07_OPENING",
                  label: "selected article",
                  defaultValue: "1",

                  options: sources["OPENING_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL07_DOOR_TYPE",
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
                },
              ],
            },
            {
              name: "ZF_COL08_SECTION",
              label: "COL08",
              type: "NONE",
              render: "SECTION",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_MODULE",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL08_DOOR_TYPE",
                  label: "Door type",
                  defaultValue: "SD",

                  options: sources["DOOR_TYPE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_CNT - $ZF_CNT_ACC_08 + 1",
                              comparaison: ">=",
                              rightValue: ".data.zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "ZF_CNT_08", path: ".data.zone_count" }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL08_LAYOUT",
                  label: "Layout",

                  options: sources["TC_COLUMN_LAYOUT_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "MD",
                              comparaison: "=",
                              rightValue: ".data.layout_type",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "DS_WACA_FR_ART_08", path: "." }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL08_SELECTED_SUB_ZONE",
                  label: "Sub-zone",
                  defaultValue: "1",

                  options: sources["SELECTED_SUB_ZONE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL08_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.allowed_layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL08_Z1_TYPE",
                  label: "Sub-zone type",
                  defaultValue: "1",

                  options: sources["TC_SUB_ZONE_1_TYPE_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL08_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL08_LAYOUT",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL08_Z1_SUB_ART",
                  label: "Sub-art 1",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_1_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL08_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL08_Z1_TYPE",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@ZF_COL08_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL08_Z2_SUB_ART",
                  label: "Sub-art 2",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_2_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL08_SELECTED_SUB_ZONE",
                              comparison: "=",
                              rightValue: "2",
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
                              leftValue: "@ZF_COL08_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                            {
                              leftValue: "@ZF_COL08_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL08_OPENING",
                  label: "selected article",
                  defaultValue: "1",

                  options: sources["OPENING_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL08_DOOR_TYPE",
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
                },
              ],
            },
            {
              name: "ZF_COL09_SECTION",
              label: "COL09",
              type: "NONE",
              render: "SECTION",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_MODULE",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL09_DOOR_TYPE",
                  label: "Door type",
                  defaultValue: "SD",

                  options: sources["DOOR_TYPE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_CNT - $ZF_CNT_ACC_09 + 1",
                              comparaison: ">=",
                              rightValue: ".data.zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "ZF_CNT_09", path: ".data.zone_count" }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL09_LAYOUT",
                  label: "Layout",

                  options: sources["TC_COLUMN_LAYOUT_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "MD",
                              comparaison: "=",
                              rightValue: ".data.layout_type",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "DS_WACA_FR_ART_09", path: "." }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL09_SELECTED_SUB_ZONE",
                  label: "Sub-zone",
                  defaultValue: "1",

                  options: sources["SELECTED_SUB_ZONE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL09_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.allowed_layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL09_Z1_TYPE",
                  label: "Sub-zone type",
                  defaultValue: "1",

                  options: sources["TC_SUB_ZONE_1_TYPE_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL09_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL09_LAYOUT",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL09_Z1_SUB_ART",
                  label: "Sub-art 1",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_1_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL09_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL09_Z1_TYPE",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@ZF_COL09_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL09_Z2_SUB_ART",
                  label: "Sub-art 2",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_2_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL09_SELECTED_SUB_ZONE",
                              comparison: "=",
                              rightValue: "2",
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
                              leftValue: "@ZF_COL09_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                            {
                              leftValue: "@ZF_COL09_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL09_OPENING",
                  label: "selected article",
                  defaultValue: "1",

                  options: sources["OPENING_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL09_DOOR_TYPE",
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
                },
              ],
            },
            {
              name: "ZF_COL10_SECTION",
              label: "COL10",
              type: "NONE",
              render: "SECTION",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_MODULE",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL10_DOOR_TYPE",
                  label: "Door type",
                  defaultValue: "SD",

                  options: sources["DOOR_TYPE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_CNT - $ZF_CNT_ACC_10 + 1",
                              comparaison: ">=",
                              rightValue: ".data.zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "ZF_CNT_10", path: ".data.zone_count" }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL10_LAYOUT",
                  label: "Layout",

                  options: sources["TC_COLUMN_LAYOUT_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "MD",
                              comparaison: "=",
                              rightValue: ".data.layout_type",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "DS_WACA_FR_ART_10", path: "." }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL10_SELECTED_SUB_ZONE",
                  label: "Sub-zone",
                  defaultValue: "1",

                  options: sources["SELECTED_SUB_ZONE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL10_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.allowed_layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL10_Z1_TYPE",
                  label: "Sub-zone type",
                  defaultValue: "1",

                  options: sources["TC_SUB_ZONE_1_TYPE_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL10_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL10_LAYOUT",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL10_Z1_SUB_ART",
                  label: "Sub-art 1",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_1_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL10_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL10_Z1_TYPE",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@ZF_COL10_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL10_Z2_SUB_ART",
                  label: "Sub-art 2",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_2_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL10_SELECTED_SUB_ZONE",
                              comparison: "=",
                              rightValue: "2",
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
                              leftValue: "@ZF_COL10_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                            {
                              leftValue: "@ZF_COL10_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL10_OPENING",
                  label: "selected article",
                  defaultValue: "1",

                  options: sources["OPENING_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL10_DOOR_TYPE",
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
                },
              ],
            },
            {
              name: "ZF_COL11_SECTION",
              label: "COL11",
              type: "NONE",
              render: "SECTION",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_MODULE",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL11_DOOR_TYPE",
                  label: "Door type",
                  defaultValue: "SD",

                  options: sources["DOOR_TYPE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_CNT - $ZF_CNT_ACC_11 + 1",
                              comparaison: ">=",
                              rightValue: ".data.zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "ZF_CNT_11", path: ".data.zone_count" }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL11_LAYOUT",
                  label: "Layout",

                  options: sources["TC_COLUMN_LAYOUT_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "MD",
                              comparaison: "=",
                              rightValue: ".data.layout_type",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "DS_WACA_FR_ART_11", path: "." }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL11_SELECTED_SUB_ZONE",
                  label: "Sub-zone",
                  defaultValue: "1",

                  options: sources["SELECTED_SUB_ZONE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL11_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.allowed_layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL11_Z1_TYPE",
                  label: "Sub-zone type",
                  defaultValue: "1",

                  options: sources["TC_SUB_ZONE_1_TYPE_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL11_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL11_LAYOUT",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL11_Z1_SUB_ART",
                  label: "Sub-art 1",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_1_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL11_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL11_Z1_TYPE",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@ZF_COL11_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL11_Z2_SUB_ART",
                  label: "Sub-art 2",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_2_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL11_SELECTED_SUB_ZONE",
                              comparison: "=",
                              rightValue: "2",
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
                              leftValue: "@ZF_COL11_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                            {
                              leftValue: "@ZF_COL11_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL11_OPENING",
                  label: "selected article",
                  defaultValue: "1",

                  options: sources["OPENING_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL11_DOOR_TYPE",
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
                },
              ],
            },
            {
              name: "ZF_COL12_SECTION",
              label: "COL12",
              type: "NONE",
              render: "SECTION",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_MODULE",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL12_DOOR_TYPE",
                  label: "Door type",
                  defaultValue: "SD",

                  options: sources["DOOR_TYPE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_CNT - $ZF_CNT_ACC_12 + 1",
                              comparaison: ">=",
                              rightValue: ".data.zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "ZF_CNT_12", path: ".data.zone_count" }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL12_LAYOUT",
                  label: "Layout",

                  options: sources["TC_COLUMN_LAYOUT_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "MD",
                              comparaison: "=",
                              rightValue: ".data.layout_type",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "DS_WACA_FR_ART_12", path: "." }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL12_SELECTED_SUB_ZONE",
                  label: "Sub-zone",
                  defaultValue: "1",

                  options: sources["SELECTED_SUB_ZONE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL12_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.allowed_layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL12_Z1_TYPE",
                  label: "Sub-zone type",
                  defaultValue: "1",

                  options: sources["TC_SUB_ZONE_1_TYPE_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL12_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL12_LAYOUT",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL12_Z1_SUB_ART",
                  label: "Sub-art 1",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_1_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL12_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL12_Z1_TYPE",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@ZF_COL12_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL12_Z2_SUB_ART",
                  label: "Sub-art 2",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_2_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL12_SELECTED_SUB_ZONE",
                              comparison: "=",
                              rightValue: "2",
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
                              leftValue: "@ZF_COL12_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                            {
                              leftValue: "@ZF_COL12_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL12_OPENING",
                  label: "selected article",
                  defaultValue: "1",

                  options: sources["OPENING_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL12_DOOR_TYPE",
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
                },
              ],
            },
            {
              name: "ZF_COL13_SECTION",
              label: "COL13",
              type: "NONE",
              render: "SECTION",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_MODULE",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL13_DOOR_TYPE",
                  label: "Door type",
                  defaultValue: "SD",

                  options: sources["DOOR_TYPE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_CNT - $ZF_CNT_ACC_13 + 1",
                              comparaison: ">=",
                              rightValue: ".data.zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "ZF_CNT_13", path: ".data.zone_count" }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL13_LAYOUT",
                  label: "Layout",

                  options: sources["TC_COLUMN_LAYOUT_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "MD",
                              comparaison: "=",
                              rightValue: ".data.layout_type",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "DS_WACA_FR_ART_13", path: "." }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL13_SELECTED_SUB_ZONE",
                  label: "Sub-zone",
                  defaultValue: "1",

                  options: sources["SELECTED_SUB_ZONE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL13_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.allowed_layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL13_Z1_TYPE",
                  label: "Sub-zone type",
                  defaultValue: "1",

                  options: sources["TC_SUB_ZONE_1_TYPE_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL13_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL13_LAYOUT",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL13_Z1_SUB_ART",
                  label: "Sub-art 1",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_1_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL13_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL13_Z1_TYPE",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@ZF_COL13_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL13_Z2_SUB_ART",
                  label: "Sub-art 2",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_2_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL13_SELECTED_SUB_ZONE",
                              comparison: "=",
                              rightValue: "2",
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
                              leftValue: "@ZF_COL13_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                            {
                              leftValue: "@ZF_COL13_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL13_OPENING",
                  label: "selected article",
                  defaultValue: "1",

                  options: sources["OPENING_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL13_DOOR_TYPE",
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
                },
              ],
            },
            {
              name: "ZF_COL14_SECTION",
              label: "COL14",
              type: "NONE",
              render: "SECTION",
              dependencies: [
                {
                  action: "SHOW",
                  roles: [
                    {
                      operator: "AND",
                      roles: [
                        {
                          leftValue: "@ZF_MODULE",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL14_DOOR_TYPE",
                  label: "Door type",
                  defaultValue: "SD",

                  options: sources["DOOR_TYPE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_CNT - $ZF_CNT_ACC_14 + 1",
                              comparaison: ">=",
                              rightValue: ".data.zone_count",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "ZF_CNT_14", path: ".data.zone_count" }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL14_LAYOUT",
                  label: "Layout",
                  options: sources["TC_COLUMN_LAYOUT_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "MD",
                              comparaison: "=",
                              rightValue: ".data.layout_type",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  variables: [{ name: "DS_WACA_FR_ART_14", path: "." }],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL14_SELECTED_SUB_ZONE",
                  label: "Sub-zone",
                  defaultValue: "1",

                  options: sources["SELECTED_SUB_ZONE_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL14_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.allowed_layout",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL14_Z1_TYPE",
                  label: "Sub-zone type",
                  defaultValue: "1",

                  options: sources["TC_SUB_ZONE_1_TYPE_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL14_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL14_LAYOUT",
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
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL14_Z1_SUB_ART",
                  label: "Sub-art 1",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_1_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL14_SELECTED_SUB_ZONE",
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
                              leftValue: "@ZF_COL14_Z1_TYPE",
                              comparaison: "I",
                              rightValue: ".data.sub_type",
                            },
                            {
                              leftValue: "@ZF_COL14_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL14_Z2_SUB_ART",
                  label: "Sub-art 2",
                  defaultValue: "1",

                  options: sources["TC_SUB_ART_2_ITEMS"],
                  dependencies: [
                    {
                      action: "SHOW",
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL14_SELECTED_SUB_ZONE",
                              comparison: "=",
                              rightValue: "2",
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
                              leftValue: "@ZF_COL14_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
                            },
                            {
                              leftValue: "@ZF_COL14_LAYOUT",
                              comparaison: "I",
                              rightValue: ".data.layout",
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
                },
                {
                  type: "COMBO",
                  render: "FIELD",
                  name: "ZF_COL14_OPENING",
                  label: "selected article",
                  defaultValue: "1",
                  options: sources["OPENING_ITEMS"],
                  filters: [
                    {
                      roles: [
                        {
                          operator: "AND",
                          roles: [
                            {
                              leftValue: "@ZF_COL14_DOOR_TYPE",
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
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const shape = {
  name: "OAKSOME_SHAPE_FR",
  width: "$ZF_W mm mm",
  depth: "$ZF_D mm mm",
  height: "$ZONE_H mm mm",
  cps: {
    CP_1_TSI_1000_C1: {
      mat: "$MAT_TS_1",
      surf: "$SRF_TS_1_EXT",
    },
    CP_1_FI_1000: {
      mat: "$MAT_FI_1",
      surf: "$SRF_FI_1_TOP",
    },
    WC_DD: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    WACA_LY_D: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    CP_1_FI_1111: {
      mat: "$MAT_FI_1",
      surf: "$SRF_FI_1_TOP",
    },
    CP_1_BA_1000: {
      mat: "$MAT_BA_1",
      surf: "$SRF_BA_1_TOP",
    },
    CP_1_CM_0000: {
      mat: "$MAT_CM_1",
      surf: "$SRF_CM_1_TOP",
    },
    WC_SD: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    WACA_LY_D_DW: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    WACA_LY_D1: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    WACA_LY_D1_DW: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    WACA_LY_DB_D: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    WACA_LY_DB_D_DW: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    WACA_LY_DR_D: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    WACA_LY_DR_D_DW: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
  },
  variables: {
    ZF_W: "6000",
    ZF_D: "500",
    ZONE_H: "3000",
    FI_1_THK: "($MAT_FI_1_THK + 2*($SRF_FI_1_THK))",
    MAT_FI_1_THK: "$MAT_FR_1_THK",
    MAT_FR_1_THK: "16",
    SRF_FI_1_THK: "$SRF_FR_1_THK",
    SRF_FR_1_THK: "0.8",
    IS_BI_L: "1",
    IS_BI_R: "1",
    BASE_HEIGHT: "100",
    CROWN_HEIGHT: "100",
    ZFL_W: "50",
    ZFR_W: "50",
    ZF_STEP: "($ZFA_W / $ZF_CNT)",
    Front_Side_GAP: "2.5",
    ZFA_W:
      "($ZF_W - ($FI_1_THK *(1-$IS_BI_R)) - ($FI_1_THK *(1-$IS_BI_L)) - ($IS_BI_R*$ZFR_W)  -($IS_BI_L*$ZFL_W))",
    ZF_CNT: "10",
    ZF_CNT_ACC_01: "$ZF_CNT_01",
    ZF_CNT_01: "1",
    ZF_CNT_ACC_02: "($ZF_CNT_ACC_01 + $ZF_CNT_02)",
    DS_WACA_FR_ART_01: "#DS_WACA_U_ART_01",
    MAT_TS_1: "$MAT_1",
    ZF_CNT_02: "1",
    MAT_1: "EG_ED_W980_ST2_18mm",
    SRF_TS_1_EXT: "$SURF_TS_1_EXT",
    MAT_FI_1: "$MAT_FR_1",
    DS_WACA_FR_ART_02: "#DS_WACA_U_ART_01",
    SURF_TS_1_EXT: "NO_SURF",
    MAT_FR_1: "UN_RW_HGS_MDFFB_16",
    SRF_FI_1_TOP: "$SRF_FR_1_TOP",
    ZF_CNT_ACC_03: "($ZF_CNT_ACC_02 + $ZF_CNT_03)",
    SRF_FR_1_TOP: "EG_HPL_HGP_W980_ST7_0_8",
    ZF_CNT_03: "2",
    MAT_BA_1: "$MAT_FR_1",
    DS_WACA_FR_ART_03: "#DS_WACA_U_ART_01",
    MAT_CM_1: "$MAT_FR_1",
    SRF_BA_1_TOP: "$SRF_FR_1_TOP",
    SRF_CM_1_TOP: "$SRF_FR_1_TOP",
    ZF_CNT_ACC_04: "($ZF_CNT_ACC_03 + $ZF_CNT_04)",
    ZF_CNT_04: "1",
    DS_WACA_FR_ART_04: "#DS_WACA_U_ART_01",
    ZF_CNT_ACC_05: "($ZF_CNT_ACC_04 + $ZF_CNT_05)",
    ZF_CNT_05: "2",
    DS_WACA_FR_ART_05: "#DS_WACA_U_ART_01",
    ZF_CNT_ACC_06: "($ZF_CNT_ACC_05 + $ZF_CNT_06)",
    ZF_CNT_06: "1",
    DS_WACA_FR_ART_06: "#DS_WACA_U_ART_01",
    ZF_CNT_ACC_07: "($ZF_CNT_ACC_06 + $ZF_CNT_07)",
    ZF_CNT_07: "2",
    DS_WACA_FR_ART_07: "#DS_WACA_U_ART_01",
    ZF_CNT_ACC_08: "($ZF_CNT_ACC_07 + $ZF_CNT_08)",
    ZF_CNT_08: "1",
    DS_WACA_FR_ART_08: "#DS_WACA_U_ART_01",
    ZF_CNT_ACC_09: "($ZF_CNT_ACC_08 + $ZF_CNT_09)",
    ZF_CNT_09: "1",
    DS_WACA_FR_ART_09: "#DS_WACA_U_ART_01",
    ZF_CNT_ACC_10: "($ZF_CNT_ACC_09 + $ZF_CNT_10)",
    ZF_CNT_10: "1",
    DS_WACA_FR_ART_10: "#DS_WACA_U_ART_01",
    ZF_CNT_ACC_11: "($ZF_CNT_ACC_10 + $ZF_CNT_11)",
    ZF_CNT_11: "1",
    DS_WACA_FR_ART_11: "#DS_WACA_U_ART_01",
    ZF_CNT_ACC_12: "($ZF_CNT_ACC_11 + $ZF_CNT_12)",
    ZF_CNT_12: "1",
    DS_WACA_FR_ART_12: "#DS_WACA_U_ART_01",
    ZF_CNT_ACC_13: "($ZF_CNT_ACC_12 + $ZF_CNT_13)",
    ZF_CNT_13: "1",
    DS_WACA_FR_ART_13: "#DS_WACA_U_ART_01",
    ZF_CNT_ACC_14: "($ZF_CNT_ACC_13 + $ZF_CNT_14)",
    ZF_CNT_14: "1",
    DS_WACA_FR_ART_14: "#DS_WACA_U_ART_01",
    ZF_CNT_ACC_15: "($ZF_CNT_ACC_14 + $ZF_CNT_15)",
    ZF_CNT_15: "1",
    DS_WACA_FR_ART_15: "#DS_WACA_U_ART_01",
    ZF_CNT_ACC_16: "($ZF_CNT_ACC_15 + $ZF_CNT_16)",
    ZF_CNT_16: "1",
    ZF_CNT_ACC_17: "($ZF_CNT_ACC_16 + $ZF_CNT_17)",
    ZF_CNT_17: "1",
  },
  descriptors: {
    DS_ZFR_SI: [
      {
        action: "CP_1_FI_1000",
        nodenum: 1,
        roles: [
          {
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "0",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 2,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_ZFL_SI: [
      {
        action: "CP_1_FI_1000",
        nodenum: 1,
        roles: [
          {
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "0",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 2,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_CM: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            roles: [
              {
                leftValue: "X",
                comparison: "<=",
                rightValue: "2700",
              },
            ],
          },
        ],
      },
      {
        action: "((round(2700/$ZF_STEP)) *$ZF_STEP +($IS_BI_L*$ZFL_W))mm:1",
        nodenum: 2,
        roles: [
          {
            roles: [
              {
                leftValue: "X",
                comparison: ">",
                rightValue: "2700",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_BA: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            roles: [
              {
                leftValue: "X",
                comparison: "<=",
                rightValue: "2700",
              },
            ],
          },
        ],
      },
      {
        action: "((round(2700/$ZF_STEP)) *$ZF_STEP +($IS_BI_L*$ZFL_W))mm:1",
        nodenum: 2,
        roles: [
          {
            roles: [
              {
                leftValue: "X",
                comparison: ">",
                rightValue: "2700",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_01: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_01 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_01 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_01 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_ZFL_FR: [
      {
        action: "CP_1_FI_1111",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "1",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 2,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_ZFR_FR: [
      {
        action: "CP_1_FI_1111",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "1",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 2,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_ZF_CM: [
      {
        action: "CP_1_CM_0000",
        nodenum: 1,
        roles: [
          {
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "1",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 2,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_02: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_02 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_02 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_02 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ART_VDIV: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: ">=",
                rightValue: "$ZONE_H -2700",
              },
            ],
          },
        ],
      },
      {
        action: "2300mm:1+400mm",
        nodenum: 2,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "<",
                rightValue: "$ZONE_H -2700",
              },
            ],
          },
        ],
      },
      {
        action: "1",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_WACA_TEC: [
      {
        action: "WC_DD",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "2",
              },
            ],
          },
        ],
      },
      {
        action: "WC_SD",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "1",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_WACA_U_ART_01: [
      {
        action: "WACA_LY_D",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "0",
              },
              {
                leftValue: "AD zone info05",
                comparison: "=",
                rightValue: "1",
              },
              {
                leftValue: "AD zone info06",
                comparison: "=",
                rightValue: "2",
              },
            ],
          },
        ],
      },
      {
        action: "WACA_LY_D_DW",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "0",
              },
              {
                leftValue: "AD zone info05",
                comparison: "=",
                rightValue: "0",
              },
              {
                leftValue: "AD zone info06",
                comparison: "=",
                rightValue: "2",
              },
            ],
          },
        ],
      },
      {
        action: "WACA_LY_D1",
        nodenum: 3,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "0",
              },
              {
                leftValue: "AD zone info05",
                comparison: "=",
                rightValue: "1",
              },
              {
                leftValue: "AD zone info06",
                comparison: "=",
                rightValue: "2",
              },
            ],
          },
        ],
      },
      {
        action: "WACA_LY_D1_DW",
        nodenum: 4,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "0",
              },
              {
                leftValue: "AD zone info06",
                comparison: "=",
                rightValue: "1",
              },
            ],
          },
        ],
      },
      {
        action: "WACA_LY_DB_D",
        nodenum: 5,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "0",
              },
              {
                leftValue: "AD zone info05",
                comparison: "=",
                rightValue: "0",
              },
              {
                leftValue: "AD zone info06",
                comparison: "=",
                rightValue: "1",
              },
            ],
          },
        ],
      },
      {
        action: "WACA_LY_DB_D_DW",
        nodenum: 6,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "0",
              },
              {
                leftValue: "AD zone info05",
                comparison: "=",
                rightValue: "0",
              },
              {
                leftValue: "AD zone info06",
                comparison: "=",
                rightValue: "1",
              },
            ],
          },
        ],
      },
      {
        action: "WACA_LY_DR_D",
        nodenum: 7,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "0",
              },
              {
                leftValue: "AD zone info02",
                comparison: "C",
                rightValue: "MD",
              },
              {
                leftValue: "AD zone info05",
                comparison: "=",
                rightValue: "0",
              },
              {
                leftValue: "AD zone info06",
                comparison: "=",
                rightValue: "1",
              },
            ],
          },
        ],
      },
      {
        action: "WACA_LY_DR_D_DW",
        nodenum: 8,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "0",
              },
              {
                leftValue: "AD zone info02",
                comparison: "C",
                rightValue: "MD",
              },
              {
                leftValue: "AD zone info05",
                comparison: "=",
                rightValue: "0",
              },
              {
                leftValue: "AD zone info06",
                comparison: "=",
                rightValue: "1",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 9,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_03: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_03 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_03 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_03 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_04: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_04 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_04 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_04 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_05: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_05 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_05 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_05 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_06: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_06 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_06 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_06 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_07: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_07 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_07 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_07 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_08: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_08 - $ZF_CNT ",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_08 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_08 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_09: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_09 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_09 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_09 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_10: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_10 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_10 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_10 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_11: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_11 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_11 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_11 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_12: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_12 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_12 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_12 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_13: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_13 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_13 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_13 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_14: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_14 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_14 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_14 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_15: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_15 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_15 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_15 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_16: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_16 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_16 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_16 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_LD_ZF_SZ_17: [
      {
        action: "1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZF_CNT_ACC_17 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "($ZF_CNT_17 * $ZF_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZF_CNT_ACC_17 - $ZF_CNT",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
  },
  zone: {
    name: "SELECTABLE",
    index: "0",
    side: "FRONT",
    variables: {},
    divDir: "H",
    linDiv: "($FI_1_THK *(1-$IS_BI_L))mm:1:($FI_1_THK *(1-$IS_BI_R))mm",
    divElem: 0,
    horDefType: "W",
    top: null,
    bottom: null,
    divider: null,
    children: [
      {
        name: "Filler thk",
        grtx: {
          "AD zone info01": "$IS_BI_L",
        },
        index: "0.0",
        divDir: "V",
        linDiv: "",
        divElem: 0,
        horDefType: "P",
        top: null,
        bottom: null,
        divider: null,
        children: [],
        sides: {
          "0": null,
          "1": {
            inSet: 0,
            inSetFor: "",
            partType: "S",
            cpName: "#DS_ZFL_SI",
          },
          "2": null,
          "3": null,
        },
      },
      {
        name: "Article Designer Group",
        index: "0.1",
        divDir: "V",
        linDiv: "$BASE_HEIGHT mm:1:$CROWN_HEIGHT mm",
        divElem: 0,
        horDefType: "W",
        top: null,
        bottom: null,
        divider: null,
        children: [
          {
            name: "Base",
            index: "0.1.0",
            divDir: "H",
            linDiv: "#DS_LD_ZF_BA",
            divElem: 0,
            horDefType: "W",
            top: null,
            bottom: null,
            divider: null,
            children: [
              {
                name: "Article Designer Group",
                index: "0.1.0.0",
                divDir: "V",
                linDiv: "",
                divElem: 0,
                horDefType: "P",
                top: null,
                bottom: null,
                divider: null,
                children: [],
                sides: {
                  "0": {
                    inSet: 0,
                    inSetFor: "",
                    partType: "S",
                    cpName: "CP_1_BA_1000",
                  },
                  "1": null,
                  "2": null,
                  "3": null,
                },
              },
              {
                name: "Article Designer Group",
                index: "0.1.0.1",
                divDir: "V",
                linDiv: "",
                divElem: 0,
                horDefType: "P",
                top: null,
                bottom: null,
                divider: null,
                children: [],
                sides: {
                  "0": {
                    inSet: 0,
                    inSetFor: "",
                    partType: "S",
                    cpName: "CP_1_BA_1000",
                  },
                  "1": null,
                  "2": null,
                  "3": null,
                },
              },
            ],
            sides: {
              "0": null,
              "1": null,
              "2": null,
              "3": null,
            },
          },
          {
            name: "Article Designer Group",
            index: "0.1.1",
            divDir: "H",
            linDiv: "($IS_BI_L * $ZFL_W)mm:1:($IS_BI_R * $ZFR_W)mm",
            divElem: 0,
            horDefType: "W",
            top: null,
            bottom: null,
            divider: null,
            children: [
              {
                name: "Filler width",
                grtx: {
                  "AD zone info01": "$IS_BI_L",
                },
                index: "0.1.1.0",
                divDir: "V",
                linDiv: "",
                divElem: 0,
                horDefType: "P",
                top: null,
                bottom: null,
                divider: null,
                children: [],
                sides: {
                  "0": {
                    inSet: -21.7,
                    inSetFor:
                      "-$Front_Side_GAP - $MAT_FR_1_THK - 2*$SRF_FR_1_THK",
                    partType: "S",
                    cpName: "#DS_ZFL_FR",
                  },
                  "1": null,
                  "2": null,
                  "3": null,
                },
              },
              {
                name: "Article Designer Group",
                index: "0.1.1.1",
                divDir: "H",
                linDiv: "#DS_LD_ZF_SZ_01",
                divElem: 0,
                horDefType: "W",
                top: null,
                bottom: null,
                divider: null,
                children: [
                  {
                    name: "Article Designer Group",
                    index: "0.1.1.1.0",
                    divDir: "V",
                    linDiv: "#DS_LD_ART_VDIV",
                    divElem: 0,
                    horDefType: "P",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "ART_ZONE_FR_01",
                        grtx: {
                          "AD zone info01": "0",
                          "AD zone info02": "MD",
                          "AD zone info03": "$HAS_HC",
                          "AD zone info04": "$HAS_DR",
                          "AD zone info05": "$IS_DR_EXT",
                          "AD zone info06": "$ZF_CNT_01",
                        },
                        index: "0.1.1.1.0.0",
                        divDir: "A",
                        linDiv: "1:1",
                        divElem: 0,
                        horDefType: "P",
                        top: null,
                        bottom: null,
                        divider: "$DS_WACA_FR_ART_01",
                        children: [
                          {
                            name: "Article Designer Group",
                            index: "0.1.1.1.0.0.0",
                            divDir: "V",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: null,
                            children: [],
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Article Designer Group",
                            index: "0.1.1.1.0.0.1",
                            divDir: "V",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: null,
                            children: [],
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                        ],
                        selectable: true,
                        sides: {
                          "0": null,
                          "1": null,
                          "2": null,
                          "3": null,
                        },
                      },
                      {
                        name: "TEC",
                        grtx: {
                          "AD zone info01": "$ZF_CNT_01",
                        },
                        index: "0.1.1.1.0.1",
                        divDir: "A",
                        linDiv: "",
                        divElem: 0,
                        horDefType: "P",
                        top: null,
                        bottom: null,
                        divider: "#DS_WACA_TEC",
                        children: [],
                        sides: {
                          "0": null,
                          "1": null,
                          "2": null,
                          "3": null,
                        },
                      },
                    ],
                    sides: {
                      "0": null,
                      "1": null,
                      "2": null,
                      "3": null,
                    },
                  },
                  {
                    name: "Article Designer Group",
                    index: "0.1.1.1.1",
                    divDir: "H",
                    linDiv: "#DS_LD_ZF_SZ_02",
                    divElem: 0,
                    horDefType: "W",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "Article Designer Group",
                        index: "0.1.1.1.1.0",
                        divDir: "V",
                        linDiv: "#DS_LD_ART_VDIV",
                        divElem: 0,
                        horDefType: "P",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "ART_ZONE_FR_02",
                            grtx: {
                              "AD zone info01": "0",
                              "AD zone info02": "MD",
                              "AD zone info03": "$HAS_HC",
                              "AD zone info04": "$HAS_DR",
                              "AD zone info05": "$IS_DR_EXT",
                              "AD zone info06": "$ZF_CNT_02",
                            },
                            index: "0.1.1.1.1.0.0",
                            divDir: "A",
                            linDiv: "1:1",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$DS_WACA_FR_ART_02",
                            children: [
                              {
                                name: "Article Designer Group",
                                index: "0.1.1.1.1.0.0.0",
                                divDir: "V",
                                linDiv: "",
                                divElem: 0,
                                horDefType: "P",
                                top: null,
                                bottom: null,
                                divider: null,
                                children: [],
                                sides: {
                                  "0": null,
                                  "1": null,
                                  "2": null,
                                  "3": null,
                                },
                              },
                              {
                                name: "Article Designer Group",
                                index: "0.1.1.1.1.0.0.1",
                                divDir: "V",
                                linDiv: "",
                                divElem: 0,
                                horDefType: "P",
                                top: null,
                                bottom: null,
                                divider: null,
                                children: [],
                                sides: {
                                  "0": null,
                                  "1": null,
                                  "2": null,
                                  "3": null,
                                },
                              },
                            ],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "TEC",
                            grtx: {
                              "AD zone info01": "$ZF_CNT_02",
                            },
                            index: "0.1.1.1.1.0.1",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "#DS_WACA_TEC",
                            children: [],
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                        ],
                        sides: {
                          "0": null,
                          "1": null,
                          "2": null,
                          "3": null,
                        },
                      },
                      {
                        name: "Article Designer Group",
                        index: "0.1.1.1.1.1",
                        divDir: "H",
                        linDiv: "#DS_LD_ZF_SZ_03",
                        divElem: 0,
                        horDefType: "W",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "Article Designer Group",
                            index: "0.1.1.1.1.1.0",
                            divDir: "V",
                            linDiv: "#DS_LD_ART_VDIV",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: null,
                            children: [
                              {
                                name: "ART_ZONE_FR_03",
                                grtx: {
                                  "AD zone info01": "0",
                                  "AD zone info02": "MD",
                                  "AD zone info03": "$HAS_HC",
                                  "AD zone info04": "$HAS_DR",
                                  "AD zone info05": "$IS_DR_EXT",
                                  "AD zone info06": "$ZF_CNT_03",
                                },
                                index: "0.1.1.1.1.1.0.0",
                                divDir: "A",
                                linDiv: "1:1",
                                divElem: 0,
                                horDefType: "P",
                                top: null,
                                bottom: null,
                                divider: "$DS_WACA_FR_ART_03",
                                children: [
                                  {
                                    name: "Article Designer Group",
                                    index: "0.1.1.1.1.1.0.0.0",
                                    divDir: "V",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: null,
                                    children: [],
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                  {
                                    name: "Article Designer Group",
                                    index: "0.1.1.1.1.1.0.0.1",
                                    divDir: "V",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: null,
                                    children: [],
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                ],
                                selectable: true,
                                sides: {
                                  "0": null,
                                  "1": null,
                                  "2": null,
                                  "3": null,
                                },
                              },
                              {
                                name: "TEC",
                                grtx: {
                                  "AD zone info01": "$ZF_CNT_03",
                                },
                                index: "0.1.1.1.1.1.0.1",
                                divDir: "A",
                                linDiv: "",
                                divElem: 0,
                                horDefType: "P",
                                top: null,
                                bottom: null,
                                divider: "#DS_WACA_TEC",
                                children: [],
                                sides: {
                                  "0": null,
                                  "1": null,
                                  "2": null,
                                  "3": null,
                                },
                              },
                            ],
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Article Designer Group",
                            index: "0.1.1.1.1.1.1",
                            divDir: "H",
                            linDiv: "#DS_LD_ZF_SZ_04",
                            divElem: 0,
                            horDefType: "W",
                            top: null,
                            bottom: null,
                            divider: null,
                            children: [
                              {
                                name: "Article Designer Group",
                                index: "0.1.1.1.1.1.1.0",
                                divDir: "V",
                                linDiv: "#DS_LD_ART_VDIV",
                                divElem: 0,
                                horDefType: "P",
                                top: null,
                                bottom: null,
                                divider: null,
                                children: [
                                  {
                                    name: "ART_ZONE_FR_04",
                                    grtx: {
                                      "AD zone info01": "0",
                                      "AD zone info02": "MD",
                                      "AD zone info03": "$HAS_HC",
                                      "AD zone info04": "$HAS_DR",
                                      "AD zone info05": "$IS_DR_EXT",
                                      "AD zone info06": "$ZF_CNT_04",
                                    },
                                    index: "0.1.1.1.1.1.1.0.0",
                                    divDir: "A",
                                    linDiv: "1:1",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: "$DS_WACA_FR_ART_04",
                                    children: [
                                      {
                                        name: "Article Designer Group",
                                        index: "0.1.1.1.1.1.1.0.0.0",
                                        divDir: "V",
                                        linDiv: "",
                                        divElem: 0,
                                        horDefType: "P",
                                        top: null,
                                        bottom: null,
                                        divider: null,
                                        children: [],
                                        sides: {
                                          "0": null,
                                          "1": null,
                                          "2": null,
                                          "3": null,
                                        },
                                      },
                                      {
                                        name: "Article Designer Group",
                                        index: "0.1.1.1.1.1.1.0.0.1",
                                        divDir: "V",
                                        linDiv: "",
                                        divElem: 0,
                                        horDefType: "P",
                                        top: null,
                                        bottom: null,
                                        divider: null,
                                        children: [],
                                        sides: {
                                          "0": null,
                                          "1": null,
                                          "2": null,
                                          "3": null,
                                        },
                                      },
                                    ],
                                    selectable: true,
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                  {
                                    name: "TEC",
                                    grtx: {
                                      "AD zone info01": "$ZF_CNT_04",
                                    },
                                    index: "0.1.1.1.1.1.1.0.1",
                                    divDir: "A",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: "#DS_WACA_TEC",
                                    children: [],
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                ],
                                sides: {
                                  "0": null,
                                  "1": null,
                                  "2": null,
                                  "3": null,
                                },
                              },
                              {
                                name: "Article Designer Group",
                                index: "0.1.1.1.1.1.1.1",
                                divDir: "H",
                                linDiv: "#DS_LD_ZF_SZ_05",
                                divElem: 0,
                                horDefType: "W",
                                top: null,
                                bottom: null,
                                divider: null,
                                children: [
                                  {
                                    name: "Article Designer Group",
                                    index: "0.1.1.1.1.1.1.1.0",
                                    divDir: "V",
                                    linDiv: "#DS_LD_ART_VDIV",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: null,
                                    children: [
                                      {
                                        name: "ART_ZONE_FR_05",
                                        grtx: {
                                          "AD zone info01": "0",
                                          "AD zone info02": "MD",
                                          "AD zone info03": "$HAS_HC",
                                          "AD zone info04": "$HAS_DR",
                                          "AD zone info05": "$IS_DR_EXT",
                                          "AD zone info06": "$ZF_CNT_05",
                                        },
                                        index: "0.1.1.1.1.1.1.1.0.0",
                                        divDir: "A",
                                        linDiv: "1:1",
                                        divElem: 0,
                                        horDefType: "P",
                                        top: null,
                                        bottom: null,
                                        divider: "$DS_WACA_FR_ART_05",
                                        children: [
                                          {
                                            name: "Article Designer Group",
                                            index: "0.1.1.1.1.1.1.1.0.0.0",
                                            divDir: "V",
                                            linDiv: "",
                                            divElem: 0,
                                            horDefType: "P",
                                            top: null,
                                            bottom: null,
                                            divider: null,
                                            children: [],
                                            sides: {
                                              "0": null,
                                              "1": null,
                                              "2": null,
                                              "3": null,
                                            },
                                          },
                                          {
                                            name: "Article Designer Group",
                                            index: "0.1.1.1.1.1.1.1.0.0.1",
                                            divDir: "V",
                                            linDiv: "",
                                            divElem: 0,
                                            horDefType: "P",
                                            top: null,
                                            bottom: null,
                                            divider: null,
                                            children: [],
                                            sides: {
                                              "0": null,
                                              "1": null,
                                              "2": null,
                                              "3": null,
                                            },
                                          },
                                        ],
                                        selectable: true,
                                        sides: {
                                          "0": null,
                                          "1": null,
                                          "2": null,
                                          "3": null,
                                        },
                                      },
                                      {
                                        name: "TEC",
                                        grtx: {
                                          "AD zone info01": "$ZF_CNT_05",
                                        },
                                        index: "0.1.1.1.1.1.1.1.0.1",
                                        divDir: "A",
                                        linDiv: "",
                                        divElem: 0,
                                        horDefType: "P",
                                        top: null,
                                        bottom: null,
                                        divider: "#DS_WACA_TEC",
                                        children: [],
                                        sides: {
                                          "0": null,
                                          "1": null,
                                          "2": null,
                                          "3": null,
                                        },
                                      },
                                    ],
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                  {
                                    name: "Article Designer Group",
                                    index: "0.1.1.1.1.1.1.1.1",
                                    divDir: "H",
                                    linDiv: "#DS_LD_ZF_SZ_06",
                                    divElem: 0,
                                    horDefType: "W",
                                    top: null,
                                    bottom: null,
                                    divider: null,
                                    children: [
                                      {
                                        name: "Article Designer Group",
                                        index: "0.1.1.1.1.1.1.1.1.0",
                                        divDir: "V",
                                        linDiv: "#DS_LD_ART_VDIV",
                                        divElem: 0,
                                        horDefType: "P",
                                        top: null,
                                        bottom: null,
                                        divider: null,
                                        children: [
                                          {
                                            name: "ART_ZONE_FR_06",
                                            grtx: {
                                              "AD zone info01": "0",
                                              "AD zone info02": "MD",
                                              "AD zone info03": "$HAS_HC",
                                              "AD zone info04": "$HAS_DR",
                                              "AD zone info05": "$IS_DR_EXT",
                                              "AD zone info06": "$ZF_CNT_06",
                                            },
                                            index: "0.1.1.1.1.1.1.1.1.0.0",
                                            divDir: "A",
                                            linDiv: "1:1",
                                            divElem: 0,
                                            horDefType: "P",
                                            top: null,
                                            bottom: null,
                                            divider: "$DS_WACA_FR_ART_06",
                                            children: [
                                              {
                                                name: "Article Designer Group",
                                                index:
                                                  "0.1.1.1.1.1.1.1.1.0.0.0",
                                                divDir: "V",
                                                linDiv: "",
                                                divElem: 0,
                                                horDefType: "P",
                                                top: null,
                                                bottom: null,
                                                divider: null,
                                                children: [],
                                                sides: {
                                                  "0": null,
                                                  "1": null,
                                                  "2": null,
                                                  "3": null,
                                                },
                                              },
                                              {
                                                name: "Article Designer Group",
                                                index:
                                                  "0.1.1.1.1.1.1.1.1.0.0.1",
                                                divDir: "V",
                                                linDiv: "",
                                                divElem: 0,
                                                horDefType: "P",
                                                top: null,
                                                bottom: null,
                                                divider: null,
                                                children: [],
                                                sides: {
                                                  "0": null,
                                                  "1": null,
                                                  "2": null,
                                                  "3": null,
                                                },
                                              },
                                            ],
                                            selectable: true,
                                            sides: {
                                              "0": null,
                                              "1": null,
                                              "2": null,
                                              "3": null,
                                            },
                                          },
                                          {
                                            name: "TEC",
                                            grtx: {
                                              "AD zone info01": "$ZF_CNT_06",
                                            },
                                            index: "0.1.1.1.1.1.1.1.1.0.1",
                                            divDir: "A",
                                            linDiv: "",
                                            divElem: 0,
                                            horDefType: "P",
                                            top: null,
                                            bottom: null,
                                            divider: "#DS_WACA_TEC",
                                            children: [],
                                            sides: {
                                              "0": null,
                                              "1": null,
                                              "2": null,
                                              "3": null,
                                            },
                                          },
                                        ],
                                        sides: {
                                          "0": null,
                                          "1": null,
                                          "2": null,
                                          "3": null,
                                        },
                                      },
                                      {
                                        name: "Article Designer Group",
                                        index: "0.1.1.1.1.1.1.1.1.1",
                                        divDir: "H",
                                        linDiv: "#DS_LD_ZF_SZ_07",
                                        divElem: 0,
                                        horDefType: "W",
                                        top: null,
                                        bottom: null,
                                        divider: null,
                                        children: [
                                          {
                                            name: "Article Designer Group",
                                            index: "0.1.1.1.1.1.1.1.1.1.0",
                                            divDir: "V",
                                            linDiv: "#DS_LD_ART_VDIV",
                                            divElem: 0,
                                            horDefType: "P",
                                            top: null,
                                            bottom: null,
                                            divider: null,
                                            children: [
                                              {
                                                name: "ART_ZONE_FR_07",
                                                grtx: {
                                                  "AD zone info01": "0",
                                                  "AD zone info02": "MD",
                                                  "AD zone info03": "$HAS_HC",
                                                  "AD zone info04": "$HAS_DR",
                                                  "AD zone info05":
                                                    "$IS_DR_EXT",
                                                  "AD zone info06":
                                                    "$ZF_CNT_07",
                                                },
                                                index:
                                                  "0.1.1.1.1.1.1.1.1.1.0.0",
                                                divDir: "A",
                                                linDiv: "1:1",
                                                divElem: 0,
                                                horDefType: "P",
                                                top: null,
                                                bottom: null,
                                                divider: "$DS_WACA_FR_ART_07",
                                                children: [
                                                  {
                                                    name: "Article Designer Group",
                                                    index:
                                                      "0.1.1.1.1.1.1.1.1.1.0.0.0",
                                                    divDir: "V",
                                                    linDiv: "",
                                                    divElem: 0,
                                                    horDefType: "P",
                                                    top: null,
                                                    bottom: null,
                                                    divider: null,
                                                    children: [],
                                                    sides: {
                                                      "0": null,
                                                      "1": null,
                                                      "2": null,
                                                      "3": null,
                                                    },
                                                  },
                                                  {
                                                    name: "Article Designer Group",
                                                    index:
                                                      "0.1.1.1.1.1.1.1.1.1.0.0.1",
                                                    divDir: "V",
                                                    linDiv: "",
                                                    divElem: 0,
                                                    horDefType: "P",
                                                    top: null,
                                                    bottom: null,
                                                    divider: null,
                                                    children: [],
                                                    sides: {
                                                      "0": null,
                                                      "1": null,
                                                      "2": null,
                                                      "3": null,
                                                    },
                                                  },
                                                ],
                                                selectable: true,
                                                sides: {
                                                  "0": null,
                                                  "1": null,
                                                  "2": null,
                                                  "3": null,
                                                },
                                              },
                                              {
                                                name: "TEC",
                                                grtx: {
                                                  "AD zone info01":
                                                    "$ZF_CNT_07",
                                                },
                                                index:
                                                  "0.1.1.1.1.1.1.1.1.1.0.1",
                                                divDir: "A",
                                                linDiv: "",
                                                divElem: 0,
                                                horDefType: "P",
                                                top: null,
                                                bottom: null,
                                                divider: "#DS_WACA_TEC",
                                                children: [],
                                                sides: {
                                                  "0": null,
                                                  "1": null,
                                                  "2": null,
                                                  "3": null,
                                                },
                                              },
                                            ],
                                            sides: {
                                              "0": null,
                                              "1": null,
                                              "2": null,
                                              "3": null,
                                            },
                                          },
                                          {
                                            name: "Article Designer Group",
                                            index: "0.1.1.1.1.1.1.1.1.1.1",
                                            divDir: "H",
                                            linDiv: "#DS_LD_ZF_SZ_08",
                                            divElem: 0,
                                            horDefType: "W",
                                            top: null,
                                            bottom: null,
                                            divider: null,
                                            children: [
                                              {
                                                name: "Article Designer Group",
                                                index:
                                                  "0.1.1.1.1.1.1.1.1.1.1.0",
                                                divDir: "V",
                                                linDiv: "#DS_LD_ART_VDIV",
                                                divElem: 0,
                                                horDefType: "P",
                                                top: null,
                                                bottom: null,
                                                divider: null,
                                                children: [
                                                  {
                                                    name: "ART_ZONE_FR_08",
                                                    grtx: {
                                                      "AD zone info01": "0",
                                                      "AD zone info02": "MD",
                                                      "AD zone info03":
                                                        "$HAS_HC",
                                                      "AD zone info04":
                                                        "$HAS_DR",
                                                      "AD zone info05":
                                                        "$IS_DR_EXT",
                                                      "AD zone info06":
                                                        "$ZF_CNT_08",
                                                    },
                                                    index:
                                                      "0.1.1.1.1.1.1.1.1.1.1.0.0",
                                                    divDir: "A",
                                                    linDiv: "1:1",
                                                    divElem: 0,
                                                    horDefType: "P",
                                                    top: null,
                                                    bottom: null,
                                                    divider:
                                                      "$DS_WACA_FR_ART_08",
                                                    children: [
                                                      {
                                                        name: "Article Designer Group",
                                                        index:
                                                          "0.1.1.1.1.1.1.1.1.1.1.0.0.0",
                                                        divDir: "V",
                                                        linDiv: "",
                                                        divElem: 0,
                                                        horDefType: "P",
                                                        top: null,
                                                        bottom: null,
                                                        divider: null,
                                                        children: [],
                                                        sides: {
                                                          "0": null,
                                                          "1": null,
                                                          "2": null,
                                                          "3": null,
                                                        },
                                                      },
                                                      {
                                                        name: "Article Designer Group",
                                                        index:
                                                          "0.1.1.1.1.1.1.1.1.1.1.0.0.1",
                                                        divDir: "V",
                                                        linDiv: "",
                                                        divElem: 0,
                                                        horDefType: "P",
                                                        top: null,
                                                        bottom: null,
                                                        divider: null,
                                                        children: [],
                                                        sides: {
                                                          "0": null,
                                                          "1": null,
                                                          "2": null,
                                                          "3": null,
                                                        },
                                                      },
                                                    ],
                                                    selectable: true,
                                                    sides: {
                                                      "0": null,
                                                      "1": null,
                                                      "2": null,
                                                      "3": null,
                                                    },
                                                  },
                                                  {
                                                    name: "TEC",
                                                    grtx: {
                                                      "AD zone info01":
                                                        "$ZF_CNT_08",
                                                    },
                                                    index:
                                                      "0.1.1.1.1.1.1.1.1.1.1.0.1",
                                                    divDir: "A",
                                                    linDiv: "",
                                                    divElem: 0,
                                                    horDefType: "P",
                                                    top: null,
                                                    bottom: null,
                                                    divider: "#DS_WACA_TEC",
                                                    children: [],
                                                    sides: {
                                                      "0": null,
                                                      "1": null,
                                                      "2": null,
                                                      "3": null,
                                                    },
                                                  },
                                                ],
                                                sides: {
                                                  "0": null,
                                                  "1": null,
                                                  "2": null,
                                                  "3": null,
                                                },
                                              },
                                              {
                                                name: "Article Designer Group",
                                                index:
                                                  "0.1.1.1.1.1.1.1.1.1.1.1",
                                                divDir: "H",
                                                linDiv: "#DS_LD_ZF_SZ_09",
                                                divElem: 0,
                                                horDefType: "W",
                                                top: null,
                                                bottom: null,
                                                divider: null,
                                                children: [
                                                  {
                                                    name: "Article Designer Group",
                                                    index:
                                                      "0.1.1.1.1.1.1.1.1.1.1.1.0",
                                                    divDir: "V",
                                                    linDiv: "#DS_LD_ART_VDIV",
                                                    divElem: 0,
                                                    horDefType: "P",
                                                    top: null,
                                                    bottom: null,
                                                    divider: null,
                                                    children: [
                                                      {
                                                        name: "ART_ZONE_FR_09",
                                                        grtx: {
                                                          "AD zone info01": "0",
                                                          "AD zone info02":
                                                            "MD",
                                                          "AD zone info03":
                                                            "$HAS_HC",
                                                          "AD zone info04":
                                                            "$HAS_DR",
                                                          "AD zone info05":
                                                            "$IS_DR_EXT",
                                                          "AD zone info06":
                                                            "$ZF_CNT_09",
                                                        },
                                                        index:
                                                          "0.1.1.1.1.1.1.1.1.1.1.1.0.0",
                                                        divDir: "A",
                                                        linDiv: "1:1",
                                                        divElem: 0,
                                                        horDefType: "P",
                                                        top: null,
                                                        bottom: null,
                                                        divider:
                                                          "$DS_WACA_FR_ART_09",
                                                        children: [
                                                          {
                                                            name: "Article Designer Group",
                                                            index:
                                                              "0.1.1.1.1.1.1.1.1.1.1.1.0.0.0",
                                                            divDir: "V",
                                                            linDiv: "",
                                                            divElem: 0,
                                                            horDefType: "P",
                                                            top: null,
                                                            bottom: null,
                                                            divider: null,
                                                            children: [],
                                                            sides: {
                                                              "0": null,
                                                              "1": null,
                                                              "2": null,
                                                              "3": null,
                                                            },
                                                          },
                                                          {
                                                            name: "Article Designer Group",
                                                            index:
                                                              "0.1.1.1.1.1.1.1.1.1.1.1.0.0.1",
                                                            divDir: "V",
                                                            linDiv: "",
                                                            divElem: 0,
                                                            horDefType: "P",
                                                            top: null,
                                                            bottom: null,
                                                            divider: null,
                                                            children: [],
                                                            sides: {
                                                              "0": null,
                                                              "1": null,
                                                              "2": null,
                                                              "3": null,
                                                            },
                                                          },
                                                        ],
                                                        selectable: true,
                                                        sides: {
                                                          "0": null,
                                                          "1": null,
                                                          "2": null,
                                                          "3": null,
                                                        },
                                                      },
                                                      {
                                                        name: "TEC",
                                                        grtx: {
                                                          "AD zone info01":
                                                            "$ZF_CNT_09",
                                                        },
                                                        index:
                                                          "0.1.1.1.1.1.1.1.1.1.1.1.0.1",
                                                        divDir: "A",
                                                        linDiv: "",
                                                        divElem: 0,
                                                        horDefType: "P",
                                                        top: null,
                                                        bottom: null,
                                                        divider: "#DS_WACA_TEC",
                                                        children: [],
                                                        sides: {
                                                          "0": null,
                                                          "1": null,
                                                          "2": null,
                                                          "3": null,
                                                        },
                                                      },
                                                    ],
                                                    sides: {
                                                      "0": null,
                                                      "1": null,
                                                      "2": null,
                                                      "3": null,
                                                    },
                                                  },
                                                  {
                                                    name: "Article Designer Group",
                                                    index:
                                                      "0.1.1.1.1.1.1.1.1.1.1.1.1",
                                                    divDir: "H",
                                                    linDiv: "#DS_LD_ZF_SZ_10",
                                                    divElem: 0,
                                                    horDefType: "W",
                                                    top: null,
                                                    bottom: null,
                                                    divider: null,
                                                    children: [
                                                      {
                                                        name: "Article Designer Group",
                                                        index:
                                                          "0.1.1.1.1.1.1.1.1.1.1.1.1.0",
                                                        divDir: "V",
                                                        linDiv:
                                                          "#DS_LD_ART_VDIV",
                                                        divElem: 0,
                                                        horDefType: "P",
                                                        top: null,
                                                        bottom: null,
                                                        divider: null,
                                                        children: [
                                                          {
                                                            name: "ART_ZONE_FR_10",
                                                            grtx: {
                                                              "AD zone info01":
                                                                "0",
                                                              "AD zone info02":
                                                                "MD",
                                                              "AD zone info03":
                                                                "$HAS_HC",
                                                              "AD zone info04":
                                                                "$HAS_DR",
                                                              "AD zone info05":
                                                                "$IS_DR_EXT",
                                                              "AD zone info06":
                                                                "$ZF_CNT_10",
                                                            },
                                                            index:
                                                              "0.1.1.1.1.1.1.1.1.1.1.1.1.0.0",
                                                            divDir: "A",
                                                            linDiv: "1:1",
                                                            divElem: 0,
                                                            horDefType: "P",
                                                            top: null,
                                                            bottom: null,
                                                            divider:
                                                              "$DS_WACA_FR_ART_10",
                                                            children: [
                                                              {
                                                                name: "Article Designer Group",
                                                                index:
                                                                  "0.1.1.1.1.1.1.1.1.1.1.1.1.0.0.0",
                                                                divDir: "V",
                                                                linDiv: "",
                                                                divElem: 0,
                                                                horDefType: "P",
                                                                top: null,
                                                                bottom: null,
                                                                divider: null,
                                                                children: [],
                                                                sides: {
                                                                  "0": null,
                                                                  "1": null,
                                                                  "2": null,
                                                                  "3": null,
                                                                },
                                                              },
                                                              {
                                                                name: "Article Designer Group",
                                                                index:
                                                                  "0.1.1.1.1.1.1.1.1.1.1.1.1.0.0.1",
                                                                divDir: "V",
                                                                linDiv: "",
                                                                divElem: 0,
                                                                horDefType: "P",
                                                                top: null,
                                                                bottom: null,
                                                                divider: null,
                                                                children: [],
                                                                sides: {
                                                                  "0": null,
                                                                  "1": null,
                                                                  "2": null,
                                                                  "3": null,
                                                                },
                                                              },
                                                            ],
                                                            selectable: true,
                                                            sides: {
                                                              "0": null,
                                                              "1": null,
                                                              "2": null,
                                                              "3": null,
                                                            },
                                                          },
                                                          {
                                                            name: "TEC",
                                                            grtx: {
                                                              "AD zone info01":
                                                                "$ZF_CNT_10",
                                                            },
                                                            index:
                                                              "0.1.1.1.1.1.1.1.1.1.1.1.1.0.1",
                                                            divDir: "A",
                                                            linDiv: "",
                                                            divElem: 0,
                                                            horDefType: "P",
                                                            top: null,
                                                            bottom: null,
                                                            divider:
                                                              "#DS_WACA_TEC",
                                                            children: [],
                                                            sides: {
                                                              "0": null,
                                                              "1": null,
                                                              "2": null,
                                                              "3": null,
                                                            },
                                                          },
                                                        ],
                                                        sides: {
                                                          "0": null,
                                                          "1": null,
                                                          "2": null,
                                                          "3": null,
                                                        },
                                                      },
                                                      {
                                                        name: "Article Designer Group",
                                                        index:
                                                          "0.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                        divDir: "H",
                                                        linDiv:
                                                          "#DS_LD_ZF_SZ_11",
                                                        divElem: 0,
                                                        horDefType: "W",
                                                        top: null,
                                                        bottom: null,
                                                        divider: null,
                                                        children: [
                                                          {
                                                            name: "Article Designer Group",
                                                            index:
                                                              "0.1.1.1.1.1.1.1.1.1.1.1.1.1.0",
                                                            divDir: "V",
                                                            linDiv:
                                                              "#DS_LD_ART_VDIV",
                                                            divElem: 0,
                                                            horDefType: "P",
                                                            top: null,
                                                            bottom: null,
                                                            divider: null,
                                                            children: [
                                                              {
                                                                name: "ART_ZONE_FR_11",
                                                                grtx: {
                                                                  "AD zone info01":
                                                                    "0",
                                                                  "AD zone info02":
                                                                    "MD",
                                                                  "AD zone info03":
                                                                    "$HAS_HC",
                                                                  "AD zone info04":
                                                                    "$HAS_DR",
                                                                  "AD zone info05":
                                                                    "$IS_DR_EXT",
                                                                  "AD zone info06":
                                                                    "$ZF_CNT_11",
                                                                },
                                                                index:
                                                                  "0.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0",
                                                                divDir: "A",
                                                                linDiv: "1:1",
                                                                divElem: 0,
                                                                horDefType: "P",
                                                                top: null,
                                                                bottom: null,
                                                                divider:
                                                                  "$DS_WACA_FR_ART_11",
                                                                children: [
                                                                  {
                                                                    name: "Article Designer Group",
                                                                    index:
                                                                      "0.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0.0",
                                                                    divDir: "V",
                                                                    linDiv: "",
                                                                    divElem: 0,
                                                                    horDefType:
                                                                      "P",
                                                                    top: null,
                                                                    bottom:
                                                                      null,
                                                                    divider:
                                                                      null,
                                                                    children:
                                                                      [],
                                                                    sides: {
                                                                      "0": null,
                                                                      "1": null,
                                                                      "2": null,
                                                                      "3": null,
                                                                    },
                                                                  },
                                                                  {
                                                                    name: "Article Designer Group",
                                                                    index:
                                                                      "0.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0.1",
                                                                    divDir: "V",
                                                                    linDiv: "",
                                                                    divElem: 0,
                                                                    horDefType:
                                                                      "P",
                                                                    top: null,
                                                                    bottom:
                                                                      null,
                                                                    divider:
                                                                      null,
                                                                    children:
                                                                      [],
                                                                    sides: {
                                                                      "0": null,
                                                                      "1": null,
                                                                      "2": null,
                                                                      "3": null,
                                                                    },
                                                                  },
                                                                ],
                                                                selectable: true,
                                                                sides: {
                                                                  "0": null,
                                                                  "1": null,
                                                                  "2": null,
                                                                  "3": null,
                                                                },
                                                              },
                                                              {
                                                                name: "TEC",
                                                                grtx: {
                                                                  "AD zone info01":
                                                                    "$ZF_CNT_11",
                                                                },
                                                                index:
                                                                  "0.1.1.1.1.1.1.1.1.1.1.1.1.1.0.1",
                                                                divDir: "A",
                                                                linDiv: "",
                                                                divElem: 0,
                                                                horDefType: "P",
                                                                top: null,
                                                                bottom: null,
                                                                divider:
                                                                  "#DS_WACA_TEC",
                                                                children: [],
                                                                sides: {
                                                                  "0": null,
                                                                  "1": null,
                                                                  "2": null,
                                                                  "3": null,
                                                                },
                                                              },
                                                            ],
                                                            sides: {
                                                              "0": null,
                                                              "1": null,
                                                              "2": null,
                                                              "3": null,
                                                            },
                                                          },
                                                          {
                                                            name: "Article Designer Group",
                                                            index:
                                                              "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                            divDir: "H",
                                                            linDiv:
                                                              "#DS_LD_ZF_SZ_12",
                                                            divElem: 0,
                                                            horDefType: "W",
                                                            top: null,
                                                            bottom: null,
                                                            divider: null,
                                                            children: [
                                                              {
                                                                name: "Article Designer Group",
                                                                index:
                                                                  "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0",
                                                                divDir: "V",
                                                                linDiv:
                                                                  "#DS_LD_ART_VDIV",
                                                                divElem: 0,
                                                                horDefType: "P",
                                                                top: null,
                                                                bottom: null,
                                                                divider: null,
                                                                children: [
                                                                  {
                                                                    name: "ART_ZONE_FR_12",
                                                                    grtx: {
                                                                      "AD zone info01":
                                                                        "0",
                                                                      "AD zone info02":
                                                                        "MD",
                                                                      "AD zone info03":
                                                                        "$HAS_HC",
                                                                      "AD zone info04":
                                                                        "$HAS_DR",
                                                                      "AD zone info05":
                                                                        "$IS_DR_EXT",
                                                                      "AD zone info06":
                                                                        "$ZF_CNT_12",
                                                                    },
                                                                    index:
                                                                      "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0",
                                                                    divDir: "A",
                                                                    linDiv:
                                                                      "1:1",
                                                                    divElem: 0,
                                                                    horDefType:
                                                                      "P",
                                                                    top: null,
                                                                    bottom:
                                                                      null,
                                                                    divider:
                                                                      "$DS_WACA_FR_ART_12",
                                                                    children: [
                                                                      {
                                                                        name: "Article Designer Group",
                                                                        index:
                                                                          "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0.0",
                                                                        divDir:
                                                                          "V",
                                                                        linDiv:
                                                                          "",
                                                                        divElem: 0,
                                                                        horDefType:
                                                                          "P",
                                                                        top: null,
                                                                        bottom:
                                                                          null,
                                                                        divider:
                                                                          null,
                                                                        children:
                                                                          [],
                                                                        sides: {
                                                                          "0": null,
                                                                          "1": null,
                                                                          "2": null,
                                                                          "3": null,
                                                                        },
                                                                      },
                                                                      {
                                                                        name: "Article Designer Group",
                                                                        index:
                                                                          "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0.1",
                                                                        divDir:
                                                                          "V",
                                                                        linDiv:
                                                                          "",
                                                                        divElem: 0,
                                                                        horDefType:
                                                                          "P",
                                                                        top: null,
                                                                        bottom:
                                                                          null,
                                                                        divider:
                                                                          null,
                                                                        children:
                                                                          [],
                                                                        sides: {
                                                                          "0": null,
                                                                          "1": null,
                                                                          "2": null,
                                                                          "3": null,
                                                                        },
                                                                      },
                                                                    ],
                                                                    selectable: true,
                                                                    sides: {
                                                                      "0": null,
                                                                      "1": null,
                                                                      "2": null,
                                                                      "3": null,
                                                                    },
                                                                  },
                                                                  {
                                                                    name: "TEC",
                                                                    grtx: {
                                                                      "AD zone info01":
                                                                        "$ZF_CNT_12",
                                                                    },
                                                                    index:
                                                                      "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.1",
                                                                    divDir: "A",
                                                                    linDiv: "",
                                                                    divElem: 0,
                                                                    horDefType:
                                                                      "P",
                                                                    top: null,
                                                                    bottom:
                                                                      null,
                                                                    divider:
                                                                      "#DS_WACA_TEC",
                                                                    children:
                                                                      [],
                                                                    sides: {
                                                                      "0": null,
                                                                      "1": null,
                                                                      "2": null,
                                                                      "3": null,
                                                                    },
                                                                  },
                                                                ],
                                                                sides: {
                                                                  "0": null,
                                                                  "1": null,
                                                                  "2": null,
                                                                  "3": null,
                                                                },
                                                              },
                                                              {
                                                                name: "Article Designer Group",
                                                                index:
                                                                  "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                divDir: "H",
                                                                linDiv:
                                                                  "#DS_LD_ZF_SZ_13",
                                                                divElem: 0,
                                                                horDefType: "W",
                                                                top: null,
                                                                bottom: null,
                                                                divider: null,
                                                                children: [
                                                                  {
                                                                    name: "Article Designer Group",
                                                                    index:
                                                                      "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0",
                                                                    divDir: "V",
                                                                    linDiv:
                                                                      "#DS_LD_ART_VDIV",
                                                                    divElem: 0,
                                                                    horDefType:
                                                                      "P",
                                                                    top: null,
                                                                    bottom:
                                                                      null,
                                                                    divider:
                                                                      null,
                                                                    children: [
                                                                      {
                                                                        name: "ART_ZONE_FR_13",
                                                                        grtx: {
                                                                          "AD zone info01":
                                                                            "0",
                                                                          "AD zone info02":
                                                                            "MD",
                                                                          "AD zone info03":
                                                                            "$HAS_HC",
                                                                          "AD zone info04":
                                                                            "$HAS_DR",
                                                                          "AD zone info05":
                                                                            "$IS_DR_EXT",
                                                                          "AD zone info06":
                                                                            "$ZF_CNT_13",
                                                                        },
                                                                        index:
                                                                          "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0",
                                                                        divDir:
                                                                          "A",
                                                                        linDiv:
                                                                          "1:1",
                                                                        divElem: 0,
                                                                        horDefType:
                                                                          "P",
                                                                        top: null,
                                                                        bottom:
                                                                          null,
                                                                        divider:
                                                                          "$DS_WACA_FR_ART_13",
                                                                        children:
                                                                          [
                                                                            {
                                                                              name: "Article Designer Group",
                                                                              index:
                                                                                "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0.0",
                                                                              divDir:
                                                                                "V",
                                                                              linDiv:
                                                                                "",
                                                                              divElem: 0,
                                                                              horDefType:
                                                                                "P",
                                                                              top: null,
                                                                              bottom:
                                                                                null,
                                                                              divider:
                                                                                null,
                                                                              children:
                                                                                [],
                                                                              sides:
                                                                                {
                                                                                  "0": null,
                                                                                  "1": null,
                                                                                  "2": null,
                                                                                  "3": null,
                                                                                },
                                                                            },
                                                                            {
                                                                              name: "Article Designer Group",
                                                                              index:
                                                                                "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0.1",
                                                                              divDir:
                                                                                "V",
                                                                              linDiv:
                                                                                "",
                                                                              divElem: 0,
                                                                              horDefType:
                                                                                "P",
                                                                              top: null,
                                                                              bottom:
                                                                                null,
                                                                              divider:
                                                                                null,
                                                                              children:
                                                                                [],
                                                                              sides:
                                                                                {
                                                                                  "0": null,
                                                                                  "1": null,
                                                                                  "2": null,
                                                                                  "3": null,
                                                                                },
                                                                            },
                                                                          ],
                                                                        selectable: true,
                                                                        sides: {
                                                                          "0": null,
                                                                          "1": null,
                                                                          "2": null,
                                                                          "3": null,
                                                                        },
                                                                      },
                                                                      {
                                                                        name: "TEC",
                                                                        grtx: {
                                                                          "AD zone info01":
                                                                            "$ZF_CNT_13",
                                                                        },
                                                                        index:
                                                                          "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.1",
                                                                        divDir:
                                                                          "A",
                                                                        linDiv:
                                                                          "",
                                                                        divElem: 0,
                                                                        horDefType:
                                                                          "P",
                                                                        top: null,
                                                                        bottom:
                                                                          null,
                                                                        divider:
                                                                          "#DS_WACA_TEC",
                                                                        children:
                                                                          [],
                                                                        sides: {
                                                                          "0": null,
                                                                          "1": null,
                                                                          "2": null,
                                                                          "3": null,
                                                                        },
                                                                      },
                                                                    ],
                                                                    sides: {
                                                                      "0": null,
                                                                      "1": null,
                                                                      "2": null,
                                                                      "3": null,
                                                                    },
                                                                  },
                                                                  {
                                                                    name: "Article Designer Group",
                                                                    index:
                                                                      "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                    divDir: "H",
                                                                    linDiv:
                                                                      "#DS_LD_ZF_SZ_14",
                                                                    divElem: 0,
                                                                    horDefType:
                                                                      "W",
                                                                    top: null,
                                                                    bottom:
                                                                      null,
                                                                    divider:
                                                                      null,
                                                                    children: [
                                                                      {
                                                                        name: "Article Designer Group",
                                                                        index:
                                                                          "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0",
                                                                        divDir:
                                                                          "V",
                                                                        linDiv:
                                                                          "#DS_LD_ART_VDIV",
                                                                        divElem: 0,
                                                                        horDefType:
                                                                          "P",
                                                                        top: null,
                                                                        bottom:
                                                                          null,
                                                                        divider:
                                                                          null,
                                                                        children:
                                                                          [
                                                                            {
                                                                              name: "ART_ZONE_FR_14",
                                                                              grtx: {
                                                                                "AD zone info01":
                                                                                  "0",
                                                                                "AD zone info02":
                                                                                  "MD",
                                                                                "AD zone info03":
                                                                                  "$HAS_HC",
                                                                                "AD zone info04":
                                                                                  "$HAS_DR",
                                                                                "AD zone info05":
                                                                                  "$IS_DR_EXT",
                                                                                "AD zone info06":
                                                                                  "$ZF_CNT_14",
                                                                              },
                                                                              index:
                                                                                "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0",
                                                                              divDir:
                                                                                "A",
                                                                              linDiv:
                                                                                "1:1",
                                                                              divElem: 0,
                                                                              horDefType:
                                                                                "P",
                                                                              top: null,
                                                                              bottom:
                                                                                null,
                                                                              divider:
                                                                                "$DS_WACA_FR_ART_14",
                                                                              children:
                                                                                [
                                                                                  {
                                                                                    name: "Article Designer Group",
                                                                                    index:
                                                                                      "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0.0",
                                                                                    divDir:
                                                                                      "V",
                                                                                    linDiv:
                                                                                      "",
                                                                                    divElem: 0,
                                                                                    horDefType:
                                                                                      "P",
                                                                                    top: null,
                                                                                    bottom:
                                                                                      null,
                                                                                    divider:
                                                                                      null,
                                                                                    children:
                                                                                      [],
                                                                                    sides:
                                                                                      {
                                                                                        "0": null,
                                                                                        "1": null,
                                                                                        "2": null,
                                                                                        "3": null,
                                                                                      },
                                                                                  },
                                                                                  {
                                                                                    name: "Article Designer Group",
                                                                                    index:
                                                                                      "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0.1",
                                                                                    divDir:
                                                                                      "V",
                                                                                    linDiv:
                                                                                      "",
                                                                                    divElem: 0,
                                                                                    horDefType:
                                                                                      "P",
                                                                                    top: null,
                                                                                    bottom:
                                                                                      null,
                                                                                    divider:
                                                                                      null,
                                                                                    children:
                                                                                      [],
                                                                                    sides:
                                                                                      {
                                                                                        "0": null,
                                                                                        "1": null,
                                                                                        "2": null,
                                                                                        "3": null,
                                                                                      },
                                                                                  },
                                                                                ],
                                                                              selectable: true,
                                                                              sides:
                                                                                {
                                                                                  "0": null,
                                                                                  "1": null,
                                                                                  "2": null,
                                                                                  "3": null,
                                                                                },
                                                                            },
                                                                            {
                                                                              name: "TEC",
                                                                              grtx: {
                                                                                "AD zone info01":
                                                                                  "$ZF_CNT_14",
                                                                              },
                                                                              index:
                                                                                "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.1",
                                                                              divDir:
                                                                                "A",
                                                                              linDiv:
                                                                                "",
                                                                              divElem: 0,
                                                                              horDefType:
                                                                                "P",
                                                                              top: null,
                                                                              bottom:
                                                                                null,
                                                                              divider:
                                                                                "#DS_WACA_TEC",
                                                                              children:
                                                                                [],
                                                                              sides:
                                                                                {
                                                                                  "0": null,
                                                                                  "1": null,
                                                                                  "2": null,
                                                                                  "3": null,
                                                                                },
                                                                            },
                                                                          ],
                                                                        sides: {
                                                                          "0": null,
                                                                          "1": null,
                                                                          "2": null,
                                                                          "3": null,
                                                                        },
                                                                      },
                                                                      {
                                                                        name: "Article Designer Group",
                                                                        index:
                                                                          "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                        divDir:
                                                                          "H",
                                                                        linDiv:
                                                                          "#DS_LD_ZF_SZ_15",
                                                                        divElem: 0,
                                                                        horDefType:
                                                                          "W",
                                                                        top: null,
                                                                        bottom:
                                                                          null,
                                                                        divider:
                                                                          null,
                                                                        children:
                                                                          [
                                                                            {
                                                                              name: "Article Designer Group",
                                                                              index:
                                                                                "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0",
                                                                              divDir:
                                                                                "V",
                                                                              linDiv:
                                                                                "#DS_LD_ART_VDIV",
                                                                              divElem: 0,
                                                                              horDefType:
                                                                                "P",
                                                                              top: null,
                                                                              bottom:
                                                                                null,
                                                                              divider:
                                                                                null,
                                                                              children:
                                                                                [
                                                                                  {
                                                                                    name: "ART_ZONE_FR_15",
                                                                                    grtx: {
                                                                                      "AD zone info01":
                                                                                        "0",
                                                                                      "AD zone info02":
                                                                                        "MD",
                                                                                      "AD zone info03":
                                                                                        "$HAS_HC",
                                                                                      "AD zone info04":
                                                                                        "$HAS_DR",
                                                                                      "AD zone info05":
                                                                                        "$IS_DR_EXT",
                                                                                      "AD zone info06":
                                                                                        "$ZF_CNT_15",
                                                                                    },
                                                                                    index:
                                                                                      "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0",
                                                                                    divDir:
                                                                                      "A",
                                                                                    linDiv:
                                                                                      "1:1",
                                                                                    divElem: 0,
                                                                                    horDefType:
                                                                                      "P",
                                                                                    top: null,
                                                                                    bottom:
                                                                                      null,
                                                                                    divider:
                                                                                      "$DS_WACA_FR_ART_15",
                                                                                    children:
                                                                                      [
                                                                                        {
                                                                                          name: "Article Designer Group",
                                                                                          index:
                                                                                            "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0.0",
                                                                                          divDir:
                                                                                            "V",
                                                                                          linDiv:
                                                                                            "",
                                                                                          divElem: 0,
                                                                                          horDefType:
                                                                                            "P",
                                                                                          top: null,
                                                                                          bottom:
                                                                                            null,
                                                                                          divider:
                                                                                            null,
                                                                                          children:
                                                                                            [],
                                                                                          sides:
                                                                                            {
                                                                                              "0": null,
                                                                                              "1": null,
                                                                                              "2": null,
                                                                                              "3": null,
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                          name: "Article Designer Group",
                                                                                          index:
                                                                                            "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0.1",
                                                                                          divDir:
                                                                                            "V",
                                                                                          linDiv:
                                                                                            "",
                                                                                          divElem: 0,
                                                                                          horDefType:
                                                                                            "P",
                                                                                          top: null,
                                                                                          bottom:
                                                                                            null,
                                                                                          divider:
                                                                                            null,
                                                                                          children:
                                                                                            [],
                                                                                          sides:
                                                                                            {
                                                                                              "0": null,
                                                                                              "1": null,
                                                                                              "2": null,
                                                                                              "3": null,
                                                                                            },
                                                                                        },
                                                                                      ],
                                                                                    selectable: true,
                                                                                    sides:
                                                                                      {
                                                                                        "0": null,
                                                                                        "1": null,
                                                                                        "2": null,
                                                                                        "3": null,
                                                                                      },
                                                                                  },
                                                                                  {
                                                                                    name: "TEC",
                                                                                    grtx: {
                                                                                      "AD zone info01":
                                                                                        "$ZF_CNT_15",
                                                                                    },
                                                                                    index:
                                                                                      "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.1",
                                                                                    divDir:
                                                                                      "A",
                                                                                    linDiv:
                                                                                      "",
                                                                                    divElem: 0,
                                                                                    horDefType:
                                                                                      "P",
                                                                                    top: null,
                                                                                    bottom:
                                                                                      null,
                                                                                    divider:
                                                                                      "#DS_WACA_TEC",
                                                                                    children:
                                                                                      [],
                                                                                    sides:
                                                                                      {
                                                                                        "0": null,
                                                                                        "1": null,
                                                                                        "2": null,
                                                                                        "3": null,
                                                                                      },
                                                                                  },
                                                                                ],
                                                                              sides:
                                                                                {
                                                                                  "0": null,
                                                                                  "1": null,
                                                                                  "2": null,
                                                                                  "3": null,
                                                                                },
                                                                            },
                                                                            {
                                                                              name: "Article Designer Group",
                                                                              index:
                                                                                "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                              divDir:
                                                                                "H",
                                                                              linDiv:
                                                                                "#DS_LD_ZF_SZ_16",
                                                                              divElem: 0,
                                                                              horDefType:
                                                                                "W",
                                                                              top: null,
                                                                              bottom:
                                                                                null,
                                                                              divider:
                                                                                null,
                                                                              children:
                                                                                [
                                                                                  {
                                                                                    name: "ART_ZONE_FR_16",
                                                                                    index:
                                                                                      "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0",
                                                                                    divDir:
                                                                                      "V",
                                                                                    linDiv:
                                                                                      "",
                                                                                    divElem: 0,
                                                                                    horDefType:
                                                                                      "P",
                                                                                    top: null,
                                                                                    bottom:
                                                                                      null,
                                                                                    divider:
                                                                                      null,
                                                                                    children:
                                                                                      [],
                                                                                    selectable: true,
                                                                                    sides:
                                                                                      {
                                                                                        "0": null,
                                                                                        "1": null,
                                                                                        "2": null,
                                                                                        "3": null,
                                                                                      },
                                                                                  },
                                                                                  {
                                                                                    name: "Article Designer Group",
                                                                                    index:
                                                                                      "0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                                    divDir:
                                                                                      "H",
                                                                                    linDiv:
                                                                                      "#DS_LD_ZF_SZ_17",
                                                                                    divElem: 0,
                                                                                    horDefType:
                                                                                      "W",
                                                                                    top: null,
                                                                                    bottom:
                                                                                      null,
                                                                                    divider:
                                                                                      null,
                                                                                    children:
                                                                                      [],
                                                                                    sides:
                                                                                      {
                                                                                        "0": null,
                                                                                        "1": null,
                                                                                        "2": null,
                                                                                        "3": null,
                                                                                      },
                                                                                  },
                                                                                ],
                                                                              sides:
                                                                                {
                                                                                  "0": null,
                                                                                  "1": null,
                                                                                  "2": null,
                                                                                  "3": null,
                                                                                },
                                                                            },
                                                                          ],
                                                                        sides: {
                                                                          "0": null,
                                                                          "1": null,
                                                                          "2": null,
                                                                          "3": null,
                                                                        },
                                                                      },
                                                                    ],
                                                                    sides: {
                                                                      "0": null,
                                                                      "1": null,
                                                                      "2": null,
                                                                      "3": null,
                                                                    },
                                                                  },
                                                                ],
                                                                sides: {
                                                                  "0": null,
                                                                  "1": null,
                                                                  "2": null,
                                                                  "3": null,
                                                                },
                                                              },
                                                            ],
                                                            sides: {
                                                              "0": null,
                                                              "1": null,
                                                              "2": null,
                                                              "3": null,
                                                            },
                                                          },
                                                        ],
                                                        sides: {
                                                          "0": null,
                                                          "1": null,
                                                          "2": null,
                                                          "3": null,
                                                        },
                                                      },
                                                    ],
                                                    sides: {
                                                      "0": null,
                                                      "1": null,
                                                      "2": null,
                                                      "3": null,
                                                    },
                                                  },
                                                ],
                                                sides: {
                                                  "0": null,
                                                  "1": null,
                                                  "2": null,
                                                  "3": null,
                                                },
                                              },
                                            ],
                                            sides: {
                                              "0": null,
                                              "1": null,
                                              "2": null,
                                              "3": null,
                                            },
                                          },
                                        ],
                                        sides: {
                                          "0": null,
                                          "1": null,
                                          "2": null,
                                          "3": null,
                                        },
                                      },
                                    ],
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                ],
                                sides: {
                                  "0": null,
                                  "1": null,
                                  "2": null,
                                  "3": null,
                                },
                              },
                            ],
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                        ],
                        sides: {
                          "0": null,
                          "1": null,
                          "2": null,
                          "3": null,
                        },
                      },
                    ],
                    sides: {
                      "0": null,
                      "1": null,
                      "2": null,
                      "3": null,
                    },
                  },
                ],
                sides: {
                  "0": null,
                  "1": null,
                  "2": null,
                  "3": null,
                },
              },
              {
                name: "Filler width",
                grtx: {
                  "AD zone info01": "$IS_BI_R",
                },
                index: "0.1.1.2",
                divDir: "V",
                linDiv: "",
                divElem: 0,
                horDefType: "P",
                top: null,
                bottom: null,
                divider: null,
                children: [],
                sides: {
                  "0": {
                    inSet: -21.7,
                    inSetFor:
                      "-$Front_Side_GAP - $MAT_FR_1_THK - 2*$SRF_FR_1_THK",
                    partType: "S",
                    cpName: "#DS_ZFR_FR",
                  },
                  "1": null,
                  "2": null,
                  "3": null,
                },
              },
            ],
            sides: {
              "0": null,
              "1": null,
              "2": null,
              "3": null,
            },
          },
          {
            name: "Crown",
            index: "0.1.2",
            divDir: "H",
            linDiv: "#DS_LD_ZF_CM",
            divElem: 0,
            horDefType: "W",
            top: null,
            bottom: null,
            divider: null,
            children: [
              {
                name: "Article Designer Group",
                grtx: {
                  "AD zone info01": "$IS_ZF_BI_T",
                },
                index: "0.1.2.0",
                divDir: "V",
                linDiv: "",
                divElem: 0,
                horDefType: "P",
                top: null,
                bottom: null,
                divider: null,
                children: [],
                sides: {
                  "0": {
                    inSet: 0,
                    inSetFor: "",
                    partType: "S",
                    cpName: "#DS_ZF_CM",
                  },
                  "1": null,
                  "2": null,
                  "3": null,
                },
              },
              {
                name: "Article Designer Group",
                grtx: {
                  "AD zone info01": "$IS_ZF_BI_T",
                },
                index: "0.1.2.1",
                divDir: "V",
                linDiv: "",
                divElem: 0,
                horDefType: "P",
                top: null,
                bottom: null,
                divider: null,
                children: [],
                sides: {
                  "0": {
                    inSet: 0,
                    inSetFor: "",
                    partType: "S",
                    cpName: "#DS_ZF_CM",
                  },
                  "1": null,
                  "2": null,
                  "3": null,
                },
              },
            ],
            sides: {
              "0": null,
              "1": null,
              "2": null,
              "3": null,
            },
          },
          {
            name: "Article Designer Group",
            index: "0.1.3",
            divDir: "V",
            linDiv: "",
            divElem: 0,
            horDefType: "P",
            top: "CP_1_TSI_1000_C1",
            bottom: null,
            divider: null,
            children: [],
            sides: {
              "0": null,
              "1": null,
              "2": null,
              "3": null,
            },
          },
          {
            name: "Article Designer Group",
            index: "0.1.4",
            divDir: "V",
            linDiv: "",
            divElem: 0,
            horDefType: "P",
            top: "CP_1_TSI_1000_C1",
            bottom: null,
            divider: null,
            children: [],
            sides: {
              "0": null,
              "1": null,
              "2": null,
              "3": null,
            },
          },
          {
            name: "Article Designer Group",
            index: "0.1.5",
            divDir: "V",
            linDiv: "",
            divElem: 0,
            horDefType: "P",
            top: null,
            bottom: null,
            divider: null,
            children: [],
            sides: {
              "0": null,
              "1": null,
              "2": null,
              "3": null,
            },
          },
          {
            name: "Article Designer Group",
            index: "0.1.6",
            divDir: "V",
            linDiv: "",
            divElem: 0,
            horDefType: "P",
            top: null,
            bottom: null,
            divider: null,
            children: [],
            sides: {
              "0": null,
              "1": null,
              "2": null,
              "3": null,
            },
          },
        ],
        sides: {
          "0": null,
          "1": null,
          "2": null,
          "3": null,
        },
      },
      {
        name: "Filler thk",
        grtx: {
          "AD zone info01": "$IS_BI_R",
        },
        index: "0.2",
        divDir: "V",
        linDiv: "",
        divElem: 0,
        horDefType: "P",
        top: null,
        bottom: null,
        divider: null,
        children: [],
        sides: {
          "0": null,
          "1": {
            inSet: 0,
            inSetFor: "",
            partType: "S",
            cpName: "#DS_ZFR_SI",
          },
          "2": null,
          "3": null,
        },
      },
    ],
    clickable: "FRONT",
    modifiable: true,
    sides: {
      "0": null,
      "1": null,
      "2": null,
      "3": null,
    },
  },
};
