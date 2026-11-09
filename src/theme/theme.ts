import { createTheme, alpha } from '@mui/material/styles';

// Matches PT INI TIKET QUE's brand: blue primary, orange CTA, white base.
// Radius scale (8/16/24) intentionally mirrors tiketq.com's own theme so the
// two products read as siblings, not lookalikes by coincidence.
export const brand = {
  deep: '#14532D',
  primary: '#1F7A4D',
  mid: '#2A8F5C',
  bright: '#3FAE76',
  sky: '#A7DDBE',
  ice: '#DDF3E6',
  cta: '#F26B1D',
  ctaLight: '#FF8A3D',
  ctaDark: '#D4560F',
  ink: '#10261B',
  slate: '#54675C',
  line: '#DCE8DF',
  cream: '#FBF8F1',
  sun: '#F6C453',
};

export const heroGradient = `linear-gradient(170deg, ${brand.deep} 0%, ${brand.primary} 55%, ${brand.bright} 100%)`;
// Same gradient, translucent, so the animated sky shows through hero bands.
export const heroGradientSoft = `linear-gradient(170deg, rgba(20,83,45,0.88) 0%, rgba(31,122,77,0.8) 55%, rgba(63,174,118,0.72) 100%)`;
export const pageGradient = `linear-gradient(180deg, #E3F2E8 0%, #FBF8F1 100%)`;

// Spread into a hero band's sx so <HeroDecor /> (zIndex -1) paints between the
// gradient and the band's content.
export const heroBase = {
  position: 'relative',
  overflow: 'hidden',
  isolation: 'isolate',
  background: heroGradientSoft,
  color: '#fff',
  mx: 0,
  mt: 0,
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.45)',
  boxShadow:
    'inset 0 1.5px 0 rgba(255,255,255,0.6), inset 0 -24px 48px rgba(255,255,255,0.07), 0 28px 60px rgba(20,83,45,0.32)',
  // top specular sheen
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    zIndex: -1,
    pointerEvents: 'none',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.08) 38%, rgba(255,255,255,0) 52%)',
  },
  // slow diagonal light sweep
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-20%',
    bottom: '-20%',
    width: '34%',
    left: 0,
    zIndex: -1,
    pointerEvents: 'none',
    background: 'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)',
    animation: 'hero-sweep 9s ease-in-out infinite',
  },
} as const;


const HEAD = `'Montserrat', 'Segoe UI', sans-serif`;

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
      main: '#F6C453',
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
    borderRadius: 12,
  },
  typography: {
    fontFamily: `'Montserrat', 'Segoe UI', sans-serif`,
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
            backgroundImage: `linear-gradient(180deg, ${brand.bright} 0%, ${brand.primary} 52%, #176640 100%)`,
            border: '1px solid rgba(255,255,255,0.28)',
            boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.12), 0 8px 18px ${alpha(brand.primary, 0.34)}`,
            '&:hover': {
              backgroundImage: `linear-gradient(180deg, #4FBE86 0%, ${brand.mid} 52%, ${brand.deep} 100%)`,
              boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.14), 0 10px 22px ${alpha(brand.primary, 0.42)}`,
            },
          },
        },
        {
          props: { variant: 'contained', color: 'warning' },
          style: {
            backgroundImage: `linear-gradient(180deg, ${brand.ctaLight} 0%, ${brand.cta} 52%, ${brand.ctaDark} 100%)`,
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.14), 0 8px 18px ${alpha(brand.cta, 0.38)}`,
            '&:hover': {
              backgroundImage: `linear-gradient(180deg, #FF8C4D 0%, #FF6A1A 52%, ${brand.ctaDark} 100%)`,
              boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.16), 0 10px 22px ${alpha(brand.cta, 0.46)}`,
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
          border: `1px solid ${alpha(brand.primary, 0.14)}`,
          backgroundColor: alpha('#FFFFFF', 0.9),
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.78) 100%)',
          boxShadow: `inset 0 1.5px 0 rgba(255,255,255,1), 0 10px 28px ${alpha(brand.deep, 0.1)}`,
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
    MuiCardContent: {
      styleOverrides: {
        root: { padding: 24, '&:last-child': { paddingBottom: 24 } },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
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
