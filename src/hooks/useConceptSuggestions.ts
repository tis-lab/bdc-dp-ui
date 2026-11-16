import { useQuery } from "@tanstack/react-query";
import { graphqlRequest } from "../api/graphql/graphqlRequest";
import {
  AUTOCOMPLETE_QUERY,
  type AutocompleteData,
  type AutocompleteVariables,
} from "../api/graphql/queries/autocomplete";
import { useQueryEndpoint } from "../contexts/ApiContext";

export const useConceptSuggestions = (searchText: string) => {
  const endpoint = useQueryEndpoint("open");
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
