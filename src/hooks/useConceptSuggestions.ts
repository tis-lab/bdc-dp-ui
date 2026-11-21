import { useQuery } from "@tanstack/react-query";
import { graphqlRequest } from "../api/graphql/graphqlRequest";
import {
  AUTOCOMPLETE_QUERY,
  type AutocompleteData,
  type AutocompleteVariables,
} from "../api/graphql/queries/autocomplete";
import { getQueryEndpoint } from "../api/queryEndpoint";

export const useConceptSuggestions = (searchText: string) => {
  const endpoint = getQueryEndpoint("open");

  const query = searchText.trim();

  return useQuery({
    queryKey: ["autocomplete", query],
    queryFn: async ({ signal }) => {
      const data = await graphqlRequest<
        AutocompleteData,
        AutocompleteVariables
      >({
        endpoint,
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
};
