import { useCallback, useState } from "react";
import { Container, Divider } from "@mui/material";
import Search from "./Search";
import CohortCriteria from "../components/CohortCriteria";
import CohortSnapshot from "../components/CohortSnapshot";
import Demographics from "../components/Demographics";
import {
  useCohortSummary,
  type Criteria,
  type CriteriaKind,
  type CriteriaMatch,
} from "../hooks/useCohortSummary";
import { useAvailableParticipants } from "../hooks/useAvailableParticipants";
import {
  getSearchItemKey,
  type SearchItem,
} from "../api/graphql/queries/resolveTerms";
import { CohortBuilderLayout, Column, Overview } from "./CohortBuilder.styles";

// ----------------------------------------------------------------------

const without = (items: SearchItem[], item: SearchItem) =>
  items.filter((i) => getSearchItemKey(i) !== getSearchItemKey(item));

// An item is in at most one list, at most once
const addTo =
  (kind: CriteriaKind, item: SearchItem) =>
  (prev: Criteria): Criteria => ({
    ...prev,
    include: without(prev.include, item),
    exclude: without(prev.exclude, item),
    [kind]: [...without(prev[kind], item), item],
  });

export default function CohortBuilder() {
  const [criteria, setCriteria] = useState<Criteria>({
    include: [],
    exclude: [],
    match: "all",
  });
  const available = useAvailableParticipants();
  const summary = useCohortSummary(criteria);

  const handleInclude = useCallback(
    (item: SearchItem) => setCriteria(addTo("include", item)),
    [],
  );
  const handleExclude = useCallback(
    (item: SearchItem) => setCriteria(addTo("exclude", item)),
    [],
  );
  const remove = useCallback(
    (kind: CriteriaKind) => (item: SearchItem) =>
      setCriteria((prev) => ({ ...prev, [kind]: without(prev[kind], item) })),
    [],
  );
  const handleMatchChange = useCallback(
    (match: CriteriaMatch) => setCriteria((prev) => ({ ...prev, match })),
    [],
  );

  return (
    <Container maxWidth="lg">
      <CohortBuilderLayout>
        <Column>
          <Search
            onInclude={handleInclude}
            onExclude={handleExclude}
            criteria={criteria}
            onRemove={remove}
          />
          <CohortCriteria
            criteria={criteria}
            onRemove={remove}
            onMatchChange={handleMatchChange}
          />
        </Column>

        <Overview aria-label="Cohort overview">
          <CohortSnapshot
            summary={summary.data}
            availableParticipants={available.data ?? 0}
            isLoading={available.isLoading || summary.isLoading}
            error={available.error ?? summary.error}
          />
          <Divider />
          <Demographics
            summary={summary.data}
            isLoading={summary.isLoading}
            error={summary.error}
          />
        </Overview>
      </CohortBuilderLayout>
    </Container>
  );
}
