import { execSync } from 'node:child_process';

// The tests load the built extension, so make sure it reflects the current source.
export default function setup() {
	execSync('pnpm wxt build', { stdio: 'inherit' });
}
