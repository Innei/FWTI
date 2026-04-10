import { onMount, type JSX } from 'solid-js';
import { initThemeFromStorage } from '../theme';
import { PreviewModal } from './PreviewModal';

export function Layout(props: { children?: JSX.Element }) {
  onMount(() => {
    initThemeFromStorage();
  });
  return (
    <>
      <div class="app">{props.children}</div>
      <PreviewModal />
    </>
  );
}
