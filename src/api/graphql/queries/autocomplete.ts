// Upstream caps autocomplete at 10 results, with no pagination.
export const AUTOCOMPLETE_QUERY = `
  query Autocomplete($query: String!) {
    autocomplete(query: $query) {
      items {
        id
        label
        category
        displayLabel
        description
      }
      total
    }
  }
`;

export interface AutocompleteVariables {
  query: string;
}

export interface Suggestion {
  id: string;
  label: string;
  category: string;
  displayLabel: string;
  description: string | null;
}

export interface SuggestionsPage {
  items: Suggestion[];
  total: number;
}

export interface AutocompleteData {
  autocomplete: SuggestionsPage | null;
}
