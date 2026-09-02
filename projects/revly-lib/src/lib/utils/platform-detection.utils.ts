/**
 * Utility to safely get the user agent string.
 * Returns an empty string on the server.
 */
const getUserAgent = (): string => {
	return typeof navigator !== 'undefined' && navigator.userAgent ? navigator.userAgent : '';
};

const getNavigator = (): Navigator | null => (typeof navigator !== 'undefined' ? navigator : null);
///

export function isMobile(): boolean {
	return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(getUserAgent());
}

export function isIOS(): boolean {
	const nav = getNavigator();
	if (!nav) return false;

	return (
		/iPad|iPhone|iPod/.test(nav.userAgent) || (/Macintosh/.test(nav.userAgent) && nav.maxTouchPoints > 1) //MacIntel also?
	);
}

export function isAndroid(): boolean {
	return /Android/.test(getUserAgent());
}
