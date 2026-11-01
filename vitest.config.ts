import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

export default defineConfig({
	plugins: [WxtVitest()],
	test: {
		include: ['tests/**/*.test.ts'],
		globalSetup: ['tests/setup.ts'],
		// The tests run against live sites, which are occasionally slow or flaky.
		retry: 2,
		testTimeout: 60_000,
		hookTimeout: 60_000,
	},
});
