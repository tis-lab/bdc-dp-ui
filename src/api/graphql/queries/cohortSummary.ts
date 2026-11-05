// Subset of schema/summary.yaml.

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
 * INCLUDE matches a recorded PRESENT condition and EXCLUDE a recorded ABSENT
 * one; EXCLUDE is not "everyone without it". Relationship defaults to ONESELF.
 */
export type ConditionSelection = "INCLUDE" | "EXCLUDE";

/** Exactly one field per node; nesting is the parentheses. Groups are never empty. */
export type SummaryFilter =
  | { condition: { concept: string; selection: ConditionSelection } }
  | { and: SummaryFilter[] }
  | { or: SummaryFilter[] };

export interface CohortSummaryVariables {
  /** null summarizes everyone. */
  filter: SummaryFilter | null;
}

export interface CohortSummaryData {
  summary: SummaryResponse | null;
}
