import type { Flavor } from '@/types';

import {
	launchWithExtension,
	setSettings,
	waitForReplacements,
} from './browser';

import { flavors } from '@catppuccin/palette';

import { describe, expect, test } from 'vitest';

/** Which flavor's colors the page's replaced icons are painted with. */
async function getReplacedIconFlavors(
	url: string,
	colorScheme: 'light' | 'dark',
) {
	const context = await launchWithExtension({ colorScheme });
	await setSettings(context, {
		flavor: 'auto',
		lightFlavor: 'latte',
		darkFlavor: 'mocha',
	});
	const page = await context.newPage();
	await page.goto(url, { waitUntil: 'domcontentloaded' });
	await waitForReplacements(page);
	const backgrounds = await page.evaluate(() =>
		[
			...document.querySelectorAll(
				'[data-catppuccin-file-explorer-icons] *',
			),
		]
			.map((el) => getComputedStyle(el).backgroundImage)
			.filter((background) => background.startsWith('url("data:'))
			.join(' ')
			.toLowerCase(),
	);
	await context.close();

	return (['latte', 'mocha'] as Array<Flavor>).filter((flavor) =>
		Object.values(flavors[flavor].colors).some(({ hex }) =>
			backgrounds.includes(encodeURIComponent(hex)),
		),
	);
}

// Logged out, these follow the system color scheme (...except Bitbucket, which always uses light).
const cases: Array<[string, string, { light: Flavor; dark: Flavor }]> = [
	[
		'github.com',
		'https://github.com/catppuccin/catppuccin',
		{ light: 'latte', dark: 'mocha' },
	],
	[
		'gitea.com',
		'https://gitea.com/gitea/gitea-mirror',
		{ light: 'latte', dark: 'mocha' },
	],
	[
		'tangled.org',
		'https://tangled.org/@tangled.org/core',
		{ light: 'latte', dark: 'mocha' },
	],
	[
		'bitbucket.org',
		'https://bitbucket.org/atlassian/atlassian-frontend-mirror',
		{ light: 'latte', dark: 'latte' },
	],
];

describe('automatic flavor', () => {
	for (const [name, url, expected] of cases) {
		for (const colorScheme of ['light', 'dark'] as const) {
			test(`${name} with a ${colorScheme} system color scheme`, async () => {
				expect(await getReplacedIconFlavors(url, colorScheme)).toEqual([
					expected[colorScheme],
				]);
			});
		}
	}
});
