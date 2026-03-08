interface ImportMetaEnv {
  readonly NG_APP_API_URL: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
