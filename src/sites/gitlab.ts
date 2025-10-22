import type { ReplacementSelectorSet, Site } from '.';

import { ATTRIBUTE_PREFIX } from '../constants';

const repositoryMainImplementation: ReplacementSelectorSet = {
	row: '.tree-table .tree-item',
	filename: '.tree-item-file-name .tree-item-link',
	icon: 'span svg:has(use)',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('folder-icon'),
	isSubmodule: (_rowEl, fileNameEl, _iconEl) =>
		fileNameEl.classList.contains('is-submodule'),
	isCollapsable: (_rowEl, _fileNameEl, _iconEl) => false,
};

const fileContentsHeaderImplementation: ReplacementSelectorSet = {
	row: '.project-show-files .file-header-content',
	filename: '.file-title-name',
	icon: 'span svg:has(use)',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('folder-icon'),
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false,
	isCollapsable: (_rowEl, _fileNameEl, _iconEl) => false,
};

const commitDiffFileHeaderImplementation: ReplacementSelectorSet = {
	row: '.js-diffs-batch .file-header-content',
	filename: '.file-title-name',
	icon: 'svg:has(+ .file-title-name)',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('folder-icon'),
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.getAttribute('data-testid') === 'folder-git-icon',
	isCollapsable: (_rowEl, _fileNameEl, _iconEl) => false,
};

const mergeRequestsTreeImplementation: ReplacementSelectorSet = {
	row: '.diff-tree-list .file-row',
	filename: '.file-row-name',
	icon: '.file-row-icon svg',
	isDirectory: (rowEl, _fileNameEl, _iconEl) =>
		rowEl.classList.contains('folder'),
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.firstElementChild.getAttribute('href').endsWith('#folder-git'),
	isCollapsable: (rowEl, fileNameEl, iconEl) =>
		mergeRequestsTreeImplementation.isDirectory(rowEl, fileNameEl, iconEl),
};
mergeRequestsTreeImplementation.styles = /* css */ `
/* Hide directory icons by default. */
${mergeRequestsTreeImplementation.row}.folder ${mergeRequestsTreeImplementation.icon} {
	display: none !important;
}
/* Show relevant extension directory icon depending on open/closed state. */
${mergeRequestsTreeImplementation.row}.is-open svg[${ATTRIBUTE_PREFIX}-iconname$='_open'],
${mergeRequestsTreeImplementation.row}:not(.is-open) svg[${ATTRIBUTE_PREFIX}]:not([${ATTRIBUTE_PREFIX}-iconname$='_open']) {
	display: inline-block !important;
}
`.trim();

export const gitlab: Site = {
	domains: ['gitlab.com'],
	replacements: [
		repositoryMainImplementation,
		fileContentsHeaderImplementation,
		commitDiffFileHeaderImplementation,
		mergeRequestsTreeImplementation,
	],
};
