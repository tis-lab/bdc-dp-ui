import { useQuery } from "@tanstack/react-query";
import { graphqlRequest } from "../api/graphql/graphqlRequest";
import {
  COHORT_SUMMARY_QUERY,
  type CohortSummaryData,
  type CohortSummaryVariables,
} from "../api/graphql/queries/cohortSummary";
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
      const data = await graphqlRequest<
        CohortSummaryData,
        CohortSummaryVariables
      >({
        endpoint,
        query: COHORT_SUMMARY_QUERY,
        variables: { filter: null },
        signal,
      });
      const studies = data?.summary?.studies;
      if (!studies?.length) return null;
      return studies.reduce((sum, s) => sum + s.participant_count, 0);
    },
    staleTime: Infinity,
  });
};
