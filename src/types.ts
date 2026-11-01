import type icons from '@/icons.json';

export type Flavor = 'latte' | 'frappe' | 'macchiato' | 'mocha';

/** A flavor, or `auto` to pick between the light and dark flavors depending on the site's color scheme. */
export type FlavorSetting = Flavor | 'auto';

export type IconName = keyof typeof icons;

export type Associations = {
	languageIds: Record<string, IconName>;
	fileExtensions: Record<string, IconName>;
	fileNames: Record<string, IconName>;
	folderNames: Record<string, IconName>;
};
