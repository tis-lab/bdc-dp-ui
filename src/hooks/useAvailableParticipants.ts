import { useQuery } from "@tanstack/react-query";
import { graphqlRequest } from "../api/graphql/graphqlRequest";
import {
  PAGE_LOAD_SNAPSHOT_QUERY,
  type PageLoadSnapshotData,
} from "../api/graphql/queries/pageLoadSnapshot";
import { getQueryEndpoint } from "../api/queryEndpoint";

/**
 * Participants available, from pageLoadSnapshot. Fetched once per session.
 * null when the count is missing or suppressed.
 */
export const useAvailableParticipants = () => {
  const endpoint = getQueryEndpoint("open");
  return useQuery({
    queryKey: ["availableParticipants"],
    queryFn: async ({ signal }) => {
      const data = await graphqlRequest<PageLoadSnapshotData, object>({
        endpoint,
        query: PAGE_LOAD_SNAPSHOT_QUERY,
        variables: {},
        signal,
      });
      const count = data?.pageLoadSnapshot?.participantCount;
      return count && !count.suppressed ? count.value : null;
    },
    staleTime: Infinity,
  });
};
