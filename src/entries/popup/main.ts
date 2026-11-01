import './styles.css';

import type { Associations, Flavor, IconName } from '@/types';

import { icons } from '@/constants';
import {
	customAssociations,
	darkFlavor,
	flavor,
	lightFlavor,
	monochrome,
	specificFolders,
} from '@/storage';
import { createStylesElement } from '@/utils';

import { flavorEntries } from '@catppuccin/palette';

function injectPaletteVariablesAsStyles() {
	const styles = createStylesElement('catppuccin-icons-css-variables');

	styles.textContent = flavorEntries
		.map(
			([flavor, { colorEntries }]) =>
				`:root[theme="${flavor}"] {\n${colorEntries.map(([name, { hex }]) => `  --ctp-${name}: ${hex};`).join('\n')}\n}`,
		)
		.join('\n');

	document.documentElement.appendChild(styles);
}

async function init() {
	injectPaletteVariablesAsStyles();

	const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');

	// Theme the popup with the selected flavor, or with the light or dark flavor matching the system color scheme if automatic.
	async function applyTheme() {
		const value = await flavor.getValue();
		document.documentElement.setAttribute(
			'theme',
			value === 'auto'
				? await (darkScheme.matches
						? darkFlavor
						: lightFlavor
					).getValue()
				: value,
		);
		for (const el of document.querySelectorAll<HTMLElement>(
			'.automatic-flavor',
		))
			el.hidden = value !== 'auto';
	}

	for (const [selector, storage] of Object.entries({
		flavor: flavor,
		lightFlavor: lightFlavor,
		darkFlavor: darkFlavor,
	})) {
		const el = document.querySelector(`#${selector}`) as HTMLSelectElement;
		el.value = await storage.getValue();
		el.addEventListener('change', async () => {
			await storage.setValue(el.value as Flavor);
			await applyTheme();
		});
	}

	darkScheme.addEventListener('change', applyTheme);
	await applyTheme();

	for (const [selector, storage] of Object.entries({
		specificFolders: specificFolders,
		monochrome: monochrome,
	})) {
		const el = document.querySelector(`#${selector}`) as HTMLInputElement;
		el.checked = await storage.getValue();
		el.addEventListener('change', async () => {
			const value = el.checked;
			await storage.setValue(value);
		});
	}

	const associations = await customAssociations.getValue();

	for (const [key, el] of Object.entries({
		fileExtensions: document.querySelector(
			'ul#associations-file-extensions',
		),
		fileNames: document.querySelector('ul#associations-file-names'),
		folderNames: document.querySelector('ul#associations-folder-names'),
	} as Record<keyof Associations, HTMLUListElement>) as Array<
		[keyof Associations, HTMLUListElement]
	>) {
		for (const [association, icon] of Object.entries(associations[key])) {
			const li = document.createElement('li');
			const inputA = document.createElement('input');
			const inputB = document.createElement('input');
			const del = document.createElement('button');

			del.className = 'delete';
			del.innerHTML = icons.x;

			inputA.value = association;
			inputA.setAttribute('required', 'true');

			inputB.value = icon;
			inputB.setAttribute('required', 'true');

			li.appendChild(inputA);
			li.appendChild(inputB);
			li.appendChild(del);
			el.appendChild(li);

			del.addEventListener('click', async () => {
				if (inputA.checkValidity()) {
					delete associations[key][association];
					await customAssociations.setValue(associations);
					li.remove();
				}
			});
			inputA.addEventListener('change', async () => {
				if (inputA.checkValidity()) {
					delete associations[key][association];
					associations[key][inputA.value] = icon;
					await customAssociations.setValue(associations);
				}
			});
			inputB.addEventListener('change', async () => {
				if (inputB.checkValidity()) {
					associations[key][association] = inputB.value as IconName;
					await customAssociations.setValue(associations);
				}
			});
		}

		function addEmpty() {
			const li = document.createElement('li');
			const inputA = document.createElement('input');
			const inputB = document.createElement('input');
			const del = document.createElement('button');

			del.className = 'delete';
			del.innerHTML = icons.x;

			inputA.setAttribute('required', 'true');
			inputB.setAttribute('required', 'true');

			li.appendChild(inputA);
			li.appendChild(inputB);
			li.appendChild(del);
			el.appendChild(li);

			del.addEventListener('click', async () => {
				if (inputA.checkValidity()) {
					delete associations[key][inputA.value];
					await customAssociations.setValue(associations);
					li.remove();
				}
			});

			let addedEmpty = false;

			inputA.addEventListener('change', async () => {
				if (inputA.checkValidity()) {
					delete associations[key][inputA.value];
					associations[key][inputA.value] = inputB.value as IconName;
					await customAssociations.setValue(associations);
				}
				if (
					!addedEmpty &&
					inputA.checkValidity() &&
					inputB.checkValidity()
				) {
					addEmpty();
					addedEmpty = true;
				}
			});
			inputB.addEventListener('change', async () => {
				if (inputB.checkValidity()) {
					associations[key][inputA.value] = inputB.value as IconName;
					await customAssociations.setValue(associations);
				}
				if (
					!addedEmpty &&
					inputA.checkValidity() &&
					inputB.checkValidity()
				) {
					addEmpty();
					addedEmpty = true;
				}
			});
		}

		addEmpty();
	}
}

init();
