import type { Config } from 'vike/types'
import vikeSolid from 'vike-solid/config'

export default {
  ssr: true,
  prerender: true,
  title: 'FWTI — 自嘲型恋爱人格测试',
  description:
    'FWTI（Fèiwù Type Indicator）自嘲型恋爱人格趣味测试：约三十道情景题动态分支、四维交叉分析，十六种类型释义。仅供娱乐，非心理诊断。',
  lang: 'zh-CN',
  extends: [vikeSolid],
} satisfies Config
