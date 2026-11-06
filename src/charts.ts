import * as echarts from "echarts/core";
import { BarChart, PieChart } from "echarts/charts";
import { AriaComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

// Only registered chart types and components are bundled; register new ones here
echarts.use([PieChart, BarChart, GridComponent, AriaComponent, CanvasRenderer]);

export { echarts };

// echarts-for-react sizes itself inline (300px default), so it needs a style, not a class
export const ECHARTS_FILL = { width: "100%", height: "100%" };
