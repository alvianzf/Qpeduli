import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { keyframes } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '../components/ui/Txt';

export type FeedbackKind = 'success' | 'error' | 'warning' | 'info' | 'question';

export interface ConfirmOptions {
  title: string;
  text?: string;
  icon?: FeedbackKind;
  confirmText?: string;
  cancelText?: string;
  /** Red confirm button for destructive actions. */
  danger?: boolean;
}

interface ToastItem { id: number; kind: FeedbackKind; message: string }

interface Feedback {
  toast: Record<'success' | 'error' | 'warning' | 'info', (message: string) => void>;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const Ctx = createContext<Feedback | null>(null);

const colors: Record<FeedbackKind, string> = { success: '#2E9E5B', error: '#C2200F', warning: '#F59E0B', info: '#4267B2', question: '#4267B2' };

const pop = keyframes`
  0% { transform: scale(0.4); opacity: 0; }
  60% { transform: scale(1.12); opacity: 1; }
  100% { transform: scale(1); }
`;
const draw = keyframes`from { stroke-dashoffset: 60; } to { stroke-dashoffset: 0; }`;
const slideIn = keyframes`from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; }`;
const shrink = keyframes`from { transform: scaleX(1); } to { transform: scaleX(0); }`;

function Glyph({ kind, size }: { kind: FeedbackKind; size: number }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round', strokeDasharray: 60, style: { animation: `${draw} .5s ease .15s both` } } as const;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      {kind === 'success' && <path d="M5 12.5l4.5 4.5L19 7.5" {...common} />}
      {kind === 'error' && <path d="M6 6l12 12M18 6L6 18" {...common} />}
      {kind === 'warning' && <path d="M12 6v7M12 17.5v.5" {...common} />}
      {kind === 'info' && <path d="M12 11v6M12 7v.5" {...common} />}
      {kind === 'question' && <path d="M9 9.2a3 3 0 115 2.2c-1 .8-2 1.2-2 2.6M12 17.5v.5" {...common} />}
    </svg>
  );
}

/** Toasts (top-right, auto-dismiss) and SweetAlert-style confirm dialogs, available through useFeedback(). */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [dlg, setDlg] = useState<(ConfirmOptions & { open: boolean }) | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((kind: FeedbackKind, message: string) => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-3), { id, kind, message }]);
    setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3800);
  }, [dismiss]);

  const confirm = useCallback((opts: ConfirmOptions) => new Promise<boolean>((resolve) => {
    resolver.current?.(false);
    resolver.current = resolve;
    setDlg({ ...opts, open: true });
  }), []);

  const close = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    setDlg((d) => (d ? { ...d, open: false } : d));
  };

  const api = useMemo<Feedback>(() => ({
    toast: { success: (m) => push('success', m), error: (m) => push('error', m), warning: (m) => push('warning', m), info: (m) => push('info', m) },
    confirm,
  }), [push, confirm]);

  useEffect(() => () => resolver.current?.(false), []);

  const kind = dlg?.icon ?? (dlg?.danger ? 'warning' : 'question');
  const color = dlg?.danger ? colors.error : colors[kind];

  return (
    <Ctx.Provider value={api}>
      {children}

      <Box aria-live="polite" sx={{ position: 'fixed', top: 16, right: 16, zIndex: (t) => t.zIndex.snackbar + 10, display: 'flex', flexDirection: 'column', gap: 1.25, width: { xs: 'calc(100vw - 32px)', sm: 360 }, pointerEvents: 'none' }}>
        {toasts.map((t) => (
          <Box
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            sx={{ pointerEvents: 'auto', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, pr: 1, bgcolor: '#fff', borderRadius: '8px', boxShadow: '0 10px 30px rgba(15,23,42,0.22)', animation: `${slideIn} .3s ease` }}
          >
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: colors[t.kind], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Glyph kind={t.kind} size={18} />
            </Box>
            <Typography variant="body2" sx={{ flex: 1, minWidth: 0, fontWeight: 600, color: '#0F172A' }}>{t.message}</Typography>
            <IconButton size="small" aria-label="Tutup" onClick={() => dismiss(t.id)}><CloseIcon fontSize="small" /></IconButton>
            <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, bgcolor: colors[t.kind], transformOrigin: 'left', animation: `${shrink} ${t.kind === 'error' ? 6 : 3.8}s linear forwards` }} />
          </Box>
        ))}
      </Box>

      <Dialog
        open={!!dlg?.open}
        onClose={() => close(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', p: 3, textAlign: 'center', overflow: 'visible' } } }}
      >
        <Box sx={{ width: 76, height: 76, mx: 'auto', mb: 2, borderRadius: '50%', border: `4px solid ${color}33`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: `${pop} .45s ease` }}>
          <Glyph kind={kind} size={40} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{dlg?.title}</Typography>
        {dlg?.text && <Typography color="text.secondary" sx={{ mb: 3 }}>{dlg.text}</Typography>}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap', mt: dlg?.text ? 0 : 3 }}>
          <Button variant="contained" autoFocus onClick={() => close(true)} sx={{ bgcolor: color, '&:hover': { bgcolor: color, filter: 'brightness(0.92)' }, minWidth: 110 }}>{dlg?.confirmText ?? 'Ya'}</Button>
          <Button variant="contained" onClick={() => close(false)} sx={{ bgcolor: '#64748B', '&:hover': { bgcolor: '#475569' }, minWidth: 110 }}>{dlg?.cancelText ?? 'Batal'}</Button>
        </Box>
      </Dialog>
    </Ctx.Provider>
  );
}

export function useFeedback(): Feedback {
  const v = useContext(Ctx);
  if (!v) throw new Error('useFeedback must be used inside FeedbackProvider');
  return v;
}
