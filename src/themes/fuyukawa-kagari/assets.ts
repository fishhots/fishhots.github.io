const themeRoot = "/themes/fuyukawa-kagari";

export function kagariAsset(path: string) {
  return `${themeRoot}/assets/${path.replace(/^\/+/, "")}`;
}

export const kagariAssets = {
  favicon: kagariAsset("wife.png"),
  appleTouchIcon: kagariAsset("wife.png"),
  brand: kagariAsset("wife.webp"),
  scrollPig: kagariAsset("wife.webp"),
  profile: kagariAsset("profile.webp"),
  heroWallpaper: kagariAsset("hero-wallpaper.webp"),
  pageBackground: kagariAsset("fuyukawa-kagari-bg.webp"),
  notFound: kagariAsset("legacy/404.webp"),
  musicManifest: `${themeRoot}/music/manifest.json`
} as const;
