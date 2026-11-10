import Avatar from '@mui/material/Avatar';
import type { SxProps, Theme } from '@mui/material/styles';

interface Props {
  name?: string;
  /** Uploaded picture URL; when missing the placeholder silhouette is shown. */
  src?: string | null;
  color?: string;
  size?: number;
  sx?: SxProps<Theme>;
}

/** Placeholder shown until the user uploads a profile picture: a head-and-shoulders silhouette on a soft gradient. */
export function AvatarPlaceholder({ size = 40, color = '#4267B2' }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} role="img" aria-label="Belum ada foto profil" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="ph-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" fill="url(#ph-bg)" />
      <circle cx="48" cy="37" r="16" fill="#fff" fillOpacity="0.92" />
      <path d="M16 96c1-20 14-32 32-32s31 12 32 32z" fill="#fff" fillOpacity="0.92" />
    </svg>
  );
}

export default function UserAvatar({ name, src, color = '#4267B2', size = 40, sx }: Props) {
  return (
    <Avatar src={src || undefined} alt={name} sx={[{ width: size, height: size, bgcolor: color, overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      <AvatarPlaceholder size={size} color={color} />
    </Avatar>
  );
}
