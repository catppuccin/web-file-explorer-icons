import type { ReplacementSelectorSet } from '@/sites';
import type { Flavor, IconName } from '@/types';

import { getAssociations } from '@/associations';
import { ATTRIBUTE_PREFIX, CSS_SELECTOR_SELF } from '@/constants';
import { flavor, monochrome, specificFolders } from '@/storage';

import { flavors } from '@catppuccin/palette';

import icons from '@/icons.json';

/*
 * Each row in a given file tree is tagged with an attribute specifying the associated icon,
 * and injected styles overlay that icon as the background of the original icon element (whose own contents are hidden).
 * Other approaches that rely on inserting or removing elements may break hydration with some frameworks (e.g. Svelte, due to hydration mismatch).
 */

const ICON_PROPERTY = '--catppuccin-icon';
const OPEN_ICON_PROPERTY = '--catppuccin-icon-open';

/** Create the static styles that paint each replacement's icon element with its row's icon, plus any site-specific styles. */
export function createReplacementStyles(
	replacements: Array<ReplacementSelectorSet>,
): string {
	return replacements
		.map((replacement) => {
			const pseudo = replacement.pseudo ?? '';
			const icon = `:is(${replacement.row})[${ATTRIBUTE_PREFIX}] :is(${replacement.icon})${pseudo}`;
			const openIcon = replacement.open
				? `:is(${replacement.row})[${ATTRIBUTE_PREFIX}]:is(${replacement.open}) :is(${replacement.icon})${pseudo}`
				: undefined;

			return [
				replacement.pseudo
					? /* css */ `
${icon} {
	content: '' !important;
	display: inline-block;
	background: var(${ICON_PROPERTY}) center / contain no-repeat !important;
}`
					: /* css */ `
${icon} {
	background: var(${ICON_PROPERTY}) center / contain no-repeat !important;
}
${icon} > * {
	display: none !important;
}
${icon}::before, ${icon}::after {
	content: none !important;
}`,
				openIcon &&
					/* css */ `
${openIcon} {
	background-image: var(${OPEN_ICON_PROPERTY}, var(${ICON_PROPERTY})) !important;
}`,
				replacement.styles,
			]
				.filter(Boolean)
				.join('\n');
		})
		.join('\n');
}

const usedIcons = new Set<IconName>();
let iconStylesEl: HTMLStyleElement;
let currentFlavor: Flavor;
let isMonochrome: boolean;

