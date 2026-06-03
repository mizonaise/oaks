export const shape = {
  name: "OAKSOME_SHAPE_L",
  width: "($ZR_W + $ZL_D ) mm mm",
  depth: "$ZONE_D mm mm",
  height: "($ZONE_H) mm mm",
  cps: {
    CP_1_FI_S010: {
      mat: "$MAT_FI_1",
      surf: "$SRF_FI_1_TOP",
    },
    WACA_LY_D: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    CP_1_BA_1000: {
      mat: "$MAT_BA_1",
      surf: "$SRF_BA_1_TOP",
    },
    WACA_LY_D_DW: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    CP_1_CM_0000: {
      mat: "$MAT_CM_1",
      surf: "$SRF_CM_1_TOP",
    },
    CP_1_FI_1000: {
      mat: "$MAT_FI_1",
      surf: "$SRF_FI_1_TOP",
    },
    CP_1_TSI_1000_C1: {
      mat: "$MAT_TS_1",
      surf: "$SRF_TS_1_EXT",
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
    CP_1_FI_10S0: {
      mat: "$MAT_FI_1",
      surf: "$SRF_FI_1_TOP",
    },
    WACA_LY_DR_D_DW: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
  },
  variables: {
    ZR_W: "7000",
    ZL_D: "500",
    ZONE_D: "8000",
    ZONE_H: "3000",
    ZR_D: "500",
    IS_RL_N: "0",
    IS_BI_R: "1",
    FI_1_THK: "($MAT_FI_1_THK + 2*($SRF_FI_1_THK))",
    MAT_FI_1_THK: "$MAT_FR_1_THK",
    MAT_FR_1_THK: "16",
    ZL_W: "6000",
    Front_Side_GAP: "2.5",
    SRF_FI_1_THK: "$SRF_FR_1_THK",
    IS_LL_P: "1",
    BASE_HEIGHT: "100",
    SRF_FR_1_THK: "0.8",
    IS_BI_L: "1",
    CROWN_HEIGHT: "100",
    ZR_STEP: "($ZRA_W / $ZR_CNT)",
    ZFR_W: "50",
    ZRA_W: "($ZR_W - ($FI_1_THK *(1-$IS_BI_R)) - ($IS_BI_R*$ZFR_W) - 50)",
    ZR_CNT: "9",
    ZL_STEP: "($ZLA_W / $ZL_CNT)",
    ZFL_W: "50",
    ZR_CNT_01: "2",
    ZLA_W: "($ZL_W - ($FI_1_THK *(1-$IS_BI_L)) - ($IS_BI_L*$ZFL_W) - 50)",
    DS_WACA_ZR_ART_01: "#DS_WACA_U_ART_01",
    ZL_CNT: "10",
    ZR_CNT_ACC_02: "($ZR_CNT_ACC_01 + $ZR_CNT_02)",
    ZL_CNT_01: "1",
    ZL_CNT_ACC_02: "($ZL_CNT_ACC_01 + $ZL_CNT_02)",
    ZR_CNT_ACC_01: "$ZR_CNT_01",
    MAT_FI_1: "$MAT_FR_1",
    ZL_CNT_ACC_01: "$ZL_CNT_01",
    ZR_CNT_02: "1",
    MAT_FR_1: "UN_RW_HGS_MDFFB_16",
    DS_WACA_ZR_ART_02: "#DS_WACA_U_ART_01",
    ZL_CNT_02: "2",
    SRF_FI_1_TOP: "$SRF_FR_1_TOP",
    ZM_D: "500",
    SRF_FR_1_TOP: "EG_HPL_HGP_W980_ST7_0_8",
    DS_WACA_ZL_ART_01: "#DS_WACA_U_ART_01",
    MAT_BA_1: "$MAT_FR_1",
    ZR_CNT_ACC_03: "($ZR_CNT_ACC_02 + $ZR_CNT_03)",
    MAT_CM_1: "$MAT_FR_1",
    MAT_TS_1: "$MAT_1",
    SRF_BA_1_TOP: "$SRF_FR_1_TOP",
    ZR_CNT_03: "2",
    SRF_CM_1_TOP: "$SRF_FR_1_TOP",
    MAT_1: "EG_ED_W980_ST2_18mm",
    DS_WACA_ZR_ART_03: "#DS_WACA_U_ART_01",
    DS_WACA_ZL_ART_02: "#DS_WACA_U_ART_01",
    SRF_TS_1_EXT: "$SURF_TS_1_EXT",
    SURF_TS_1_EXT: "NO_SURF",
    ZR_CNT_ACC_04: "($ZR_CNT_ACC_03 + $ZR_CNT_04)",
    ZL_CNT_ACC_03: "($ZL_CNT_ACC_02 + $ZL_CNT_03)",
    ZR_CNT_04: "1",
    ZL_CNT_03: "1",
    DS_WACA_ZR_ART_04: "#DS_WACA_U_ART_01",
    DS_WACA_ZL_ART_03: "#DS_WACA_U_ART_01",
    ZL_CNT_ACC_04: "($ZL_CNT_ACC_03 + $ZL_CNT_04)",
    ZR_CNT_ACC_05: "($ZR_CNT_ACC_04 + $ZR_CNT_05)",
    ZL_CNT_04: "2",
    ZR_CNT_05: "2",
    DS_WACA_ZL_ART_04: "#DS_WACA_U_ART_01",
    DS_WACA_ZR_ART_05: "#DS_WACA_U_ART_01",
    ZL_CNT_ACC_05: "($ZL_CNT_ACC_04 + $ZL_CNT_05)",
    ZR_CNT_ACC_06: "($ZR_CNT_ACC_05 + $ZR_CNT_06)",
    ZL_CNT_05: "1",
    ZR_CNT_06: "1",
    DS_WACA_ZL_ART_05: "#DS_WACA_U_ART_01",
    DS_WACA_ZR_ART_06: "#DS_WACA_U_ART_01",
    ZL_CNT_ACC_06: "($ZL_CNT_ACC_05 + $ZL_CNT_06)",
    ZR_CNT_ACC_07: "($ZR_CNT_ACC_06 + $ZR_CNT_07)",
    ZL_CNT_06: "2",
    ZR_CNT_07: "1",
    DS_WACA_ZL_ART_06: "#DS_WACA_U_ART_01",
    DS_WACA_ZR_ART_07: "#DS_WACA_U_ART_01",
    ZL_CNT_ACC_07: "($ZL_CNT_ACC_06 + $ZL_CNT_07)",
    ZR_CNT_ACC_08: "($ZR_CNT_ACC_07 + $ZR_CNT_08)",
    ZL_CNT_07: "1",
    ZR_CNT_08: "1",
    DS_WACA_ZL_ART_07: "#DS_WACA_U_ART_01",
    DS_WACA_ZR_ART_08: "#DS_WACA_U_ART_01",
    ZL_CNT_ACC_08: "($ZL_CNT_ACC_07 + $ZL_CNT_08)",
    ZR_CNT_ACC_09: "($ZR_CNT_ACC_08 + $ZR_CNT_09)",
    ZL_CNT_08: "1",
    ZR_CNT_09: "1",
    DS_WACA_ZL_ART_08: "#DS_WACA_U_ART_01",
    DS_WACA_ZR_ART_09: "#DS_WACA_U_ART_01",
    ZL_CNT_ACC_09: "($ZL_CNT_ACC_08 + $ZL_CNT_09)",
    ZR_CNT_ACC_10: "($ZR_CNT_ACC_09 + $ZR_CNT_10)",
    ZL_CNT_09: "1",
    ZR_CNT_10: "1",
    DS_WACA_ZL_ART_09: "#DS_WACA_U_ART_01",
    DS_WACA_ZR_ART_10: "#DS_WACA_U_ART_01",
    ZL_CNT_ACC_10: "($ZL_CNT_ACC_09 + $ZL_CNT_10)",
    ZR_CNT_ACC_11: "($ZR_CNT_ACC_10 + $ZR_CNT_11)",
    ZL_CNT_10: "1",
    ZR_CNT_11: "1",
    DS_WACA_ZL_ART_10: "#DS_WACA_U_ART_01",
    DS_WACA_ZR_ART_11: "#DS_WACA_U_ART_01",
    ZL_CNT_ACC_11: "($ZL_CNT_ACC_10 + $ZL_CNT_11)",
    ZR_CNT_ACC_12: "($ZR_CNT_ACC_11 + $ZR_CNT_12)",
    ZL_CNT_11: "1",
    ZR_CNT_12: "1",
    DS_WACA_ZL_ART_11: "#DS_WACA_U_ART_01",
    DS_WACA_ZR_ART_12: "#DS_WACA_U_ART_01",
    ZL_CNT_ACC_12: "($ZL_CNT_ACC_11 + $ZL_CNT_12)",
    ZL_CNT_12: "1",
    ZR_CNT_ACC_13: "($ZR_CNT_ACC_12 + $ZR_CNT_13)",
    DS_WACA_ZL_ART_12: "#DS_WACA_U_ART_01",
    ZR_CNT_13: "1",
    DS_WACA_ZR_ART_13: "#DS_WACA_U_ART_01",
    ZL_CNT_ACC_13: "($ZL_CNT_ACC_12 + $ZL_CNT_13)",
    ZL_CNT_13: "1",
    ZR_CNT_ACC_14: "($ZR_CNT_ACC_13 + $ZR_CNT_14)",
    DS_WACA_ZL_ART_13: "#DS_WACA_U_ART_01",
    ZR_CNT_14: "1",
    DS_WACA_ZR_ART_14: "#DS_WACA_U_ART_01",
    ZL_CNT_ACC_14: "($ZL_CNT_ACC_13 + $ZL_CNT_14)",
    ZL_CNT_14: "1",
  },
  descriptors: {
    DS_LD_SL_ZR_SZ_01: [
      {
        action: "($ZL_D + $ZR_STEP +50) mm:1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "1-$IS_RL_N",
              },
            ],
          },
        ],
      },
      {
        action: "($ZR_CNT_01 * $ZR_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$IS_RL_N",
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
    DS_LD_SL_ZR_SZ_02: [
      {
        action: "(1 * $ZR_STEP ) mm:1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZR_CNT_ACC_02*$ZR_STEP -$ZRA_W",
              },
            ],
          },
        ],
      },
      {
        action: "($ZR_CNT_02 * $ZR_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZR_CNT_ACC_02*$ZR_STEP -$ZRA_W",
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
    DS_LD_SL_ZL_SZ_01: [
      {
        action: "1:($ZL_CNT_01 * $ZL_STEP ) mm",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "!=",
                rightValue: "1-$IS_LL_P",
              },
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZL_CNT_ACC_02*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:(1 * $ZL_STEP ) mm",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "!=",
                rightValue: "1-$IS_LL_P",
              },
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZL_CNT_ACC_02*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZM_D +  $ZL_STEP +50 ) mm",
        nodenum: 3,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "1-$IS_LL_P",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZL_CNT_01 * $ZL_STEP +50) mm",
        nodenum: 4,
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
    DS_LD_SL_ZR_SZ_03: [
      {
        action: "(1 * $ZR_STEP ) mm:1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZR_CNT_ACC_03*$ZR_STEP -$ZRA_W",
              },
            ],
          },
        ],
      },
      {
        action: "($ZR_CNT_03 * $ZR_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZR_CNT_ACC_03*$ZR_STEP -$ZRA_W",
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
    DS_LD_SL_ZL_SZ_02: [
      {
        action: "1:(1 * $ZL_STEP ) mm",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZL_CNT_ACC_02*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZL_CNT_02 * $ZL_STEP ) mm",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZL_CNT_ACC_02*$ZL_STEP -$ZLA_W",
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
    DS_LD_SL_ZR_SZ_04: [
      {
        action: "(1 * $ZR_STEP ) mm:1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZR_CNT_ACC_04*$ZR_STEP -$ZRA_W",
              },
            ],
          },
        ],
      },
      {
        action: "($ZR_CNT_04 * $ZR_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZR_CNT_ACC_04*$ZR_STEP -$ZRA_W",
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
    DS_LD_SL_ZL_SZ_03: [
      {
        action: "1:(1 * $ZL_STEP ) mm",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZL_CNT_ACC_03*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZL_CNT_03 * $ZL_STEP ) mm",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZL_CNT_ACC_03*$ZL_STEP -$ZLA_W",
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
    DS_LD_SL_ZL_SZ_04: [
      {
        action: "1:(1 * $ZL_STEP ) mm",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZL_CNT_ACC_04*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZL_CNT_04 * $ZL_STEP ) mm",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZL_CNT_ACC_04*$ZL_STEP -$ZLA_W",
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
    DS_LD_SL_ZR_SZ_05: [
      {
        action: "(1 * $ZR_STEP ) mm:1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZR_CNT_ACC_05*$ZR_STEP -$ZRA_W",
              },
            ],
          },
        ],
      },
      {
        action: "($ZR_CNT_05 * $ZR_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZR_CNT_ACC_05*$ZR_STEP -$ZRA_W",
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
    DS_LD_SL_ZL_SZ_05: [
      {
        action: "1:(1 * $ZL_STEP ) mm",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZL_CNT_ACC_05*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZL_CNT_05 * $ZL_STEP ) mm",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZL_CNT_ACC_05*$ZL_STEP -$ZLA_W",
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
    DS_LD_SL_ZR_SZ_06: [
      {
        action: "(1 * $ZR_STEP ) mm:1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZR_CNT_ACC_06*$ZR_STEP -$ZRA_W",
              },
            ],
          },
        ],
      },
      {
        action: "($ZR_CNT_06 * $ZR_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZR_CNT_ACC_06*$ZR_STEP -$ZRA_W",
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
    DS_LD_SL_ZL_SZ_06: [
      {
        action: "1:(1 * $ZL_STEP ) mm",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZL_CNT_ACC_06*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZL_CNT_06 * $ZL_STEP ) mm",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZL_CNT_ACC_06*$ZL_STEP -$ZLA_W",
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
    DS_LD_SL_ZR_SZ_07: [
      {
        action: "(1 * $ZR_STEP ) mm:1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZR_CNT_ACC_07*$ZR_STEP -$ZRA_W",
              },
            ],
          },
        ],
      },
      {
        action: "($ZR_CNT_07 * $ZR_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZR_CNT_ACC_07*$ZR_STEP -$ZRA_W",
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
    DS_LD_SL_ZL_SZ_07: [
      {
        action: "1:(1 * $ZL_STEP ) mm",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZL_CNT_ACC_07*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZL_CNT_07 * $ZL_STEP ) mm",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZL_CNT_ACC_07*$ZL_STEP -$ZLA_W",
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
    DS_LD_SL_ZR_SZ_08: [
      {
        action: "(1 * $ZR_STEP ) mm:1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZR_CNT_ACC_08*$ZR_STEP -$ZRA_W",
              },
            ],
          },
        ],
      },
      {
        action: "($ZR_CNT_08 * $ZR_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZR_CNT_ACC_08*$ZR_STEP -$ZRA_W",
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
    DS_LD_SL_ZL_SZ_08: [
      {
        action: "1:(1 * $ZL_STEP ) mm",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZL_CNT_ACC_08*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZL_CNT_08 * $ZL_STEP ) mm",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZL_CNT_ACC_08*$ZL_STEP -$ZLA_W",
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
    DS_LD_SL_ZR_SZ_09: [
      {
        action: "(1 * $ZR_STEP ) mm:1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZR_CNT_ACC_09*$ZR_STEP -$ZRA_W",
              },
            ],
          },
        ],
      },
      {
        action: "($ZR_CNT_09 * $ZR_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZR_CNT_ACC_09*$ZR_STEP -$ZRA_W",
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
    DS_LD_SL_ZL_SZ_09: [
      {
        action: "1:(1 * $ZL_STEP ) mm",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZL_CNT_ACC_09*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZL_CNT_09 * $ZL_STEP ) mm",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZL_CNT_ACC_09*$ZL_STEP -$ZLA_W",
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
    DS_LD_SL_ZR_SZ_10: [
      {
        action: "(1 * $ZR_STEP ) mm:1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZR_CNT_ACC_10*$ZR_STEP -$ZRA_W",
              },
            ],
          },
        ],
      },
      {
        action: "($ZR_CNT_10 * $ZR_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZR_CNT_ACC_10*$ZR_STEP -$ZRA_W",
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
    DS_LD_SL_ZL_SZ_10: [
      {
        action: "1:(1 * $ZL_STEP ) mm",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZL_CNT_ACC_10*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZL_CNT_10 * $ZL_STEP ) mm",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZL_CNT_ACC_10*$ZL_STEP -$ZLA_W",
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
    DS_LD_SL_ZR_SZ_11: [
      {
        action: "(1 * $ZR_STEP ) mm:1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZR_CNT_ACC_11*$ZR_STEP -$ZRA_W",
              },
            ],
          },
        ],
      },
      {
        action: "($ZR_CNT_11 * $ZR_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZR_CNT_ACC_11*$ZR_STEP -$ZRA_W",
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
    DS_LD_SL_ZL_SZ_11: [
      {
        action: "1:(1 * $ZL_STEP ) mm",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZL_CNT_ACC_11*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZL_CNT_11 * $ZL_STEP ) mm",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZL_CNT_ACC_11*$ZL_STEP -$ZLA_W",
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
    DS_LD_SL_ZR_SZ_12: [
      {
        action: "(1 * $ZR_STEP ) mm:1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZR_CNT_ACC_12*$ZR_STEP -$ZRA_W",
              },
            ],
          },
        ],
      },
      {
        action: "($ZR_CNT_12 * $ZR_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZR_CNT_ACC_12*$ZR_STEP -$ZRA_W",
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
    DS_LD_SL_ZL_SZ_12: [
      {
        action: "1:(1 * $ZL_STEP ) mm",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZL_CNT_ACC_12*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZL_CNT_12 * $ZL_STEP ) mm",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZL_CNT_ACC_12*$ZL_STEP -$ZLA_W",
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
    DS_LD_SL_ZR_SZ_13: [
      {
        action: "(1 * $ZR_STEP ) mm:1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZR_CNT_ACC_13*$ZR_STEP -$ZRA_W",
              },
            ],
          },
        ],
      },
      {
        action: "($ZR_CNT_13 * $ZR_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZR_CNT_ACC_13*$ZR_STEP -$ZRA_W",
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
    DS_LD_SL_ZL_SZ_13: [
      {
        action: "1:(1 * $ZL_STEP ) mm",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZL_CNT_ACC_13*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZL_CNT_13 * $ZL_STEP ) mm",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZL_CNT_ACC_13*$ZL_STEP -$ZLA_W",
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
    DS_LD_SL_ZR_SZ_14: [
      {
        action: "(1 * $ZR_STEP ) mm:1",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZR_CNT_ACC_14*$ZR_STEP -$ZRA_W",
              },
            ],
          },
        ],
      },
      {
        action: "($ZR_CNT_14 * $ZR_STEP ) mm:1",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZR_CNT_ACC_14*$ZR_STEP -$ZRA_W",
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
    DS_LD_SL_ZL_SZ_14: [
      {
        action: "1:(1 * $ZL_STEP ) mm",
        nodenum: 1,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: "<=",
                rightValue: "$ZL_CNT_ACC_14*$ZL_STEP -$ZLA_W",
              },
            ],
          },
        ],
      },
      {
        action: "1:($ZL_CNT_14 * $ZL_STEP ) mm",
        nodenum: 2,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "0",
                comparison: ">",
                rightValue: "$ZL_CNT_ACC_14*$ZL_STEP -$ZLA_W",
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
    name: "Article Designer Group",
    index: "0",
    side: "FRONT",
    variables: {},
    divDir: "I",
    linDiv: "3*{1}",
    divElem: 0,
    horDefType: "P",
    top: null,
    bottom: null,
    divider: null,
    children: [
      {
        name: "Filler middle",
        index: "0.0",
        divDir: "H",
        linDiv: "($ZL_D +50 -$Front_Side_GAP)mm:1",
        divElem: 0,
        horDefType: "W",
        top: null,
        bottom: null,
        divider: null,
        children: [
          {
            name: "Article Designer Group",
            index: "0.0.0",
            divDir: "H",
            linDiv: "1:($ZR_D + 50 -$Front_Side_GAP)mm",
            divElem: 0,
            horDefType: "D",
            top: null,
            bottom: null,
            divider: null,
            children: [
              {
                name: "Article Designer Group",
                index: "0.0.0.0",
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
                index: "0.0.0.1",
                divDir: "H",
                linDiv: "1:(50-2*$Front_Side_GAP)mm",
                divElem: 0,
                horDefType: "W",
                top: null,
                bottom: null,
                divider: null,
                children: [
                  {
                    name: "Article Designer Group",
                    index: "0.0.0.1.0",
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
                    index: "0.0.0.1.1",
                    divDir: "H",
                    linDiv: "1:($ZR_D +$Front_Side_GAP)mm",
                    divElem: 0,
                    horDefType: "D",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "Article Designer Group",
                        index: "0.0.0.1.1.0",
                        divDir: "V",
                        linDiv: "$BASE_HEIGHT mm:1:$CROWN_HEIGHT mm",
                        divElem: 0,
                        horDefType: "P",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "Article Designer Group",
                            index: "0.0.0.1.1.0.0",
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
                            index: "0.0.0.1.1.0.1",
                            divDir: "V",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: null,
                            children: [
                              {
                                name: "Article Designer Group",
                                index: "0.0.0.1.1.0.1.0",
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
                                index: "0.0.0.1.1.0.1.1",
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
                                index: "0.0.0.1.1.0.1.2",
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
                              "2": {
                                inSet: 0,
                                inSetFor: "",
                                partType: "S",
                                cpName: "CP_1_FI_S010",
                              },
                              "3": {
                                inSet: 0,
                                inSetFor: "",
                                partType: "S",
                                cpName: "CP_1_FI_10S0",
                              },
                            },
                          },
                          {
                            name: "Article Designer Group",
                            index: "0.0.0.1.1.0.2",
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
                        index: "0.0.0.1.1.1",
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
                        index: "0.0.0.1.1.2",
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
                index: "0.0.0.2",
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
              "1": null,
              "2": null,
              "3": null,
            },
          },
          {
            name: "Article Designer Group",
            index: "0.0.2",
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
        name: "Zone left",
        index: "0.1",
        divDir: "H",
        linDiv: "$ZL_D mm : 1",
        divElem: 0,
        horDefType: "W",
        top: null,
        bottom: null,
        divider: null,
        children: [
          {
            name: "Article Designer Group",
            index: "0.1.0",
            divDir: "H",
            linDiv: "1:($ZL_W + $IS_LL_P * $ZR_D)mm:((1-$IS_LL_P)*$ZR_D)mm",
            divElem: 0,
            horDefType: "D",
            top: null,
            bottom: null,
            divider: null,
            children: [
              {
                name: "Empty",
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
                  "0": null,
                  "1": null,
                  "2": null,
                  "3": null,
                },
              },
              {
                name: "SELECTABLE_1",
                index: "0.1.0.1",
                divDir: "H",
                linDiv: "((1-$IS_BI_L)*$FI_1_THK) mm:1",
                divElem: 0,
                horDefType: "D",
                top: null,
                bottom: null,
                divider: null,
                children: [
                  {
                    name: "Filler thk",
                    index: "0.1.0.1.0",
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
                        cpName: "#DS_ZFL_SI",
                      },
                      "1": null,
                      "2": null,
                      "3": null,
                    },
                  },
                  {
                    name: "SELECTABLE_1_REV",
                    index: "0.1.0.1.1",
                    divDir: "V",
                    linDiv: "$BASE_HEIGHT mm:1:$CROWN_HEIGHT mm",
                    divElem: 0,
                    horDefType: "D",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "Base_ZL",
                        index: "0.1.0.1.1.0",
                        divDir: "H",
                        linDiv: "((round((2700/$ZL_STEP) ) ) *$ZL_STEP)mm:1",
                        divElem: 0,
                        horDefType: "D",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "Article Designer Group",
                            index: "0.1.0.1.1.0.0",
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
                                cpName: "CP_1_BA_1000",
                              },
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Article Designer Group",
                            index: "0.1.0.1.1.0.1",
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
                                cpName: "CP_1_BA_1000",
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
                        index: "0.1.0.1.1.1",
                        divDir: "H",
                        linDiv: "($IS_BI_L*$ZFL_W) mm:1",
                        divElem: 0,
                        horDefType: "D",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "Article Designer Group",
                            index: "0.1.0.1.1.1.0",
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
                                inSet: -21.7,
                                inSetFor:
                                  "-$Front_Side_GAP-$MAT_FR_1_THK-2*$SRF_FR_1_THK",
                                partType: "S",
                                cpName: "#DS_ZFL_FR",
                              },
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Article Designer Group",
                            index: "0.1.0.1.1.1.1",
                            divDir: "H",
                            linDiv: "1:((1-$IS_LL_P) * 50)mm",
                            divElem: 0,
                            horDefType: "D",
                            top: null,
                            bottom: null,
                            divider: null,
                            children: [
                              {
                                name: "Article Designer Group",
                                index: "0.1.0.1.1.1.1.0",
                                divDir: "H",
                                linDiv: "#DS_LD_SL_ZL_SZ_01",
                                divElem: 0,
                                horDefType: "D",
                                top: null,
                                bottom: null,
                                divider: null,
                                children: [
                                  {
                                    name: "Article Designer Group",
                                    index: "0.1.0.1.1.1.1.0.0",
                                    divDir: "H",
                                    linDiv: "#DS_LD_SL_ZL_SZ_02",
                                    divElem: 0,
                                    horDefType: "D",
                                    top: null,
                                    bottom: null,
                                    divider: null,
                                    children: [
                                      {
                                        name: "Article Designer Group",
                                        index: "0.1.0.1.1.1.1.0.0.0",
                                        divDir: "H",
                                        linDiv: "#DS_LD_SL_ZL_SZ_03",
                                        divElem: 0,
                                        horDefType: "D",
                                        top: null,
                                        bottom: null,
                                        divider: null,
                                        children: [
                                          {
                                            name: "Article Designer Group",
                                            index: "0.1.0.1.1.1.1.0.0.0.0",
                                            divDir: "H",
                                            linDiv: "#DS_LD_SL_ZL_SZ_04",
                                            divElem: 0,
                                            horDefType: "D",
                                            top: null,
                                            bottom: null,
                                            divider: null,
                                            children: [
                                              {
                                                name: "Article Designer Group",
                                                index:
                                                  "0.1.0.1.1.1.1.0.0.0.0.0",
                                                divDir: "H",
                                                linDiv: "#DS_LD_SL_ZL_SZ_05",
                                                divElem: 0,
                                                horDefType: "D",
                                                top: null,
                                                bottom: null,
                                                divider: null,
                                                children: [
                                                  {
                                                    name: "Article Designer Group",
                                                    index:
                                                      "0.1.0.1.1.1.1.0.0.0.0.0.0",
                                                    divDir: "H",
                                                    linDiv:
                                                      "#DS_LD_SL_ZL_SZ_06",
                                                    divElem: 0,
                                                    horDefType: "D",
                                                    top: null,
                                                    bottom: null,
                                                    divider: null,
                                                    children: [
                                                      {
                                                        name: "Article Designer Group",
                                                        index:
                                                          "0.1.0.1.1.1.1.0.0.0.0.0.0.0",
                                                        divDir: "H",
                                                        linDiv:
                                                          "#DS_LD_SL_ZL_SZ_07",
                                                        divElem: 0,
                                                        horDefType: "D",
                                                        top: null,
                                                        bottom: null,
                                                        divider: null,
                                                        children: [
                                                          {
                                                            name: "Article Designer Group",
                                                            index:
                                                              "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0",
                                                            divDir: "H",
                                                            linDiv:
                                                              "#DS_LD_SL_ZL_SZ_08",
                                                            divElem: 0,
                                                            horDefType: "D",
                                                            top: null,
                                                            bottom: null,
                                                            divider: null,
                                                            children: [
                                                              {
                                                                name: "Article Designer Group",
                                                                index:
                                                                  "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0",
                                                                divDir: "H",
                                                                linDiv:
                                                                  "#DS_LD_SL_ZL_SZ_09",
                                                                divElem: 0,
                                                                horDefType: "D",
                                                                top: null,
                                                                bottom: null,
                                                                divider: null,
                                                                children: [
                                                                  {
                                                                    name: "Article Designer Group",
                                                                    index:
                                                                      "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0",
                                                                    divDir: "H",
                                                                    linDiv:
                                                                      "#DS_LD_SL_ZL_SZ_10",
                                                                    divElem: 0,
                                                                    horDefType:
                                                                      "D",
                                                                    top: null,
                                                                    bottom:
                                                                      null,
                                                                    divider:
                                                                      null,
                                                                    children: [
                                                                      {
                                                                        name: "Article Designer Group",
                                                                        index:
                                                                          "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0",
                                                                        divDir:
                                                                          "H",
                                                                        linDiv:
                                                                          "#DS_LD_SL_ZL_SZ_11",
                                                                        divElem: 0,
                                                                        horDefType:
                                                                          "D",
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
                                                                                "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.0",
                                                                              divDir:
                                                                                "H",
                                                                              linDiv:
                                                                                "#DS_LD_SL_ZL_SZ_12",
                                                                              divElem: 0,
                                                                              horDefType:
                                                                                "D",
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
                                                                                      "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.0.0",
                                                                                    divDir:
                                                                                      "H",
                                                                                    linDiv:
                                                                                      "#DS_LD_SL_ZL_SZ_13",
                                                                                    divElem: 0,
                                                                                    horDefType:
                                                                                      "D",
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
                                                                                            "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.0.0.0",
                                                                                          divDir:
                                                                                            "H",
                                                                                          linDiv:
                                                                                            "#DS_LD_SL_ZL_SZ_14",
                                                                                          divElem: 0,
                                                                                          horDefType:
                                                                                            "D",
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
                                                                                                  "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0",
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
                                                                                                name: "ART_ZONE_L_08",
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
                                                                                                    "$ZL_CNT_08",
                                                                                                },
                                                                                                index:
                                                                                                  "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.1",
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
                                                                                                  "$DS_WACA_ZL_ART_08",
                                                                                                children:
                                                                                                  [
                                                                                                    {
                                                                                                      name: "Article Designer Group",
                                                                                                      index:
                                                                                                        "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.1.0",
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
                                                                                                        "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.1.1",
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
                                                                                          name: "ART_ZONE_L_13",
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
                                                                                              "$ZL_CNT_13",
                                                                                          },
                                                                                          index:
                                                                                            "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.0.0.1",
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
                                                                                            "$DS_WACA_ZL_ART_13",
                                                                                          children:
                                                                                            [
                                                                                              {
                                                                                                name: "Article Designer Group",
                                                                                                index:
                                                                                                  "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.0.0.1.0",
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
                                                                                                  "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.0.0.1.1",
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
                                                                                    name: "ART_ZONE_L_12",
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
                                                                                        "$ZL_CNT_12",
                                                                                    },
                                                                                    index:
                                                                                      "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.0.1",
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
                                                                                      "$DS_WACA_ZL_ART_12",
                                                                                    children:
                                                                                      [
                                                                                        {
                                                                                          name: "Article Designer Group",
                                                                                          index:
                                                                                            "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.0.1.0",
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
                                                                                            "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.0.1.1",
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
                                                                              name: "ART_ZONE_L_11",
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
                                                                                  "$ZL_CNT_11",
                                                                              },
                                                                              index:
                                                                                "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.1",
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
                                                                                "$DS_WACA_ZL_ART_11",
                                                                              children:
                                                                                [
                                                                                  {
                                                                                    name: "Article Designer Group",
                                                                                    index:
                                                                                      "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.1.0",
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
                                                                                      "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.0.1.1",
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
                                                                          ],
                                                                        sides: {
                                                                          "0": null,
                                                                          "1": null,
                                                                          "2": null,
                                                                          "3": null,
                                                                        },
                                                                      },
                                                                      {
                                                                        name: "ART_ZONE_L_10",
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
                                                                            "$ZL_CNT_10",
                                                                        },
                                                                        index:
                                                                          "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.1",
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
                                                                          "$DS_WACA_ZL_ART_10",
                                                                        children:
                                                                          [
                                                                            {
                                                                              name: "Article Designer Group",
                                                                              index:
                                                                                "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.1.0",
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
                                                                                "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.0.1.1",
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
                                                                    ],
                                                                    sides: {
                                                                      "0": null,
                                                                      "1": null,
                                                                      "2": null,
                                                                      "3": null,
                                                                    },
                                                                  },
                                                                  {
                                                                    name: "ART_ZONE_L_09",
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
                                                                        "$ZL_CNT_09",
                                                                    },
                                                                    index:
                                                                      "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.1",
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
                                                                      "$DS_WACA_ZL_ART_09",
                                                                    children: [
                                                                      {
                                                                        name: "Article Designer Group",
                                                                        index:
                                                                          "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.1.0",
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
                                                                          "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.0.1.1",
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
                                                                ],
                                                                sides: {
                                                                  "0": null,
                                                                  "1": null,
                                                                  "2": null,
                                                                  "3": null,
                                                                },
                                                              },
                                                              {
                                                                name: "ART_ZONE_L_08",
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
                                                                    "$ZL_CNT_08",
                                                                },
                                                                index:
                                                                  "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.1",
                                                                divDir: "A",
                                                                linDiv: "1:1",
                                                                divElem: 0,
                                                                horDefType: "P",
                                                                top: null,
                                                                bottom: null,
                                                                divider:
                                                                  "$DS_WACA_ZL_ART_08",
                                                                children: [
                                                                  {
                                                                    name: "Article Designer Group",
                                                                    index:
                                                                      "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.1.0",
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
                                                                      "0.1.0.1.1.1.1.0.0.0.0.0.0.0.0.1.1",
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
                                                            ],
                                                            sides: {
                                                              "0": null,
                                                              "1": null,
                                                              "2": null,
                                                              "3": null,
                                                            },
                                                          },
                                                          {
                                                            name: "ART_ZONE_L_07",
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
                                                                "$ZL_CNT_07",
                                                            },
                                                            index:
                                                              "0.1.0.1.1.1.1.0.0.0.0.0.0.0.1",
                                                            divDir: "A",
                                                            linDiv: "1:1",
                                                            divElem: 0,
                                                            horDefType: "P",
                                                            top: null,
                                                            bottom: null,
                                                            divider:
                                                              "$DS_WACA_ZL_ART_07",
                                                            children: [
                                                              {
                                                                name: "Article Designer Group",
                                                                index:
                                                                  "0.1.0.1.1.1.1.0.0.0.0.0.0.0.1.0",
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
                                                                  "0.1.0.1.1.1.1.0.0.0.0.0.0.0.1.1",
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
                                                        ],
                                                        sides: {
                                                          "0": null,
                                                          "1": null,
                                                          "2": null,
                                                          "3": null,
                                                        },
                                                      },
                                                      {
                                                        name: "ART_ZONE_L_06",
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
                                                            "$ZL_CNT_06",
                                                        },
                                                        index:
                                                          "0.1.0.1.1.1.1.0.0.0.0.0.0.1",
                                                        divDir: "A",
                                                        linDiv: "1:1",
                                                        divElem: 0,
                                                        horDefType: "P",
                                                        top: null,
                                                        bottom: null,
                                                        divider:
                                                          "$DS_WACA_ZL_ART_06",
                                                        children: [
                                                          {
                                                            name: "Article Designer Group",
                                                            index:
                                                              "0.1.0.1.1.1.1.0.0.0.0.0.0.1.0",
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
                                                              "0.1.0.1.1.1.1.0.0.0.0.0.0.1.1",
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
                                                    ],
                                                    sides: {
                                                      "0": null,
                                                      "1": null,
                                                      "2": null,
                                                      "3": null,
                                                    },
                                                  },
                                                  {
                                                    name: "ART_ZONE_L_05",
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
                                                        "$ZL_CNT_05",
                                                    },
                                                    index:
                                                      "0.1.0.1.1.1.1.0.0.0.0.0.1",
                                                    divDir: "A",
                                                    linDiv: "1:1",
                                                    divElem: 0,
                                                    horDefType: "P",
                                                    top: null,
                                                    bottom: null,
                                                    divider:
                                                      "$DS_WACA_ZL_ART_05",
                                                    children: [
                                                      {
                                                        name: "Article Designer Group",
                                                        index:
                                                          "0.1.0.1.1.1.1.0.0.0.0.0.1.0",
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
                                                          "0.1.0.1.1.1.1.0.0.0.0.0.1.1",
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
                                                ],
                                                sides: {
                                                  "0": null,
                                                  "1": null,
                                                  "2": null,
                                                  "3": null,
                                                },
                                              },
                                              {
                                                name: "ART_ZONE_L_04",
                                                grtx: {
                                                  "AD zone info01": "0",
                                                  "AD zone info02": "MD",
                                                  "AD zone info03": "$HAS_HC",
                                                  "AD zone info04": "$HAS_DR",
                                                  "AD zone info05":
                                                    "$IS_DR_EXT",
                                                  "AD zone info06":
                                                    "$ZL_CNT_04",
                                                },
                                                index:
                                                  "0.1.0.1.1.1.1.0.0.0.0.1",
                                                divDir: "A",
                                                linDiv: "1:1",
                                                divElem: 0,
                                                horDefType: "P",
                                                top: null,
                                                bottom: null,
                                                divider: "$DS_WACA_ZL_ART_04",
                                                children: [
                                                  {
                                                    name: "Article Designer Group",
                                                    index:
                                                      "0.1.0.1.1.1.1.0.0.0.0.1.0",
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
                                                      "0.1.0.1.1.1.1.0.0.0.0.1.1",
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
                                            ],
                                            sides: {
                                              "0": null,
                                              "1": null,
                                              "2": null,
                                              "3": null,
                                            },
                                          },
                                          {
                                            name: "ART_ZONE_L_03",
                                            grtx: {
                                              "AD zone info01": "0",
                                              "AD zone info02": "MD",
                                              "AD zone info03": "$HAS_HC",
                                              "AD zone info04": "$HAS_DR",
                                              "AD zone info05": "$IS_DR_EXT",
                                              "AD zone info06": "$ZL_CNT_03",
                                            },
                                            index: "0.1.0.1.1.1.1.0.0.0.1",
                                            divDir: "A",
                                            linDiv: "1:1",
                                            divElem: 0,
                                            horDefType: "P",
                                            top: null,
                                            bottom: null,
                                            divider: "$DS_WACA_ZL_ART_03",
                                            children: [
                                              {
                                                name: "Article Designer Group",
                                                index:
                                                  "0.1.0.1.1.1.1.0.0.0.1.0",
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
                                                  "0.1.0.1.1.1.1.0.0.0.1.1",
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
                                        ],
                                        sides: {
                                          "0": null,
                                          "1": null,
                                          "2": null,
                                          "3": null,
                                        },
                                      },
                                      {
                                        name: "ART_ZONE_L_02",
                                        grtx: {
                                          "AD zone info01": "0",
                                          "AD zone info02": "MD",
                                          "AD zone info03": "$HAS_HC",
                                          "AD zone info04": "$HAS_DR",
                                          "AD zone info05": "$IS_DR_EXT",
                                          "AD zone info06": "$ZL_CNT_02",
                                        },
                                        index: "0.1.0.1.1.1.1.0.0.1",
                                        divDir: "A",
                                        linDiv: "1:1",
                                        divElem: 0,
                                        horDefType: "P",
                                        top: null,
                                        bottom: null,
                                        divider: "$DS_WACA_ZL_ART_02",
                                        children: [
                                          {
                                            name: "Article Designer Group",
                                            index: "0.1.0.1.1.1.1.0.0.1.0",
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
                                            index: "0.1.0.1.1.1.1.0.0.1.1",
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
                                        name: "Article Designer Group",
                                        index: "0.1.0.1.1.1.1.0.0.2",
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
                                        index: "0.1.0.1.1.1.1.0.0.3",
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
                                        index: "0.1.0.1.1.1.1.0.0.4",
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
                                    name: "ART_ZONE_L_01",
                                    grtx: {
                                      "AD zone info01": "0",
                                      "AD zone info02": "CLMD",
                                      "AD zone info03": "$HAS_HC",
                                      "AD zone info04": "$HAS_DR",
                                      "AD zone info05": "$IS_DR_EXT",
                                      "AD zone info06": "$ZL_CNT_01",
                                    },
                                    index: "0.1.0.1.1.1.1.0.1",
                                    divDir: "A",
                                    linDiv: "1:1",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: "$DS_WACA_ZL_ART_01",
                                    children: [
                                      {
                                        name: "Article Designer Group",
                                        index: "0.1.0.1.1.1.1.0.1.0",
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
                                        index: "0.1.0.1.1.1.1.0.1.1",
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
                                    name: "Article Designer Group",
                                    index: "0.1.0.1.1.1.1.0.2",
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
                                    index: "0.1.0.1.1.1.1.0.3",
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
                                    index: "0.1.0.1.1.1.1.0.4",
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
                                    index: "0.1.0.1.1.1.1.0.5",
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
                                    index: "0.1.0.1.1.1.1.0.6",
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
                                index: "0.1.0.1.1.1.1.1",
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
                        ],
                        sides: {
                          "0": null,
                          "1": null,
                          "2": null,
                          "3": null,
                        },
                      },
                      {
                        name: "Crown_ZL",
                        index: "0.1.0.1.1.2",
                        divDir: "H",
                        linDiv: "((round((2700/$ZL_STEP) ) ) *$ZL_STEP)mm:1",
                        divElem: 0,
                        horDefType: "D",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "Article Designer Group",
                            index: "0.1.0.1.1.2.0",
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
                                cpName: "CP_1_CM_0000",
                              },
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Article Designer Group",
                            index: "0.1.0.1.1.2.1",
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
                                cpName: "CP_1_CM_0000",
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
                    sides: {
                      "0": null,
                      "1": null,
                      "2": null,
                      "3": null,
                    },
                  },
                ],
                clickable: "RIGHT",
                modifiable: true,
                sides: {
                  "0": null,
                  "1": null,
                  "2": null,
                  "3": null,
                },
              },
              {
                name: "wested",
                index: "0.1.0.2",
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
            name: "EMPTY",
            index: "0.1.1",
            divDir: "V",
            linDiv: "",
            divElem: 0,
            horDefType: "P",
            top: null,
            bottom: null,
            divider: null,
            children: [],
            empty: true,
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
        name: "Zone right",
        index: "0.2",
        divDir: "H",
        linDiv: "1:$ZR_D mm",
        divElem: 0,
        horDefType: "D",
        top: null,
        bottom: null,
        divider: null,
        children: [
          {
            name: "EMPTY",
            index: "0.2.0",
            divDir: "V",
            linDiv: "",
            divElem: 0,
            horDefType: "P",
            top: null,
            bottom: null,
            divider: null,
            children: [],
            empty: true,
            sides: {
              "0": null,
              "1": null,
              "2": null,
              "3": null,
            },
          },
          {
            name: "SELECTABLE",
            index: "0.2.1",
            divDir: "H",
            linDiv: "((1-$IS_RL_N)*$ZL_D)mm :1",
            divElem: 0,
            horDefType: "W",
            top: null,
            bottom: null,
            divider: null,
            children: [
              {
                name: "Wested",
                index: "0.2.1.0",
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
                index: "0.2.1.1",
                divDir: "H",
                linDiv: "1:((1-$IS_BI_R)*$FI_1_THK) mm",
                divElem: 0,
                horDefType: "W",
                top: null,
                bottom: null,
                divider: null,
                children: [
                  {
                    name: "SELECTABLE_0",
                    index: "0.2.1.1.0",
                    divDir: "V",
                    linDiv: "$BASE_HEIGHT mm:1:$CROWN_HEIGHT mm",
                    divElem: 0,
                    horDefType: "D",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "Base_ZR",
                        index: "0.2.1.1.0.0",
                        divDir: "H",
                        linDiv: "((round((2700/$ZR_STEP) ) ) *$ZR_STEP)mm:1",
                        divElem: 0,
                        horDefType: "W",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "Article Designer Group",
                            index: "0.2.1.1.0.0.0",
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
                            index: "0.2.1.1.0.0.1",
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
                        index: "0.2.1.1.0.1",
                        divDir: "H",
                        linDiv: "1:($IS_BI_R*$ZFR_W) mm",
                        divElem: 0,
                        horDefType: "W",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "Article Designer Group",
                            index: "0.2.1.1.0.1.0",
                            divDir: "H",
                            linDiv: "((1-$IS_RL_N) * 50)mm:1",
                            divElem: 0,
                            horDefType: "W",
                            top: null,
                            bottom: null,
                            divider: null,
                            children: [
                              {
                                name: "Article Designer Group",
                                index: "0.2.1.1.0.1.0.0",
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
                                index: "0.2.1.1.0.1.0.1",
                                divDir: "H",
                                linDiv: "#DS_LD_SL_ZR_SZ_01",
                                divElem: 3,
                                horDefType: "W",
                                top: null,
                                bottom: null,
                                divider: null,
                                children: [
                                  {
                                    name: "ART_ZONE_R_01",
                                    grtx: {
                                      "AD zone info01": "0",
                                      "AD zone info02": "CRMD",
                                      "AD zone info03": "$HAS_HC",
                                      "AD zone info04": "$HAS_DR",
                                      "AD zone info05": "$IS_DR_EXT",
                                      "AD zone info06": "$ZR_CNT_01",
                                    },
                                    index: "0.2.1.1.0.1.0.1.0",
                                    divDir: "A",
                                    linDiv: "1:1",
                                    divElem: 1,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: "$DS_WACA_ZR_ART_01",
                                    children: [
                                      {
                                        name: "Article Designer Group",
                                        index: "0.2.1.1.0.1.0.1.0.0",
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
                                        index: "0.2.1.1.0.1.0.1.0.1",
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
                                    name: "Article Designer Group",
                                    index: "0.2.1.1.0.1.0.1.1",
                                    divDir: "H",
                                    linDiv: "#DS_LD_SL_ZR_SZ_02",
                                    divElem: 3,
                                    horDefType: "W",
                                    top: null,
                                    bottom: null,
                                    divider: null,
                                    children: [
                                      {
                                        name: "ART_ZONE_R_02",
                                        grtx: {
                                          "AD zone info01": "0",
                                          "AD zone info02": "MD",
                                          "AD zone info03": "$HAS_HC",
                                          "AD zone info04": "$HAS_DR",
                                          "AD zone info05": "$IS_DR_EXT",
                                          "AD zone info06": "$ZR_CNT_02",
                                        },
                                        index: "0.2.1.1.0.1.0.1.1.0",
                                        divDir: "A",
                                        linDiv: "1:1",
                                        divElem: 2,
                                        horDefType: "P",
                                        top: null,
                                        bottom: null,
                                        divider: "$DS_WACA_ZR_ART_02",
                                        children: [
                                          {
                                            name: "Article Designer Group",
                                            index: "0.2.1.1.0.1.0.1.1.0.0",
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
                                            index: "0.2.1.1.0.1.0.1.1.0.1",
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
                                        name: "Article Designer Group",
                                        index: "0.2.1.1.0.1.0.1.1.1",
                                        divDir: "H",
                                        linDiv: "#DS_LD_SL_ZR_SZ_03",
                                        divElem: 0,
                                        horDefType: "W",
                                        top: null,
                                        bottom: null,
                                        divider: null,
                                        children: [
                                          {
                                            name: "ART_ZONE_R_03",
                                            grtx: {
                                              "AD zone info01": "0",
                                              "AD zone info02": "MD",
                                              "AD zone info03": "$HAS_HC",
                                              "AD zone info04": "$HAS_DR",
                                              "AD zone info05": "$IS_DR_EXT",
                                              "AD zone info06": "$ZR_CNT_03",
                                            },
                                            index: "0.2.1.1.0.1.0.1.1.1.0",
                                            divDir: "A",
                                            linDiv: "1:1",
                                            divElem: 2,
                                            horDefType: "P",
                                            top: null,
                                            bottom: null,
                                            divider: "$DS_WACA_ZR_ART_03",
                                            children: [
                                              {
                                                name: "Article Designer Group",
                                                index:
                                                  "0.2.1.1.0.1.0.1.1.1.0.0",
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
                                                  "0.2.1.1.0.1.0.1.1.1.0.1",
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
                                            name: "Article Designer Group",
                                            index: "0.2.1.1.0.1.0.1.1.1.1",
                                            divDir: "H",
                                            linDiv: "#DS_LD_SL_ZR_SZ_04",
                                            divElem: 0,
                                            horDefType: "W",
                                            top: null,
                                            bottom: null,
                                            divider: null,
                                            children: [
                                              {
                                                name: "ART_ZONE_R_04",
                                                grtx: {
                                                  "AD zone info01": "0",
                                                  "AD zone info02": "MD",
                                                  "AD zone info03": "$HAS_HC",
                                                  "AD zone info04": "$HAS_DR",
                                                  "AD zone info05":
                                                    "$IS_DR_EXT",
                                                  "AD zone info06":
                                                    "$ZR_CNT_04",
                                                },
                                                index:
                                                  "0.2.1.1.0.1.0.1.1.1.1.0",
                                                divDir: "A",
                                                linDiv: "1:1",
                                                divElem: 2,
                                                horDefType: "P",
                                                top: null,
                                                bottom: null,
                                                divider: "$DS_WACA_ZR_ART_04",
                                                children: [
                                                  {
                                                    name: "Article Designer Group",
                                                    index:
                                                      "0.2.1.1.0.1.0.1.1.1.1.0.0",
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
                                                      "0.2.1.1.0.1.0.1.1.1.1.0.1",
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
                                                name: "Article Designer Group",
                                                index:
                                                  "0.2.1.1.0.1.0.1.1.1.1.1",
                                                divDir: "H",
                                                linDiv: "#DS_LD_SL_ZR_SZ_05",
                                                divElem: 0,
                                                horDefType: "W",
                                                top: null,
                                                bottom: null,
                                                divider: null,
                                                children: [
                                                  {
                                                    name: "ART_ZONE_R_05",
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
                                                        "$ZR_CNT_05",
                                                    },
                                                    index:
                                                      "0.2.1.1.0.1.0.1.1.1.1.1.0",
                                                    divDir: "A",
                                                    linDiv: "1:1",
                                                    divElem: 2,
                                                    horDefType: "P",
                                                    top: null,
                                                    bottom: null,
                                                    divider:
                                                      "$DS_WACA_ZR_ART_05",
                                                    children: [
                                                      {
                                                        name: "Article Designer Group",
                                                        index:
                                                          "0.2.1.1.0.1.0.1.1.1.1.1.0.0",
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
                                                          "0.2.1.1.0.1.0.1.1.1.1.1.0.1",
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
                                                    name: "Article Designer Group",
                                                    index:
                                                      "0.2.1.1.0.1.0.1.1.1.1.1.1",
                                                    divDir: "H",
                                                    linDiv:
                                                      "#DS_LD_SL_ZR_SZ_06",
                                                    divElem: 0,
                                                    horDefType: "W",
                                                    top: null,
                                                    bottom: null,
                                                    divider: null,
                                                    children: [
                                                      {
                                                        name: "ART_ZONE_R_06",
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
                                                            "$ZR_CNT_06",
                                                        },
                                                        index:
                                                          "0.2.1.1.0.1.0.1.1.1.1.1.1.0",
                                                        divDir: "A",
                                                        linDiv: "1:1",
                                                        divElem: 2,
                                                        horDefType: "P",
                                                        top: null,
                                                        bottom: null,
                                                        divider:
                                                          "$DS_WACA_ZR_ART_06",
                                                        children: [
                                                          {
                                                            name: "Article Designer Group",
                                                            index:
                                                              "0.2.1.1.0.1.0.1.1.1.1.1.1.0.0",
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
                                                              "0.2.1.1.0.1.0.1.1.1.1.1.1.0.1",
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
                                                        name: "Article Designer Group",
                                                        index:
                                                          "0.2.1.1.0.1.0.1.1.1.1.1.1.1",
                                                        divDir: "H",
                                                        linDiv:
                                                          "#DS_LD_SL_ZR_SZ_07",
                                                        divElem: 0,
                                                        horDefType: "W",
                                                        top: null,
                                                        bottom: null,
                                                        divider: null,
                                                        children: [
                                                          {
                                                            name: "ART_ZONE_R_07",
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
                                                                "$ZR_CNT_07",
                                                            },
                                                            index:
                                                              "0.2.1.1.0.1.0.1.1.1.1.1.1.1.0",
                                                            divDir: "A",
                                                            linDiv: "1:1",
                                                            divElem: 2,
                                                            horDefType: "P",
                                                            top: null,
                                                            bottom: null,
                                                            divider:
                                                              "$DS_WACA_ZR_ART_07",
                                                            children: [
                                                              {
                                                                name: "Article Designer Group",
                                                                index:
                                                                  "0.2.1.1.0.1.0.1.1.1.1.1.1.1.0.0",
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
                                                                  "0.2.1.1.0.1.0.1.1.1.1.1.1.1.0.1",
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
                                                            name: "Article Designer Group",
                                                            index:
                                                              "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1",
                                                            divDir: "H",
                                                            linDiv:
                                                              "#DS_LD_SL_ZR_SZ_08",
                                                            divElem: 2,
                                                            horDefType: "W",
                                                            top: null,
                                                            bottom: null,
                                                            divider: null,
                                                            children: [
                                                              {
                                                                name: "ART_ZONE_R_08",
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
                                                                    "$ZR_CNT_08",
                                                                },
                                                                index:
                                                                  "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.0",
                                                                divDir: "A",
                                                                linDiv: "1:1",
                                                                divElem: 0,
                                                                horDefType: "P",
                                                                top: null,
                                                                bottom: null,
                                                                divider:
                                                                  "$DS_WACA_ZR_ART_08",
                                                                children: [
                                                                  {
                                                                    name: "Article Designer Group",
                                                                    index:
                                                                      "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.0.0",
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
                                                                      "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.0.1",
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
                                                                name: "Article Designer Group",
                                                                index:
                                                                  "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1",
                                                                divDir: "H",
                                                                linDiv:
                                                                  "#DS_LD_SL_ZR_SZ_09",
                                                                divElem: 0,
                                                                horDefType: "W",
                                                                top: null,
                                                                bottom: null,
                                                                divider: null,
                                                                children: [
                                                                  {
                                                                    name: "ART_ZONE_R_09",
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
                                                                        "$ZR_CNT_09",
                                                                    },
                                                                    index:
                                                                      "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.0",
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
                                                                      "$DS_WACA_ZR_ART_09",
                                                                    children: [
                                                                      {
                                                                        name: "Article Designer Group",
                                                                        index:
                                                                          "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.0.0",
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
                                                                          "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.0.1",
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
                                                                    name: "Article Designer Group",
                                                                    index:
                                                                      "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1",
                                                                    divDir: "H",
                                                                    linDiv:
                                                                      "#DS_LD_SL_ZR_SZ_10",
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
                                                                        name: "ART_ZONE_R_10",
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
                                                                            "$ZR_CNT_10",
                                                                        },
                                                                        index:
                                                                          "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.0",
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
                                                                          "$DS_WACA_ZR_ART_10",
                                                                        children:
                                                                          [
                                                                            {
                                                                              name: "Article Designer Group",
                                                                              index:
                                                                                "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.0.0",
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
                                                                                "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.0.1",
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
                                                                        name: "Article Designer Group",
                                                                        index:
                                                                          "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1",
                                                                        divDir:
                                                                          "H",
                                                                        linDiv:
                                                                          "#DS_LD_SL_ZR_SZ_11",
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
                                                                              name: "ART_ZONE_R_11",
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
                                                                                  "$ZR_CNT_11",
                                                                              },
                                                                              index:
                                                                                "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.0",
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
                                                                                "$DS_WACA_ZR_ART_11",
                                                                              children:
                                                                                [
                                                                                  {
                                                                                    name: "Article Designer Group",
                                                                                    index:
                                                                                      "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.0.0",
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
                                                                                      "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.0.1",
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
                                                                              name: "Article Designer Group",
                                                                              index:
                                                                                "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                              divDir:
                                                                                "H",
                                                                              linDiv:
                                                                                "#DS_LD_SL_ZR_SZ_12",
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
                                                                                    name: "ART_ZONE_R_12",
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
                                                                                        "$ZR_CNT_12",
                                                                                    },
                                                                                    index:
                                                                                      "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.1.0",
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
                                                                                      "$DS_WACA_ZR_ART_12",
                                                                                    children:
                                                                                      [
                                                                                        {
                                                                                          name: "Article Designer Group",
                                                                                          index:
                                                                                            "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.1.0.0",
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
                                                                                            "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.1.0.1",
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
                                                                                    name: "Article Designer Group",
                                                                                    index:
                                                                                      "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                                    divDir:
                                                                                      "H",
                                                                                    linDiv:
                                                                                      "#DS_LD_SL_ZR_SZ_13",
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
                                                                                          name: "ART_ZONE_R_13",
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
                                                                                              "$ZR_CNT_13",
                                                                                          },
                                                                                          index:
                                                                                            "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.1.1.0",
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
                                                                                            "$DS_WACA_ZR_ART_13",
                                                                                          children:
                                                                                            [
                                                                                              {
                                                                                                name: "Article Designer Group",
                                                                                                index:
                                                                                                  "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0",
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
                                                                                                  "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.1.1.0.1",
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
                                                                                          name: "Article Designer Group",
                                                                                          index:
                                                                                            "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                                          divDir:
                                                                                            "H",
                                                                                          linDiv:
                                                                                            "#DS_LD_SL_ZR_SZ_14",
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
                                                                                                name: "ART_ZONE_R_14",
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
                                                                                                    "$ZR_CNT_14",
                                                                                                },
                                                                                                index:
                                                                                                  "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0",
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
                                                                                                  "$DS_WACA_ZR_ART_14",
                                                                                                children:
                                                                                                  [
                                                                                                    {
                                                                                                      name: "Article Designer Group",
                                                                                                      index:
                                                                                                        "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.0",
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
                                                                                                        "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.0.1",
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
                                                                                                name: "Article Designer Group",
                                                                                                index:
                                                                                                  "0.2.1.1.0.1.0.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
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
                                  {
                                    name: "Article Designer Group",
                                    index: "0.2.1.1.0.1.0.1.2",
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
                                    index: "0.2.1.1.0.1.0.1.3",
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
                                    index: "0.2.1.1.0.1.0.1.4",
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
                                    index: "0.2.1.1.0.1.0.1.5",
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
                                    index: "0.2.1.1.0.1.0.1.6",
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
                            index: "0.2.1.1.0.1.1",
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
                                  "-$Front_Side_GAP-$MAT_FR_1_THK-2*$SRF_FR_1_THK",
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
                        name: "Crown_ZR",
                        index: "0.2.1.1.0.2",
                        divDir: "H",
                        linDiv: "((round((2700/$ZR_STEP) ) ) *$ZR_STEP)mm:1",
                        divElem: 0,
                        horDefType: "W",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "Article Designer Group",
                            index: "0.2.1.1.0.2.0",
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
                                cpName: "CP_1_CM_0000",
                              },
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Article Designer Group",
                            index: "0.2.1.1.0.2.1",
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
                                cpName: "CP_1_CM_0000",
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
                    clickable: "FRONT",
                    modifiable: true,
                    sides: {
                      "0": null,
                      "1": null,
                      "2": null,
                      "3": null,
                    },
                  },
                  {
                    name: "Filler thk",
                    index: "0.2.1.1.1",
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
