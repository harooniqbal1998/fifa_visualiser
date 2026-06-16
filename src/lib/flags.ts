export function getFlagUrl(isoCode: string): string {
  return `https://flagcdn.com/${isoCode.toLowerCase()}.svg`;
}
