import type {
  DemographicSummary,
  DemographicValue,
  SummaryResponse,
  StudyCount,
} from "../mocks/sampleSummaryResponse";
import { enumToLabel } from "./text";

export type DemographicSlot = DemographicSummary["summarized_slot"];

export interface CategoryCount {
  label: string;
  /** null = some values fell below min_count and are not shown; never display a number. */
  count: number | null;
}

export interface CohortTotals {
  participants: number;
  studies: number;
  demographics: Record<DemographicSlot, CategoryCount[]>;
}

/** Shown wherever totals from cohortTotals are displayed. */
export const SUMMED_TOTALS_NOTE =
  "Illustrative totals based on synthetic data; participants may be counted more than once across studies.";

/** Whole-number percentage; 0 for an empty cohort rather than NaN. */
export const percentOf = (count: number, total: number): number =>
  total > 0 ? Math.round((count / total) * 100) : 0;

const sumCounts = (studies: StudyCount[]): number =>
  studies.reduce((sum, s) => sum + s.participant_count, 0);

/** Switching on the value's own summarized_slot lets TS narrow it. */
const codesOf = (value: DemographicValue): string[] => {
  switch (value.summarized_slot) {
    case "sex":
      return [value.sex];
    case "race":
      return value.race;
    case "ethnicity":
      return [value.ethnicity];
  }
};

/**
 * Per-category counts summed across studies, largest first.
 * "Not reported" = participants with no value for this slot (cohort minus the slot's own total).
 * Suppressed = values the API hid below min_count; shown without a count so it can't be back-calculated.
 */
const sumBreakdown = (
  summary: SummaryResponse,
  slot: DemographicSlot,
  participants: number,
): CategoryCount[] => {
  const group = summary.summary.demographics.find(
    (d) => d.summarized_slot === slot,
  );
  // No study reports this slot.
  if (!group || group.studies.length === 0) return [];

  const counts = new Map<string, number>();
  for (const value of group.values) {
    const label = codesOf(value).filter(Boolean).map(enumToLabel).join(", ");
    if (label)
      counts.set(label, (counts.get(label) ?? 0) + sumCounts(value.studies));
  }

  const rows: CategoryCount[] = [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const slotTotal = sumCounts(group.studies);
  const shown = [...counts.values()].reduce((sum, c) => sum + c, 0);
  if (slotTotal > shown)
    rows.push({
      label: `Other (fewer than ${summary.min_count} per study, not shown)`,
      count: null,
    });

  const notReported = participants - slotTotal;
  if (notReported > 0) rows.push({ label: "Not reported", count: notReported });

  return rows;
};

/** Temporary: sums per-study counts until the endpoint returns global totals. */
export const cohortTotals = (summary: SummaryResponse): CohortTotals => {
  const participants = sumCounts(summary.studies);
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
