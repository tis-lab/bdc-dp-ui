import { useQuery } from "@tanstack/react-query";
import { getGraphQLEndpoint } from "../api/config";
import { graphqlRequest } from "../api/graphql/graphqlRequest";
import {
  PAGE_LOAD_SNAPSHOT_QUERY,
  type PageLoadSnapshotData,
} from "../api/graphql/queries/pageLoadSnapshot";

/**
 * Everyone available, as unique participants from pageLoadSnapshot, fetched
 * once on page load. Fails rather than showing 0 when the count is missing or
 * suppressed.
 */
export const useAvailableParticipants = () =>
  useQuery({
    queryKey: ["availableParticipants"],
    queryFn: async ({ signal }) => {
      const data = await graphqlRequest<PageLoadSnapshotData, object>({
        endpoint: getGraphQLEndpoint(),
        query: PAGE_LOAD_SNAPSHOT_QUERY,
        variables: {},
        signal,
      });
      const count = data?.pageLoadSnapshot?.participantCount;
      if (!count || count.suppressed || count.value === null) {
        throw new Error("Available participant count is unavailable");
      }
      return count.value;
    },
    staleTime: Infinity,
  });
