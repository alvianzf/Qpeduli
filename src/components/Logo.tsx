import { GoodwillMark } from './art/Nature';

export default function Logo({ size = 40, light = false }: { size?: number; light?: boolean }) {
  return (
    <span role="img" aria-label="Qpeduli" style={{ display: 'inline-flex', lineHeight: 0 }}>
      <GoodwillMark size={size} light={light} />
    </span>
  );
}
