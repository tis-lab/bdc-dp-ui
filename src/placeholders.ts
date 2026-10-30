import type { SummaryResponse } from "./api/graphql/queries/cohortSummary";
import type { Criteria, CriteriaMatch } from "./hooks/useCohortSummary";
import { cohortParticipants } from "./utils/summary";

// PLACEHOLDER, not data: the summary API has no total of available participants
// yet (see the note on BDC-Portal #99). Stands in as the example source's count
// (480 + 460) times a random 10–20, picked once per page load.
export const AVAILABLE_PARTICIPANTS_PLACEHOLDER =
  940 * (10 + Math.floor(Math.random() * 11));

// PLACEHOLDER until the summary returns counts per selection: include/exclude
// don't change the example source's count, so nudge it to show the flow. With
// OR each include adds people; with AND each include after the first removes some.
export function illustrativeParticipants(
  sourceCount: number,
  includes: number,
  excludes: number,
  match: CriteriaMatch,
): number {
  const included =
    match === "any" ? 50 * includes : includes > 0 ? 50 * (2 - includes) : 0;
  return Math.max(sourceCount + included - 70 * excludes, 0);
}

/**
 * The summary response with its study counts moved to the illustrative total,
 * spread across studies by size; the rest of the response is untouched.
 */
export function illustrateSummary(
  summary: SummaryResponse,
  criteria: Criteria,
): SummaryResponse {
  const total = cohortParticipants(summary);
  const target = illustrativeParticipants(
    total,
    criteria.include.length,
    criteria.exclude.length,
    criteria.match,
  );
  const scale = total > 0 ? target / total : 0;
  return {
    ...summary,
    studies: summary.studies.map((study) => ({
      ...study,
      participant_count: Math.round(study.participant_count * scale),
    })),
  };
}
