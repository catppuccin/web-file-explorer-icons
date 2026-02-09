import './styles.css';

import type { Associations, Flavor, IconName } from '@/types';

import * as storage from '@/storage';
import { createStylesElement } from '@/utils';

import { flavorEntries } from '@catppuccin/palette';

import { Plus, X } from 'lucide-solid';
import { createEffect, createSignal, For, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';

type AssociationEntry = {
	key: string;
	icon: IconName;
};

type AssociationDrafts = Record<
	keyof Associations,
	{ key: string; icon: '' | IconName }
>;

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

export function App() {
	const [selectedFlavor, setSelectedFlavor] = createSignal<Flavor>('mocha');
	const [isSpecificFolders, setIsSpecificFolders] = createSignal(false);
	const [isMonochrome, setIsMonochrome] = createSignal(false);
	const [customAssociations, setCustomAssociations] = createStore<
		Record<keyof Associations, Array<AssociationEntry>>
	>({
		languageIds: [],
		fileExtensions: [],
		fileNames: [],
		folderNames: [],
	});
	const [associationDrafts, setAssociationDrafts] =
		createStore<AssociationDrafts>({
			languageIds: { key: '', icon: '' },
			fileExtensions: { key: '', icon: '' },
			fileNames: { key: '', icon: '' },
			folderNames: { key: '', icon: '' },
		});

	function associationsToEntries(
		associations: Associations,
	): Record<keyof Associations, Array<AssociationEntry>> {
		return Object.entries(associations).reduce(
			(acc, [type, entries]) => {
				acc[type as keyof Associations] = Object.entries(entries).map(
					([key, icon]) => ({
						key,
						icon,
					}),
				);
				return acc;
			},
			{} as Record<keyof Associations, Array<AssociationEntry>>,
		);
	}

	function entriesToAssociations(
		entries: Record<keyof Associations, Array<AssociationEntry>>,
	): Associations {
		return Object.entries(entries).reduce((acc, [type, entries]) => {
			acc[type as keyof Associations] = entries.reduce(
				(association, { key, icon }) => {
					association[key] = icon;
					return association;
				},
				{} as Record<string, IconName>,
			);
			return acc;
		}, {} as Associations);
	}

	onMount(async () => {
		injectStyles();

		const flavor = await storage.flavor.getValue();
		setSelectedFlavor(flavor);
		document.documentElement.setAttribute('theme', flavor);

		setIsSpecificFolders(await storage.specificFolders.getValue());
		setIsMonochrome(await storage.monochrome.getValue());
		setCustomAssociations(
			associationsToEntries(await storage.customAssociations.getValue()),
		);
	});

	createEffect(() => {
		const value = selectedFlavor();
		storage.flavor.setValue(value);
		document.documentElement.setAttribute('theme', value);
	});

	createEffect(async () => {
		await storage.specificFolders.setValue(isSpecificFolders());
	});

	createEffect(async () => {
		await storage.monochrome.setValue(isMonochrome());
	});

	createEffect(async () => {
		await storage.customAssociations.setValue(
			entriesToAssociations(customAssociations),
		);
	});

	const handleFlavorChange = (e: Event) => {
		const value = (e.target as HTMLSelectElement).value as Flavor;
		setSelectedFlavor(value);
	};

	const AssociationList = (props: {
		type: keyof Associations;
		entries: Array<AssociationEntry>;
		placeholderKey: string;
		placeholderIcon: IconName;
	}) => (
		<>
			<ul class="association-list">
				<For each={props.entries}>
					{(entry, index) => (
						<li>
							<input
								type="text"
								value={entry.key}
								required
								placeholder={props.placeholderKey}
								onChange={handleAssociationKeyChange(
									props.type,
									index(),
								)}
							/>
							<input
								type="text"
								value={entry.icon}
								required
								placeholder={props.placeholderIcon}
								onChange={handleAssociationIconChange(
									props.type,
									index(),
								)}
							/>
							<button
								type="button"
								class="btn-delete"
								onClick={handleDeleteAssociation(
									props.type,
									index(),
								)}
							>
								<X />
							</button>
						</li>
					)}
				</For>
				<li class="association-add">
					<input
						type="text"
						value={associationDrafts[props.type].key}
						placeholder={props.placeholderKey}
						onInput={(e) =>
							setAssociationDrafts(
								props.type,
								'key',
								e.currentTarget.value,
							)
						}
					/>
					<input
						type="text"
						value={associationDrafts[props.type].icon}
						placeholder={props.placeholderIcon}
						onInput={(e) =>
							setAssociationDrafts(
								props.type,
								'icon',
								e.currentTarget.value as IconName,
							)
						}
					/>
					<button
						type="button"
						class="btn-add"
						onClick={() => handleAddAssociation(props.type)}
					>
						<Plus />
					</button>
				</li>
			</ul>
		</>
	);

	function handleAssociationKeyChange(
		type: keyof Associations,
		index: number,
	) {
		return (e: Event) => {
			const value = (e.target as HTMLInputElement).value;
			setCustomAssociations(type, index, 'key', value);
		};
	}

	function handleAssociationIconChange(
		type: keyof Associations,
		index: number,
	) {
		return (e: Event) => {
			const value = (e.target as HTMLInputElement).value as IconName;
			setCustomAssociations(type, index, 'icon', value);
		};
	}

	function handleDeleteAssociation(type: keyof Associations, index: number) {
		return () => {
			setCustomAssociations(type, (prev) =>
				prev.filter((_, i) => i !== index),
			);
		};
	}

	function handleAddAssociation(type: keyof Associations) {
		const draft = associationDrafts[type];
		if (!(draft.key && draft.icon)) {
			return;
		}

		setCustomAssociations(type, (prev) => [
			...prev,
			{ key: draft.key, icon: draft.icon as IconName },
		]);
		setAssociationDrafts(type, { key: '', icon: '' });
	}

	return (
		<>
			<section>
				<label for="flavor">Flavor</label>
				<select
					id="flavor"
					value={selectedFlavor()}
					onChange={handleFlavorChange}
				>
					<For each={flavorEntries}>
						{([flavor, { name }]) => (
							<option value={flavor}>{name}</option>
						)}
					</For>
				</select>
			</section>
			<section class="associations">
				<span>Associations</span>
				<div>
					<span>File extensions</span>
					<AssociationList
						type="fileExtensions"
						entries={customAssociations.fileExtensions}
						placeholderKey="rs"
						placeholderIcon="rust"
					/>
				</div>
				<div>
					<span>File names</span>
					<AssociationList
						type="fileNames"
						entries={customAssociations.fileNames}
						placeholderKey="Cargo.toml"
						placeholderIcon="toml"
					/>
				</div>
				<div>
					<span>Folder names</span>
					<AssociationList
						type="folderNames"
						entries={customAssociations.folderNames}
						placeholderKey="node_modules"
						placeholderIcon="javascript"
					/>
				</div>
			</section>
			<section>
				<label for="specificFolders">Specific folders</label>
				<input
					id="specificFolders"
					type="checkbox"
					checked={isSpecificFolders()}
					onChange={(e) =>
						setIsSpecificFolders(e.currentTarget.checked)
					}
				/>
			</section>
			<section>
				<label for="monochrome">Monochrome</label>
				<input
					id="monochrome"
					type="checkbox"
					checked={isMonochrome()}
					onChange={(e) => setIsMonochrome(e.currentTarget.checked)}
				/>
			</section>
		</>
	);
}
