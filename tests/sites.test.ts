import type { BrowserContext } from 'playwright';
import type { Site } from '@/sites';

import { bitbucket } from '@/sites/bitbucket';
import { forgejo } from '@/sites/forgejo';
import { gitea } from '@/sites/gitea';
import { github } from '@/sites/github';
import { gitlab } from '@/sites/gitlab';
// import { sourcehut } from '@/sites/sourcehut';
import { tangled } from '@/sites/tangled';
import {
	collectRows,
	launchWithExtension,
	waitForReplacements,
} from './browser';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

type TestCase = {
	name: string;
	url: string;
	/** A sample of file names and the icons they should be replaced with. */
	expected: Record<string, string>;
};

// Prefer URLs pinned to a commit, pull request, or tag so the expected files do not change.
// Codeberg and Gitea serve bot challenges or sign-in walls for anything past the repository root.
const cases: Array<[Site, Array<TestCase>]> = [
	[
		github,
		[
			{
				name: 'repository',
				url: 'https://github.com/catppuccin/catppuccin',
				expected: {
					'.github': 'folder_github',
					'README.md': 'readme',
					'package.json': 'package-json',
				},
			},
			{
				name: 'repository side tree',
				url: 'https://github.com/catppuccin/catppuccin/blob/main/README.md',
				expected: {
					'.github': 'folder_github',
					LICENSE: 'license',
					'pnpm-lock.yaml': 'pnpm-lock',
				},
			},
			{
				name: 'pull request tree',
				url: 'https://github.com/catppuccin/vscode-icons/pull/600/files',
				expected: {
					workflows: 'folder_workflows',
					'ci.yml': 'yaml',
					'package.json': 'package-json',
				},
			},
			{
				name: 'commit diff tree',
				url: 'https://github.com/catppuccin/catppuccin/commit/ad76b8d005b3497afe5df8966cd08815854d09cc',
				expected: {
					resources: '_folder',
					types: 'folder_types',
					'README.md': 'readme',
					'ports.yml': 'yaml',
					'ports.schema.d.ts': 'typescript-def',
				},
			},
			{
				name: 'release assets',
				url: 'https://github.com/catppuccin/vscode-icons/releases/tag/v1.26.0',
				expected: {
					'catppuccin-vsc-icons-1.26.0.vsix': 'vscode',
					'v1.26.0.zip': 'zip',
				},
			},
			{
				name: 'parent directory row',
				url: 'https://github.com/catppuccin/catppuccin/tree/d09787dd98ca6fba08af5ef2ae94a7e09f17daca/resources',
				expected: {
					'..': '_folder',
					types: 'folder_types',
					'ports.yml': 'yaml',
				},
			},
			// TODO: Test that open/closed folder icons follow expanded state in the side tree and pull request tree.
		],
	],
	[
		gitlab,
		[
			{
				name: 'repository',
				url: 'https://gitlab.com/gitlab-org/gitlab',
				expected: {
					'.gitlab': 'folder_gitlab',
					'.github': 'folder_github',
				},
			},
			{
				name: 'merge request tree',
				url: 'https://gitlab.com/gitlab-org/gitlab-runner/-/merge_requests/7737/diffs',
				expected: {
					'go.mod': 'go-mod',
					'go.sum': 'go-mod',
				},
			},
			{
				name: 'file contents header',
				url: 'https://gitlab.com/gitlab-org/gitlab/-/blob/bf4a74a13e89f2d270825e6e1f64a2cab9c725e7/scripts/ci/otel_span_exporter.rb',
				expected: {
					'otel_span_exporter.rb': 'ruby',
				},
			},
		],
	],
	[
		forgejo,
		[
			{
				name: 'repository',
				url: 'https://codeberg.org/forgejo/forgejo',
				expected: {
					'.forgejo': 'folder_forgejo',
					assets: 'folder_assets',
				},
			},
			// TODO: Add tests for release assets (https://codeberg.org/forgejo/forgejo/releases/tag/v17.0.1) and the diff tree, on both commits (https://codeberg.org/forgejo/forgejo/commit/4635883acd8ac08fc041b3cedaee5b17540649e6) and pull requests (https://codeberg.org/forgejo/forgejo/pulls/14959/files).
			// Codeberg serves decoy pages to headless browsers for anything deeper than a repository's root, so these need a different approach or Forgejo instance.
		],
	],
	[
		gitea,
		[
			{
				name: 'repository',
				url: 'https://gitea.com/gitea/gitea-mirror',
				expected: {
					'.github': 'folder_github',
					docs: 'folder_docs',
				},
			},
			// TODO: Add tests for the repository side tree, diff tree, parent directory row, and release assets (headless is blocked in some cases).
		],
	],
	[
		bitbucket,
		[
			{
				name: 'repository',
				url: 'https://bitbucket.org/atlassian/atlassian-frontend-mirror',
				expected: {
					build: 'folder_dist',
					data: 'folder_database',
				},
			},
			{
				name: 'file contents header',
				url: 'https://bitbucket.org/atlassian/atlassian-frontend-mirror/src/master/ai-mate/agent-color/src/agent-brand-color-schemes.ts',
				expected: {
					'agent-brand-color-schemes.ts': 'typescript',
				},
			},
		],
	],
	[
		tangled,
		[
			{
				name: 'repository',
				url: 'https://tangled.org/@tangled.org/core',
				expected: {
					'.cargo': 'folder_cargo',
					api: 'folder_api',
				},
			},
			{
				name: 'commit diff tree',
				url: 'https://tangled.org/tangled.org/core/commit/d15cbd9da4db885fa7e76efc75de0c5b878e9cf1',
				expected: {
					'flake.nix': 'nix',
					'go.mod': 'go-mod',
					db: 'folder_database',
					nix: 'folder_nix',
				},
			},
		],
	],
	// TODO: Enable once there is a way to test SourceHut, which currently responds with a 502 to headless browsers.
	// [
	// 	sourcehut,
	// 	[
	// 		{
	// 			name: 'git repository',
	// 			url: 'https://git.sr.ht/~sircmpwn/git.sr.ht/tree/96f4fef9d1afb7f68b2eecdbc5c40041086dd749',
	// 			expected: {
	// 				'.builds': '_folder',
	// 				api: 'folder_api',
	// 				'.gitattributes': 'git',
	// 				'go.mod': 'go-mod',
	// 			},
	// 		},
	// 		{
	// 			name: 'git subdirectory',
	// 			url: 'https://git.sr.ht/~sircmpwn/git.sr.ht/tree/96f4fef9d1afb7f68b2eecdbc5c40041086dd749/item/gitsrht',
	// 			expected: {
	// 				'..': '_folder',
	// 			},
	// 		},
	// 		{
	// 			name: 'mercurial repository',
	// 			url: 'https://hg.sr.ht/~sircmpwn/hg.sr.ht/browse',
	// 			expected: {
	// 				api: 'folder_api',
	// 				LICENSE: 'license',
	// 				Makefile: 'makefile',
	// 			},
	// 		},
	// 	],
	// ],
];

