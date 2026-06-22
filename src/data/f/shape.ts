export const shape = {
  name: "OAKSOME_SHAPE_FR",
  width: "$ZF_W mm mm",
  depth: "$ZF_D mm mm",
  height: "$ZONE_H mm mm",
  cps: {
    CP_1_FI_1000: {
      mat: "$MAT_FI_1",
      surf: "$SRF_FI_1_TOP",
    },
    CP_1_TSI_1000_C1: {
      mat: "$MAT_TS_1",
      surf: "$SRF_TS_1_EXT",
    },
    GEWC_LY: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    WACA_LY_D: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    WACA_LY_D_DW: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    CP_1_BA_1000: {
      mat: "$MAT_BA_1",
      surf: "$SRF_BA_1_TOP",
    },
    CP_1_FI_1111: {
      mat: "$MAT_FI_1",
      surf: "$SRF_FI_1_TOP",
    },
    WACA_LY_D1: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    WACA_LY_D1_DW: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    CP_1_CM_0000: {
      mat: "$MAT_CM_1",
      surf: "$SRF_CM_1_TOP",
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
    ZFA_W:
      "($ZF_W - ($FI_1_THK *(1-$IS_BI_R)) - ($FI_1_THK *(1-$IS_BI_L)) - ($IS_BI_R*$ZFR_W)  -($IS_BI_L*$ZFL_W))",
    Front_Side_GAP: "2.5",
    ZF_CNT: "10",
    ZF_CNT_ACC_01: "$ZF_CNT_01",
    ZF_CNT_01: "1",
    IS_ZF_BI_T: "1",
    DS_WACA_FR_ART_01: "#DS_WACA_U_ART_01",
    MAT_FI_1: "$MAT_FR_1",
    DS_WACA_FR_ART_TEC: "#DS_WACA_TEC",
    MAT_FR_1: "UN_RW_HGS_MDFFB_16",
    SRF_FI_1_TOP: "$SRF_FR_1_TOP",
    ZF_CNT_ACC_02: "($ZF_CNT_ACC_01 + $ZF_CNT_02)",
    SRF_FR_1_TOP: "EG_HPL_HGP_W980_ST7_0_8",
    ZF_CNT_02: "1",
    MAT_TS_1: "$MAT_1",
    DS_WACA_FR_ART_02: "#DS_WACA_U_ART_01",
    MAT_1: "EG_ED_W980_ST2_18mm",
    SRF_TS_1_EXT: "$SURF_TS_1_EXT",
    HAS_HC: "0",
    SURF_TS_1_EXT: "NO_SURF",
    ZF_CNT_ACC_03: "($ZF_CNT_ACC_02 + $ZF_CNT_03)",
    HAS_DR: "0",
    ZF_CNT_03: "2",
    MAT_BA_1: "$MAT_FR_1",
    IS_DR_EXT: "0",
    DS_WACA_FR_ART_03: "#DS_WACA_U_ART_01",
    SRF_BA_1_TOP: "$SRF_FR_1_TOP",
    ZF_CNT_ACC_04: "($ZF_CNT_ACC_03 + $ZF_CNT_04)",
    ZF_CNT_04: "1",
    MAT_CM_1: "$MAT_FR_1",
    DS_WACA_FR_ART_04: "#DS_WACA_U_ART_01",
    SRF_CM_1_TOP: "$SRF_FR_1_TOP",
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
    DS_LD_ART_VDIV_FL: [],
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
    DS_WACA_TEC: [
      {
        action: "GEWC_LY",
        nodenum: 1,
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
    name: "CAMERA_0",
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
        name: "filler thk left",
        index: "0.0",
        divDir: "V",
        linDiv: "#DS_LD_ART_VDIV_FL",
        divElem: 0,
        horDefType: "P",
        top: null,
        bottom: null,
        divider: null,
        children: [
          {
            name: "Filler thk",
            grtx: {
              "AD zone info01": "$IS_BI_L",
            },
            index: "0.0.0",
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
            name: "Filler thk",
            grtx: {
              "AD zone info01": "$IS_BI_L",
            },
            index: "0.0.1",
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
                name: "Filler left",
                index: "0.1.1.0",
                divDir: "V",
                linDiv: "#DS_LD_ART_VDIV",
                divElem: 0,
                horDefType: "P",
                top: null,
                bottom: null,
                divider: null,
                children: [
                  {
                    name: "Filler width",
                    grtx: {
                      "AD zone info01": "$IS_BI_L",
                    },
                    index: "0.1.1.0.0",
                    divDir: "V",
                    linDiv: "#DS_LD_ART_VDIV",
                    divElem: 0,
                    horDefType: "P",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "Article Designer Group",
                        index: "0.1.1.0.0.0",
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
                        index: "0.1.1.0.0.1",
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
                    name: "Filler width",
                    grtx: {
                      "AD zone info01": "$IS_BI_L",
                    },
                    index: "0.1.1.0.1",
                    divDir: "V",
                    linDiv: "#DS_LD_ART_VDIV",
                    divElem: 0,
                    horDefType: "P",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "Article Designer Group",
                        index: "0.1.1.0.1.0",
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
                        index: "0.1.1.0.1.1",
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
                    name: "ART_ZONE_FR_01",
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
                        name: "Article Designer Group",
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
                        sides: {
                          "0": null,
                          "1": null,
                          "2": null,
                          "3": null,
                        },
                      },
                      {
                        name: "Article Designer Group",
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
                        divider: "$DS_WACA_FR_ART_TEC",
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
                        name: "ART_ZONE_FR_02",
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
                            name: "Article Designer Group",
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
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Article Designer Group",
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
                            divider: "$DS_WACA_FR_ART_TEC",
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
                            name: "ART_ZONE_FR_03",
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
                                name: "Article Designer Group",
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
                                sides: {
                                  "0": null,
                                  "1": null,
                                  "2": null,
                                  "3": null,
                                },
                              },
                              {
                                name: "Article Designer Group",
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
                                divider: "$DS_WACA_FR_ART_TEC",
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
                                name: "ART_ZONE_FR_04",
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
                                    name: "Article Designer Group",
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
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                  {
                                    name: "Article Designer Group",
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
                                    divider: "$DS_WACA_FR_ART_TEC",
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
                                    name: "ART_ZONE_FR_05",
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
                                        name: "Article Designer Group",
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
                                        sides: {
                                          "0": null,
                                          "1": null,
                                          "2": null,
                                          "3": null,
                                        },
                                      },
                                      {
                                        name: "Article Designer Group",
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
                                        divider: "$DS_WACA_FR_ART_TEC",
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
                                        name: "ART_ZONE_FR_06",
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
                                            name: "Article Designer Group",
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
                                            sides: {
                                              "0": null,
                                              "1": null,
                                              "2": null,
                                              "3": null,
                                            },
                                          },
                                          {
                                            name: "Article Designer Group",
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
                                            divider: "$DS_WACA_FR_ART_TEC",
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
                                            name: "ART_ZONE_FR_07",
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
                                                name: "Article Designer Group",
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
                                                sides: {
                                                  "0": null,
                                                  "1": null,
                                                  "2": null,
                                                  "3": null,
                                                },
                                              },
                                              {
                                                name: "Article Designer Group",
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
                                                divider: "$DS_WACA_FR_ART_TEC",
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
                                                name: "ART_ZONE_FR_08",
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
                                                    name: "Article Designer Group",
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
                                                    sides: {
                                                      "0": null,
                                                      "1": null,
                                                      "2": null,
                                                      "3": null,
                                                    },
                                                  },
                                                  {
                                                    name: "Article Designer Group",
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
                                                    divider:
                                                      "$DS_WACA_FR_ART_TEC",
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
                                                    name: "ART_ZONE_FR_09",
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
                                                        name: "Article Designer Group",
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
                                                        sides: {
                                                          "0": null,
                                                          "1": null,
                                                          "2": null,
                                                          "3": null,
                                                        },
                                                      },
                                                      {
                                                        name: "Article Designer Group",
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
                                                        divider:
                                                          "$DS_WACA_FR_ART_TEC",
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
                                                        name: "ART_ZONE_FR_10",
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
                                                            name: "Article Designer Group",
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
                                                            sides: {
                                                              "0": null,
                                                              "1": null,
                                                              "2": null,
                                                              "3": null,
                                                            },
                                                          },
                                                          {
                                                            name: "Article Designer Group",
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
                                                              "$DS_WACA_FR_ART_TEC",
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
                                                            name: "ART_ZONE_FR_11",
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
                                                                name: "Article Designer Group",
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
                                                                sides: {
                                                                  "0": null,
                                                                  "1": null,
                                                                  "2": null,
                                                                  "3": null,
                                                                },
                                                              },
                                                              {
                                                                name: "Article Designer Group",
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
                                                                  "$DS_WACA_FR_ART_TEC",
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
                                                                name: "ART_ZONE_FR_12",
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
                                                                    name: "Article Designer Group",
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
                                                                    sides: {
                                                                      "0": null,
                                                                      "1": null,
                                                                      "2": null,
                                                                      "3": null,
                                                                    },
                                                                  },
                                                                  {
                                                                    name: "Article Designer Group",
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
                                                                      "$DS_WACA_FR_ART_TEC",
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
                                                                    name: "ART_ZONE_FR_13",
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
                                                                        name: "Article Designer Group",
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
                                                                        sides: {
                                                                          "0": null,
                                                                          "1": null,
                                                                          "2": null,
                                                                          "3": null,
                                                                        },
                                                                      },
                                                                      {
                                                                        name: "Article Designer Group",
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
                                                                          "$DS_WACA_FR_ART_TEC",
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
                                                                        name: "ART_ZONE_FR_14",
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
                                                                              name: "Article Designer Group",
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
                                                                                "$DS_WACA_FR_ART_TEC",
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
                                                                              name: "ART_ZONE_FR_15",
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
                                                                                    name: "Article Designer Group",
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
                                                                                      "$DS_WACA_FR_ART_TEC",
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
                name: "Filller right",
                index: "0.1.1.2",
                divDir: "V",
                linDiv: "#DS_LD_ART_VDIV",
                divElem: 0,
                horDefType: "P",
                top: null,
                bottom: null,
                divider: null,
                children: [
                  {
                    name: "Filler width",
                    grtx: {
                      "AD zone info01": "$IS_BI_R",
                    },
                    index: "0.1.1.2.0",
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
                  {
                    name: "Filler width",
                    grtx: {
                      "AD zone info01": "$IS_BI_R",
                    },
                    index: "0.1.1.2.1",
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
        name: "filler thk right",
        index: "0.2",
        divDir: "V",
        linDiv: "#DS_LD_ART_VDIV_FL",
        divElem: 0,
        horDefType: "P",
        top: null,
        bottom: null,
        divider: null,
        children: [
          {
            name: "Filler thk",
            grtx: {
              "AD zone info01": "$IS_BI_R",
            },
            index: "0.2.0",
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
          {
            name: "Filler thk",
            grtx: {
              "AD zone info01": "$IS_BI_R",
            },
            index: "0.2.1",
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
        sides: {
          "0": null,
          "1": null,
          "2": null,
          "3": null,
        },
      },
    ],
    modifiable: true,
    clickable: "FRONT",
    camera: "FRONT",
    sides: {
      "0": null,
      "1": null,
      "2": null,
      "3": null,
    },
  },
};
