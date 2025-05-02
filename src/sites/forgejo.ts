import type { ReplacementSelectorSet, Site } from '.';
import { ATTRIBUTE_PREFIX } from '../constants';

const mainRepositoryImplementation: ReplacementSelectorSet = {
	row: '#repo-files-table .entry',
	filename: '.name a',
	icon: '.svg',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-directory-fill'),
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-submodule'),
	isCollapsable: (_rowEl, _fileNameEl, _iconEl) => false,
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
	isCollapsable: (rowEl, fileNameEl, iconEl) =>
		diffTreeImplementation.isDirectory(rowEl, fileNameEl, iconEl),
};
diffTreeImplementation.styles = /* css */ `
${diffTreeImplementation.row} {
	svg.octicon-file-directory-fill {
		display: none !important;
	}

	svg.octicon-chevron-down ~ svg[${ATTRIBUTE_PREFIX}-iconname$='_open'],
	svg.octicon-chevron-right ~ svg[${ATTRIBUTE_PREFIX}]:not([${ATTRIBUTE_PREFIX}-iconname$='_open']) {
		display: inline-block !important;
	}
}
`.trim();

const releaseAssetsImplementation: ReplacementSelectorSet = {
	row: '#release-list .download li',
	filename: 'a',
	icon: 'a > svg',
	isDirectory: (_rowEl, _fileNameEl, _iconEl) => false,
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false,
	isCollapsable: (_rowEl, _fileNameEl, _iconEl) => false,
	getFilename: (_rowEl, fileNameEl, _iconEl) =>
		(fileNameEl as HTMLAnchorElement).href,
};

export const forgejo: Site = {
	domains: ['codeberg.org'],
	replacements: [
		mainRepositoryImplementation,
		diffTreeImplementation,
		releaseAssetsImplementation,
	],
};
