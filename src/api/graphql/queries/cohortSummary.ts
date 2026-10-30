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
  query ReadSummary($sourceId: ID!, $include: [ID!]!, $exclude: [ID!]!) {
    summary(sourceId: $sourceId, include: $include, exclude: $exclude) {
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

export interface CohortSummaryVariables {
  sourceId: string;
  include: string[];
  exclude: string[];
}

export interface CohortSummaryData {
  summary: SummaryResponse | null;
}
