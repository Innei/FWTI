import type { JSX } from 'solid-js'
import { Layout } from '../src/App'

export default function RootLayout(props: { children?: JSX.Element }) {
  return <Layout>{props.children}</Layout>
}
