import type { ReplacementSelectorSet, Site } from '.';
import { ATTRIBUTE_PREFIX, CSS_SELECTOR_SELF } from '../constants';

const mainRepositoryImplementation: ReplacementSelectorSet = {
	row: '#repo-files-table .repo-file-item',
	filename: '.name a',
	icon: '.svg',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-directory-fill'),
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-submodule'),
	isCollapsable: (_rowEl, _fileNameEl, _iconEl) => false,
};

const mainRepositoryParentLinkImplementation: ReplacementSelectorSet = {
	row: '#repo-files-table .repo-file-line.parent-link',
	filename: CSS_SELECTOR_SELF,
	icon: '.svg',
	isDirectory: (_rowEl, _fileNameEl, _iconEl) => true,
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false,
	isCollapsable: (_rowEl, _fileNameEl, _iconEl) => false,
};

const repositorySideTreeImplementation: ReplacementSelectorSet = {
	row: '.view-file-tree-items .tree-item',
	filename: '.item-content .gt-ellipsis',
	icon: '.item-content .svg',
	isDirectory: (rowEl, _fileNameEl, _iconEl) =>
		rowEl.classList.contains('type-directory'),
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-submodule'),
	isCollapsable: (rowEl, fileNameEl, iconEl) =>
		repositorySideTreeImplementation.isDirectory(rowEl, fileNameEl, iconEl),
};
repositorySideTreeImplementation.styles = /* css */ `
${repositorySideTreeImplementation.row} {
	&.type-directory .item-content .svg {
		display: none !important;
	}

	.item-toggle:has(svg.octicon-chevron-down) ~ .item-content svg[${ATTRIBUTE_PREFIX}-iconname$='_open'],
	.item-toggle:has(svg.octicon-chevron-right) ~ .item-content svg[${ATTRIBUTE_PREFIX}]:not([${ATTRIBUTE_PREFIX}-iconname$='_open']) {
		display: inline-block !important;
	}
}
`.trim();

const diffTreeImplementation: ReplacementSelectorSet = {
	row: '.diff-file-tree-items .item-directory, .diff-file-tree-items .item-file',
	filename: '.gt-ellipsis',
	icon: '.octicon-file-directory-fill, .octicon-file-directory-open-fill, .octicon-file',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-directory-fill') ||
		iconEl.classList.contains('octicon-file-directory-open-fill'),
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-submodule'),
	isCollapsable: (rowEl, fileNameEl, iconEl) =>
		diffTreeImplementation.isDirectory(rowEl, fileNameEl, iconEl),
};
diffTreeImplementation.styles = /* css */ `
${diffTreeImplementation.row} {
	svg.octicon-file-directory-fill, svg.octicon-file-directory-open-fill {
		display: none !important;
	}

	svg.octicon-chevron-down ~ svg[${ATTRIBUTE_PREFIX}-iconname$='_open'],
	svg.octicon-chevron-right ~ svg[${ATTRIBUTE_PREFIX}]:not([${ATTRIBUTE_PREFIX}-iconname$='_open']) {
		display: inline-block !important;
	}
}
`.trim();

export const gitea: Site = {
	domains: ['gitea.com'],
	replacements: [
		mainRepositoryImplementation,
		mainRepositoryParentLinkImplementation,
		repositorySideTreeImplementation,
		diffTreeImplementation,
	],
};
