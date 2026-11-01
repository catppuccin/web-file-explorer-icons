import type { ReplacementSelectorSet, Site } from ".";
import { ATTRIBUTE_PREFIX } from "../constants";

const repositorySideTreeImplementation: ReplacementSelectorSet = {
	row: '.repos-file-explorer-tree-cell',
	filename: 'a',
	icon: '.fluent-icons-enabled:not(:has(.ms-Icon--ChevronRightMed, .ms-Icon--ChevronDownMed)) > span',
	async setupObserver(row, replace) {
		await replace();

		const observer = new MutationObserver((mutations) => {
			const nodes = mutations
				.map(mutation => Array.from(mutation.addedNodes))
				.filter(nodes => nodes.length > 0)
				.flat() as Array<Element>

			// Prevent detecting our <svg> manipulations.
			//
			// If a single node in a single mutation does NOT have our manipulation
			// we still run `replace()` again though.
			if (nodes.length > 0 && nodes.every(node =>
				node.hasAttribute(ATTRIBUTE_PREFIX)
				&& node.getAttribute(ATTRIBUTE_PREFIX + "-filename") === row.textContent.trim()
			)) return;

			replace();
		});

		observer.observe(row, {
			subtree: true,
			childList: true,
			characterData: true,
			characterDataOldValue: true
		});
	},
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('repos-folder-icon'),
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) =>
		false, // TODO
	isCollapsable: (rowEl, fileNameEl, iconEl) =>
		repositorySideTreeImplementation.isDirectory(rowEl, fileNameEl, iconEl)
};
repositorySideTreeImplementation.styles = /* css */ `
${repositorySideTreeImplementation.row} {
	/* Hide directory icons by default. */
	svg {
		display: none !important;
	}

	/* Show relevant extension directory icon depending on open/closed state. */
	&:has(.ms-Icon--ChevronDownMed) svg[${ATTRIBUTE_PREFIX}-iconname$='_open'],
	&:has(.ms-Icon--ChevronRightMed) svg:not([${ATTRIBUTE_PREFIX}-iconname$='_open']) {
		display: inline-block !important;
	}
}
`.trim();

const repositoryMainImplementation: ReplacementSelectorSet = {
	row: '.repos-files-hub-page tbody [aria-colindex=\'1\']',
	filename: 'a',
	icon: '.fluent-icons-enabled > span',
	isDirectory: (_rowEl, _fileNameEl, iconEl) =>
		iconEl.classList.contains('repos-folder-icon'),
	isSubmodule: (_rowEl, _fileNameEl, _iconEl) =>
		false, // TODO
	isCollapsable: (_rowEl, _fileNameEl, _iconEl) =>
		false,
};

export const devops: Site = {
	domains: ['dev.azure.com'],
	replacements: [
		repositorySideTreeImplementation,
		repositoryMainImplementation
	]
};
