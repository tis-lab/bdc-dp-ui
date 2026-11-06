import { useQuery } from "@tanstack/react-query";
import { getGraphQLEndpoint } from "../api/config";
import { graphqlRequest } from "../api/graphql/graphqlRequest";
import {
  PAGE_LOAD_SNAPSHOT_QUERY,
  type PageLoadSnapshotData,
} from "../api/graphql/queries/pageLoadSnapshot";

/**
 * Participants available, from pageLoadSnapshot. Fetched once per session.
 * Errors when the count is missing or suppressed, so the snapshot shows an
 * error instead of 0.
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
