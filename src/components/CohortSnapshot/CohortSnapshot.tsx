import { useId, useMemo } from "react";
import { Alert, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { SummaryResponse } from "../../api/graphql/queries/cohortSummary";
import { ECHARTS_FILL } from "../../charts";
import { cohortParticipants } from "../../utils/summary";
import { MutedSkeleton } from "../LoadingSkeleton";
import { PanelSection, PanelTitle } from "../Panel/Panel.styles";
import {
  DONUT_SIZE,
  Donut,
  DonutCaption,
  DonutCenter,
  SnapshotFooter,
} from "./CohortSnapshot.styles";

// ----------------------------------------------------------------------

export interface Props {
  /** Without one, everyone available is shown. */
  summary?: SummaryResponse;
  availableParticipants: number;
  /** First load only; later updates keep the current counts on screen. */
  isLoading?: boolean;
  /** Shown instead of the counts, so a failed request never looks like everyone. */
  error?: Error | null;
}

// ----------------------------------------------------------------------

export default function CohortSnapshot({
  summary,
  availableParticipants,
  isLoading = false,
  error = null,
}: Props) {
  const titleId = useId();
  const theme = useTheme();

  const participants = summary
    ? cohortParticipants(summary)
    : availableParticipants;

  const donut = useMemo(() => ({
    series: [
      {
        type: "pie",
        radius: ["82%", "100%"],
        startAngle: 90,
        silent: true,
        animation: false,
        label: { show: false },
        data: [
          {
            name: "In cohort",
            value: participants,
            itemStyle: { color: theme.palette.primary.main },
          },
          {
            name: "Not in cohort",
            value: Math.max(availableParticipants - participants, 0),
            itemStyle: { color: theme.palette.grey[300] },
          },
        ],
      },
    ],
  }), [participants, availableParticipants, theme]);

  return (
    <PanelSection aria-labelledby={titleId} aria-busy={isLoading}>
      <div>
        <PanelTitle id={titleId}>Cohort Snapshot</PanelTitle>
        {summary && (
          <Typography variant="body2" color="text.secondary">
            Based on current cohort
          </Typography>
        )}
      </div>

      {error ? (
        <Alert severity="error">Couldn't load the cohort snapshot.</Alert>
      ) : isLoading ? (
        <Donut role="progressbar" aria-label="Loading cohort snapshot">
          <DonutCenter>
            <MutedSkeleton
              variant="circular"
              width={DONUT_SIZE}
              height={DONUT_SIZE}
            />
          </DonutCenter>
        </Donut>
      ) : (
        <>
          <Donut>
            <ReactECharts option={donut} style={ECHARTS_FILL} />
            <DonutCenter>
              <Typography variant="h5" component="p">
                {participants.toLocaleString()}
              </Typography>
              <DonutCaption variant="caption">Estimated Participants</DonutCaption>
              {summary && (
                <DonutCaption variant="caption" color="text.secondary">
                  of {availableParticipants.toLocaleString()} available
                </DonutCaption>
              )}
            </DonutCenter>
          </Donut>

          <SnapshotFooter>
            {summary && (
              <Typography variant="body2">
                Studies: <strong>{summary.studies.length}</strong>
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Participant count is estimated until query is executed
            </Typography>
          </SnapshotFooter>
        </>
      )}
    </PanelSection>
  );
}
