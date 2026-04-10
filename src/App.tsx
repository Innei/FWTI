/**
 * src/App.tsx · thin barrel。
 *
 * v0.4 refactor：原单文件 ~900 行拆为 src/components/* + src/state.ts。
 * 此文件仅保留 barrel re-export，保持 `pages/*` 的旧 import 路径兼容。
 * 不要在本文件内加实现——请落到对应的组件或 state 文件。
 */

import './global.css';

export { Layout } from './components/Layout';
export { HomePage } from './components/HomePage';
export { QuizPage } from './components/QuizPage';
export { ResultPage } from './components/ResultPage';
export {
  QUIZ_RANGE_TEXT,
  GITHUB_REPO_URL,
  FWTI_SITE_URL,
  answers,
  setAnswers,
  retreatCount,
  setRetreatCount,
  previewDetail,
  setPreviewDetail,
} from './state';
