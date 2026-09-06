import MuiStack from '@mui/material/Stack';
import type { StackProps as MuiStackProps } from '@mui/material/Stack';
import type { ResponsiveStyleValue } from '@mui/system';
import type { CSSProperties } from 'react';

export interface StackProps extends MuiStackProps {
  alignItems?: ResponsiveStyleValue<CSSProperties['alignItems']>;
  justifyContent?: ResponsiveStyleValue<CSSProperties['justifyContent']>;
  flexWrap?: ResponsiveStyleValue<CSSProperties['flexWrap']>;
  gap?: ResponsiveStyleValue<number | string>;
  textAlign?: ResponsiveStyleValue<CSSProperties['textAlign']>;
  maxWidth?: ResponsiveStyleValue<number | string>;
}

export default function FlexStack({ alignItems, justifyContent, flexWrap, gap, textAlign, maxWidth, sx, ...rest }: StackProps) {
  const shorthandSx = { alignItems, justifyContent, flexWrap, gap, textAlign, maxWidth };
  return (
    <MuiStack
      sx={[shorthandSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...rest}
    />
  );
}
