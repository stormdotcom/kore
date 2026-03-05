declare module "blessed-contrib" {
  import type blessed from "blessed";

  namespace Widgets {
    interface LineData {
      title: string;
      x: string[];
      y: number[];
      style?: { line?: string };
    }

    interface LineElement extends blessed.Widgets.BoxElement {
      setData(data: LineData[]): void;
    }

    interface DonutData {
      label: string;
      percent: number;
      color: string;
    }

    interface DonutElement extends blessed.Widgets.BoxElement {
      setData(data: DonutData[]): void;
    }

    interface SparklineElement extends blessed.Widgets.BoxElement {
      setData(titles: string[], datasets: number[][]): void;
    }

    interface TableData {
      headers: string[];
      data: string[][];
    }

    interface TableElement extends blessed.Widgets.BoxElement {
      setData(data: TableData): void;
    }
  }

  interface GridOptions {
    rows: number;
    cols: number;
    screen: blessed.Widgets.Screen;
  }

  class grid {
    constructor(options: GridOptions);
    set<T>(
      row: number,
      col: number,
      rowSpan: number,
      colSpan: number,
      widget: unknown,
      options: Record<string, unknown>
    ): T;
  }

  const line: unknown;
  const donut: unknown;
  const sparkline: unknown;
  const table: unknown;

  export { grid, line, donut, sparkline, table, Widgets };
}
