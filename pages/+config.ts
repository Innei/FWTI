import type { Config } from 'vike/types'
import vikeSolid from 'vike-solid/config'

export default {
  ssr: true,
  prerender: true,
  title: 'FWTI — 恋爱废物人格测试',
  lang: 'zh-CN',
  extends: [vikeSolid],
} satisfies Config
