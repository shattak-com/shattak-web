const config = require('../../next-sitemap.config');

module.exports = { ...config, outDir: process.env.SHATTAK_SITEMAP_TEST_OUTPUT };
