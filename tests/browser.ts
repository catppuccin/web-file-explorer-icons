import type { BrowserContext, Page } from 'playwright';
import type { ReplacementSelectorSet } from '@/sites';

import { CSS_SELECTOR_SELF } from '@/constants';

import { join } from 'node:path';
import { chromium } from 'playwright';

export const EXTENSION_PATH = join(import.meta.dirname, '../dist/chrome-mv3');

export function launchWithExtension(
	options: { colorScheme?: 'light' | 'dark' } = {},
): Promise<BrowserContext> {
	return chromium.launchPersistentContext('', {
		...options,
		channel: 'chromium',
		headless: !process.env.HEADED,
		// Allow `collectRows` to evaluate replacement `getFilename` functions on sites which forbid `eval`.
		bypassCSP: true,
		args: [
			`--disable-extensions-except=${EXTENSION_PATH}`,
			`--load-extension=${EXTENSION_PATH}`,
		],
	});
}

export type ReplacedRow = {
	name: string;
	/** The icon name the extension tagged the row with, if any. */
	icon: string | null;
	/** Whether the site's icon element is actually painted with the replacement icon. */
	painted: boolean;
	/** How many elements the icon selector matches, as CSS paints all of them (e.g. a trailing status icon too). */
	iconCount: number;
};

/** Collect every row matched by the given replacements and how the extension handled it. */
export function collectRows(
	page: Page,
	replacements: Array<ReplacementSelectorSet>,
): Promise<Array<ReplacedRow>> {
	return page.evaluate(
		(replacements) =>
			replacements.flatMap(
				({ row, filename, icon, pseudo, getFilename }) =>
					[...document.querySelectorAll<HTMLElement>(row)]
						.filter((rowEl) => rowEl.querySelector(icon))
						.map((rowEl) => {
							const iconEl = rowEl.querySelector(icon);
							const fileNameEl = filename
								? rowEl.querySelector(filename)
								: rowEl;
							return {
								// The last path segment, as some `getFilename`s return URLs.
								name: (getFilename
									? new Function(`return ${getFilename}`)()(
											rowEl,
											fileNameEl,
											iconEl,
										)
									: (fileNameEl?.textContent ?? '')
								)
									.split('/')
									.at(-1)
									.trim(),
								icon: rowEl.getAttribute(
									'data-catppuccin-file-explorer-icons',
								),
								painted: getComputedStyle(
									iconEl,
									pseudo,
								).backgroundImage.startsWith(
									'url("data:image/svg+xml',
								),
								iconCount: rowEl.querySelectorAll(icon).length,
							};
						}),
			),
		replacements.map(({ row, filename, icon, pseudo, getFilename }) => ({
			row,
			pseudo: pseudo ?? null,
			filename:
				filename === CSS_SELECTOR_SELF ? null : (filename as string),
			icon,
			// Functions cannot be passed to the page, so pass their source instead.
			getFilename: getFilename?.toString() ?? null,
		})),
	);
}

/** Wait until at least one row is tagged by the extension, then for the page to settle (e.g. after hydration). */
export async function waitForReplacements(page: Page) {
	await page
		.locator('[data-catppuccin-file-explorer-icons]')
		.first()
		.waitFor({ timeout: 20_000 })
		.catch(() => {});
	await page.waitForTimeout(2_000);
}

/** Write the extension's settings, by their storage keys without the `local:` prefix. */
export async function setSettings(
	context: BrowserContext,
	settings: Record<string, unknown>,
) {
	const worker =
		context.serviceWorkers()[0] ??
		(await context.waitForEvent('serviceworker'));
	await worker.evaluate(
		(settings) => chrome.storage.local.set(settings),
		settings,
	);
}
