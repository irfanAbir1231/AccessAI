import type { MetadataRoute } from 'next';

/** App Router manifest; service-worker registration remains opt-in from Settings. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nagorik Shathi',
    short_name: 'Nagorik Shathi',
    description: "Bangladesh's opportunity and benefits assistant",
    start_url: '/bn/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#176b4d',
    lang: 'bn',
    icons: [{ src: '/nagorik-shathi-logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
