import { useQuery } from "@tanstack/react-query";
import { cohortParticipants } from "../utils/summary";
import { fetchSummary } from "./useCohortSummary";

/**
 * Everyone available: the unfiltered summary, fetched once on page load.
 * Summed across studies like the cohort count, so the two compare.
 */
export const useAvailableParticipants = () =>
  useQuery({
    queryKey: ["availableParticipants"],
    queryFn: async ({ signal }) =>
      cohortParticipants(await fetchSummary(null, signal)),
    staleTime: Infinity,
  });
