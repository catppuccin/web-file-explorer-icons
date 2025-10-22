import type { ReplacementSelectorSet, Site } from '.';

import { ATTRIBUTE_PREFIX } from '../constants';

const mainRepositoryImplementation: ReplacementSelectorSet = {
	row: '#file-tree > div, .tree > div',
	filename: 'a',
	icon: 'svg',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('fill-current'),
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false, // TODO: Implement isSubmodule.
	isCollapsable: (_rowEl, _fileNameEl, _iconEl) => false,
};

const commitTreeImplementation: ReplacementSelectorSet = {
	row: '.diff-stat .tree-directory, .diff-stat .tree-file',
	filename: '.filename',
	icon: 'svg',
	isDirectory: (rowEl, _fileNameEl, _iconEl) =>
		rowEl.classList.contains('tree-directory'),
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false, // TODO: Implement isSubmodule.
	isCollapsable: (rowEl, fileNameEl, iconEl) =>
		commitTreeImplementation.isDirectory(rowEl, fileNameEl, iconEl),
};
commitTreeImplementation.styles = /* css */ `
/* Hide directory icons by default. */
${commitTreeImplementation.row.split(',').at(0)} ${commitTreeImplementation.icon} {
	display: none;
}

/* Show relevant extension directory icon depending on open/closed state. */
details[open] > summary > .tree-directory svg[${ATTRIBUTE_PREFIX}-iconname$='_open'],
details:not([open]) > summary > .tree-directory svg[${ATTRIBUTE_PREFIX}]:not([${ATTRIBUTE_PREFIX}-iconname$='_open']) {
	display: inline-block !important;
}
	`.trim();

export const tangled: Site = {
	domains: ['tangled.org'],
	replacements: [mainRepositoryImplementation, commitTreeImplementation],
};
