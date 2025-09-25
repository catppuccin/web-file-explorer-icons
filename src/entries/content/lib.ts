import type { IconName } from '@/types';

import { getAssociations } from '@/associations';
import { flavor, monochrome, specificFolders } from '@/storage';

import { flavors } from '@catppuccin/palette';

import { ATTRIBUTE_PREFIX, CSS_SELECTOR_SELF } from '@/constants';
import icons from '@/icons.json';
import type { ReplacementSelectorSet } from '@/sites';

export async function injectStyles(stylesEl: Element, siteStyles: string) {
	stylesEl.textContent =
		/* css */ `
	:root {
	${flavors[await flavor.getValue()].colorEntries
		.map(([name, { hex }]) => `--ctp-${name}: ${hex};`)
		.join('\n  ')}
	}
	`.trim() + siteStyles;
}

async function createIconElement(
	iconName: IconName,
	fileName: string,
	originalIconEl: HTMLElement,
): Promise<SVGSVGElement> {
	const temp = document.createElement('div');
	if (await monochrome.getValue()) {
		temp.innerHTML = icons[iconName].replaceAll(
			/var\(--ctp-\w+\)/g,
			'var(--ctp-text)',
		);
	} else {
		temp.innerHTML = icons[iconName];
	}
	const svg = temp.firstElementChild as SVGSVGElement;

	/* 
		We need to copy all classes to the svg to avoid React adding another icon
		as this icon is not recognised as the same icon.
		https://github.com/catppuccin/web-file-explorer-icons/issues/156
	*/
	if (originalIconEl.classList.length > 0) {
		svg.classList.add(...originalIconEl.classList);
	}

	svg.setAttribute(ATTRIBUTE_PREFIX, '');
	svg.setAttribute(`${ATTRIBUTE_PREFIX}-iconname`, iconName);
	svg.setAttribute(`${ATTRIBUTE_PREFIX}-filename`, fileName);

	for (const attribute of originalIconEl.getAttributeNames()) {
		if (
			!(
				attribute.startsWith(ATTRIBUTE_PREFIX) ||
				[
					'viewBox',
					'stroke-width',
					'stroke-linecap',
					'stroke-linejoin',
				].includes(attribute)
			)
		) {
			svg.setAttribute(
				attribute,
				originalIconEl.getAttribute(attribute) as string,
			);
		}
	}

	return svg;
}

async function findIconMatch(
	fileName: string,
	fileExtensions: Array<string>,
	isSubmodule: boolean,
	isDirectory: boolean,
): Promise<IconName> {
	// Special parent directory folder icon.
	if (fileName === '..') return '_folder';

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

export async function replaceIconInRow(
	rowEl: HTMLElement,
	selectors: ReplacementSelectorSet,
) {
	const iconEl = rowEl.querySelector(selectors.icon) as HTMLElement;
	// Icon already has extension prefix, not necessary to replace again.
	if (!iconEl || iconEl?.hasAttribute(ATTRIBUTE_PREFIX)) return;

	const fileNameEl =
		selectors.filename === CSS_SELECTOR_SELF
			? rowEl
			: (rowEl.querySelector(
					selectors.filename as string,
				) as HTMLElement);
	if (!fileNameEl) return;
	const fileName =
		'getFilename' in selectors
			? selectors.getFilename(rowEl, fileNameEl, iconEl)
			: fileNameEl.textContent
					?.split('/')
					.at(-1)
					.trim()
					/* Remove [Unicode LEFT-TO-RIGHT MARK](https://en.wikipedia.org/wiki/Left-to-right_mark) used on GitLab's merge request diff file tree. */
					.replace(/\u200E/g, '');

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
	const isCollapsable = selectors.isCollapsable(rowEl, fileNameEl, iconEl);

	const iconName = await findIconMatch(
		fileName,
		fileExtensions,
		isSubmodule,
		isDirectory,
	);

	const replacementEl = await createIconElement(iconName, fileName, iconEl);

	// Check if element sibling before current element was inserted by extension, replace the old replacement with the new one instead.
	const prevEl = iconEl.previousElementSibling;
	if (prevEl?.hasAttribute(ATTRIBUTE_PREFIX)) {
		replacementEl.replaceWith(prevEl);
	}
	// If the current icon element is an icon from this extension, replace it with the new icon.
	else if (iconEl.hasAttribute(ATTRIBUTE_PREFIX)) {
		iconEl.replaceWith(replacementEl);
	}
	// If neither of the above, prepend the new icon to the original icon element.
	// If we remove the icon, GitHub code view crashes when you navigate through the
	// tree view. Instead, we just hide it via `style` attribute (not CSS class).
	else {
		iconEl.style.display = 'none';
		iconEl.before(replacementEl);
	}

	if (isCollapsable) {
		const companionEl = await createIconElement(
			`${iconName}_open` as IconName,
			fileName,
			iconEl,
		);

		replacementEl.after(companionEl);
	}
}
