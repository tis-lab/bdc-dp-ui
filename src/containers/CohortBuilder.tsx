import { useState } from "react";
import { Container, Divider } from "@mui/material";
import Search from "./Search";
import CohortCriteria from "../components/CohortCriteria";
import CohortSnapshot from "../components/CohortSnapshot";
import Demographics from "../components/Demographics";
import {
  useCohortSummary,
  type Criteria,
  type CriteriaKind,
} from "../hooks/useCohortSummary";
import { AVAILABLE_PARTICIPANTS_PLACEHOLDER } from "../placeholders";
import {
  getSearchItemKey,
  type SearchItem,
} from "../api/graphql/queries/resolveTerms";
import { CohortBuilderLayout, Column, Overview } from "./CohortBuilder.styles";

// ----------------------------------------------------------------------

const without = (items: SearchItem[], item: SearchItem) =>
  items.filter((i) => getSearchItemKey(i) !== getSearchItemKey(item));

export default function CohortBuilder() {
  const [criteria, setCriteria] = useState<Criteria>({
    include: [],
    exclude: [],
    match: "all",
  });
  const summary = useCohortSummary(criteria);

  // An item is in at most one list, at most once
  const add = (kind: CriteriaKind) => (item: SearchItem) =>
    setCriteria((prev) => ({
      ...prev,
      include: without(prev.include, item),
      exclude: without(prev.exclude, item),
      [kind]: [...without(prev[kind], item), item],
    }));

  const remove = (kind: CriteriaKind) => (item: SearchItem) =>
    setCriteria((prev) => ({ ...prev, [kind]: without(prev[kind], item) }));

  return (
    <Container maxWidth="lg">
      <CohortBuilderLayout>
        <Column>
          <Search
            onInclude={add("include")}
            onExclude={add("exclude")}
            criteria={criteria}
            onRemove={remove}
          />
          <CohortCriteria
            criteria={criteria}
            onRemove={remove}
            onMatchChange={(match) =>
              setCriteria((prev) => ({ ...prev, match }))
            }
          />
        </Column>

        <Overview aria-label="Cohort overview">
          <CohortSnapshot
            summary={summary.data}
            availableParticipants={AVAILABLE_PARTICIPANTS_PLACEHOLDER}
            isLoading={summary.isLoading}
            error={summary.error}
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
