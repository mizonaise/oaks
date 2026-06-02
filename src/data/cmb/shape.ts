export const shape = {
  name: "OAKSOME_SHAPE_CMB_1111",
  width: "$ZONE_W mm mm",
  depth: "800 mm",
  height: "$ZONE_H mm mm",
  cps: {
    CP_1_FI_1000: {
      mat: "$MAT_FI_1",
      surf: "$SRF_FI_1_TOP",
    },
    CP_1_BA_1000: {
      mat: "$MAT_BA_1",
      surf: "$SRF_BA_1_TOP",
    },
    CP_1_FI_1111: {
      mat: "$MAT_FI_1",
      surf: "$SRF_FI_1_TOP",
    },
    CP_1_CM_0000: {
      mat: "$MAT_CM_1",
      surf: "$SRF_CM_1_TOP",
    },
    CP_1_LV_1000_NC: {
      mat: "$MAT_LV_1",
      surf: "$SRF_LV_1_TOP",
    },
    CP_1_WS_1000_C1: {
      mat: "$MAT_WS_1",
      surf: "$SRF_WS_1_TOP",
    },
    BC_4xDR1: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    BC_DR1_DR3: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    BC_DR2_2xDR1: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    BC_DR1_DR2_DR1: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    BC_SD: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
    BC_DD: {
      mat: "NO_MAT",
      surf: "NO_SURF",
    },
  },
  variables: {
    ZONE_W: "8000",
    ZONE_H: "3000",
    Z10_W: "3000",
    Z30_W: "3000",
    Z10_D: "500",
    FI_1_THK: "($MAT_FI_1_THK + 2*($SRF_FI_1_THK))",
    MAT_FI_1_THK: "$MAT_FR_1_THK",
    MAT_FR_1_THK: "16",
    SRF_FI_1_THK: "$SRF_FR_1_THK",
    SRF_FR_1_THK: "0.8",
    IS_BI_L: "1",
    BASE_HEIGHT: "100",
    IS_ZF1_BI_T: "1",
    CROWN_HEIGHT: "100",
    Z30_D: "500",
    Z21_H: "500",
    IS_BI_R: "1",
    ZF23_D: "400",
    Z21_D: "500",
    IS_ZF3_BI_T: "1",
    LV_1_THK: "$FR_1_THK",
    Z23_H: "500",
    FR_1_THK: "(2*$SRF_FR_1_THK + $MAT_FR_1_THK)",
    ZFR_W: "50",
    ZFL_W: "50",
    IS_ZF23_BI_T: "1",
    Z23_D: "500",
    ZF3_W: "4000",
    ZF23_CNT_01: "1",
    ZF3_CNT: "8",
    ZF1_W: "6000",
    WS_1_THK: "($MAT_WS_1_THK+2*$SRF_WS_1_THK)",
    ZF1_CNT: "10",
    MAT_WS_1_THK: "38",
    ZF23_CNT: "7",
    Z30_MCNT_01: "1",
    Z10_MCNT_01: "1",
    SRF_WS_1_THK: "0.8",
    ZF2_W: "3000",
    ZF23_CNT_02: "1",
    Z23_MCNT_01: "1",
    Z30_CNT: "10",
    Z10_CNT: "10",
    ZF23_CNT_03: "1",
    Z23_CNT: "10",
    Z30_MACC_01: "$Z30_MCNT_01",
    Z10_MACC_01: "$Z10_MCNT_01",
    ZF23_CNT_04: "1",
    Z23_MACC_01: "$Z23_MCNT_01",
    Z30_MCNT_02: "1",
    Z10_MCNT_02: "1",
    Z23_MCNT_02: "1",
    ZF23_CNT_05: "1",
    Z30_MACC_02: "$Z30_MACC_01 + $Z30_MCNT_02",
    Z10_MACC_02: "$Z10_MACC_01 + $Z10_MCNT_02",
    ZF21_CNT: "5",
    Z21_MCNT_01: "1",
    ZF23_CNT_06: "1",
    Z23_MACC_02: "$Z23_MACC_01 + $Z23_MCNT_02",
    Z30_MCNT_03: "1",
    Z10_MCNT_03: "1",
    Z21_CNT: "10",
    ZF23_CNT_07: "1",
    MAT_FI_1: "$MAT_FR_1",
    Z23_MCNT_03: "1",
    Z30_MACC_03: "$Z30_MACC_02 + $Z30_MCNT_03",
    Z10_MACC_03: "$Z10_MACC_02 + $Z10_MCNT_03",
    Z21_MACC_01: "$Z21_MCNT_01",
    MAT_FR_1: "UN_RW_HGS_MDFFB_16",
    Z23_MACC_03: "$Z23_MACC_02 + $Z23_MCNT_03",
    Z30_MCNT_04: "1",
    Z10_MCNT_04: "1",
    MAT_BA_1: "$MAT_FR_1",
    SRF_FI_1_TOP: "$SRF_FR_1_TOP",
    Z21_MCNT_02: "1",
    Z23_MCNT_04: "1",
    Z30_MACC_04: "$Z30_MACC_03 + $Z30_MCNT_04",
    Z10_MACC_04: "$Z10_MACC_03 + $Z10_MCNT_04",
    SRF_BA_1_TOP: "$SRF_FR_1_TOP",
    Z21_MACC_02: "$Z21_MACC_01 + $Z21_MCNT_02",
    SRF_FR_1_TOP: "EG_HPL_HGP_W980_ST7_0_8",
    Z23_MACC_04: "$Z23_MACC_03 + $Z23_MCNT_04",
    Z30_MCNT_05: "1",
    Z10_MCNT_05: "1",
    Z21_MCNT_03: "1",
    Z23_MCNT_05: "1",
    Z30_MACC_05: "$Z30_MACC_04 + $Z30_MCNT_05",
    Z10_MACC_05: "$Z10_MACC_04 + $Z10_MCNT_05",
    Z21_MACC_03: "$Z21_MACC_02 + $Z21_MCNT_03",
    Z23_MACC_05: "$Z23_MACC_04 + $Z23_MCNT_05",
    Z10_MCNT_06: "1",
    Z21_MCNT_04: "1",
    Z30_MCNT_06: "1",
    MAT_CM_1: "$MAT_FR_1",
    MAT_LV_1: "$MAT_FR_1",
    Z21_MACC_04: "$Z21_MACC_03 + $Z21_MCNT_04",
    Z23_MCNT_06: "1",
    Z10_MACC_06: "$Z10_MACC_05 + $Z10_MCNT_06",
    SRF_CM_1_TOP: "$SRF_FR_1_TOP",
    Z30_MACC_06: "$Z30_MACC_05 + $Z30_MCNT_06",
    SRF_LV_1_TOP: "$SRF_LV_1_EXT",
    Z21_MCNT_05: "1",
    Z23_MACC_06: "$Z23_MACC_05 + $Z23_MCNT_06",
    Z10_MCNT_07: "1",
    MAT_WS_1: "iX_PB38_MEL_Cement_M",
    Z23_MCNT_07: "1",
    Z30_MCNT_07: "1",
    Z21_MACC_05: "$Z21_MACC_04 + $Z21_MCNT_05",
    SRF_LV_1_EXT: "$SRF_FR_1_TOP",
    Z10_MACC_07: "$Z10_MACC_06 + $Z10_MCNT_07",
    SRF_WS_1_TOP: "$SURF_WS_1_TOP",
    Z23_MACC_07: "$Z23_MACC_06 + $Z23_MCNT_07",
    Z30_MACC_07: "$Z30_MACC_06 + $Z30_MCNT_07",
    Z21_MCNT_06: "1",
    Z10_MCNT_08: "1",
    SURF_WS_1_TOP: "NO_SURF",
    Z30_MCNT_08: "1",
    Z23_MCNT_08: "1",
    Z10_MACC_08: "$Z10_MACC_07 + $Z10_MCNT_08",
    Z21_MACC_06: "$Z21_MACC_05 + $Z21_MCNT_06",
    Z30_MACC_08: "$Z30_MACC_07 + $Z30_MCNT_08",
    Z23_MACC_08: "$Z23_MACC_07 + $Z23_MCNT_08",
    Z10_MCNT_09: "1",
    Z21_MCNT_07: "1",
    Z23_MCNT_09: "1",
    Z30_MCNT_09: "1",
    Z10_MACC_09: "$Z10_MACC_08 + $Z10_MCNT_09",
    Z21_MACC_07: "$Z21_MACC_06 + $Z21_MCNT_07",
    Z23_MACC_09: "$Z23_MACC_08 + $Z23_MCNT_09",
    Z10_MCNT_10: "1",
    Z30_MACC_09: "$Z30_MACC_08 + $Z30_MCNT_09",
    Z21_MCNT_08: "1",
    Z23_MCNT_10: "1",
    Z10_MACC_10: "$Z10_MACC_09 + $Z10_MCNT_10",
    Z21_MACC_08: "$Z21_MACC_07 + $Z21_MCNT_08",
    Z23_MACC_10: "$Z23_MACC_09 + $Z23_MCNT_10",
    Z30_MCNT_10: "1",
    Z10_ART_01: "",
    Z10_ART_02: "",
    Z10_ART_03: "",
    Z10_ART_04: "",
    Z10_ART_05: "",
    Z10_ART_06: "",
    Z10_ART_07: "",
    Z10_ART_08: "",
    Z10_ART_09: "",
    Z10_ART_10: "",
    Z21_MCNT_09: "1",
    Z23_ART_02: "",
    Z23_ART_03: "",
    Z23_ART_04: "",
    Z23_ART_05: "",
    Z23_ART_08: "",
    Z23_ART_01: "",
    Z23_ART_06: "",
    Z23_ART_09: "",
    Z23_ART_10: "",
    Z23_ART_07: "",
    Z30_MACC_10: "$Z30_MACC_09 + $Z30_MCNT_10",
    Z21_MACC_09: "$Z21_MACC_08 + $Z21_MCNT_09",
    Z30_ART_01: "",
    Z30_ART_02: "",
    Z30_ART_03: "",
    Z30_ART_04: "",
    Z30_ART_05: "",
    Z30_ART_06: "",
    Z30_ART_07: "",
    Z30_ART_08: "",
    Z30_ART_09: "",
    Z30_ART_10: "",
    Z21_MCNT_10: "1",
    Z21_MACC_10: "$Z21_MACC_09 + $Z21_MCNT_10",
    Z21_ART_04: "#DS_ART_BC",
    Z21_ART_05: "#DS_ART_BC",
    Z21_ART_06: "#DS_ART_BC",
    Z21_ART_07: "#DS_ART_BC",
    Z21_ART_08: "#DS_ART_BC",
    Z21_ART_01: "#DS_ART_BC",
    Z21_ART_02: "#DS_ART_BC",
    Z21_ART_03: "#DS_ART_BC",
    Z21_ART_09: "#DS_ART_BC",
    Z21_ART_10: "#DS_ART_BC",
  },
  descriptors: {
    DS_ZF3_BA: [
      {
        action:
          "1:((round(2700/(($ZF3_W-$FI_1_THK*((1-$IS_BI_R))-($IS_BI_R*$ZFR_W))/$ZF3_CNT)))*(($ZF3_W-$FI_1_THK*((1-$IS_BI_R))-($IS_BI_R*$ZFR_W))/$ZF3_CNT)+($IS_BI_R * 50))mm",
        nodenum: 1,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_ZF3_CM: [
      {
        action:
          "1:((round(2700/(($ZF3_W-$FI_1_THK*((1-$IS_BI_R))-($IS_BI_R*$ZFR_W))/$ZF3_CNT)))*(($ZF3_W-$FI_1_THK*((1-$IS_BI_R))-($IS_BI_R*$ZFR_W))/$ZF3_CNT)+($IS_BI_R * 50))mm",
        nodenum: 1,
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
    DS_ZF1_BA: [
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
        action:
          "1:((round(2700/(($ZF1_W-$FI_1_THK*((1-$IS_BI_L))-($IS_BI_L*$ZFL_W))/$ZF1_CNT)))*(($ZF1_W-$FI_1_THK*((1-$IS_BI_L))-($IS_BI_L*$ZFL_W))/$ZF1_CNT))mm",
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
        action:
          "1:((round(2700/(($ZF1_W-$FI_1_THK*((1-$IS_BI_L))-($IS_BI_L*$ZFL_W))/$ZF1_CNT)))*(($ZF1_W-$FI_1_THK*((1-$IS_BI_L))-($IS_BI_L*$ZFL_W))/$ZF1_CNT)+($IS_BI_L * 50))mm",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_ZF1_CM: [
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
        action:
          "1:((round(2700/(($ZF1_W-$FI_1_THK*(1-$IS_BI_L)-($IS_BI_L*$ZFL_W))/$ZF1_CNT)))*(($ZF1_W-$FI_1_THK*((1-$IS_BI_L))-($IS_BI_L*$ZFL_W))/$ZF1_CNT))mm",
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
        action:
          "1:((round(2700/(($ZF1_W-$FI_1_THK*((1-$IS_BI_L))-($IS_BI_L*$ZFL_W))/$ZF1_CNT)))*(($ZF1_W-$FI_1_THK*((1-$IS_BI_L))-($IS_BI_L*$ZFL_W))/$ZF1_CNT)+($IS_BI_L * 50))mm",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_SHAPE_1111_Z23_LV: [
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
        action:
          "((round(2700/(($ZONE_W-$ZF1_W -$ZF3_W)/$ZF23_CNT)-0.5))*(($ZONE_W-$ZF1_W -$ZF3_W)/$ZF23_CNT))mm:1",
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
        action:
          "((round(2700/(($ZONE_W-$ZF1_W -$ZF2_W)/$ZF23_CNT)-0.5))*(($ZONE_W-$ZF1_W -$ZF2_W)/$ZF23_CNT))mm:1",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_Z30_LD_ART_ZONE: [
      {
        action: "$Z30_MCNT_01",
        nodenum: 1,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_01",
              },
            ],
          },
        ],
      },
      {
        action: "1",
        nodenum: 2,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_01 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "$Z30_MCNT_01 : $Z30_MCNT_02",
        nodenum: 3,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_02",
              },
            ],
          },
        ],
      },
      {
        action: "$Z30_MCNT_01 : 1",
        nodenum: 4,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_02 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03",
        nodenum: 5,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_03",
              },
            ],
          },
        ],
      },
      {
        action: "$Z30_MCNT_01 : $Z30_MCNT_02 : 1",
        nodenum: 6,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_03 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03 : $Z30_MCNT_04",
        nodenum: 7,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_04",
              },
            ],
          },
        ],
      },
      {
        action: "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03 : 1",
        nodenum: 8,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_04 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03 : $Z30_MCNT_04 : $Z30_MCNT_05",
        nodenum: 9,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_05",
              },
            ],
          },
        ],
      },
      {
        action: "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03 : $Z30_MCNT_04 : 1",
        nodenum: 10,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_05 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03 : $Z30_MCNT_04 : $Z30_MCNT_05 : $Z30_MCNT_06",
        nodenum: 11,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_06",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03 : $Z30_MCNT_04 : $Z30_MCNT_05 : 1",
        nodenum: 12,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_06 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03 : $Z30_MCNT_04 : $Z30_MCNT_05 : $Z30_MCNT_06 : $Z30_MCNT_07",
        nodenum: 13,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_07",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03 : $Z30_MCNT_04 : $Z30_MCNT_05 : $Z30_MCNT_06 : 1",
        nodenum: 14,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_07 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03 : $Z30_MCNT_04 : $Z30_MCNT_05 : $Z30_MCNT_06 : $Z30_MCNT_07 : $Z30_MCNT_08",
        nodenum: 15,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_08",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03 : $Z30_MCNT_04 : $Z30_MCNT_05 : $Z30_MCNT_06 : $Z30_MCNT_07 : 1",
        nodenum: 16,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_08 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03 : $Z30_MCNT_04 : $Z30_MCNT_05 : $Z30_MCNT_06 : $Z30_MCNT_07 : $Z30_MCNT_08 : $Z30_MCNT_09",
        nodenum: 17,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_09",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03 : $Z30_MCNT_04 : $Z30_MCNT_05 : $Z30_MCNT_06 : $Z30_MCNT_07 : $Z30_MCNT_08 : 1",
        nodenum: 18,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_09 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03 : $Z30_MCNT_04 : $Z30_MCNT_05 : $Z30_MCNT_06 : $Z30_MCNT_07 : $Z30_MCNT_08 : $Z30_MCNT_09 : $Z30_MCNT_10",
        nodenum: 19,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_10",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z30_MCNT_01 : $Z30_MCNT_02 : $Z30_MCNT_03 : $Z30_MCNT_04 : $Z30_MCNT_05 : $Z30_MCNT_06 : $Z30_MCNT_07 : $Z30_MCNT_08 : $Z30_MCNT_09 : 1",
        nodenum: 20,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z30_CNT - $Z30_MACC_10 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 21,
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
    DS_Z10_LD_ART_ZONE: [
      {
        action: "$Z10_MCNT_01",
        nodenum: 1,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_01",
              },
            ],
          },
        ],
      },
      {
        action: "1",
        nodenum: 2,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_01 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "$Z10_MCNT_01 : $Z10_MCNT_02",
        nodenum: 3,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_02",
              },
            ],
          },
        ],
      },
      {
        action: "$Z10_MCNT_01 : 1",
        nodenum: 4,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_02 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03",
        nodenum: 5,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_03",
              },
            ],
          },
        ],
      },
      {
        action: "$Z10_MCNT_01 : $Z10_MCNT_02 : 1",
        nodenum: 6,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_03 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03 : $Z10_MCNT_04",
        nodenum: 7,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_04",
              },
            ],
          },
        ],
      },
      {
        action: "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03 : 1",
        nodenum: 8,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_04 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03 : $Z10_MCNT_04 : $Z10_MCNT_05",
        nodenum: 9,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_05",
              },
            ],
          },
        ],
      },
      {
        action: "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03 : $Z10_MCNT_04 : 1",
        nodenum: 10,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_05 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03 : $Z10_MCNT_04 : $Z10_MCNT_05 : $Z10_MCNT_06",
        nodenum: 11,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_06",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03 : $Z10_MCNT_04 : $Z10_MCNT_05 : 1",
        nodenum: 12,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_06 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03 : $Z10_MCNT_04 : $Z10_MCNT_05 : $Z10_MCNT_06 : $Z10_MCNT_07",
        nodenum: 13,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_07",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03 : $Z10_MCNT_04 : $Z10_MCNT_05 : $Z10_MCNT_06 : 1",
        nodenum: 14,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_07 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03 : $Z10_MCNT_04 : $Z10_MCNT_05 : $Z10_MCNT_06 : $Z10_MCNT_07 : $Z10_MCNT_08",
        nodenum: 15,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_08",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03 : $Z10_MCNT_04 : $Z10_MCNT_05 : $Z10_MCNT_06 : $Z10_MCNT_07 : 1",
        nodenum: 16,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_08 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03 : $Z10_MCNT_04 : $Z10_MCNT_05 : $Z10_MCNT_06 : $Z10_MCNT_07 : $Z10_MCNT_08 : $Z10_MCNT_09",
        nodenum: 17,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_09",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03 : $Z10_MCNT_04 : $Z10_MCNT_05 : $Z10_MCNT_06 : $Z10_MCNT_07 : $Z10_MCNT_08 : 1",
        nodenum: 18,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_09 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03 : $Z10_MCNT_04 : $Z10_MCNT_05 : $Z10_MCNT_06 : $Z10_MCNT_07 : $Z10_MCNT_08 : $Z10_MCNT_09 : $Z10_MCNT_10",
        nodenum: 19,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_10",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z10_MCNT_01 : $Z10_MCNT_02 : $Z10_MCNT_03 : $Z10_MCNT_04 : $Z10_MCNT_05 : $Z10_MCNT_06 : $Z10_MCNT_07 : $Z10_MCNT_08 : $Z10_MCNT_09 : 1",
        nodenum: 20,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z10_CNT - $Z10_MACC_10 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 21,
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
    DS_SHAPE_1111_Z23_CM: [
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
        action:
          "((round(2700/(($ZONE_W-$ZF1_W -$ZF3_W)/$ZF23_CNT)))*(($ZONE_W-$ZF1_W -$ZF3_W)/$ZF23_CNT))mm:1",
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
        action:
          "((round(2700/(($ZONE_W-$ZF1_W -$ZF3_W)/$ZF23_CNT)))*(($ZONE_W-$ZF1_W -$ZF3_W)/$ZF23_CNT))mm:1",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_Z23_LD_ART_ZONE: [
      {
        action: "$Z23_MCNT_01",
        nodenum: 1,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_01",
              },
            ],
          },
        ],
      },
      {
        action: "1",
        nodenum: 2,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_01 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "$Z23_MCNT_01 : $Z23_MCNT_02",
        nodenum: 3,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_02",
              },
            ],
          },
        ],
      },
      {
        action: "$Z23_MCNT_01 : 1",
        nodenum: 4,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_02 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03",
        nodenum: 5,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_03",
              },
            ],
          },
        ],
      },
      {
        action: "$Z23_MCNT_01 : $Z23_MCNT_02 : 1",
        nodenum: 6,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_03 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03 : $Z23_MCNT_04",
        nodenum: 7,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_04",
              },
            ],
          },
        ],
      },
      {
        action: "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03 : 1",
        nodenum: 8,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_04 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03 : $Z23_MCNT_04 : $Z23_MCNT_05",
        nodenum: 9,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_05",
              },
            ],
          },
        ],
      },
      {
        action: "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03 : $Z23_MCNT_04 : 1",
        nodenum: 10,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_05 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03 : $Z23_MCNT_04 : $Z23_MCNT_05 : $Z23_MCNT_06",
        nodenum: 11,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_06",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03 : $Z23_MCNT_04 : $Z23_MCNT_05 : 1",
        nodenum: 12,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_06 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03 : $Z23_MCNT_04 : $Z23_MCNT_05 : $Z23_MCNT_06 : $Z23_MCNT_07",
        nodenum: 13,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_07",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03 : $Z23_MCNT_04 : $Z23_MCNT_05 : $Z23_MCNT_06 : 1",
        nodenum: 14,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_07 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03 : $Z23_MCNT_04 : $Z23_MCNT_05 : $Z23_MCNT_06 : $Z23_MCNT_07 : $Z23_MCNT_08",
        nodenum: 15,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_08",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03 : $Z23_MCNT_04 : $Z23_MCNT_05 : $Z23_MCNT_06 : $Z23_MCNT_07 : 1",
        nodenum: 16,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_08 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03 : $Z23_MCNT_04 : $Z23_MCNT_05 : $Z23_MCNT_06 : $Z23_MCNT_07 : $Z23_MCNT_08 : $Z23_MCNT_09",
        nodenum: 17,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_09",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03 : $Z23_MCNT_04 : $Z23_MCNT_05 : $Z23_MCNT_06 : $Z23_MCNT_07 : $Z23_MCNT_08 : 1",
        nodenum: 18,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_09 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03 : $Z23_MCNT_04 : $Z23_MCNT_05 : $Z23_MCNT_06 : $Z23_MCNT_07 : $Z23_MCNT_08 : $Z23_MCNT_09 : $Z23_MCNT_10",
        nodenum: 19,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_10",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z23_MCNT_01 : $Z23_MCNT_02 : $Z23_MCNT_03 : $Z23_MCNT_04 : $Z23_MCNT_05 : $Z23_MCNT_06 : $Z23_MCNT_07 : $Z23_MCNT_08 : $Z23_MCNT_09 : 1",
        nodenum: 20,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z23_CNT - $Z23_MACC_10 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 21,
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
    DS_SHAPE_1111_Z21_WS: [
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
        action:
          "((round(2700/(($ZONE_W-$ZF1_W-$ZF3_W)/$ZF21_CNT)))*(($ZONE_W-$ZF1_W -$ZF3_W)/$ZF21_CNT))mm:1",
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
        action:
          "((round(2700/(($ZONE_W-$ZF1_W-$ZF3_W)/$ZF21_CNT)-0.5))*(($ZONE_W-$ZF1_W -$ZF3_W)/$ZF21_CNT))mm:1",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_SHAPE_1111_Z21_BA: [
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
        action:
          "((round(2700/(($ZONE_W-$ZF1_W-$ZF3_W)/$ZF21_CNT)))*(($ZONE_W-$ZF1_W -$ZF3_W)/$ZF21_CNT))mm:1",
        nodenum: 2,
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
        action:
          "((round(2700/(($ZONE_W-$ZF1_W-$ZF2_W)/$ZF21_CNT)-0.5))*(($ZONE_W-$ZF1_W -$ZF2_W)/$ZF21_CNT))mm:1",
        nodenum: 3,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_Z21_LD_ART_ZONE: [
      {
        action: "$Z21_MCNT_01",
        nodenum: 1,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_01",
              },
            ],
          },
        ],
      },
      {
        action: "1",
        nodenum: 2,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_01 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "$Z21_MCNT_01 : $Z21_MCNT_02",
        nodenum: 3,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_02",
              },
            ],
          },
        ],
      },
      {
        action: "$Z21_MCNT_01 : 1",
        nodenum: 4,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_02 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03",
        nodenum: 5,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_03",
              },
            ],
          },
        ],
      },
      {
        action: "$Z21_MCNT_01 : $Z21_MCNT_02 : 1",
        nodenum: 6,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_03 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03 : $Z21_MCNT_04",
        nodenum: 7,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_04",
              },
            ],
          },
        ],
      },
      {
        action: "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03 : 1",
        nodenum: 8,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_04 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03 : $Z21_MCNT_04 : $Z21_MCNT_05",
        nodenum: 9,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_05",
              },
            ],
          },
        ],
      },
      {
        action: "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03 : $Z21_MCNT_04 : 1",
        nodenum: 10,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_05 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03 : $Z21_MCNT_04 : $Z21_MCNT_05 : $Z21_MCNT_06",
        nodenum: 11,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_06",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03 : $Z21_MCNT_04 : $Z21_MCNT_05 : 1",
        nodenum: 12,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_06 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03 : $Z21_MCNT_04 : $Z21_MCNT_05 : $Z21_MCNT_06 : $Z21_MCNT_07",
        nodenum: 13,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_07",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03 : $Z21_MCNT_04 : $Z21_MCNT_05 : $Z21_MCNT_06 : 1",
        nodenum: 14,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_07 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03 : $Z21_MCNT_04 : $Z21_MCNT_05 : $Z21_MCNT_06 : $Z21_MCNT_07 : $Z21_MCNT_08",
        nodenum: 15,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_08",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03 : $Z21_MCNT_04 : $Z21_MCNT_05 : $Z21_MCNT_06 : $Z21_MCNT_07 : 1",
        nodenum: 16,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_08 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03 : $Z21_MCNT_04 : $Z21_MCNT_05 : $Z21_MCNT_06 : $Z21_MCNT_07 : $Z21_MCNT_08 : $Z21_MCNT_09",
        nodenum: 17,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_09",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03 : $Z21_MCNT_04 : $Z21_MCNT_05 : $Z21_MCNT_06 : $Z21_MCNT_07 : $Z21_MCNT_08 : 1",
        nodenum: 18,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_09 + 1",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03 : $Z21_MCNT_04 : $Z21_MCNT_05 : $Z21_MCNT_06 : $Z21_MCNT_07 : $Z21_MCNT_08 : $Z21_MCNT_09 : $Z21_MCNT_10",
        nodenum: 19,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_10",
              },
            ],
          },
        ],
      },
      {
        action:
          "$Z21_MCNT_01 : $Z21_MCNT_02 : $Z21_MCNT_03 : $Z21_MCNT_04 : $Z21_MCNT_05 : $Z21_MCNT_06 : $Z21_MCNT_07 : $Z21_MCNT_08 : $Z21_MCNT_09 : 1",
        nodenum: 20,
        roles: [
          {
            roles: [
              {
                leftValue: "0",
                comparison: "=",
                rightValue: "$Z21_CNT - $Z21_MACC_10 + 1",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 21,
        roles: [
          {
            roles: [],
          },
        ],
      },
    ],
    DS_ART_BC: [
      {
        action: "BC_4xDR1",
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
              {
                leftValue: "AD zone info02",
                comparison: "=",
                rightValue: "DR",
              },
              {
                leftValue: "AD zone info03",
                comparison: "=",
                rightValue: "1",
              },
              {
                leftValue: "AD zone info04",
                comparison: "=",
                rightValue: "1",
              },
            ],
          },
        ],
      },
      {
        action: "BC_DR1_DR3",
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
              {
                leftValue: "AD zone info02",
                comparison: "=",
                rightValue: "DR",
              },
              {
                leftValue: "AD zone info03",
                comparison: "=",
                rightValue: "1",
              },
              {
                leftValue: "AD zone info04",
                comparison: "=",
                rightValue: "1",
              },
            ],
          },
        ],
      },
      {
        action: "BC_DR2_2xDR1",
        nodenum: 3,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "1",
              },
              {
                leftValue: "AD zone info02",
                comparison: "=",
                rightValue: "DR",
              },
              {
                leftValue: "AD zone info03",
                comparison: "=",
                rightValue: "1",
              },
              {
                leftValue: "AD zone info04",
                comparison: "=",
                rightValue: "1",
              },
            ],
          },
        ],
      },
      {
        action: "BC_DR1_DR2_DR1",
        nodenum: 4,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "1",
              },
              {
                leftValue: "AD zone info02",
                comparison: "=",
                rightValue: "DR",
              },
              {
                leftValue: "AD zone info03",
                comparison: "=",
                rightValue: "1",
              },
              {
                leftValue: "AD zone info04",
                comparison: "=",
                rightValue: "1",
              },
            ],
          },
        ],
      },
      {
        action: "BC_SD",
        nodenum: 5,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "1",
              },
              {
                leftValue: "AD zone info02",
                comparison: "=",
                rightValue: "DR",
              },
              {
                leftValue: "AD zone info03",
                comparison: "=",
                rightValue: "0",
              },
            ],
          },
        ],
      },
      {
        action: "BC_DD",
        nodenum: 6,
        roles: [
          {
            operator: "AND",
            roles: [
              {
                leftValue: "AD zone info01",
                comparison: "=",
                rightValue: "1",
              },
              {
                leftValue: "AD zone info02",
                comparison: "=",
                rightValue: "DR",
              },
              {
                leftValue: "AD zone info03",
                comparison: "=",
                rightValue: "0",
              },
            ],
          },
        ],
      },
      {
        action: "",
        nodenum: 7,
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
    divDir: "H",
    linDiv: "$Z10_W mm:1:$Z30_W mm",
    divElem: 0,
    horDefType: "W",
    top: null,
    bottom: null,
    divider: null,
    children: [
      {
        name: "Article Designer Group",
        index: "0.0",
        divDir: "H",
        linDiv: "1:$Z10_D mm",
        divElem: 0,
        horDefType: "D",
        top: null,
        bottom: null,
        divider: null,
        children: [
          {
            name: "wasted",
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
              "1": null,
              "2": null,
              "3": null,
            },
          },
          {
            name: "Z10_SELECTABLE_0",
            index: "0.0.1",
            divDir: "H",
            linDiv: "($FI_1_THK*(1-$IS_BI_L))mm:1",
            divElem: 0,
            horDefType: "P",
            top: null,
            bottom: null,
            divider: null,
            children: [
              {
                name: "Article Designer Group",
                grtx: {
                  "AD zone info01": "$IS_BI_L",
                },
                index: "0.0.1.0",
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
                index: "0.0.1.1",
                divDir: "V",
                linDiv: "$BASE_HEIGHT mm:1:($IS_ZF1_BI_T*$CROWN_HEIGHT )mm",
                divElem: 0,
                horDefType: "W",
                top: null,
                bottom: null,
                divider: null,
                children: [
                  {
                    name: "Base",
                    index: "0.0.1.1.0",
                    divDir: "H",
                    linDiv: "#DS_ZF1_BA",
                    divElem: 0,
                    horDefType: "W",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "Article Designer Group",
                        index: "0.0.1.1.0.0",
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
                        index: "0.0.1.1.0.1",
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
                    index: "0.0.1.1.1",
                    divDir: "H",
                    linDiv: "($IS_BI_L*$ZFL_W)mm:1",
                    divElem: 0,
                    horDefType: "W",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "filler width",
                        grtx: {
                          "AD zone info01": "$IS_BI_L",
                        },
                        index: "0.0.1.1.1.0",
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
                            cpName: "#DS_ZFL_FR",
                          },
                          "1": null,
                          "2": null,
                          "3": null,
                        },
                      },
                      {
                        name: "Article Designer Group",
                        index: "0.0.1.1.1.1",
                        divDir: "H",
                        linDiv: "#DS_Z10_LD_ART_ZONE",
                        divElem: 0,
                        horDefType: "W",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "Z10_ART_ZONE_01",
                            index: "0.0.1.1.1.1.0",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z10_ART_01",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z10_ART_ZONE_02",
                            index: "0.0.1.1.1.1.1",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z10_ART_02",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z10_ART_ZONE_03",
                            index: "0.0.1.1.1.1.2",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z10_ART_03",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z10_ART_ZONE_04",
                            index: "0.0.1.1.1.1.3",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z10_ART_04",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z10_ART_ZONE_05",
                            index: "0.0.1.1.1.1.4",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z10_ART_05",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z10_ART_ZONE_06",
                            index: "0.0.1.1.1.1.5",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z10_ART_06",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z10_ART_ZONE_07",
                            index: "0.0.1.1.1.1.6",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z10_ART_07",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z10_ART_ZONE_08",
                            index: "0.0.1.1.1.1.7",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z10_ART_08",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z10_ART_ZONE_09",
                            index: "0.0.1.1.1.1.8",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z10_ART_09",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z10_ART_ZONE_10",
                            index: "0.0.1.1.1.1.9",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z10_ART_10",
                            children: [],
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
                    index: "0.0.1.1.2",
                    divDir: "H",
                    linDiv: "#DS_ZF1_CM",
                    divElem: 0,
                    horDefType: "W",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "Article Designer Group",
                        grtx: {
                          "AD zone info01": "$IS_ZF1_BI_T",
                        },
                        index: "0.0.1.1.2.0",
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
                          "AD zone info01": "$IS_ZF1_BI_T",
                        },
                        index: "0.0.1.1.2.1",
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
                          "1": {
                            inSet: 0,
                            inSetFor: "",
                            partType: "S",
                            cpName: "#DS_ZF_CM",
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
        linDiv: "$Z21_H mm:1",
        divElem: 0,
        horDefType: "P",
        top: null,
        bottom: null,
        divider: null,
        children: [
          {
            name: "Z21_SELECTABLE_0",
            index: "0.1.0",
            divDir: "H",
            linDiv: "1:$Z21_D mm",
            divElem: 0,
            horDefType: "D",
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
                  "0": null,
                  "1": null,
                  "2": null,
                  "3": null,
                },
              },
              {
                name: "Article Designer Group",
                index: "0.1.0.1",
                divDir: "V",
                linDiv: "1:$WS_1_THK mm",
                divElem: 0,
                horDefType: "P",
                top: null,
                bottom: null,
                divider: null,
                children: [
                  {
                    name: "Article Designer Group",
                    index: "0.1.0.1.0",
                    divDir: "V",
                    linDiv: "$BASE_HEIGHT mm:1",
                    divElem: 0,
                    horDefType: "P",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "Base_ZF21",
                        index: "0.1.0.1.0.0",
                        divDir: "H",
                        linDiv: "#DS_SHAPE_1111_Z21_BA",
                        divElem: 0,
                        horDefType: "W",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "Article Designer Group",
                            index: "0.1.0.1.0.0.0",
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
                            index: "0.1.0.1.0.0.1",
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
                        name: "Z21",
                        index: "0.1.0.1.0.1",
                        divDir: "H",
                        linDiv: "#DS_Z21_LD_ART_ZONE",
                        divElem: 0,
                        horDefType: "W",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "Z21_ART_ZONE_01",
                            index: "0.1.0.1.0.1.0",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z21_ART_01",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z21_ART_ZONE_02",
                            index: "0.1.0.1.0.1.1",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z21_ART_02",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z21_ART_ZONE_03",
                            index: "0.1.0.1.0.1.2",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z21_ART_03",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z21_ART_ZONE_04",
                            index: "0.1.0.1.0.1.3",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z21_ART_04",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z21_ART_ZONE_05",
                            index: "0.1.0.1.0.1.4",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z21_ART_05",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z21_ART_ZONE_06",
                            index: "0.1.0.1.0.1.5",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z21_ART_06",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z21_ART_ZONE_07",
                            index: "0.1.0.1.0.1.6",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z21_ART_07",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z21_ART_ZONE_08",
                            index: "0.1.0.1.0.1.7",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z21_ART_08",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z21_ART_ZONE_09",
                            index: "0.1.0.1.0.1.8",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z21_ART_09",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z21_ART_ZONE_10",
                            index: "0.1.0.1.0.1.9",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z21_ART_10",
                            children: [],
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
                    index: "0.1.0.1.1",
                    divDir: "H",
                    linDiv: "#DS_SHAPE_1111_Z21_WS",
                    divElem: 0,
                    horDefType: "W",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "Article Designer Group",
                        index: "0.1.0.1.1.0",
                        divDir: "V",
                        linDiv: "",
                        divElem: 0,
                        horDefType: "P",
                        top: "CP_1_WS_1000_C1",
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
                        index: "0.1.0.1.1.1",
                        divDir: "V",
                        linDiv: "",
                        divElem: 0,
                        horDefType: "P",
                        top: "CP_1_WS_1000_C1",
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
            name: "Rest",
            index: "0.1.1",
            divDir: "V",
            linDiv: "1:$CROWN_HEIGHT mm",
            divElem: 0,
            horDefType: "P",
            top: null,
            bottom: null,
            divider: null,
            children: [
              {
                name: "Rest",
                index: "0.1.1.0",
                divDir: "H",
                linDiv: "1:$Z21_D mm",
                divElem: 0,
                horDefType: "D",
                top: null,
                bottom: null,
                divider: null,
                children: [
                  {
                    name: "Article Designer Group",
                    index: "0.1.1.0.0",
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
                    name: "Rest",
                    index: "0.1.1.0.1",
                    divDir: "V",
                    linDiv: "1:$Z23_H mm",
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
                        name: "Z23_SELECTABLE_0",
                        index: "0.1.1.0.1.1",
                        divDir: "H",
                        linDiv: "1:$Z23_D mm",
                        divElem: 0,
                        horDefType: "D",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "wasted",
                            index: "0.1.1.0.1.1.0",
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
                            index: "0.1.1.0.1.1.1",
                            divDir: "V",
                            linDiv: "($LV_1_THK) mm :1",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: null,
                            children: [
                              {
                                name: "Article Designer Group",
                                index: "0.1.1.0.1.1.1.0",
                                divDir: "H",
                                linDiv: "#DS_SHAPE_1111_Z23_LV",
                                divElem: 0,
                                horDefType: "W",
                                top: null,
                                bottom: null,
                                divider: null,
                                children: [
                                  {
                                    name: "Article Designer Group",
                                    index: "0.1.1.0.1.1.1.0.0",
                                    divDir: "V",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: "CP_1_LV_1000_NC",
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
                                    index: "0.1.1.0.1.1.1.0.1",
                                    divDir: "V",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: "CP_1_LV_1000_NC",
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
                                name: "Z23",
                                index: "0.1.1.0.1.1.1.1",
                                divDir: "H",
                                linDiv: "#DS_Z23_LD_ART_ZONE",
                                divElem: 0,
                                horDefType: "W",
                                top: null,
                                bottom: null,
                                divider: null,
                                children: [
                                  {
                                    name: "Z23_ART_ZONE_01",
                                    index: "0.1.1.0.1.1.1.1.0",
                                    divDir: "A",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: "$Z23_ART_01",
                                    children: [],
                                    selectable: true,
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                  {
                                    name: "Z23_ART_ZONE_02",
                                    index: "0.1.1.0.1.1.1.1.1",
                                    divDir: "A",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: "$Z23_ART_02",
                                    children: [],
                                    selectable: true,
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                  {
                                    name: "Z23_ART_ZONE_03",
                                    index: "0.1.1.0.1.1.1.1.2",
                                    divDir: "A",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: "$Z23_ART_03",
                                    children: [],
                                    selectable: true,
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                  {
                                    name: "Z23_ART_ZONE_04",
                                    index: "0.1.1.0.1.1.1.1.3",
                                    divDir: "A",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: "$Z23_ART_04",
                                    children: [],
                                    selectable: true,
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                  {
                                    name: "Z23_ART_ZONE_05",
                                    index: "0.1.1.0.1.1.1.1.4",
                                    divDir: "A",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: "$Z23_ART_05",
                                    children: [],
                                    selectable: true,
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                  {
                                    name: "Z23_ART_ZONE_06",
                                    index: "0.1.1.0.1.1.1.1.5",
                                    divDir: "A",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: "$Z23_ART_06",
                                    children: [],
                                    selectable: true,
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                  {
                                    name: "Z23_ART_ZONE_07",
                                    index: "0.1.1.0.1.1.1.1.6",
                                    divDir: "A",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: "$Z23_ART_07",
                                    children: [],
                                    selectable: true,
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                  {
                                    name: "Z23_ART_ZONE_08",
                                    index: "0.1.1.0.1.1.1.1.7",
                                    divDir: "A",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: "$Z23_ART_08",
                                    children: [],
                                    selectable: true,
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                  {
                                    name: "Z23_ART_ZONE_09",
                                    index: "0.1.1.0.1.1.1.1.8",
                                    divDir: "A",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: "$Z23_ART_09",
                                    children: [],
                                    selectable: true,
                                    sides: {
                                      "0": null,
                                      "1": null,
                                      "2": null,
                                      "3": null,
                                    },
                                  },
                                  {
                                    name: "Z23_ART_ZONE_10",
                                    index: "0.1.1.0.1.1.1.1.9",
                                    divDir: "A",
                                    linDiv: "",
                                    divElem: 0,
                                    horDefType: "P",
                                    top: null,
                                    bottom: null,
                                    divider: "$Z23_ART_10",
                                    children: [],
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
                    ],
                    sides: {
                      "0": null,
                      "1": {
                        inSet: 0,
                        inSetFor: "",
                        partType: "S",
                        cpName: "CP_1_FI_1000",
                      },
                      "2": null,
                      "3": {
                        inSet: 0,
                        inSetFor: "",
                        partType: "S",
                        cpName: "CP_1_FI_1000",
                      },
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
                linDiv: "1:$ZF23_D mm",
                divElem: 0,
                horDefType: "D",
                top: null,
                bottom: null,
                divider: null,
                children: [
                  {
                    name: "Article Designer Group",
                    index: "0.1.1.1.0",
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
                    name: "Crown",
                    index: "0.1.1.1.1",
                    divDir: "H",
                    linDiv: "#DS_SHAPE_1111_Z23_CM",
                    divElem: 0,
                    horDefType: "W",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "Article Designer Group",
                        grtx: {
                          "AD zone info01": "$IS_ZF23_BI_T",
                        },
                        index: "0.1.1.1.1.0",
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
                          "AD zone info01": "$IS_ZF23_BI_T",
                        },
                        index: "0.1.1.1.1.1",
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
            name: "ZF23",
            index: "0.1.2",
            divDir: "H",
            linDiv: "$ZF23_D mm:1",
            divElem: 0,
            horDefType: "D",
            top: null,
            bottom: null,
            divider: null,
            children: [
              {
                name: "Article Designer Group",
                index: "0.1.2.0",
                divDir: "V",
                linDiv: "$LV_1_THK mm :1",
                divElem: 0,
                horDefType: "P",
                top: null,
                bottom: null,
                divider: null,
                children: [
                  {
                    name: "Article Designer Group",
                    index: "0.1.2.0.0",
                    divDir: "H",
                    linDiv: "#DS_SHAPE_1111_Z23_LV",
                    divElem: 0,
                    horDefType: "W",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "Article Designer Group",
                        index: "0.1.2.0.0.0",
                        divDir: "V",
                        linDiv: "",
                        divElem: 0,
                        horDefType: "P",
                        top: "CP_1_LV_1000_NC",
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
                        index: "0.1.2.0.0.1",
                        divDir: "V",
                        linDiv: "",
                        divElem: 0,
                        horDefType: "P",
                        top: "CP_1_LV_1000_NC",
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
                    index: "0.1.2.0.1",
                    divDir: "V",
                    linDiv: "1:($IS_ZF23_BI_T *$CROWN_HEIGHT)mm",
                    divElem: 0,
                    horDefType: "P",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "ZF23",
                        index: "0.1.2.0.1.0",
                        divDir: "H",
                        linDiv:
                          "($ZF23_CNT_01 * (($ZONE_W - $ZF1_W mm - $ZF3_W)/ $ZF23_CNT)) mm:1",
                        divElem: 0,
                        horDefType: "W",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "Article Designer Group",
                            index: "0.1.2.0.1.0.0",
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
                            index: "0.1.2.0.1.0.1",
                            divDir: "H",
                            linDiv:
                              "($ZF23_CNT_02 * (($ZONE_W - $ZF1_W mm - $ZF3_W)/ $ZF23_CNT)) mm:1",
                            divElem: 0,
                            horDefType: "W",
                            top: null,
                            bottom: null,
                            divider: null,
                            children: [
                              {
                                name: "Article Designer Group",
                                index: "0.1.2.0.1.0.1.0",
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
                                index: "0.1.2.0.1.0.1.1",
                                divDir: "H",
                                linDiv:
                                  "($ZF23_CNT_03 * (($ZONE_W - $ZF1_W mm - $ZF3_W)/ $ZF23_CNT)) mm:1",
                                divElem: 0,
                                horDefType: "W",
                                top: null,
                                bottom: null,
                                divider: null,
                                children: [
                                  {
                                    name: "Article Designer Group",
                                    index: "0.1.2.0.1.0.1.1.0",
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
                                    index: "0.1.2.0.1.0.1.1.1",
                                    divDir: "H",
                                    linDiv:
                                      "($ZF23_CNT_04 * (($ZONE_W - $ZF1_W mm - $ZF3_W)/ $ZF23_CNT)) mm:1",
                                    divElem: 0,
                                    horDefType: "W",
                                    top: null,
                                    bottom: null,
                                    divider: null,
                                    children: [
                                      {
                                        name: "Article Designer Group",
                                        index: "0.1.2.0.1.0.1.1.1.0",
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
                                        index: "0.1.2.0.1.0.1.1.1.1",
                                        divDir: "H",
                                        linDiv:
                                          "($ZF23_CNT_05 * (($ZONE_W - $ZF1_W mm - $ZF3_W)/ $ZF23_CNT)) mm:1",
                                        divElem: 0,
                                        horDefType: "W",
                                        top: null,
                                        bottom: null,
                                        divider: null,
                                        children: [
                                          {
                                            name: "Article Designer Group",
                                            index: "0.1.2.0.1.0.1.1.1.1.0",
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
                                            index: "0.1.2.0.1.0.1.1.1.1.1",
                                            divDir: "H",
                                            linDiv:
                                              "($ZF23_CNT_06 * (($ZONE_W - $ZF1_W mm - $ZF3_W)/ $ZF23_CNT)) mm:1",
                                            divElem: 0,
                                            horDefType: "W",
                                            top: null,
                                            bottom: null,
                                            divider: null,
                                            children: [
                                              {
                                                name: "Article Designer Group",
                                                index:
                                                  "0.1.2.0.1.0.1.1.1.1.1.0",
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
                                                  "0.1.2.0.1.0.1.1.1.1.1.1",
                                                divDir: "H",
                                                linDiv:
                                                  "($ZF23_CNT_07 * (($ZONE_W - $ZF1_W mm - $ZF3_W)/ $ZF23_CNT)) mm:1",
                                                divElem: 0,
                                                horDefType: "W",
                                                top: null,
                                                bottom: null,
                                                divider: null,
                                                children: [
                                                  {
                                                    name: "Article Designer Group",
                                                    index:
                                                      "0.1.2.0.1.0.1.1.1.1.1.1.0",
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
                                                      "0.1.2.0.1.0.1.1.1.1.1.1.1",
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
                        name: "Crown",
                        index: "0.1.2.0.1.1",
                        divDir: "H",
                        linDiv: "#DS_SHAPE_1111_Z23_CM",
                        divElem: 0,
                        horDefType: "W",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "Article Designer Group",
                            index: "0.1.2.0.1.1.0",
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
                            index: "0.1.2.0.1.1.1",
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
                name: "wasted",
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
        index: "0.2",
        divDir: "H",
        linDiv: "1: $Z30_D mm",
        divElem: 0,
        horDefType: "D",
        top: null,
        bottom: null,
        divider: null,
        children: [
          {
            name: "Article Designer Group",
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
              "1": null,
              "2": null,
              "3": null,
            },
          },
          {
            name: "Z30_SELECTABLE_0",
            index: "0.2.1",
            divDir: "H",
            linDiv: "1:($FI_1_THK*(1-$IS_BI_R))mm",
            divElem: 0,
            horDefType: "W",
            top: null,
            bottom: null,
            divider: null,
            children: [
              {
                name: "Article Designer Group",
                index: "0.2.1.0",
                divDir: "V",
                linDiv: "$BASE_HEIGHT mm:1:($IS_ZF3_BI_T*$CROWN_HEIGHT)mm",
                divElem: 0,
                horDefType: "P",
                top: null,
                bottom: null,
                divider: null,
                children: [
                  {
                    name: "Base",
                    index: "0.2.1.0.0",
                    divDir: "H",
                    linDiv: "#DS_ZF3_BA",
                    divElem: 0,
                    horDefType: "W",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "Article Designer Group",
                        index: "0.2.1.0.0.0",
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
                        index: "0.2.1.0.0.1",
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
                    index: "0.2.1.0.1",
                    divDir: "H",
                    linDiv: "1:($IS_BI_R*$ZFR_W)mm",
                    divElem: 0,
                    horDefType: "W",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "ZF3",
                        index: "0.2.1.0.1.0",
                        divDir: "H",
                        linDiv: "#DS_Z30_LD_ART_ZONE",
                        divElem: 0,
                        horDefType: "W",
                        top: null,
                        bottom: null,
                        divider: null,
                        children: [
                          {
                            name: "Z30_ART_ZONE_01",
                            index: "0.2.1.0.1.0.0",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z30_ART_01",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z30_ART_ZONE_02",
                            index: "0.2.1.0.1.0.1",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z30_ART_02",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z30_ART_ZONE_03",
                            index: "0.2.1.0.1.0.2",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z30_ART_03",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z30_ART_ZONE_04",
                            index: "0.2.1.0.1.0.3",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z30_ART_04",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z30_ART_ZONE_05",
                            index: "0.2.1.0.1.0.4",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z30_ART_05",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z30_ART_ZONE_06",
                            index: "0.2.1.0.1.0.5",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z30_ART_06",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z30_ART_ZONE_07",
                            index: "0.2.1.0.1.0.6",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z30_ART_07",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z30_ART_ZONE_08",
                            index: "0.2.1.0.1.0.7",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z30_ART_08",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z30_ART_ZONE_09",
                            index: "0.2.1.0.1.0.8",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z30_ART_09",
                            children: [],
                            selectable: true,
                            sides: {
                              "0": null,
                              "1": null,
                              "2": null,
                              "3": null,
                            },
                          },
                          {
                            name: "Z30_ART_ZONE_10",
                            index: "0.2.1.0.1.0.9",
                            divDir: "A",
                            linDiv: "",
                            divElem: 0,
                            horDefType: "P",
                            top: null,
                            bottom: null,
                            divider: "$Z30_ART_10",
                            children: [],
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
                        name: "Filler width",
                        grtx: {
                          "AD zone info01": "$IS_BI_R",
                        },
                        index: "0.2.1.0.1.1",
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
                    index: "0.2.1.0.2",
                    divDir: "H",
                    linDiv: "#DS_ZF3_CM",
                    divElem: 0,
                    horDefType: "W",
                    top: null,
                    bottom: null,
                    divider: null,
                    children: [
                      {
                        name: "Article Designer Group",
                        grtx: {
                          "AD zone info01": "$IS_ZF3_BI_T",
                        },
                        index: "0.2.1.0.2.0",
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
                          "3": {
                            inSet: 0,
                            inSetFor: "",
                            partType: "S",
                            cpName: "#DS_ZF_CM",
                          },
                        },
                      },
                      {
                        name: "Article Designer Group",
                        grtx: {
                          "AD zone info01": "$IS_ZF3_BI_T",
                        },
                        index: "0.2.1.0.2.1",
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
                  "AD zone info01": "$IS_BI_R",
                },
                index: "0.2.1.1",
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
