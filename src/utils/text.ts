const LOWERCASE_WORDS = new Set(["or", "and", "of"]);

/** "BLACK_OR_AFRICAN_AMERICAN" -> "Black or African American". */
export const enumToLabel = (code: string): string =>
  code
    .toLowerCase()
    .split("_")
    .map((word, i) =>
      i > 0 && LOWERCASE_WORDS.has(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");

/** "RNAProduct" -> "RNA Product". */
export const splitCamelCase = (id: string): string =>
  id
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // camelCase boundary
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // acronym boundary
    .trim();
