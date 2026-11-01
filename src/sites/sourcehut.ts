import type { ReplacementSelectorSet, Site } from '.';

import { ATTRIBUTE_PREFIX } from '../constants';

// Both git (`tree`, `blob`, and `commit` for submodules) and Mercurial (`dir`, `file`) file listings, which have no icons of their own.
const repositoryTreeImplementation: ReplacementSelectorSet = {
	row: '.tree-list .name',
	filename: 'a',
	icon: 'a',
	pseudo: '::before',
	isDirectory: (rowEl, _fileNameEl, _iconEl) =>
		rowEl.classList.contains('tree') || rowEl.classList.contains('dir'),
	isSubmodule: (rowEl, _fileNameEl, _iconEl) =>
		rowEl.classList.contains('commit'),
	// The file mode is in the preceding cell of the row.
	isSymlink: (rowEl, _fileNameEl, _iconEl) =>
		rowEl.previousElementSibling?.querySelector('[title="120000"]') !==
		null,
	// Directory names have a trailing slash, e.g. `.builds/`.
	getFilename: (_rowEl, fileNameEl, _iconEl) =>
		fileNameEl.textContent.trim().replace(/\/$/, ''),
};
repositoryTreeImplementation.styles = /* css */ `
${repositoryTreeImplementation.row}[${ATTRIBUTE_PREFIX}] a::before {
	width: 1em;
	height: 1em;
	margin-right: 0.4em;
	vertical-align: -0.125em;
}
`.trim();

export const sourcehut: Site = {
	domains: ['git.sr.ht', 'hg.sr.ht'],
	replacements: [repositoryTreeImplementation],
};
