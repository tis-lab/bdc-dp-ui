import type { SummaryResponse } from "./api/graphql/queries/cohortSummary";
import type { Criteria, CriteriaMatch } from "./hooks/useCohortSummary";
import { cohortParticipants } from "./utils/summary";

// PLACEHOLDER until the summary returns counts per selection: include/exclude
// don't change the example source's count, so nudge it to show the flow. With
// OR each include adds people; with AND each include after the first removes some.
export const illustrativeParticipants = (
  sourceCount: number,
  includes: number,
  excludes: number,
  match: CriteriaMatch,
): number => {
  const included =
    match === "any" ? 50 * includes : includes > 0 ? 50 * (2 - includes) : 0;
  return Math.max(sourceCount + included - 70 * excludes, 0);
};

/** The summary with its study counts moved to the illustrative total. */
export const illustrateSummary = (
  summary: SummaryResponse,
  criteria: Criteria,
): SummaryResponse => {
  const total = cohortParticipants(summary);
  const target = illustrativeParticipants(
    total,
    criteria.include.length,
    criteria.exclude.length,
    criteria.match,
  );
  return withParticipants(summary, target);
};

/** The summary with its study counts moved to `target`, spread across studies by size. */
export const withParticipants = (
  summary: SummaryResponse,
  target: number,
): SummaryResponse => {
  const total = cohortParticipants(summary);
  const scale = total > 0 ? target / total : 0;
  return {
    ...summary,
    studies: summary.studies.map((study) => ({
      ...study,
      participant_count: Math.round(study.participant_count * scale),
    })),
  };
};
