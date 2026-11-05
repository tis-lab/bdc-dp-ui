/** Temporary: a condition's count until the summary routes are live. */
export const SEARCH_CONDITIONS_QUERY = `
  query SearchConditions($keyword: String!) {
    searchConditions(keyword: $keyword) {
      totalHits
    }
  }
`;

export interface SearchConditionsVariables {
  /** status|relationship|concept, e.g. PRESENT|ONESELF|MONDO:0005148 */
  keyword: string;
}

export interface SearchConditionsData {
  searchConditions: { totalHits: string };
}
