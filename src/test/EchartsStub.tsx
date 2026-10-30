/**
 * Jest stand-in for echarts-for-react, wired up in jest.config.js.
 * ECharts needs a real canvas, which jsdom lacks, so this lists each slice
 * or bar as "name: value" for tests to read.
 *
 * Handles both data shapes:
 *  - items with their own names:  series.data = [{ name: "Female", value: 480 }]
 *  - plain numbers named by a category axis:  yAxis.data = ["Female"], series.data = [480]
 */
type Item = number | { name?: string; value: number };
type Series = { data?: Item[] };
type Axis = { data?: string[] };
type Option = {
  series?: Series | Series[];
  xAxis?: Axis | Axis[];
  yAxis?: Axis | Axis[];
};

const toList = <T,>(value: T | T[] | undefined): T[] =>
  ([] as T[]).concat(value ?? []);

export default function EChartsStub({ option }: { option: Option }) {
  // Horizontal bars put the categories on the y axis, vertical bars on the x axis
  const categories =
    [...toList(option.yAxis), ...toList(option.xAxis)].find(
      (axis) => axis.data?.length,
    )?.data ?? [];

  const rows = toList(option.series).flatMap((series) =>
    (series.data ?? []).map((item, i) =>
      typeof item === "number"
        ? { name: categories[i], value: item }
        : { name: item.name ?? categories[i], value: item.value },
    ),
  );

  return (
    <ul data-testid="echarts-stub">
      {rows.map((row, i) => (
        <li key={i}>{`${row.name}: ${row.value}`}</li>
      ))}
    </ul>
  );
}
