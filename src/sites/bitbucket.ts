import type { ReplacementSelectorSet, Site } from './index.js';

import { ATTRIBUTE_PREFIX } from '../constants';

const mainRepositoryImplementation: ReplacementSelectorSet = {
	row: 'table[data-qa="repository-directory"] tr:not(:has(a[aria-label="Parent directory"]))',
	filename: 'td:first-of-type',
	icon: 'svg',
	isDirectory: (rowEl, _fileNameEl, _iconEl) =>
		rowEl.querySelector('a[aria-label^="Directory,"]') !== null,
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-submodule'),
};
mainRepositoryImplementation.styles = /* css */ `
/* Remove tinted box behind folder icons and shrink file icons to 16px for consistency. */
${mainRepositoryImplementation.row}[${ATTRIBUTE_PREFIX}] {
	span:has(> span > svg) {
		background: none !important;
	}
	svg {
		background-size: 16px !important;
	}
}
`.trim();

const fileContentsHeaderImplementation: ReplacementSelectorSet = {
	row: '[data-qa="bk-file__header"]',
	filename: 'span:has(+ div [aria-label="Copy File Path"])',
	// Only the leading icon, not those of the copy and overflow buttons.
	icon: '[data-qa="bk-file__header"] > div:first-child svg',
	isDirectory: (_rowEl, _fileNameEl, _iconEl) => false,
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false,
};
fileContentsHeaderImplementation.styles = /* css */ `
/* Shrink icon size to 16px to match. */
${fileContentsHeaderImplementation.row}[${ATTRIBUTE_PREFIX}] > div:first-child svg {
	background-size: 16px !important;
}
`.trim();

export const bitbucket: Site = {
	domains: ['bitbucket.org'],
	replacements: [
		mainRepositoryImplementation,
		fileContentsHeaderImplementation,
	],
};
