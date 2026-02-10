import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "./lib/ui/button";
import { SEVERITY_COLORS } from "~/utils/severityTheme";

const ResponsiveLine = dynamic(
  () => import("@nivo/line").then((m) => m.ResponsiveLine),
  { ssr: false }
);

type Props = {};

interface ChartSettings {
  stacked: boolean;
  lineWidth: number;
  enableArea: boolean;
}

const VulnerabilitiesOverTimeChart = (props: Props) => {
  const [settings, setSettings] = useState({
    stacked: true,
    lineWidth: 0,
    enableArea: true,
  });

  const data = [
    {
      id: "informational",
      color: "hsl(37, 70%, 50%)",
      data: [
        {
          x: "Scan 1",
          y: 2,
        },
        {
          x: "Scan 2",
          y: 42,
        },
        {
          x: "Scan 3",
          y: 122,
        },
        {
          x: "Scan 4",
          y: 101,
        },
        {
          x: "Scan 5",
          y: 305,
        },
      ],
    },
    {
      id: "low",
      color: "hsl(37, 70%, 50%)",
      data: [
        {
          x: "Scan 1",
          y: 242,
        },
        {
          x: "Scan 2",
          y: 162,
        },
        {
          x: "Scan 3",
          y: 122,
        },
        {
          x: "Scan 4",
          y: 118,
        },
        {
          x: "Scan 5",
          y: 38,
        },
      ],
    },
    {
      id: "medium",
      color: "hsl(37, 70%, 50%)",
      data: [
        {
          x: "Scan 1",
          y: 192,
        },
        {
          x: "Scan 2",
          y: 282,
        },
        {
          x: "Scan 3",
          y: 172,
        },
        {
          x: "Scan 4",
          y: 61,
        },
        {
          x: "Scan 5",
          y: 125,
        },
      ],
    },
    {
      id: "high",
      color: "hsl(37, 70%, 50%)",
      data: [
        {
          x: "Scan 1",
          y: 2,
        },
        {
          x: "Scan 2",
          y: 142,
        },
        {
          x: "Scan 3",
          y: 12,
        },
        {
          x: "Scan 4",
          y: 111,
        },
        {
          x: "Scan 5",
          y: 25,
        },
      ],
    },
    {
      id: "critical",
      color: "hsl(37, 70%, 50%)",
      data: [
        {
          x: "Scan 1",
          y: 2,
        },
        {
          x: "Scan 2",
          y: 12,
        },
        {
          x: "Scan 3",
          y: 72,
        },
        {
          x: "Scan 4",
          y: 11,
        },
        {
          x: "Scan 5",
          y: 5,
        },
      ],
    },
  ];

  const handleVulnerabilitiesOverTimeClick = () => {
    setSettings({
      stacked: true, // Example of different settings
      lineWidth: 0,
      enableArea: true,
    });
  };

  const handleVulnerabilitiesBySeverityClick = () => {
    setSettings({
      enableArea: false,
      stacked: false,
      lineWidth: 1,
    });
  };

  return (
    <div className="w-100 mb-20 h-80 min-w-full text-white">
      <div className="ml-6 flex flex-row gap-4">
        <Button
          onClick={handleVulnerabilitiesOverTimeClick}
          className="mb-2 border border-violet-500/30 bg-transparent p-1 pl-2 pr-2 text-xs text-white hover:bg-violet-300 hover:text-black focus:bg-violet-300 focus:text-black"
          size="none"
          autoFocus
        >
          Vulnerabilities Over Time
        </Button>
        <Button
          onClick={handleVulnerabilitiesBySeverityClick}
          className="mb-2 border border-violet-500/30 bg-transparent p-1 pl-2 pr-2 text-xs text-white hover:bg-violet-300 hover:text-black focus:bg-violet-300 focus:text-black"
          size="none"
        >
          Vulnerabilities By Severity
        </Button>
      </div>
      <VulnerabilityChart data={data} settings={settings} />
    </div>
  );
};

interface VulnerabilityChartProps {
  id: string;
  color: string;
  data: {
    x: string;
    y: number;
  }[];
  settings: {
    stacked: boolean;
    lineWidth: number;
    enableArea: boolean;
  };
}

