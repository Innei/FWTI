/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OG_IMAGE?: string
  readonly VITE_TELEMETRY_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
