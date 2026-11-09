import { useQuery } from "@tanstack/react-query";
import { getGraphQLEndpoint } from "../api/config";
import { graphqlRequest } from "../api/graphql/graphqlRequest";
import type { SearchItem } from "../api/graphql/queries/resolveTerms";
import {
  COHORT_SUMMARY_QUERY,
  type CohortSummaryData,
  type CohortSummaryVariables,
  type SummaryFilter,
} from "../api/graphql/queries/cohortSummary";

export type CriteriaKind = "include" | "exclude";

/** How included concepts combine: "all" is AND, "any" is OR. */
export type CriteriaMatch = "all" | "any";

export interface Criteria {
  include: SearchItem[];
  exclude: SearchItem[];
  match: CriteriaMatch;
}

const conceptOf = (item: SearchItem) =>
  item.__typename === "Term" ? item.id : item.conceptType;

/** Groups two or more nodes; returns one node as-is, null for none. */
const group = (
  op: "and" | "or",
  nodes: SummaryFilter[],
): SummaryFilter | null => {
  if (nodes.length === 0) return null;
  if (nodes.length === 1) return nodes[0];
  return op === "and" ? { and: nodes } : { or: nodes };
};

/** Includes combined by `match`, excludes ANDed; null when empty. */
export const summaryFilter = (
  include: string[],
  exclude: string[],
  match: CriteriaMatch,
): SummaryFilter | null => {
  const included = group(
    match === "any" ? "or" : "and",
    include.map((concept): SummaryFilter => ({
      condition: { concept, selection: "INCLUDE" },
    })),
  );
  return group("and", [
    ...(included ? [included] : []),
    ...exclude.map((concept): SummaryFilter => ({
      condition: { concept, selection: "EXCLUDE" },
    })),
  ]);
};

/** Disabled until at least one concept is included or excluded. */
export const useCohortSummary = (criteria: Criteria) => {
  const include = criteria.include.map(conceptOf).sort();
  const exclude = criteria.exclude.map(conceptOf).sort();
  const filter = summaryFilter(include, exclude, criteria.match);

  return useQuery({
    queryKey: ["cohortSummary", filter],
    queryFn: async ({ signal }) => {
      const data = await graphqlRequest<
        CohortSummaryData,
        CohortSummaryVariables
      >({
        endpoint: getGraphQLEndpoint(),
        query: COHORT_SUMMARY_QUERY,
        variables: { filter },
        signal,
      });
      if (!data?.summary) throw new Error("Missing summary response");
      return data.summary;
    },
    enabled: filter !== null,
  });
};
