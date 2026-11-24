import { useQuery } from "@tanstack/react-query";
import { graphqlRequest } from "../api/graphql/graphqlRequest";
import {
  getSearchItemKey,
  type SearchItem,
} from "../api/graphql/queries/resolveTerms";
import { type CohortSummaryData } from "../api/graphql/queries/cohortSummary";
import { getQueryEndpoint } from "../api/queryEndpoint";
import { toClassFirst } from "../mocks/toClassFirst";
import {
  NESTED_SUMMARY_QUERY,
  RELEASE,
  type CohortExpression,
  type CohortSummaryVariables,
  type ConditionStatus,
  type CriteriaGroup,
  type CriteriaNode,
  type CriterionType,
} from "../mocks/sampleSummaryResponse";

export type CriteriaKind = "include" | "exclude";

/** How included concepts combine: "all" is AND, "any" is OR. */
export type CriteriaMatch = "all" | "any";

export interface Criteria {
  include: SearchItem[];
  exclude: SearchItem[];
  match: CriteriaMatch;
}

export const CRITERION_TYPE_BY_BDCHM: Record<string, CriterionType> = {
  condition: "CONDITION",
  observation: "OBSERVATION",
  drugexposure: "DRUG_EXPOSURE",
  procedure: "PROCEDURE",
  exposure: "EXPOSURE",
};

const INCLUDE_STATUS: ConditionStatus[] = ["PRESENT"];
const EXCLUDE_STATUS: ConditionStatus[] = ["PRESENT", "HISTORICAL"];

const conceptOf = (item: SearchItem) =>
  item.__typename === "Term" ? item.id : item.conceptType;

/** null for Terms and untyped concepts; those are not queryable yet. */
export const criterionTypeOf = (item: SearchItem): CriterionType | null =>
  item.__typename === "BdcConcept" && item.bdchmType
    ? (CRITERION_TYPE_BY_BDCHM[item.bdchmType] ?? null)
    : null;

/** Status is condition-only. */
const node = (
  item: SearchItem,
  status: ConditionStatus[],
): CriteriaNode | null => {
  const criterionType = criterionTypeOf(item);
  if (!criterionType) return null;
  const concept = conceptOf(item);
  return {
    criterion:
      criterionType === "CONDITION"
        ? { criterionType, concept, status }
        : { criterionType, concept },
  };
};

const isNode = (n: CriteriaNode | null): n is CriteriaNode => n !== null;

const byKey = (a: SearchItem, b: SearchItem) =>
  getSearchItemKey(a).localeCompare(getSearchItemKey(b));

/** Includes under `match` ("all" | "any"), excludes under "none"; null when empty. */
export const buildExpression = (
  include: SearchItem[],
  exclude: SearchItem[],
  match: CriteriaMatch,
): CohortExpression | null => {
  const inc = [...include]
    .sort(byKey)
    .map((i) => node(i, INCLUDE_STATUS))
    .filter(isNode);
  const exc = [...exclude]
    .sort(byKey)
    .map((i) => node(i, EXCLUDE_STATUS))
    .filter(isNode);
  if (!inc.length && !exc.length) return null;

  const root: CriteriaGroup = {};
  if (inc.length) root[match] = inc;
  if (exc.length) root.none = exc;
  return { release: RELEASE, criteria: { group: root } };
};

/** Disabled until at least one queryable concept is included or excluded. */
export const useCohortSummary = (criteria: Criteria) => {
  const endpoint = getQueryEndpoint("open");
  const expression = buildExpression(
    criteria.include,
    criteria.exclude,
    criteria.match,
  );

  return useQuery({
    queryKey: ["cohortSummary", expression],
    queryFn: async ({ signal }) => {
      const data = await graphqlRequest<
        CohortSummaryData,
        CohortSummaryVariables
      >({
        endpoint,
        query: NESTED_SUMMARY_QUERY,
        variables: { expression: expression! },
        signal,
      });
      if (!data?.summary) throw new Error("Missing summary response");
      // TODO: replace with new response mapping
      return toClassFirst(data.summary, data.summary.min_count);
    },
    enabled: expression !== null,
  });
};
