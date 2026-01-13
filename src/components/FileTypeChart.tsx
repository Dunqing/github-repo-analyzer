import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

import type { FileStats } from "@/types"

interface FileTypeChartProps {
  stats: FileStats
  maxSlices?: number
}

// Chart colors matching theme CSS variables
const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "hsl(200 60% 50%)",
  "hsl(260 60% 55%)",
  "hsl(320 60% 50%)",
  "hsl(100 50% 45%)",
  "hsl(180 50% 45%)",
]

interface ChartDataItem {
  name: string
  value: number
  percentage: number
  [key: string]: string | number
}

export function FileTypeChart({ stats, maxSlices = 8 }: FileTypeChartProps) {
  const sortedExtensions = Object.entries(stats.extensionCounts).sort((a, b) => b[1] - a[1])

  // Take top N extensions and group rest as "Other"
  const topExtensions = sortedExtensions.slice(0, maxSlices)
  const otherExtensions = sortedExtensions.slice(maxSlices)
  const otherCount = otherExtensions.reduce((sum, [, count]) => sum + count, 0)

  const chartData: ChartDataItem[] = topExtensions.map(([ext, count]) => ({
    name: ext === "no-ext" ? "No extension" : `.${ext}`,
    value: count,
    percentage: (count / stats.totalFiles) * 100,
  }))

  if (otherCount > 0) {
    chartData.push({
      name: "Other",
      value: otherCount,
      percentage: (otherCount / stats.totalFiles) * 100,
    })
  }

  return (
    <div className="w-full">
      <h3 className="mb-4 text-sm font-medium">File Type Distribution</h3>
      <div className="flex items-center gap-4">
        {/* Chart */}
        <div className="h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartDataItem
                    return (
                      <div className="rounded-md border bg-popover px-3 py-2 text-popover-foreground shadow-md">
                        <p className="font-mono text-sm">{data.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {data.value} files ({data.percentage.toFixed(1)}%)
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1.5">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="truncate font-mono">{item.name}</span>
              <span className="ml-auto text-muted-foreground tabular-nums">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
