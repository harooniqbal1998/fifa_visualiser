export function getFlagUrl(isoCode: string): string {
  return `https://flagcdn.com/${isoCode.toLowerCase()}.svg`;
}

/** Draw a flag image cropped to cover a circle (object-fit: cover). */
export function drawFlagCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  diameter: number,
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;

  const scale = Math.max(diameter / iw, diameter / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
}
