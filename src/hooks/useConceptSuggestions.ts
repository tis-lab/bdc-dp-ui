import { useQuery } from "@tanstack/react-query";
import { getGraphQLEndpoint } from "../api/config";
import { graphqlRequest } from "../api/graphql/graphqlRequest";
import {
  AUTOCOMPLETE_QUERY,
  type AutocompleteData,
  type AutocompleteVariables,
} from "../api/graphql/queries/autocomplete";

export function useConceptSuggestions(searchText: string) {
  const query = searchText.trim();

  return useQuery({
    queryKey: ["autocomplete", query],
    queryFn: async ({ signal }) => {
      const data = await graphqlRequest<
        AutocompleteData,
        AutocompleteVariables
      >({
        endpoint: getGraphQLEndpoint(),
        query: AUTOCOMPLETE_QUERY,
        variables: { query },
        signal,
      });
      if (!data?.autocomplete) {
        throw new Error("Missing autocomplete response");
      }
      return data.autocomplete;
    },
    enabled: query.length > 0,
  });
}
