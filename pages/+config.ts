import type { Config } from 'vike/types'
import vikeSolid from 'vike-solid/config'

export default {
  ssr: true,
  prerender: true,
  title: 'FWTI — 恋爱废物人格测试',
  description:
    'FWTI（Fèiwù Type Indicator）恋爱废物人格趣味测试：三十三道情景题、四维交叉分析，十六种「废料」类型释义。仅供娱乐，非心理诊断。',
  lang: 'zh-CN',
  extends: [vikeSolid],
} satisfies Config
