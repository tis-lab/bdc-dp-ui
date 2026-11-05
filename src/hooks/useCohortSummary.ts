import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGraphQLEndpoint } from "../api/config";
import { graphqlRequest } from "../api/graphql/graphqlRequest";
import type { SearchItem } from "../api/graphql/queries/resolveTerms";
import {
  COHORT_SUMMARY_QUERY,
  type CohortSummaryData,
  type CohortSummaryVariables,
  type ConditionSelection,
  type SummaryFilter,
  type SummaryResponse,
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

const condition =
  (selection: ConditionSelection) =>
  (concept: string): SummaryFilter => ({ condition: { concept, selection } });

/** Groups two or more nodes; returns one node as-is, null for none. */
const group = (
  op: "and" | "or",
  nodes: SummaryFilter[],
): SummaryFilter | null => {
  if (nodes.length === 0) return null;
  if (nodes.length === 1) return nodes[0];
  return op === "and" ? { and: nodes } : { or: nodes };
};

/**
 * Builds the summary filter: includes are combined by `match`, and each exclude
 * is ANDed with the result. Returns null when no criteria are selected.
 */
export const summaryFilter = (
  include: string[],
  exclude: string[],
  match: CriteriaMatch,
): SummaryFilter | null => {
  const included = group(
    match === "any" ? "or" : "and",
    include.map(condition("INCLUDE")),
  );
  return group("and", [
    ...(included ? [included] : []),
    ...exclude.map(condition("EXCLUDE")),
  ]);
};

/** Throws on GraphQL errors or a null summary instead of returning empty. */
export const fetchSummary = async (
  filter: SummaryFilter | null,
  signal: AbortSignal,
): Promise<SummaryResponse> => {
  const data = await graphqlRequest<CohortSummaryData, CohortSummaryVariables>(
    {
      endpoint: getGraphQLEndpoint(),
      query: COHORT_SUMMARY_QUERY,
      variables: { filter },
      signal,
    },
  );
  if (!data?.summary) throw new Error("Missing summary response");
  return data.summary;
};

/** Disabled until at least one concept is included or excluded. */
export const useCohortSummary = (criteria: Criteria) => {
  const include = useMemo(
    () => criteria.include.map(conceptOf).sort(),
    [criteria.include],
  );
  const exclude = useMemo(
    () => criteria.exclude.map(conceptOf).sort(),
    [criteria.exclude],
  );
  const filter = useMemo(
    () => summaryFilter(include, exclude, criteria.match),
    [include, exclude, criteria.match],
  );

  return useQuery({
    queryKey: ["cohortSummary", filter],
    queryFn: ({ signal }) => fetchSummary(filter, signal),
    enabled: filter !== null,
  });
};
