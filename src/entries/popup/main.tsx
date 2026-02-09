import { App } from './App';

import { render } from 'solid-js/web';

// biome-ignore lint/style/noNonNullAssertion: it exists
const root = document.getElementById('app')!;

render(
	() => (
		<Suspense>
			<App />
		</Suspense>
	),
	root,
);
