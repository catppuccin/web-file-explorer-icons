import { defineContentScript } from '#imports';

import type { Site } from '@/sites';

import { matches, sites } from '@/sites';
import { createStylesElement } from '@/utils';
import {
	createReplacementStyles,
	injectIconStyles,
	replaceIconInRow,
} from './lib';

import { observe } from 'selector-observer';

export default defineContentScript({
	// Make sure `matches` URLs are updated in wxt.config.ts as well.
	matches: matches,
	runAt: 'document_start',

	async main() {
		for (const site of sites) {
			if (site.domains.includes(window.location.hostname)) {
				await runReplacements(site);
				// Assume URLs only have one matching site implementation. Can change this in the future.
				return;
			}
		}

		/* No matching domain, so run every site's replacements and follow the system color scheme. */
		await runReplacements({
			domains: [],
			replacements: sites.flatMap((site) => site.replacements),
		});
	},
});

async function runReplacements({ replacements, dark, system }: Site) {
	createStylesElement('catppuccin-file-explorer-icons').textContent =
		createReplacementStyles(replacements);
	const useIcon = await injectIconStyles(
		createStylesElement('catppuccin-file-explorer-icons-icons'),
		{ dark, system },
	);

	for (const replacement of replacements) {
		// Rows can be observed before their contents are parsed or rendered, and sites may reuse a row for a different file, so replace again whenever a row's contents change.
		const contentObserver = new MutationObserver(async (records) => {
			const rowEls = new Set<HTMLElement>();
			for (const { target } of records) {
				const el =
					target instanceof Element ? target : target.parentElement;
				const rowEl = el?.closest<HTMLElement>(replacement.row);
				if (rowEl) rowEls.add(rowEl);
			}
			for (const rowEl of rowEls)
				await replaceIconInRow(rowEl, replacement, useIcon);
		});

		// Monitor DOM elements that match a CSS selector.
		observe(replacement.row, {
			async add(rowEl: HTMLElement) {
				contentObserver.observe(rowEl, {
					childList: true,
					subtree: true,
					characterData: true,
					// State used to tell directories and open folders apart.
					attributes: true,
					attributeFilter: [
						'class',
						'aria-expanded',
						'aria-label',
						'data-kind',
					],
				});
				await replaceIconInRow(rowEl, replacement, useIcon);
			},
		});
	}
}
