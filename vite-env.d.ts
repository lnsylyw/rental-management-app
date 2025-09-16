/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  // 可以在这里添加更多环境变量类型定义
  readonly VITE_APP_TITLE?: string
  readonly VITE_PORT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}