const theme = {
  text: {
    fontSize: 48,
    color: "#fff",
  },
  axis: {
    domain: {
      line: {
        stroke: "#777777",
        strokeWidth: 0,
      },
    },
    legend: {
      text: {
        fontSize: 12,
        fill: "#fff",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
    ticks: {
      line: {},
      text: {
        fontSize: 8,
        fill: "#fff",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
  },
  grid: {
    line: {
      stroke: "#777777",
      strokeWidth: 0.2,
    },
  },
  legends: {
    title: {
      text: {
        fontSize: 48,
        fill: "#fff",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
    text: {
      fontSize: 12,
      fill: "#fff",
      outlineWidth: 0,
      outlineColor: "transparent",
    },
  },
  tooltip: {
    container: {
      background: "#000",
      fontSize: 12,
    },
    basic: {},
    chip: {},
    table: {},
    tableCell: {},
    tableCellValue: {},
  },
};

const VulnerabilityChart: React.FC<VulnerabilityChartProps> = ({
  id,
  color,
  data,
  settings,
}) => {
  const tmp = [
    {
      id: "informational",
      color: "hsl(0, 0%, 0%, .1)",
      data: [
        {
          x: "Scan 1",
          y: 42,
        },
        {
          x: "Scan 2",
          y: 142,
        },
        {
          x: "Scan 3",
          y: 172,
        },
        {
          x: "Scan 4",
          y: 211,
        },
        {
          x: "Scan 5",
          y: 325,
        },
      ],
    },
    {
      id: "low",
      color: "hsl(37, 70%, 50%)",
      data: [
        {
          x: "Scan 1",
          y: 242,
        },
        {
          x: "Scan 2",
          y: 242,
        },
        {
          x: "Scan 3",
          y: 172,
        },
        {
          x: "Scan 4",
          y: 111,
        },
        {
          x: "Scan 5",
          y: 5,
        },
      ],
    },
    {
      id: "medium",
      color: "hsl(37, 70%, 50%)",
      data: [
        {
          x: "Scan 1",
          y: 242,
        },
        {
          x: "Scan 2",
          y: 242,
        },
        {
          x: "Scan 3",
          y: 72,
        },
        {
          x: "Scan 4",
          y: 111,
        },
        {
          x: "Scan 5",
          y: 225,
        },
      ],
    },
    {
      id: "high",
      color: "hsl(37, 70%, 50%)",
      data: [
        {
          x: "Scan 1",
          y: 2,
        },
        {
          x: "Scan 2",
          y: 142,
        },
        {
          x: "Scan 3",
          y: 172,
        },
        {
          x: "Scan 4",
          y: 111,
        },
        {
          x: "Scan 5",
          y: 25,
        },
      ],
    },
    {
      id: "critical",
      label: "Critical",
      color: "#000",
      data: [
        {
          x: "Scan 1",
          y: 2,
        },
        {
          x: "Scan 2",
          y: 12,
        },
        {
          x: "Scan 3",
          y: 72,
        },
        {
          x: "Scan 4",
          y: 11,
        },
        {
          x: "Scan 5",
          y: 25,
        },
      ],
    },
  ];

  return (
    <ResponsiveLine
      data={data}
      lineWidth={settings.lineWidth}
      theme={theme}
      enableGridX={true}
      enableGridY={false}
      enableSlices="x"
      enableArea={settings.enableArea}
      areaBlendMode="hard-light"
      areaOpacity={0.7}
      curve="natural"
      colors={[
        SEVERITY_COLORS.info.hex,
        SEVERITY_COLORS.low.hex,
        SEVERITY_COLORS.medium.hex,
        SEVERITY_COLORS.high.hex,
        SEVERITY_COLORS.critical.hex,
      ]}
      margin={{ top: 10, right: 110, bottom: 20, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: settings.stacked,
        reverse: false,
      }}
      yFormat=">-"
      axisTop={null}
      axisRight={null}
      axisBottom={null}
      axisLeft={{
        tickSize: 15,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Vulnerabilities",
        legendOffset: -50,
        legendPosition: "middle",
      }}
      pointSize={6}
      pointColor="#9929bd"
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.7,
          symbolSize: 15,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 0.5,
              },
            },
          ],
        },
      ]}
    />
  );
};
export default VulnerabilitiesOverTimeChart;
