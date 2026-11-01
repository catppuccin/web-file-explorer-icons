import type { ReplacementSelectorSet, Site } from '.';

// For the inner repository file sidepanel. Extra specificity to only match this tree, as the commit page's diff tree uses the same component (see `commitTreeImplementation`).
const repositorySideTreeImplementation: ReplacementSelectorSet = {
	row: 'ul[aria-label="Files"] .PRIVATE_TreeView-item-content',
	filename:
		'.PRIVATE_TreeView-item-content > .PRIVATE_TreeView-item-content-text',
	icon: '.PRIVATE_TreeView-item-visual svg',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.getAttribute('class')?.includes('octicon-file-directory-'),
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('octicon-file-submodule'),
	open: ':has(.octicon-file-directory-open-fill)',
};

// The commit page's diff file tree, which uses the same component as the repository side tree.
const commitTreeImplementation: ReplacementSelectorSet = {
	...repositorySideTreeImplementation,
	row: '#diff_file_tree ul[aria-label="File Tree"] .PRIVATE_TreeView-item-content',
};

const repositoryMainImplementation: ReplacementSelectorSet = {
	row: '.react-directory-filename-column',
	filename: '.react-directory-filename-cell a',
	icon: 'svg',
	// Symlinks to files also have the `icon-directory` class.
	isDirectory: (_rowEl, fileNameEl, iconEl) =>
		iconEl.classList.contains('icon-directory') &&
		!fileNameEl.getAttribute('aria-label')?.endsWith('(Symlink to file)'),
	isSubmodule: (_rowEl, fileNameEl, _iconEl) =>
		fileNameEl.getAttribute('aria-label')?.includes('(Submodule)'),
	isSymlink: (_rowEl, fileNameEl, _iconEl) =>
		/\(Symlink to (file|directory)\)$/.test(
			fileNameEl.getAttribute('aria-label') ?? '',
		),
};

const repositoryMainParentDirectoryImplementation: ReplacementSelectorSet = {
	row: '#folder-row-0 [aria-label="Parent directory"]',
	filename: 'div',
	icon: 'svg',
	isDirectory: (_rowEl, _fileNameEl, _iconEl) => true,
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false,
};

const pullRequestTreeImplementation: ReplacementSelectorSet = {
	row: 'file-tree .ActionList-content',
	filename: '.ActionList-item-label',
	// Leading only, the icon at the end of the row is the git/change status (added, modified, etc.).
	icon: '.ActionList-item-visual--leading svg',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.getAttribute('aria-label') === 'Directory',
	isSubmodule: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.getAttribute('aria-label') === 'Submodule',
	// Symlinks to both files and directories are labelled `Symlink Directory`, so they cannot be told apart.
	isSymlink: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.getAttribute('aria-label') === 'Symlink Directory',
	open: '[aria-expanded="true"]',
};

const releaseAssetsImplementation: ReplacementSelectorSet = {
	row: 'li.Box-row:has(a[href*="/releases/download/"], a[href*="/archive/refs/tags/"])',
	filename: 'a[href*="/releases/download/"], a[href*="/archive/refs/tags/"]',
	// Specific octicons only, as rows also contain e.g. a copy button icon.
	icon: 'svg:is(.octicon-package, .octicon-file-zip)',
	isDirectory: (_rowEl, _fileNameEl, _iconEl) => false,
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) => false,
	getFilename: (_rowEl, fileNameEl, _iconEl) =>
		(fileNameEl as HTMLAnchorElement).href,
};

export const github: Site = {
	domains: ['github.com'],
	// Themes are named for their scheme (e.g. `dark_dimmed`, `light_high_contrast`), and either can be used for either mode.
	dark: '[data-color-mode="dark"][data-dark-theme^="dark"], [data-color-mode="light"][data-light-theme^="dark"]',
	system: '[data-color-mode="auto"][data-dark-theme^="dark"]',
	replacements: [
		repositorySideTreeImplementation,
		commitTreeImplementation,
		repositoryMainImplementation,
		pullRequestTreeImplementation,
		repositoryMainParentDirectoryImplementation,
		releaseAssetsImplementation,
	],
};
