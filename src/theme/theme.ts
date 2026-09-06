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

export const brand = {
  deep: '#0B1E4D',
  primary: '#123A8C',
  mid: '#1E5FE0',
  bright: '#3B82F6',
  sky: '#60A5FA',
  ice: '#DBEAFE',
};

export const heroGradient = `linear-gradient(180deg, ${brand.deep} 0%, ${brand.primary} 32%, ${brand.mid} 62%, ${brand.bright} 100%)`;
export const pageGradient = `linear-gradient(180deg, #EFF4FF 0%, #F7FAFF 40%, #FFFFFF 100%)`;
export const cardGlass = (opacity = 0.6) => `linear-gradient(145deg, ${alpha('#FFFFFF', opacity)}, ${alpha('#EAF1FF', opacity - 0.15)})`;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: brand.mid,
      dark: brand.primary,
      light: brand.sky,
      contrastText: '#fff',
    },
    secondary: {
      main: '#0EA5E9',
    },
    success: { main: '#16A34A' },
    warning: { main: '#F59E0B' },
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
    borderRadius: 18,
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
            backgroundImage: `linear-gradient(135deg, ${brand.mid}, ${brand.bright})`,
            boxShadow: `0 8px 24px ${alpha(brand.mid, 0.35)}`,
            '&:hover': {
              backgroundImage: `linear-gradient(135deg, ${brand.primary}, ${brand.mid})`,
              boxShadow: `0 10px 28px ${alpha(brand.mid, 0.45)}`,
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
        root: { fontWeight: 700 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          height: 10,
          backgroundColor: alpha(brand.mid, 0.12),
        },
        bar: {
          borderRadius: 999,
          backgroundImage: `linear-gradient(90deg, ${brand.mid}, ${brand.sky})`,
        },
      },
    },
  },
});

export default theme;
