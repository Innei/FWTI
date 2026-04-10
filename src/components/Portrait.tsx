/** @jsxImportSource solid-js */
import type { JSX } from 'solid-js';

const modules = import.meta.glob('../assets/portraits/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function srcOf(code: string): string | undefined {
  return modules[`../assets/portraits/${code}.webp`];
}

export interface PortraitProps {
  code: string;
  size?: number | string;
  class?: string;
}

export default function Portrait(props: PortraitProps): JSX.Element {
  const width = () =>
    typeof props.size === 'number' ? `${props.size}px` : props.size ?? '140px';
  return (
    <div
      class={`portrait-ring ${props.class ?? ''}`}
      style={{ width: width() }}
    >
      <img
        src={srcOf(props.code)}
        alt={`FWTI ${props.code} portrait`}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
