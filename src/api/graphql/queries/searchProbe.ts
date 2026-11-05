/** Temporary: the total for page load until the summary routes are live. */
export const SEARCH_PROBE_QUERY = `
  query SearchProbe {
    searchProbe {
      totalHits
    }
  }
`;

export interface SearchProbeData {
  searchProbe: { totalHits: string };
}
