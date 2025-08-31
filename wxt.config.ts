import { defineConfig } from 'wxt';

import { join } from 'node:path';
import { hfs } from '@humanfs/node';

import jiti from 'jiti';

import { matches } from './src/sites';

export default defineConfig({
	srcDir: 'src',
	entrypointsDir: 'entries',
	outDir: 'dist',
	// https://wxt.dev/guide/key-concepts/manifest.html
	manifest: ({ manifestVersion }) => {
		const defaults = {
			name: 'Catppuccin for Web File Explorer Icons',
			permissions: ['storage', 'contextMenus', 'activeTab'],
		};

		const mv3 = {
			permissions: [...defaults.permissions, 'scripting'],
			optional_host_permissions: ['*://*/*'],
		};

		const mv2 = {
			optional_permissions: ['*://*/*'],
		};

		return { ...defaults, ...(manifestVersion === 3 ? mv3 : mv2) };
	},
	hooks: {
		'build:before': async () => {
			const ICON_DIR = join(
				__dirname,
				'./vscode-icons/icons/css-variables/',
			);
			const icons = {};

			for await (const entry of hfs.list(ICON_DIR)) {
				icons[entry.name.replace('.svg', '')] = await hfs
					.text(join(ICON_DIR, entry.name))
					.then((text) =>
						text
							.replaceAll('--vscode-ctp', '--ctp')
							.replaceAll('\n\t', ''),
					);
			}

			await hfs.write(
				join(__dirname, './src/icons.json'),
				JSON.stringify(icons),
			);

			await hfs.write(
				join(__dirname, './src/associations.json'),
				JSON.stringify(
					jiti(__dirname)('./vscode-icons/src/defaults/index.ts')
						.defaultConfig.associations,
				),
			);
		},
		'build:manifestGenerated': (wxt, manifest) => {
			if (wxt.config.command === 'serve') {
				// During development, content script is not listed in manifest, causing
				// "webext-dynamic-content-scripts" to throw an error. So we need to
				// add it manually.
				manifest.content_scripts ??= [];
				manifest.content_scripts.push({
					// Make sure `matches` URLs are updated in src/entries/content/index.ts as well.
					matches: matches,
					run_at: 'document_start',
					js: ['content-scripts/content.js'],
				});
			}
		},
	},
	modules: ['@wxt-dev/auto-icons'],
	webExt: {
		startUrls: [
			'https://github.com/catppuccin/catppuccin',
			'https://gitlab.com/gitlab-org/gitlab',
			'https://codeberg.org/forgejo/forgejo',
			'https://gitea.com/gitea/gitea-mirror',
			'https://gitea.catppuccin.com/catppuccin/catppuccin',
			'https://bitbucket.org/atlassian/atlassian-frontend-mirror',
			'https://tangled.sh/@tangled.sh/core',
		],
	},
});
