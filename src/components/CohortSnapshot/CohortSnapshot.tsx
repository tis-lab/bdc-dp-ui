import { useId, useMemo } from "react";
import { Alert, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { SummaryResponse } from "../../api/graphql/queries/cohortSummary";
import { ECHARTS_FILL } from "../../charts";
import { cohortTotals, SUMMED_TOTALS_NOTE } from "../../utils/summary";
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
  /** Current criteria's summary; if absent, the available total is shown. */
  filteredSummary?: SummaryResponse;
  /** Participants available, or null when unavailable. */
  availableTotal: number | null;
  /** First load only; later updates keep the current counts on screen. */
  isLoading?: boolean;
  /** Replaces the counts so a failure is not shown as the full population. */
  error?: Error | null;
}

// ----------------------------------------------------------------------

export default function CohortSnapshot({
  filteredSummary,
  availableTotal,
  isLoading = false,
  error = null,
}: Props) {
  const titleId = useId();
  const theme = useTheme();

  const totals = filteredSummary && cohortTotals(filteredSummary);
  const cohortCount = totals ? totals.participants : availableTotal;

  const donut = useMemo(() => ({
    series: [
      {
        type: "pie",
        radius: ["82%", "100%"],
        startAngle: 90,
        // Draw an all-zero ring empty rather than split evenly
        stillShowZeroSum: false,
        silent: true,
        animation: false,
        label: { show: false },
        // Without an available total there is no proportion to draw
        data: [
          {
            name: "In cohort",
            value: availableTotal === null ? 0 : (cohortCount ?? 0),
            itemStyle: { color: theme.palette.primary.main },
          },
          {
            name: "Not in cohort",
            value: Math.max((availableTotal ?? 0) - (cohortCount ?? 0), 0),
            itemStyle: { color: theme.palette.grey[300] },
          },
        ],
      },
    ],
  }), [cohortCount, availableTotal, theme]);

  return (
    <PanelSection aria-labelledby={titleId} aria-busy={isLoading}>
      <div>
        <PanelTitle id={titleId}>Cohort Snapshot</PanelTitle>
        {filteredSummary && (
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
              {cohortCount === null ? (
                <Typography variant="body1" component="p">
                  Not available
                </Typography>
              ) : (
                <Typography variant="h5" component="p">
                  {cohortCount.toLocaleString()}
                </Typography>
              )}
              <DonutCaption variant="caption">Estimated Participants</DonutCaption>
              {filteredSummary && availableTotal !== null && (
                <DonutCaption variant="caption" color="text.secondary">
                  of {availableTotal.toLocaleString()} available
                </DonutCaption>
              )}
            </DonutCenter>
          </Donut>

          <SnapshotFooter>
            {totals && (
              <Typography variant="body2">
                Studies: <strong>{totals.studies}</strong>
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Participant count is estimated until query is executed
            </Typography>
            {totals && (
              <Typography variant="caption" color="text.secondary">
                {SUMMED_TOTALS_NOTE}
              </Typography>
            )}
          </SnapshotFooter>
        </>
      )}
    </PanelSection>
  );
}
