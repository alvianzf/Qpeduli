import { createTheme, alpha } from '@mui/material/styles';

// Matches PT INI TIKET QUE's brand: blue primary, orange CTA, white base.
// Radius scale (8/16/24) intentionally mirrors tiketq.com's own theme so the
// two products read as siblings, not lookalikes by coincidence.
export const brand = {
  deep: '#2F4F8A',
  primary: '#4267B2',
  mid: '#4D70B8',
  bright: '#5A7EC4',
  sky: '#9DB6E3',
  ice: '#DBEAFE',
  cta: '#FF5A00',
  ctaLight: '#FF7A33',
  ctaDark: '#E65100',
  ink: '#0F172A',
  slate: '#5B6B85',
  line: '#E1E8F2',
  cream: '#F8FAFC',
  sun: '#F6C453',
};

export const heroGradient = `linear-gradient(170deg, ${brand.deep} 0%, ${brand.primary} 55%, ${brand.bright} 100%)`;
export const pageGradient = `linear-gradient(180deg, #E8EFFB 0%, #F8FAFC 100%)`;

// Spread into a hero band's sx so <HeroDecor /> (zIndex -1) paints between the
// gradient and the band's content.
export const heroBase = {
  position: 'relative',
  overflow: 'hidden',
  isolation: 'isolate',
  background: heroGradient,
  color: '#fff',
} as const;

const HEAD = `'Fraunces Variable', 'Fraunces', Georgia, serif`;

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
      default: 'transparent',
      paper: '#FFFFFF',
    },
    text: {
      primary: brand.ink,
      secondary: brand.slate,
    },
    divider: brand.line,
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: `'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif`,
    h1: { fontFamily: HEAD, fontWeight: 700, letterSpacing: '-0.01em' },
    h2: { fontFamily: HEAD, fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontFamily: HEAD, fontWeight: 700 },
    h4: { fontFamily: HEAD, fontWeight: 700 },
    h5: { fontFamily: HEAD, fontWeight: 600 },
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
          borderRadius: 999,
          paddingInline: 24,
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
          borderRadius: 20,
          border: `1px solid ${alpha(brand.primary, 0.14)}`,
          backgroundColor: alpha('#FFFFFF', 0.92),
          boxShadow: `0 6px 22px ${alpha(brand.deep, 0.07)}`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
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
