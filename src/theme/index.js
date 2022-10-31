import { createTheme } from '@mui/material/styles';

import colors from './colors';

const spacing = 8;

const typographyOptions = {
  header: {
    fontSize: 30,
    letterSpacing: 1.4,
    fontWeight: 700,
    lineHeight: '38px', //
  },
  title: {
    fontSize: 24,
    letterSpacing: 0.5,
    lineHeight: '30px',
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 18,
    letterSpacing: 1.3,
    fontWeight: 700, //
  },
  body: {
    fontSize: 16,
    letterSpacing: 0.6,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 0.6,
  },
  tinyBold: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 1,
  },
  tiny: {
    fontSize: 13,
    letterSpacing: 0.5,
    lineHeight: '12px',
  },
  caption: {
    fontSize: 18,
    letterSpacing: 0.4, //
  },
};

const theme = {
  palette: {
    type: 'dark',
    surface: colors.surface,
    background: {
      default: colors.surface[0],
      main: colors.surface[1],
      card: colors.surface[2],
    },
    border: {
      main: colors.border.main,
      focus: colors.border.focus,
      secondary: colors.border.secondary,
    },
    divider: colors.divider,
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
      hint: colors.text.passive,
    },
    action: {
      hover: colors.active,
      disabled: colors.depth,
    },
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    success: colors.success,
  },
  spacing,
  shape: {
    borderRadius: 10,
    mdBorderRadius: 14,
    cardBorderRadius: 18,
    lgBorderRadius: 30,
  },
  typography: {
    htmlFontSize: 16,
    fontFamily: [
      'Arial',
      'Noto Sans',
      'sans-serif',
      'Apple Color Emoji',
      'Segoe UI Emoji',
      'Segoe UI Symbol',
      'Noto Color Emoji',
    ].join(),
    h1: typographyOptions.header,
    h2: typographyOptions.title,
    subtitle1: typographyOptions.subtitle,
    caption: typographyOptions.caption,
    body1: typographyOptions.body,
    bodyBold: typographyOptions.bodyBold,
    h5: typographyOptions.tinyBold,
    h6: typographyOptions.tiny,
    button: typographyOptions.body,
    title: typographyOptions.title,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'capitalize',
          fontWeight: '400',
          lineHeight: '1.5',
          padding: '0.5rem 1rem',
          fontSize: '0.9rem',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
          padding: '2rem 1.5rem',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
        },
      },
    },
  },
  props: {},
  layouts: {
    container: 1152,
    containerSm: 766,
  },
};

export default createTheme(theme);
