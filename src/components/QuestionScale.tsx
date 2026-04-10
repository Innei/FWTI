import { For } from 'solid-js';

export interface QuestionScaleProps {
  value: number | undefined;
  onSelect: (value: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
}

const DOT_SIZES = [44, 34, 26, 18, 26, 34, 44];

export default function QuestionScale(props: QuestionScaleProps) {
  const left = () => props.leftColor ?? '#33A474';
  const right = () => props.rightColor ?? '#576071';

  return (
    <div class="qs" role="radiogroup" aria-label="agree-disagree scale">
      <span class="qs-label qs-label-left" style={{ color: left() }}>
        {props.leftLabel ?? '同意'}
      </span>
      <div class="qs-dots">
        <For each={DOT_SIZES}>
          {(size, idx) => {
            const i = idx();
            const isLeft = i < 3;
            const isCenter = i === 3;
            const color = () => (isLeft ? left() : isCenter ? '#b0b7c3' : right());
            const selected = () => props.value === i;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={selected()}
                aria-label={`option ${i + 1} of 7`}
                class={`qs-dot ${selected() ? 'is-selected' : ''}`}
                classList={{
                  'qs-dot-left': isLeft,
                  'qs-dot-center': isCenter,
                  'qs-dot-right': !isLeft && !isCenter,
                }}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  '--qs-color': color(),
                }}
                onClick={() => props.onSelect(i)}
              />
            );
          }}
        </For>
      </div>
      <span class="qs-label qs-label-right" style={{ color: right() }}>
        {props.rightLabel ?? '不同意'}
      </span>
    </div>
  );
}
