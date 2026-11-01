import type { ReplacementSelectorSet, Site } from '.';

import { CSS_SELECTOR_SELF } from '../constants';

const mainRepositoryImplementation: ReplacementSelectorSet = {
	row: '#repo-files-table .repo-file-item',
	filename: '.name a',
	icon: '.svg',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-directory-fill'),
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-submodule'),
};

const mainRepositoryParentLinkImplementation: ReplacementSelectorSet = {
	row: '#repo-files-table .repo-file-line.parent-link',
	filename: CSS_SELECTOR_SELF,
	icon: '.svg',
	isDirectory: (_rowEl, _fileNameEl, _iconEl) => true,
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false,
};

const repositorySideTreeImplementation: ReplacementSelectorSet = {
	row: '.view-file-tree-items .tree-item',
	filename: '.item-content .gt-ellipsis',
	icon: '.item-content .svg',
	isDirectory: (rowEl, _fileNameEl, _iconEl) =>
		rowEl.classList.contains('type-directory'),
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-submodule'),
	open: ':has(.item-toggle .octicon-chevron-down)',
};

const diffTreeImplementation: ReplacementSelectorSet = {
	row: '.diff-file-tree-items .item-directory, .diff-file-tree-items .item-file',
	filename: '.gt-ellipsis',
	icon: '.octicon-file-directory-fill, .octicon-file-directory-open-fill, .octicon-file',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-directory-fill') ||
		iconEl.classList.contains('octicon-file-directory-open-fill'),
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-submodule'),
	open: ':has(.octicon-chevron-down)',
};

const releaseAssetsImplementation: ReplacementSelectorSet = {
	row: '#release-list .download li',
	filename: 'a',
	icon: 'a svg',
	isDirectory: (_rowEl, _fileNameEl, _iconEl) => false,
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false,
	getFilename: (_rowEl, fileNameEl, _iconEl) =>
		(fileNameEl as HTMLAnchorElement).href,
};

export const gitea: Site = {
	domains: ['gitea.com'],
	// Some versions resolve the theme into `data-gitea-theme-dark`, fall back to the theme name (e.g. `gitea-dark`, `gitea-auto`).
	dark: '[data-gitea-theme-dark="true"], :not([data-gitea-theme-dark])[data-theme*="-dark"]',
	system: ':not([data-gitea-theme-dark])[data-theme*="-auto"]',
	replacements: [
		mainRepositoryImplementation,
		mainRepositoryParentLinkImplementation,
		repositorySideTreeImplementation,
		diffTreeImplementation,
		releaseAssetsImplementation,
	],
};
