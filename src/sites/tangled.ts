import type { ReplacementSelectorSet, Site } from '.';

// Both the repository file tree and the files of the commit/pull diff file tree.
const fileTreeImplementation: ReplacementSelectorSet = {
	row: '.file-tree .tree-entry, .diff-file-tree .tree-file',
	filename: '.tree-name',
	icon: '.tree-icon',
	// `data-kind` is the entry kind: one of `directory`, `submodule`, `symlink`, or `file` (see https://tangled.org/tangled.org/core/blob/master/web/src/lib/components/repo/FileTree.svelte).
	isDirectory: (rowEl, _fileNameEl, _iconEl) =>
		rowEl.dataset.kind === 'directory',
	isSubmodule: (rowEl, _fileNameEl, _iconEl) =>
		rowEl.dataset.kind === 'submodule',
	isSymlink: (rowEl, _fileNameEl, _iconEl) =>
		rowEl.dataset.kind === 'symlink',
};

const diffTreeDirectoryImplementation: ReplacementSelectorSet = {
	row: '.diff-file-tree .tree-directory',
	filename: '.tree-name',
	icon: '.tree-name',
	pseudo: '::before', // directories here only have a toggle chevron and no icon; adds one before the path name using a ::before psuedo element.
	isDirectory: (_rowEl, _fileNameEl, _iconEl) => true,
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false,
	open: '[aria-expanded="true"]',
};
diffTreeDirectoryImplementation.styles = /* css */ `
${diffTreeDirectoryImplementation.row} .tree-name::before {
	/* Match the size of file icons and the row's gap for psuedo icons. */
	width: 14px;
	height: 14px;
	margin-right: 8px;
	vertical-align: -2px;
}
`.trim();

export const tangled: Site = {
	domains: ['tangled.org'],
	// `data-theme` is only set when a scheme is chosen explicitly.
	dark: '[data-theme="dark"]',
	system: ':not([data-theme="light"])',
	replacements: [fileTreeImplementation, diffTreeDirectoryImplementation],
};