/** Create a CSS `url()` of the icon as an SVG data URL, with the current flavor's colors inserted in. */
function createIconDataUrl(iconName: IconName): string {
	const { colors } = flavors[currentFlavor];
	const svg = icons[iconName].replaceAll(
		/var\(--ctp-(\w+)\)/g,
		(_, color: keyof typeof colors) =>
			(isMonochrome ? colors.text : colors[color]).hex,
	);
	return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Create the rule defining the icon (and its open variant, if any) for rows tagged with it. */
function createIconStyleRule(iconName: IconName): string {
	const openIconName = `${iconName}_open` as IconName;
	const openIconExists = openIconName in icons;
	const openIconDecl = openIconExists
		? `${OPEN_ICON_PROPERTY}: ${createIconDataUrl(openIconName)};`
		: '';
	return `[${ATTRIBUTE_PREFIX}="${iconName}"] { ${ICON_PROPERTY}: ${createIconDataUrl(iconName)}; ${openIconDecl} }`;
}

/** Regenerate the rules for every icon used so far, e.g. after the flavor changes. */
function renderIconStyles() {
	iconStylesEl.textContent = [...usedIcons]
		.map(createIconStyleRule)
		.join('\n');
}

/** Set the element icon rules are written to, and keep them in sync with the flavor and monochrome settings. */
export async function injectIconStyles(stylesEl: HTMLStyleElement) {
	iconStylesEl = stylesEl;
	currentFlavor = await flavor.getValue();
	isMonochrome = await monochrome.getValue();

	flavor.watch((value) => {
		currentFlavor = value;
		renderIconStyles();
	});
	monochrome.watch((value) => {
		isMonochrome = value;
		renderIconStyles();
	});
}

/** Define the icon's rule if it has not been used before. */
function useIcon(iconName: IconName) {
	if (usedIcons.has(iconName)) return;
	usedIcons.add(iconName);

	const rule = createIconStyleRule(iconName);
	if (iconStylesEl.sheet) {
		iconStylesEl.sheet.insertRule(rule, iconStylesEl.sheet.cssRules.length);
	} else {
		iconStylesEl.textContent += `\n${rule}`;
	}
}

/** Find the icon for a file or directory, based on the default and custom associations. */
async function findIconMatch(
	fileName: string,
	fileExtensions: Array<string>,
	isSubmodule: boolean,
	isDirectory: boolean,
	isSymlink: boolean,
): Promise<IconName> {
	// Special parent directory folder icon.
	if (fileName === '..') return '_folder';

	if (isSymlink) return isDirectory ? 'folder_symlink' : 'symlink';

	const associations = await getAssociations();
	const useSpecificFolders = await specificFolders.getValue();

	if (useSpecificFolders && isSubmodule) return 'folder_git';

	if (isDirectory) {
		if (useSpecificFolders) {
			if (fileName in associations.folderNames)
				return associations.folderNames[fileName];
			if (fileName.toLowerCase() in associations.folderNames)
				return associations.folderNames[fileName.toLowerCase()];
		}

		return '_folder';
	}

	if (fileName in associations.fileNames)
		return associations.fileNames[fileName];
	if (fileName.toLowerCase() in associations.fileNames)
		return associations.fileNames[fileName.toLowerCase()];

	for (const ext of fileExtensions) {
		if (ext in associations.fileExtensions)
			return associations.fileExtensions[ext];
		if (ext in associations.languageIds)
			return associations.languageIds[ext];
	}

	return '_file';
}

/** Find the icon for a row and tag the row with it, or clear the tag if the row has no icon or filename. */
export async function replaceIconInRow(
	rowEl: HTMLElement,
	selectors: ReplacementSelectorSet,
) {
	const iconEl = rowEl.querySelector(selectors.icon) as HTMLElement;
	// Clear any previous icon, in case the site reused this row for something else.
	if (!iconEl) return rowEl.removeAttribute(ATTRIBUTE_PREFIX);

	const fileNameEl =
		selectors.filename === CSS_SELECTOR_SELF
			? rowEl
			: (rowEl.querySelector(
					selectors.filename as string,
				) as HTMLElement);
	if (!fileNameEl) return rowEl.removeAttribute(ATTRIBUTE_PREFIX);
	const fileName =
		'getFilename' in selectors
			? selectors.getFilename(rowEl, fileNameEl, iconEl)
			: fileNameEl.textContent?.split('/').at(-1).trim();

	const fileExtensions: Array<string> = [];
	// Avoid doing an explosive combination of extensions for very long filenames
	// (most file systems do not allow files > 255 length) with lots of `.` characters
	// https://github.com/microsoft/vscode/issues/116199
	if (fileName.length <= 255) {
		for (let i = 0; i < fileName.length; i += 1) {
			if (fileName[i] === '.')
				fileExtensions.push(fileName.toLowerCase().slice(i + 1));
		}
	}

	const isDirectory = selectors.isDirectory(rowEl, fileNameEl, iconEl);
	const isSubmodule = selectors.isSubmodule(rowEl, fileNameEl, iconEl);
	const isSymlink = selectors.isSymlink?.(rowEl, fileNameEl, iconEl) ?? false;

	const iconName = await findIconMatch(
		fileName,
		fileExtensions,
		isSubmodule,
		isDirectory,
		isSymlink,
	);

	// Define the icon's styles before tagging the row so the original icon is never hidden without a replacement.
	useIcon(iconName);
	if (rowEl.getAttribute(ATTRIBUTE_PREFIX) !== iconName)
		rowEl.setAttribute(ATTRIBUTE_PREFIX, iconName);
}
