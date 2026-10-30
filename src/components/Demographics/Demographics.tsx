import { useId, useMemo, useState } from "react";
import { Alert, Tab, Tabs, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { SummaryResponse } from "../../api/graphql/queries/cohortSummary";
import { ECHARTS_FILL } from "../../charts";
import {
  cohortParticipants,
  demographicBreakdown,
  percentOf,
  type DemographicSlot,
} from "../../utils/summary";
import EmptyState from "../EmptyState";
import { SkeletonRows } from "../LoadingSkeleton";
import { PanelSection, PanelTitle } from "../Panel/Panel.styles";
import { BarArea } from "./Demographics.styles";

// ----------------------------------------------------------------------

const SLOTS: { slot: DemographicSlot; label: string }[] = [
  { slot: "sex", label: "Sex" },
  { slot: "race", label: "Race" },
  { slot: "ethnicity", label: "Ethnicity" },
];

export interface Props {
  summary?: SummaryResponse;
  /** First load only; later updates keep the current chart on screen. */
  isLoading?: boolean;
  /** Shown instead of the chart, so a failed request never reads as "add criteria". */
  error?: Error | null;
}

const BAR_THICKNESS = 10;
const SKELETON_BARS = 3;

// ----------------------------------------------------------------------

export default function Demographics({
  summary,
  isLoading = false,
  error = null,
}: Props) {
  const titleId = useId();

  return (
    <PanelSection aria-labelledby={titleId} aria-busy={isLoading}>
      <div>
        <PanelTitle id={titleId}>Demographics</PanelTitle>
        {summary && !error && (
          <Typography variant="body2" color="text.secondary">
            {cohortParticipants(summary).toLocaleString()} participants ·{" "}
            {summary.studies.length} studies
          </Typography>
        )}
      </div>

      {error ? (
        <Alert severity="error">Couldn't load demographics.</Alert>
      ) : summary ? (
        <Breakdown summary={summary} />
      ) : isLoading ? (
        <BarArea rows={SKELETON_BARS}>
          <SkeletonRows
            count={SKELETON_BARS}
            height={BAR_THICKNESS}
            label="Loading demographics"
          />
        </BarArea>
      ) : (
        <EmptyState description="Include a concept to see its demographic breakdown." />
      )}
    </PanelSection>
  );
}

function Breakdown({ summary }: { summary: SummaryResponse }) {
  const theme = useTheme();
  const [slot, setSlot] = useState<DemographicSlot>("sex");

  const total = cohortParticipants(summary);
  const rows = useMemo(
    () => demographicBreakdown(summary, slot),
    [summary, slot],
  );

  const bars = useMemo(
    () => ({
      aria: { enabled: true },
      textStyle: {
        fontFamily: theme.typography.fontFamily,
        color: theme.palette.text.secondary,
      },
      animation: false,
      grid: { left: 0, right: 80, top: 0, bottom: 0, containLabel: true },
      xAxis: { type: "value", max: total, show: false },
      yAxis: {
        type: "category",
        inverse: true,
        data: rows.map((r) => r.label),
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          barWidth: BAR_THICKNESS,
          showBackground: true,
          backgroundStyle: {
            color: theme.palette.grey[200],
            borderRadius: theme.shape.borderRadius,
          },
          itemStyle: {
            color: theme.palette.primary.main,
            borderRadius: theme.shape.borderRadius,
          },
          label: {
            show: true,
            position: "right",
            color: theme.palette.text.primary,
            formatter: ({ value }: { value: number }) =>
              `${value.toLocaleString()} · ${percentOf(value, total)}%`,
          },
          data: rows.map((r) => ({ name: r.label, value: r.count })),
        },
      ],
    }),
    [rows, total, theme],
  );

  return (
    <>
      <Tabs
        value={slot}
        onChange={(_, value: DemographicSlot) => setSlot(value)}
        variant="fullWidth"
      >
        {SLOTS.map((s) => (
          <Tab key={s.slot} value={s.slot} label={s.label} />
        ))}
      </Tabs>

      {rows.length > 0 ? (
        <BarArea rows={rows.length}>
          <ReactECharts option={bars} style={ECHARTS_FILL} />
        </BarArea>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Not reported for this cohort.
        </Typography>
      )}

      <Typography variant="caption" color="text.secondary">
        Counts are aggregated across studies. Categories may not total 100% when
        values are not reported.
      </Typography>
    </>
  );
}
