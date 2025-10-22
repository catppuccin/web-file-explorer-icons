import type { ReplacementSelectorSet, Site } from '.';

import { ATTRIBUTE_PREFIX } from '../constants';

// For the inner repository file sidepanel. Extra specificity to avoid matching icons on the new commit details page, which uses the same component.
const repositorySideTreeImplementation: ReplacementSelectorSet = {
	row: 'ul[aria-label="Files"] .PRIVATE_TreeView-item-content',
	filename:
		'.PRIVATE_TreeView-item-content > .PRIVATE_TreeView-item-content-text',
	icon: '.PRIVATE_TreeView-item-visual svg',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.getAttribute('class')?.includes('octicon-file-directory-'),
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-submodule'),
	isCollapsable: (rowEl, fileNameEl, iconEl) =>
		repositorySideTreeImplementation.isDirectory(rowEl, fileNameEl, iconEl),
};
repositorySideTreeImplementation.styles = /* css */ `
${repositorySideTreeImplementation.row} {
	/* Hide directory icons by default. */
	.PRIVATE_TreeView-directory-icon svg {
		display: none !important;
	}

	/* Show relevant extension directory icon depending on open/closed state. */
	svg[${ATTRIBUTE_PREFIX}-iconname$='_open']:has(~ svg.octicon-file-directory-open-fill:not([data-catppuccin-file-explorer-icons])),
	svg:not([${ATTRIBUTE_PREFIX}-iconname$='_open']):has(~ svg.octicon-file-directory-fill:not([data-catppuccin-file-explorer-icons])),
	svg[${ATTRIBUTE_PREFIX}]:has(+ .octicon-file) {
		display: inline-block !important;
	}
}
`.trim();

const repositoryMainImplementation: ReplacementSelectorSet = {
	row: '.react-directory-filename-column',
	filename: '.react-directory-filename-cell a',
	icon: 'svg',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('icon-directory'),
	isSubmodule: (_rowEl, fileNameEl, _iconEl) =>
		fileNameEl.getAttribute('aria-label')?.includes('(Submodule)'),
	isCollapsable: (_rowEl, _fileNameEl, _iconEl) => false,
};

const repositoryMainParentDirectoryImplementation: ReplacementSelectorSet = {
	row: '#folder-row-0 [aria-label="Parent directory"]',
	filename: 'div',
	icon: 'svg',
	isDirectory: (_rowEl, _fileNameEl, _iconEl) => true,
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false,
	isCollapsable: (_rowEl, _fileNameEl, _iconEl) => false,
};

const pullRequestTreeImplementation: ReplacementSelectorSet = {
	row: 'file-tree .ActionList-content',
	filename: '.ActionList-item-label',
	icon: '.ActionList-item-visual svg',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.getAttribute('aria-label') === 'Directory',
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.getAttribute('aria-label') === 'Submodule',
	isCollapsable: (rowEl, fileNameEl, iconEl) =>
		pullRequestTreeImplementation.isDirectory(rowEl, fileNameEl, iconEl),
};
pullRequestTreeImplementation.styles = /* css */ `
${pullRequestTreeImplementation.row} {
	/* Hide directory icons by default. */
	${pullRequestTreeImplementation.icon}[aria-label="Directory"] {
		display: none;
	}

	/* Show relevant extension directory icon depending on open/closed state. */
	&[aria-expanded="true"] svg[${ATTRIBUTE_PREFIX}-iconname$='_open'],
	&[aria-expanded="false"] svg[${ATTRIBUTE_PREFIX}]:not([${ATTRIBUTE_PREFIX}-iconname$='_open']) {
		display: inline-block !important;
	}
}
	`.trim();

const releaseAssetsImplementation: ReplacementSelectorSet = {
	row: '#release_page_title + div > section ul li',
	filename: 'a.Truncate',
	icon: 'svg.octicon',
	isDirectory: (_rowEl, _fileNameEl, _iconEl) => false,
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false,
	isCollapsable: (_rowEl, _fileNameEl, _iconEl) => false,
	getFilename: (_rowEl, fileNameEl, _iconEl) =>
		(fileNameEl as HTMLAnchorElement).href,
};
releaseAssetsImplementation.styles = /* css */ `
${releaseAssetsImplementation.row} {
	svg[${ATTRIBUTE_PREFIX}] {
		margin-right: 4px;
	}
}
	`.trim();

export const github: Site = {
	domains: ['github.com'],
	replacements: [
		repositorySideTreeImplementation,
		repositoryMainImplementation,
		pullRequestTreeImplementation,
		repositoryMainParentDirectoryImplementation,
		releaseAssetsImplementation,
	],
};
