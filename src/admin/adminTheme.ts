import { createTheme } from '@mui/material/styles';
import baseTheme from '../theme/theme';

/** AdminLTE-style density: square-ish corners, flat cards with a hairline shadow, no pill buttons. */
export const adminTheme = createTheme(baseTheme, {
  shape: { borderRadius: 4 },
  typography: { fontSize: 14 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          background: '#fff',
          backdropFilter: 'none',
          border: 0,
          boxShadow: '0 0 1px rgba(0,0,0,.13), 0 1px 3px rgba(0,0,0,.2)',
        },
      },
    },
    MuiCardContent: { styleOverrides: { root: { padding: 16, '&:last-child': { paddingBottom: 16 } } } },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 4 } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 4, textTransform: 'none', fontWeight: 600, boxShadow: 'none' } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 4, fontWeight: 600 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiToggleButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 4 } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 2 }, bar: { borderRadius: 2 } } },
    MuiTableCell: { styleOverrides: { root: { padding: '10px 14px', borderColor: '#DEE2E6' }, head: { fontWeight: 700, background: '#F8F9FA', whiteSpace: 'nowrap' } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 4 } } },
  },
});

// Same palette as the public site (tiketq blue + orange CTA).
export const lte = {
  sidebar: 'linear-gradient(180deg, #2F4F8A 0%, #3B5BA0 55%, #4267B2 100%)',
  sidebarText: 'rgba(255,255,255,0.82)',
  content: '#F8FAFC',
  border: '#E1E8F2',
  blue: '#4267B2',
  cyan: '#5A7EC4',
  green: '#2F4F8A',
  orange: '#E65100',
  red: '#C2200F',
};

// Profile area: same layout as the admin console, teal instead of blue.
export const profilePalette = {
  ...lte,
  sidebar: 'linear-gradient(180deg, #0B4F4A 0%, #0F766E 55%, #14958A 100%)',
  blue: '#0F766E',
  cyan: '#14958A',
  green: '#0B4F4A',
};
