// colors.ts

const white = '#ffffff';
const success = '#33BC41';
const lightGrey = '#bcbcbc';
const mediumGrey = '#979797';
const red = '#da3d3d';
const lightOrange = '#F09E11';
const electricPurple = '#bf00ff';
const lightOliveGreen = '#b1d73c';
const deepCerise = '#cb2b86';
const whiteSmoke = '#F5F5F5';
const black = '#000000';
const grey = '#808080';
const darkGrey = '#224242';
const lightBlack = '#3E3E3E';
const lightWhite = '#F9F9F9';
const lightSkyBlue = '#E6F5F2';
const lightBlackGrey = 'rgba(0, 0, 0, 0.2)';
const lightBlackShadowColor = 'rgba(0, 0, 0, 0.1)';

interface DashboardColors {
  darkGreen: string;
  lightGreen: string;
  lightOrage: string;
  darkOrange: string;
  lightPurple: string;
  darkPurple: string;
  darkGreenParot: string;
  lightGreenParot: string;
  darkRed: string;
  lightRed: string;
  dimPurple: string;
  dimDarkPurple: string;
  dimBlue: string;
  darkBlue: string;
  dimGreen: string;
  DarkDimGreen: string;
}

interface ChartColors {
  lightGreen: string;
  darkBrown: string;
  lightOrange: string;
  deepCerise: string;
  electricPurple: string;
  lightOliveGreen: string;
}

interface BackgroundColors {
  primary: string;
  secondary: string;
}

interface TextColors {
  primary: string;
  secondary: string;
  light: string;
  dark: string;
  darkBrown: string;
}

interface ToastColors {
  success: string;
  error: string;
  successBorder: string;
  errorBorder: string;
  [key: string]: string; // Index signature for dynamic access
}

interface PopupDialogColors {
  success: string;
  warning: string;
  borderColor: string;
}

interface Colors {
  lightGrey: string;
  darkGrey: string;
  lightBlack: string;
  lightWhite: string;
  lightBlackGrey: string;
  lightBlackShadowColor: string;
  lightSkyBlue: string;
  mediumGrey: string;
  darkPurple: string;
  lightGreen: string;
  primary: string;
  receiverColor: string;
  senderColor: string;
  dividerColor: string;
  subHeadingColor: string;
  secondary: string;
  light: string;
  borderColorBlack: string;
  borderColorGray: string;
  white: string;
  red: string;
  lightOrange: string;
  success: string;
  electricPurple: string;
  lightOliveGreen: string;
  deepCerise: string;
  whiteSmoke: string;
  black: string;
  grey: string;
  shadyGreen: string;
  dashboard: DashboardColors;
  chartsColors: ChartColors;
  borderColor: string;
  borderColorLight: string;
  background: BackgroundColors;
  textColor: TextColors;
  toastColors: ToastColors;
  popupDialogColors: PopupDialogColors;
}

export const colors: Colors = {
  lightGrey,
  darkGrey,
  lightBlack,
  lightWhite,
  lightBlackGrey,
  lightBlackShadowColor,
  lightSkyBlue,
  mediumGrey,
  darkPurple: '#061E64',
  lightGreen: '#EBF5F3',
  primary: '#30B19A',
  receiverColor: '#EBF5F3',
  senderColor: '#f5f5f5',
  dividerColor: '#e0e0e0',
  subHeadingColor: '#eeeeee',
  secondary: '#515151',
  light: '#E6DCFA',
  borderColorBlack: '#DEDEDE',
  borderColorGray: '#EDEDED',
  white,
  red,
  lightOrange,
  success,
  electricPurple,
  lightOliveGreen,
  deepCerise,
  whiteSmoke,
  black,
  grey,
  shadyGreen: '#DEF2EF',
  dashboard: {
    darkGreen: '#30B19A',
    lightGreen: '#E1FFFA',
    lightOrage: '#FFF4DE',
    darkOrange: '#FE947A',
    lightPurple: '#FBFBFB',
    darkPurple: '#BF82FF',
    darkGreenParot: '#18CA74',
    lightGreenParot: '#E6FBDE',
    darkRed: '#F52929',
    lightRed: '#FFF7F0',
    dimPurple: '#FFEDFB',
    dimDarkPurple: '#BE0896',
    dimBlue: '#EEEFFF',
    darkBlue: '#0F17C9',
    dimGreen: '#EAFEFF',
    DarkDimGreen: '#049CA5',
  },
  chartsColors: {
    lightGreen: '#2BCB70',
    darkBrown: '#515151',
    lightOrange,
    deepCerise: '#cb2b86',
    electricPurple: '#bf00ff',
    lightOliveGreen: '#b1d73c',
  },
  borderColor: '#828282',
  borderColorLight: '#c4c4c4',
  background: {
    primary: '#ffffff',
    secondary: white,
  },
  textColor: {
    primary: '#30B19A',
    secondary: 'white',
    light: white,
    dark: black,
    darkBrown: '#515151',
  },
  toastColors: {
    success: '#F1FFF3',
    error: '#FFF1F1',
    successBorder: success,
    errorBorder: '#da3d3d',
  },
  popupDialogColors: {
    success,
    warning: '#FF8E38',
    borderColor: '#522E81',
  },
};