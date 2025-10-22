// See https://github.com/fregante/webext-dynamic-content-scripts/blob/main/how-to-add-github-enterprise-support-to-web-extensions.md.
import 'webext-dynamic-content-scripts';

import addPermissionToggle from 'webext-permission-toggle';

export default defineBackground({
	main() {
		addPermissionToggle();
	},
});
