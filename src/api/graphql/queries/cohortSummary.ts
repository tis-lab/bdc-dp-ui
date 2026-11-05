// Subset of the middleware's summary response.

export interface DemographyValue {
  id: string;
  participant_count: number;
  sex?: string;
  race?: string[];
  ethnicity?: string;
}

export interface DemographySummary {
  id: string;
  summarized_slot: "sex" | "race" | "ethnicity";
  participant_count: number;
  values?: DemographyValue[];
}

export interface StudySummary {
  research_study: string;
  participant_count: number;
  demographics?: DemographySummary[];
}

export interface SummaryResponse {
  studies: StudySummary[];
}

export const COHORT_SUMMARY_QUERY = `
  query GetSummary($filter: SummaryFilterInput) {
    summary(filter: $filter) {
      studies {
        research_study
        participant_count
        demographics {
          id
          summarized_slot
          participant_count
          values { id participant_count sex race ethnicity }
        }
      }
    }
  }
`;

/**
 * INCLUDE matches a recorded PRESENT condition; EXCLUDE matches a recorded
 * ABSENT condition, not the absence of a record. Relationship defaults to
 * ONESELF.
 */
export type ConditionSelection = "INCLUDE" | "EXCLUDE";

/** One field per node; nesting defines grouping. Groups must be non-empty. */
export type SummaryFilter =
  | { condition: { concept: string; selection: ConditionSelection } }
  | { and: SummaryFilter[] }
  | { or: SummaryFilter[] };

export interface CohortSummaryVariables {
  /** null returns the unfiltered summary. */
  filter: SummaryFilter | null;
}

export interface CohortSummaryData {
  summary: SummaryResponse | null;
}
