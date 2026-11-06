import type {
  DemographySummary,
  SummaryResponse,
} from "../api/graphql/queries/cohortSummary";

export type DemographicSlot = DemographySummary["summarized_slot"];

export interface CategoryCount {
  label: string;
  count: number;
}

export interface CohortTotals {
  participants: number;
  studies: number;
  demographics: Record<DemographicSlot, CategoryCount[]>;
}

/** Shown wherever totals from cohortTotals are displayed. */
export const SUMMED_TOTALS_NOTE =
  "Illustrative totals based on synthetic data; participants may be counted more than once across studies.";

const LOWERCASE_WORDS = new Set(["or", "and", "of"]);

/** "BLACK_OR_AFRICAN_AMERICAN" → "Black or African American". */
export const humanize = (code: string): string =>
  code
    .toLowerCase()
    .split("_")
    .map((word, i) =>
      i > 0 && LOWERCASE_WORDS.has(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");

/** Whole-number percentage; 0 for an empty cohort rather than NaN. */
export const percentOf = (count: number, total: number): number =>
  total > 0 ? Math.round((count / total) * 100) : 0;

const sumParticipants = (summary: SummaryResponse): number =>
  summary.studies.reduce((sum, s) => sum + s.participant_count, 0);

/**
 * Counts per category summed across studies, largest first. The remainder of
 * the cohort is "Not reported" (missing, or below min_count). Empty when no
 * study reports the slot.
 */
const sumBreakdown = (
  summary: SummaryResponse,
  slot: DemographicSlot,
  participants: number,
): CategoryCount[] => {
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
  const notReported = participants - rows.reduce((sum, r) => sum + r.count, 0);

  return notReported > 0 ? [...rows, { label: "Not reported", count: notReported }] : rows;
};

/**
 * Cohort totals from a summary. Temporary: sums per-study counts and
 * demographic values, assuming participants are distinct across studies.
 * Replace with global counts once the summary endpoint provides them.
 */
export const cohortTotals = (summary: SummaryResponse): CohortTotals => {
  const participants = sumParticipants(summary);
  return {
    participants,
    studies: summary.studies.length,
    demographics: {
      sex: sumBreakdown(summary, "sex", participants),
      race: sumBreakdown(summary, "race", participants),
      ethnicity: sumBreakdown(summary, "ethnicity", participants),
    },
  };
};
