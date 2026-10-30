import type {
  DemographySummary,
  SummaryResponse,
} from "../api/graphql/queries/cohortSummary";

export type DemographicSlot = DemographySummary["summarized_slot"];

export interface CategoryCount {
  label: string;
  count: number;
}

const LOWERCASE_WORDS = new Set(["or", "and", "of"]);

/** "BLACK_OR_AFRICAN_AMERICAN" → "Black or African American". */
export function humanize(code: string): string {
  return code
    .toLowerCase()
    .split("_")
    .map((word, i) =>
      i > 0 && LOWERCASE_WORDS.has(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

/** Estimated: a participant in two studies is counted twice. */
export function cohortParticipants(summary: SummaryResponse): number {
  return summary.studies.reduce((sum, s) => sum + s.participant_count, 0);
}

/** Whole-number percentage; 0 for an empty cohort rather than NaN. */
export function percentOf(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

/**
 * Counts per category summed across studies, largest first. The remainder of
 * the cohort is "Not reported" (missing, or below min_count). Empty when no
 * study reports the slot.
 */
export function demographicBreakdown(
  summary: SummaryResponse,
  slot: DemographicSlot,
): CategoryCount[] {
  const counts = new Map<string, number>();
  let reported = false;

  for (const study of summary.studies) {
    const group = study.demographics?.find((d) => d.summarized_slot === slot);
    if (!group) continue;
    reported = true;
    for (const value of group.values ?? []) {
      const codes = slot === "race" ? (value.race ?? []) : [value[slot] ?? ""];
      const label = codes.filter(Boolean).map(humanize).join(", ");
      if (label) counts.set(label, (counts.get(label) ?? 0) + value.participant_count);
    }
  }
  if (!reported) return [];

  const rows = [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
  const notReported =
    cohortParticipants(summary) - rows.reduce((sum, r) => sum + r.count, 0);

  return notReported > 0 ? [...rows, { label: "Not reported", count: notReported }] : rows;
}
