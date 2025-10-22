import './styles.css';

import type { Associations, Flavor, IconName } from '@/types';

import { icons } from '@/constants';
import {
	customAssociations,
	darkFlavor,
	monochrome,
	specificFolders,
} from '@/storage';
import { createStylesElement } from '@/utils';

import { flavorEntries } from '@catppuccin/palette';

function injectStyles() {
	const styles = createStylesElement();

	styles.textContent = flavorEntries
		.map(
			([flavor, { colorEntries }]) =>
				`:root[theme="${flavor}"] {\n${colorEntries.map(([name, { hex }]) => `  --ctp-${name}: ${hex};`).join('\n')}\n}`,
		)
		.join('\n');

	document.documentElement.appendChild(styles);
}

async function init() {
	injectStyles();

	const flavorEl = document.querySelector('#flavor') as HTMLSelectElement;

	flavorEl.value = await darkFlavor.getValue();
	document.documentElement.setAttribute('theme', flavorEl.value);

	flavorEl.addEventListener('change', async () => {
		const value = flavorEl.value as Flavor;
		await darkFlavor.setValue(value);
		document.documentElement.setAttribute('theme', value);
	});

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
