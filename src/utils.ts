export function createStylesElement(id: string) {
	let styles = document.querySelector<HTMLStyleElement>(`#${id}`);

	if (!styles) {
		styles = document.createElement('style');
		styles.setAttribute('id', id);
		document.documentElement.appendChild(styles);
	}

	return styles;
}
