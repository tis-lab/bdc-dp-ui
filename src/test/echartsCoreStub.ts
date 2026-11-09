/**
 * Jest stand-in for the echarts/* modules imported by src/charts.ts, wired up
 * in jest.config.js. Charts render through EchartsStub, so registration is a no-op.
 */
export const use = () => {};

export const PieChart = {};
export const BarChart = {};
export const GridComponent = {};
export const AriaComponent = {};
export const CanvasRenderer = {};
