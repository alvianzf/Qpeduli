import MuiTypography from '@mui/material/Typography';
import type { TypographyProps as MuiTypographyProps } from '@mui/material/Typography';
import type { ResponsiveStyleValue } from '@mui/system';
import type { CSSProperties } from 'react';

export interface TypographyProps extends MuiTypographyProps {
  fontWeight?: ResponsiveStyleValue<CSSProperties['fontWeight']>;
  textAlign?: ResponsiveStyleValue<CSSProperties['textAlign']>;
  maxWidth?: ResponsiveStyleValue<number | string>;
}

export default function Txt({ fontWeight, textAlign, maxWidth, sx, ...rest }: TypographyProps) {
  const shorthandSx = { fontWeight, textAlign, maxWidth };
  return (
    <MuiTypography
      sx={[shorthandSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...rest}
    />
  );
}
