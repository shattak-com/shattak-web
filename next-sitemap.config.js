/** @type {import('next-sitemap').IConfig} */
const NextSitemapConfig = {
	siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
	generateRobotsTxt: true
};

module.exports = NextSitemapConfig;
