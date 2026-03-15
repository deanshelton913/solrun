/**
 * @type {import('next-sitemap').IConfig}
 * @see https://github.com/iamvishnusankar/next-sitemap#readme
 * Note: Next.js app/sitemap.ts and app/robots.ts are used for dynamic SEO.
 * This config is for postbuild static generation if needed.
 */
module.exports = {
  siteUrl: 'https://solrun.app',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
  },
};
