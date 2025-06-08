import createMDX from '@next/mdx'
/**
 * Import environment configuration
 */
await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
})

export default withMDX(config)
