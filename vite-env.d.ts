/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_AMAP_KEY?: string;
  readonly VITE_AMAP_SECURITY_CODE?: string;
  // 添加其他环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
