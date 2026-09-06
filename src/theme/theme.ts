import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    glass: {
      background: string;
      border: string;
    };
  }
  interface PaletteOptions {
    glass?: {
      background: string;
      border: string;
    };
  }
}

// Matches PT INI TIKET QUE's brand: blue primary, orange CTA, white base.
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
};

export const heroGradient = `linear-gradient(180deg, ${brand.deep} 0%, ${brand.primary} 45%, ${brand.bright} 100%)`;
export const pageGradient = `linear-gradient(180deg, #EFF4FF 0%, #F7FAFF 40%, #FFFFFF 100%)`;
export const cardGlass = (opacity = 0.6) => `linear-gradient(145deg, ${alpha('#FFFFFF', opacity)}, ${alpha('#EAF1FF', opacity - 0.15)})`;

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
      default: '#F3F7FF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0B1E4D',
      secondary: '#4C5E82',
    },
    glass: {
      background: alpha('#FFFFFF', 0.55),
      border: alpha('#FFFFFF', 0.7),
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: `'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif`,
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 800, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: 20,
          paddingBlock: 10,
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            backgroundImage: `linear-gradient(135deg, ${brand.primary}, ${brand.bright})`,
            boxShadow: `0 8px 24px ${alpha(brand.primary, 0.35)}`,
            '&:hover': {
              backgroundImage: `linear-gradient(135deg, ${brand.deep}, ${brand.primary})`,
              boxShadow: `0 10px 28px ${alpha(brand.primary, 0.45)}`,
            },
          },
        },
        {
          props: { variant: 'contained', color: 'warning' },
          style: {
            backgroundImage: `linear-gradient(135deg, ${brand.cta}, ${brand.ctaLight})`,
            boxShadow: `0 8px 24px ${alpha(brand.cta, 0.35)}`,
            '&:hover': {
              backgroundImage: `linear-gradient(135deg, ${brand.ctaDark}, ${brand.cta})`,
              boxShadow: `0 10px 28px ${alpha(brand.cta, 0.45)}`,
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
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `1px solid ${alpha('#FFFFFF', 0.6)}`,
          backdropFilter: 'blur(16px)',
          backgroundImage: cardGlass(0.75),
          boxShadow: `0 8px 32px ${alpha(brand.primary, 0.08)}`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
        input: {
          paddingTop: 14.5,
          paddingBottom: 14.5,
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
          height: 12,
          backgroundColor: alpha(brand.primary, 0.1),
        },
        bar: {
          borderRadius: 999,
          backgroundImage: `linear-gradient(90deg, ${brand.cta}, ${brand.ctaLight})`,
        },
      },
    },
  },
});

export default theme;
