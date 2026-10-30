import { useQuery } from "@tanstack/react-query";
import { getGraphQLEndpoint } from "../api/config";
import { graphqlRequest } from "../api/graphql/graphqlRequest";
import type { SearchItem } from "../api/graphql/queries/resolveTerms";
import {
  COHORT_SUMMARY_QUERY,
  type CohortSummaryData,
  type CohortSummaryVariables,
} from "../api/graphql/queries/cohortSummary";
import { illustrateSummary } from "../placeholders";

export type CriteriaKind = "include" | "exclude";

/** How included concepts combine: "all" is AND, "any" is OR. */
export type CriteriaMatch = "all" | "any";

export interface Criteria {
  include: SearchItem[];
  exclude: SearchItem[];
  match: CriteriaMatch;
}

const conceptOf = (item: SearchItem) =>
  item.__typename === "Term" ? item.id : item.name;

/** Runs only once a concept is included or excluded. */
export function useCohortSummary(criteria: Criteria) {
  const include = criteria.include.map(conceptOf).sort();
  const exclude = criteria.exclude.map(conceptOf).sort();
  const enabled = include.length + exclude.length > 0;

  return useQuery({
    // The summary API has no AND/OR argument yet (it treats includes as OR), so
    // `match` is keyed but not sent; add it to the variables once the API takes it
    queryKey: ["cohortSummary", include, exclude, criteria.match],
    queryFn: async ({ signal }) => {
      const data = await graphqlRequest<
        CohortSummaryData,
        CohortSummaryVariables
      >({
        endpoint: getGraphQLEndpoint(),
        query: COHORT_SUMMARY_QUERY,
        variables: { sourceId: "t2d", include, exclude },
        signal,
      });
      if (!data?.summary) throw new Error("Missing summary response");
      return illustrateSummary(data.summary, criteria);
    },
    enabled,
    placeholderData: (previous) => (enabled ? previous : undefined),
  });
}
