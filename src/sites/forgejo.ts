import type { ReplacementSelectorSet, Site } from '.';

const mainRepositoryImplementation: ReplacementSelectorSet = {
	row: '#repo-files-table .entry',
	filename: '.name a',
	icon: '.svg',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-directory-fill'),
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-submodule'),
};

/* Both commits and pull requests. */
const diffTreeImplementation: ReplacementSelectorSet = {
	row: '.diff-file-tree-items .item-directory, .diff-file-tree-items .item-file',
	filename: '.gt-ellipsis',
	icon: '.octicon-file-directory-fill, .octicon-file',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-directory-fill'),
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-submodule'),
	open: ':has(.octicon-chevron-down)',
};

const releaseAssetsImplementation: ReplacementSelectorSet = {
	row: '#release-list .download li',
	filename: 'a',
	icon: 'a > svg',
	isDirectory: (_rowEl, _fileNameEl, _iconEl) => false,
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false,
	getFilename: (_rowEl, fileNameEl, _iconEl) =>
		(fileNameEl as HTMLAnchorElement).href,
};

export const forgejo: Site = {
	domains: ['codeberg.org'],
	// Theme names include the theme, e.g. `forgejo-dark`, `codeberg-auto`.
	dark: '[data-theme*="-dark"]',
	system: '[data-theme*="-auto"]',
	replacements: [
		mainRepositoryImplementation,
		diffTreeImplementation,
		releaseAssetsImplementation,
	],
};
