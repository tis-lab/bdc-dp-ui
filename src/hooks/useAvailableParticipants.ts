import { useQuery } from "@tanstack/react-query";
import { getGraphQLEndpoint } from "../api/config";
import { graphqlRequest } from "../api/graphql/graphqlRequest";
import {
  SEARCH_PROBE_QUERY,
  type SearchProbeData,
} from "../api/graphql/queries/searchProbe";

/** Everyone available, fetched once on page load. */
export const useAvailableParticipants = () =>
  useQuery({
    queryKey: ["availableParticipants"],
    queryFn: async ({ signal }) => {
      const data = await graphqlRequest<SearchProbeData, object>({
        endpoint: getGraphQLEndpoint(),
        query: SEARCH_PROBE_QUERY,
        variables: {},
        signal,
      });
      return Number(data.searchProbe.totalHits);
    },
    staleTime: Infinity,
  });
