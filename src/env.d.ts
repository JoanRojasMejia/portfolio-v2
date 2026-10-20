interface ImportMetaEnv {
  // Solo servidor/build: sin prefijo PUBLIC_, Astro no las expone al cliente.
  readonly LASTFM_KEY?: string;
  readonly LASTFM_USER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
