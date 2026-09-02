type ImageVariant = 'thumb' | 'medium' | 'large';

export function buildImageUrl(url: string, variant: ImageVariant = 'large'): string {
	if (!url) return '';
	const lastDotIndex = url.lastIndexOf('.');
	if (lastDotIndex === -1) return url;
	const base = url.substring(0, lastDotIndex);
	const ext = url.substring(lastDotIndex);
	return `${base}_${variant}${ext}`;
}
