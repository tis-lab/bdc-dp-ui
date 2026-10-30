/** Resolves free-text search terms to concepts, paginated by `limit` and `offset`. */
export const RESOLVE_TERMS_QUERY = `
  query ResolveTerms($query: String!, $limit: Int!, $offset: Int!) {
    terms(query: $query, limit: $limit, offset: $offset) {
      items {
        __typename
        ... on BdcVariable {
          name
          label
          domain
          studyCount
          studies
          concepts
        }
        ... on Term {
          id
          label
          category
          description
          synonyms
          bdc {
            studyCount
            studies
            variableNames
          }
        }
      }
      total
      limit
      offset
      hasMore
      bdcVariableCount
    }
  }
`;

export interface ResolveTermsVariables {
  query: string;
  limit: number;
  offset: number;
}

// Nullability mirrors the GraphQL schema.

// `studyCount` is the number of studies the concept is harmonized in, not data
// availability; 0 is common.
export interface BdcCoverage {
  studyCount: number;
  studies: string[];
  variableNames: string[];
}

export interface BdcVariable {
  name: string;
  label: string;
  domain: string | null;
  studyCount: number;
  studies: string[];
  concepts: string[];
}

export interface Term {
  id: string;
  label: string;
  category: string;
  description: string | null;
  synonyms: string[] | null;
  bdc: BdcCoverage;
}

// BDC variables come first in `items`, followed by terms.
export type SearchItem =
  | ({ __typename: "BdcVariable" } & BdcVariable)
  | ({ __typename: "Term" } & Term);

export interface TermsPage {
  items: SearchItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  bdcVariableCount: number;
}

export interface ResolveTermsData {
  terms: TermsPage | null;
}

export function getSearchItemKey(item: SearchItem): string {
  return item.__typename === "BdcVariable"
    ? `BdcVariable:${item.name}`
    : `Term:${item.id}`;
}
