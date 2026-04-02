/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.eatrealfoodnyc.com',
  generateRobotsTxt: true,
  sitemapSize: 5000,

  exclude: [
    '/search',
    '/search/*',
    '/near-me',
    '/near-me/*',
    '/compare',
    '/compare/*',
    '/saved',
    '/saved/*',
    '/api/*',
    '/_next/*',
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/search',
          '/near-me',
          '/compare',
          '/saved',
          '/api/',
          '/_next/',
        ],
      },
    ],
  },

  transform: async (config, path) => {
    if (path === '/') {
      return { loc: path, priority: 1.0, changefreq: 'daily' }
    }
    if (path.startsWith('/healthy-restaurants/') && !path.includes('/nyc/')) {
      return { loc: path, priority: 0.95, changefreq: 'weekly' }
    }
    if (path.startsWith('/nyc/') && path.split('/').length === 4 && path.endsWith('/healthy-restaurants')) {
      return { loc: path, priority: 0.9, changefreq: 'weekly' }
    }
    if (path.startsWith('/nyc/') && path.split('/').length === 5 && path.endsWith('/healthy-restaurants')) {
      return { loc: path, priority: 0.85, changefreq: 'weekly' }
    }
    if (path.startsWith('/restaurants/')) {
      return { loc: path, priority: 0.8, changefreq: 'monthly' }
    }
    if (path === '/map') {
      return { loc: path, priority: 0.75, changefreq: 'weekly' }
    }
    if (path === '/nyc/compare') {
      return { loc: path, priority: 0.8, changefreq: 'weekly' }
    }
    if (path === '/guides') {
      return { loc: path, priority: 0.8, changefreq: 'monthly' }
    }
    if (path.startsWith('/guides/')) {
      return { loc: path, priority: 0.85, changefreq: 'monthly' }
    }
    return { loc: path, priority: 0.6, changefreq: 'monthly' }
  },
}
