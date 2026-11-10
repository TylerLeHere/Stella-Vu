import { defineConfig } from 'astro/config';

// The production domain is pending. Set SITE_URL when building for release;
// without it, tags that need an absolute URL are left out.
function configuredSite() {
  const value = process.env.SITE_URL?.trim();
  if (!value) return undefined;
  const url = new URL(value);
  if (
    url.protocol !== 'https:' ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  )
    throw new Error('SITE_URL must be an https origin such as https://domain');
  return url.origin;
}

export default defineConfig({
  output: 'static',
  site: configuredSite(),
});
