import { GoodwillMark } from './art/Nature';

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <span role="img" aria-label="Qpeduli" style={{ display: 'inline-flex', lineHeight: 0 }}>
      <GoodwillMark size={size} />
    </span>
  );
}
