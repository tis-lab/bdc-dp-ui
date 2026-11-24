import type { SummaryResponse as Legacy } from "../api/graphql/queries/cohortSummary";
import type {
  DemographicSummary,
  SummaryResponse,
} from "./sampleSummaryResponse";

const SLOTS = ["sex", "race", "ethnicity"] as const;

/** Temporary: delete when the endpoint returns the new shape. */
export const toClassFirst = (
  legacy: Legacy,
  minCount: number,
): SummaryResponse => ({
  release: "",
  min_count: minCount,
  terms: {},
  research_studies: [],
  studies: legacy.studies.map((s) => ({
    research_study: s.research_study,
    participant_count: s.participant_count,
    name: s.research_study,
  })),
  summary: {
    participants: [],
    demographics: SLOTS.flatMap((slot) => {
      const groups = legacy.studies.flatMap((s) => {
        const g = s.demographics?.find((d) => d.summarized_slot === slot);
        return g ? [{ study: s.research_study, g }] : [];
      });
      if (groups.length === 0) return [];
      const values = new Map<string, any>();
      for (const { study, g } of groups)
        for (const v of g.values ?? []) {
          const entry = values.get(v.id) ?? {
            id: v.id,
            summarized_slot: slot,
            [slot]: v[slot],
            studies: [],
          };
          entry.studies.push({
            research_study: study,
            participant_count: v.participant_count,
          });
          values.set(v.id, entry);
        }
      return [
        {
          id: `palette:demography/${slot}`,
          summarized_slot: slot,
          studies: groups.map(({ study, g }) => ({
            research_study: study,
            participant_count: g.participant_count,
          })),
          values: [...values.values()],
        } as DemographicSummary,
      ];
    }),
  },
});
