import type { ReplacementSelectorSet, Site } from '.';

const repositoryMainImplementation: ReplacementSelectorSet = {
	row: '.tree-table .tree-item',
	filename: '.tree-item-file-name .tree-item-link',
	icon: 'span svg:has(use)',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('folder-icon'),
	isSubmodule: (_rowEl, fileNameEl, _iconEl) =>
		fileNameEl.classList.contains('is-submodule'),
};

const repositorySideTreeImplementation: ReplacementSelectorSet = {
	row: '.file-tree-browser .repository-tree-list .file-row',
	filename: '.file-row-name span:last-of-type',
	icon: 'svg',
	isDirectory: (rowEl, _fileNameEl, _iconEl) =>
		rowEl.classList.contains('folder'),
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false, // TODO: determine submodule flag
	open: '.is-open',
};

const fileHeaderImplementation: ReplacementSelectorSet = {
	row: '.tree-ref-container + div > [data-testid="repository-heading"]',
	icon: 'span svg',
	filename: 'span', // dummy value, filename is in raw text content node within the row
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('folder-icon'),
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false, // TODO: determine submodule flag
	getFilename: (rowEl, _fileNameEl, _iconEl) => rowEl.textContent.trim(),
};

const fileContentsHeaderImplementation: ReplacementSelectorSet = {
	row: '.blob-content-holder .file-holder .file-header-content',
	filename: '.file-title-name',
	icon: 'span svg:has(use)',
	isDirectory: (_rowEl, _fileNameEl, _iconEl) => false, // is only ever a file (blob contents header)
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false,
};

const mergeRequestsTreeImplementation: ReplacementSelectorSet = {
	row: '.diff-tree-list .file-row',
	filename: '.file-row-name',
	icon: '.file-row-name svg',
	isDirectory: (rowEl, _fileNameEl, _iconEl) =>
		rowEl.classList.contains('folder'),
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.firstElementChild.getAttribute('href').endsWith('#folder-git'),
	open: '.is-open',
	// Names have [LEFT-TO-RIGHT MARKs](https://en.wikipedia.org/wiki/Left-to-right_mark) around the extension, e.g. `go.\u200Emod\u200E`.
	getFilename: (_rowEl, fileNameEl, _iconEl) =>
		fileNameEl.textContent.replace(/\u200E/g, '').trim(),
};

export const gitlab: Site = {
	domains: ['gitlab.com'],
	replacements: [
		repositoryMainImplementation,
		repositorySideTreeImplementation,
		fileHeaderImplementation,
		fileContentsHeaderImplementation,
		mergeRequestsTreeImplementation,
	],
};