let context: BrowserContext;
beforeAll(async () => {
	context = await launchWithExtension();
});
afterAll(async () => {
	await context?.close();
});

for (const [site, siteCases] of cases) {
	describe(site.domains[0], () => {
		for (const { name, url, expected } of siteCases) {
			test(name, async (ctx) => {
				const page = await context.newPage();
				const hydrationErrors: Array<string> = [];
				page.on('console', (message) => {
					if (/hydrat/i.test(message.text()))
						hydrationErrors.push(message.text());
				});
				let rateLimited = false;
				page.on('response', (response) => {
					if (response.status() === 429) rateLimited = true;
				});

				await page.goto(url, { waitUntil: 'domcontentloaded' });
				await waitForReplacements(page);
				const rows = await collectRows(page, site.replacements);
				await page.close();

				if (rows.length === 0 && rateLimited)
					ctx.skip('rate limited by site');
				expect(rows.length, 'no rows found').toBeGreaterThan(0);
				expect(
					rows.filter((row) => !(row.icon && row.painted)),
					'rows not replaced',
				).toEqual([]);
				expect(
					rows.filter((row) => row.iconCount !== 1),
					'rows with more than one icon element',
				).toEqual([]);
				expect(
					Object.fromEntries(
						Object.keys(expected).map((fileName) => [
							fileName,
							rows.find((row) => row.name === fileName)?.icon,
						]),
					),
				).toEqual(expected);
				expect(hydrationErrors).toEqual([]);
			});
		}
	});
}
