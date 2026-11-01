import { bitbucket } from './bitbucket';
import { forgejo } from './forgejo';
import { gitea } from './gitea';
import { github } from './github';
import { gitlab } from './gitlab';
import { tangled } from './tangled';

export type FnWithContext<T> = (
	rowEl: HTMLElement,
	fileNameEl: HTMLElement,
	iconEl: HTMLElement,
) => T;

export type ReplacementSelectorSet = {
	row: string;
	filename: string | symbol;
	icon: string;
	isDirectory: FnWithContext<boolean>;
	isSubmodule: FnWithContext<boolean>;
	isCollapsable: FnWithContext<boolean>;
	getFilename?: FnWithContext<string>;
	/**
	 * Setup a manual row observer and call {@link replace} when you
	 * to replace the icon properly in the row.
	 *
	 * If not given, the classic behavior will be used; should work for
	 * most cases, use this only for very specific behaviors (e.g. DOM nodes
	 * are re-used for a new row).
	 */
	setupObserver?: (row: HTMLElement, replace: () => Promise<void>) => Promise<void>;
	styles?: string;
};

export type Site = {
	domains: Array<string>;
	replacements: Array<ReplacementSelectorSet>;
};

// import type { Site } from '.';
//
// export const mySite: SupportedSite = {
// 	urls: ['*://mysite.com/*'],
// 	replacements: [someImplementationFoo, someImplementationBar],
// 	styles: /* css */ `
// /* ... */
// `.trim(),
// };

export const sites: Array<Site> = [
	github,
	gitlab,
	gitea,
	forgejo,
	bitbucket,
	tangled,
];
export const matches: Array<string> = sites
	.flatMap((site) => site.domains)
	.map((domain) => `*://${domain}/*`);
