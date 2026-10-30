import { useId } from "react";
import { Card, Chip, ToggleButtonGroup, Typography } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CriteriaSection from "../CriteriaSection";
import EmptyState from "../EmptyState";
import { PanelTitle } from "../Panel/Panel.styles";
import type { SearchItem } from "../../api/graphql/queries/resolveTerms";
import type {
  Criteria,
  CriteriaKind,
  CriteriaMatch,
} from "../../hooks/useCohortSummary";
import {
  CriteriaPanel,
  Header,
  MatchRow,
  MatchToggle,
  Sections,
} from "./CohortCriteria.styles";

// ----------------------------------------------------------------------

export interface Props {
  criteria: Criteria;
  onRemove: (kind: CriteriaKind) => (item: SearchItem) => void;
  onMatchChange: (match: CriteriaMatch) => void;
}

// ----------------------------------------------------------------------

export default function CohortCriteria({
  criteria,
  onRemove,
  onMatchChange,
}: Props) {
  const titleId = useId();
  const total = criteria.include.length + criteria.exclude.length;

  return (
    <CriteriaPanel as="section" aria-labelledby={titleId}>
      <Header>
        <div>
          <PanelTitle id={titleId}>Cohort Criteria</PanelTitle>
          <Typography variant="body2" color="text.secondary">
            Define who should and should not be part of this cohort.
          </Typography>
        </div>
        <Chip
          label={`${total} ${total === 1 ? "criterion" : "criteria"}`}
          size="small"
        />
      </Header>

      {total === 0 ? (
        <Card variant="outlined">
          <EmptyState
            align="start"
            icon={<FilterListIcon color="action" />}
            title="No criteria added yet"
            description="Search above, then add a concept as Include or Exclude."
          />
        </Card>
      ) : (
        <Sections>
          <CriteriaSection
            title="Include"
            emptyText="No inclusion criteria added"
            items={criteria.include}
            onRemove={onRemove("include")}
          >
            {criteria.include.length > 1 && (
              <MatchRow>
                <Typography variant="body2">
                  Include participants who match
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={criteria.match}
                  onChange={(_, match: CriteriaMatch | null) =>
                    match && onMatchChange(match)
                  }
                  aria-label="Inclusion logic"
                >
                  <MatchToggle value="all">All</MatchToggle>
                  <MatchToggle value="any">Any</MatchToggle>
                </ToggleButtonGroup>
                <Typography variant="body2">of these criteria.</Typography>
              </MatchRow>
            )}
          </CriteriaSection>
          <CriteriaSection
            title="Exclude"
            emptyText="No exclusion criteria added"
            items={criteria.exclude}
            onRemove={onRemove("exclude")}
          />
        </Sections>
      )}
    </CriteriaPanel>
  );
}
