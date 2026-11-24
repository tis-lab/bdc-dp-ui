import { useQuery } from "@tanstack/react-query";
import { graphqlRequest } from "../api/graphql/graphqlRequest";
import { getQueryEndpoint } from "../api/queryEndpoint";
import {
  AVAILABLE_PARTICIPANTS_QUERY,
  AvailableParticipantsData,
  RELEASE,
  type CohortSummaryVariables,
} from "../mocks/sampleSummaryResponse";

/**
 * Participants available, from pageLoadSnapshot. Fetched once per session.
 * null when the count is missing or suppressed.
 */
export const useAvailableParticipants = () => {
  const endpoint = getQueryEndpoint("open");
  return useQuery({
    queryKey: ["availableParticipants", RELEASE],
    queryFn: async ({ signal }) => {
      const data = await graphqlRequest<
        AvailableParticipantsData,
        CohortSummaryVariables
      >({
        endpoint,
        query: AVAILABLE_PARTICIPANTS_QUERY,
        variables: { expression: { release: RELEASE } },
        signal,
      });
      const studies = data?.summary?.studies;
      if (!studies?.length) return null;
      return studies.reduce((sum, s) => sum + s.participant_count, 0);
    },
    staleTime: Infinity,
  });
};
