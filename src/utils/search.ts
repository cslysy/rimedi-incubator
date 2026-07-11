export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("pl-PL")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function containsNormalized(haystack: string, needle: string): boolean {
  const normalizedNeedle = normalizeSearchText(needle);

  if (normalizedNeedle.length === 0) {
    return true;
  }

  return normalizeSearchText(haystack).includes(normalizedNeedle);
}
