import { createTheme, alpha } from '@mui/material/styles';

// Matches PT INI TIKET QUE's brand: blue primary, orange CTA, white base.
// Radius scale (8/16/24) intentionally mirrors tiketq.com's own theme so the
// two products read as siblings, not lookalikes by coincidence.
export const brand = {
  deep: '#2F4F8A',
  primary: '#4267B2',
  mid: '#4267B2',
  bright: '#5A7EC4',
  sky: '#5A7EC4',
  ice: '#DBEAFE',
  cta: '#FF5A00',
  ctaLight: '#FF7A33',
  ctaDark: '#E65100',
  ink: '#16233F',
  slate: '#5B6B85',
  line: '#E4E9F2',
};

export const heroGradient = `linear-gradient(180deg, ${brand.deep} 0%, ${brand.primary} 45%, ${brand.bright} 100%)`;
export const pageGradient = `linear-gradient(180deg, #EFF4FF 0%, #F7FAFF 40%, #FFFFFF 100%)`;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: brand.primary,
      dark: brand.deep,
      light: brand.bright,
      contrastText: '#fff',
    },
    secondary: {
      main: '#0AD1FF',
      dark: '#00B3D9',
    },
    success: { main: '#16A34A' },
    warning: { main: brand.cta, light: brand.ctaLight, dark: brand.ctaDark, contrastText: '#fff' },
    error: { main: '#EF4444' },
    background: {
      default: '#F6F8FC',
      paper: '#FFFFFF',
    },
    text: {
      primary: brand.ink,
      secondary: brand.slate,
    },
    divider: brand.line,
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: `'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif`,
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 700 },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 20,
          paddingBlock: 10,
          boxShadow: 'none',
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            boxShadow: `0 6px 16px ${alpha(brand.primary, 0.28)}`,
            '&:hover': {
              backgroundColor: brand.deep,
              boxShadow: `0 8px 20px ${alpha(brand.primary, 0.36)}`,
            },
          },
        },
        {
          props: { variant: 'contained', color: 'warning' },
          style: {
            boxShadow: `0 6px 16px ${alpha(brand.cta, 0.3)}`,
            '&:hover': {
              backgroundColor: brand.ctaDark,
              boxShadow: `0 8px 20px ${alpha(brand.cta, 0.4)}`,
            },
          },
        },
      ],
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${brand.line}`,
          boxShadow: `0 2px 10px ${alpha(brand.ink, 0.04)}`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#fff',
        },
        input: {
          paddingTop: 14.5,
          paddingBottom: 14.5,
        },
        notchedOutline: {
          borderColor: brand.line,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          paddingTop: 14.5,
          paddingBottom: 14.5,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          height: 30,
          paddingInline: 4,
        },
        label: {
          paddingInline: 10,
        },
        sizeSmall: {
          height: 26,
        },
        icon: {
          marginLeft: 8,
          marginRight: -4,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          height: 10,
          backgroundColor: alpha(brand.primary, 0.1),
        },
        bar: {
          borderRadius: 999,
          backgroundColor: brand.cta,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
          backgroundColor: brand.cta,
        },
      },
    },
  },
});

export default theme;
