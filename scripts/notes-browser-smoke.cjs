/* eslint-env node */
const assert = require('node:assert/strict');

// Playwright is optional local QA tooling, not a project dependency.
exports.verifyNotesBrowser = async ({ base, apiBase, department }) => {
	const { chromium } = require(process.env.NOTES_BROWSER_PLAYWRIGHT);
	const browser = await chromium.launch({
		executablePath: process.env.NOTES_BROWSER_EXECUTABLE,
		headless: true,
		args: ['--no-proxy-server']
	});
	const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
	try {
		await context.route('**/*', route => {
			const origin = new URL(route.request().url()).origin;
			return [base, apiBase].includes(origin) ? route.continue() : route.abort();
		});
		const page = await context.newPage();
		const rsc = [];
		let accessCalls = 0;
		page.on('request', request => {
			const url = new URL(request.url());
			if (url.searchParams.has('_rsc'))
				rsc.push({ path: url.pathname, prefetch: Boolean(request.headers()['next-router-prefetch']) });
			if (request.method() === 'POST' && url.pathname === '/api/v1/notes/sample/access') accessCalls++;
		});
		const subject = `/notes/${department}/math/`;
		const detail = `${subject}sample/`;
		await page.goto(`${base}/notes/`);
		await page
			.getByRole('link', { name: /Department version/ })
			.first()
			.click();
		await page.waitForURL(`${base}/notes/${department}/`);
		await page.getByRole('link', { name: /Math/ }).first().click();
		await page.waitForURL(`${base}${subject}`);
		await page
			.getByText(/Result NOTES page 1/)
			.first()
			.waitFor();
		await page.getByRole('link', { name: 'PYQ', exact: true }).click();
		await page.waitForURL(`${base}${subject}?category=PYQ`);
		await page
			.getByText(/Result PYQ page 1/)
			.first()
			.waitFor();
		await page.getByRole('link', { name: /Next/ }).click();
		await page.waitForURL(`${base}${subject}?category=PYQ&page=2`);
		await page
			.getByText(/Result PYQ page 2/)
			.first()
			.waitFor();
		await page.goBack();
		await page
			.getByText(/Result PYQ page 1/)
			.first()
			.waitFor();
		await page.goForward();
		await page
			.getByText(/Result PYQ page 2/)
			.first()
			.waitFor();
		assert.equal(accessCalls, 0, 'Browsing and history must not access a private resource');
		assert.ok(
			await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
			'Mobile subject should not overflow'
		);
		await page.getByRole('link', { name: 'View', exact: true }).first().click();
		await page.waitForURL(
			url =>
				url.pathname === '/login/' && url.searchParams.get('redirect')?.replace(/\/$/, '') === detail.replace(/\/$/, '')
		);
		assert.equal(accessCalls, 1, 'The unauthenticated viewer uses one protected request');
		await context.addCookies([{ name: 'notes-fixture-user', value: 'authorized', url: apiBase }]);
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto(`${base}${detail}`);
		await page.locator('iframe[title^="Note version"]').waitFor();
		assert.equal(accessCalls, 2, 'The authorized viewer uses one protected request');
		assert.ok(
			await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
			'Desktop viewer should not overflow'
		);
		const samples = await page.evaluate(() =>
			performance
				.getEntriesByType('navigation')
				.map(entry => ({ responseStart: entry.responseStart, domContentLoaded: entry.domContentLoadedEventEnd }))
		);
		const popupReady = page.waitForEvent('popup');
		await page.getByRole('button', { name: 'Download', exact: true }).first().click();
		const popup = await popupReady;
		await popup.waitForURL(`${apiBase}/fixture-file`);
		assert.equal(accessCalls, 3, 'An explicit Download uses one additional protected request');
		await popup.close();
		const notesPrefetches = rsc.filter(request => request.prefetch && request.path.startsWith('/notes/')).length;
		console.log(
			JSON.stringify({
				browser: 'Notes navigation, history, anonymous redirect, authorized viewer and download passed',
				rsc,
				notesPrefetches,
				accessCalls,
				samples
			})
		);
		assert.ok(notesPrefetches <= 8, `Notes ancestor prefetch budget exceeded: ${notesPrefetches}`);
	} finally {
		await context.close();
		await browser.close();
	}
};
