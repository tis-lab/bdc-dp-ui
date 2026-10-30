/**
 * Returns up to `max` distinct labels, in the order given.
 *
 * Labels that differ only in case or surrounding spaces count as the same
 * name ("Hypertension" and "hypertension "); the first one seen is kept, as
 * written. Blank labels are dropped.
 */
export function uniqueLabels(labels: readonly string[], max: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const label of labels) {
    if (result.length >= max) break;

    const name = label.trim();
    const key = name.toLowerCase();
    if (name === "" || seen.has(key)) continue;

    seen.add(key);
    result.push(name);
  }

  return result;
}
