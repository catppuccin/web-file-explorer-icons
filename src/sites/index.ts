import { bitbucket } from './bitbucket';
import { forgejo } from './forgejo';
import { gitea } from './gitea';
import { github } from './github';
import { gitlab } from './gitlab';
import { sourcehut } from './sourcehut';
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
	isSymlink?: FnWithContext<boolean>;
	/** Selector matching the row element while its directory is expanded, to show the open folder icon. */
	open?: string;
	/** Add the icon as this pseudo-element of the `icon` element instead of replacing its contents, for rows without an icon of their own. */
	pseudo?: '::before' | '::after';
	getFilename?: FnWithContext<string>;
	styles?: string;
};

export type Site = {
	domains: Array<string>;
	replacements: Array<ReplacementSelectorSet>;
	/** Selector matching the root element while the site is in dark mode. */
	dark?: string;
	/** Selector matching the root element while the site follows the system color scheme. */
	system?: string;
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
	sourcehut,
];
export const matches: Array<string> = sites
	.flatMap((site) => site.domains)
	.map((domain) => `*://${domain}/*`);
