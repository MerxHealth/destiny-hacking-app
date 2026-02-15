import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

/**
 * Slider History Chart Component
 * 
 * Visualizes emotional state trends over time with line graphs.
 * Shows how each axis value changes across days/weeks.
 */

interface SliderHistoryChartProps {
  axisId?: number;
}

export function SliderHistoryChart({ axisId }: SliderHistoryChartProps) {
  const [dateRange, setDateRange] = useState<7 | 30 | 90>(30);
  const [selectedAxisId, setSelectedAxisId] = useState<number | undefined>(axisId);

  const { data: axes } = trpc.sliders.listAxes.useQuery();

  const effectiveAxisId = selectedAxisId ?? axes?.[0]?.id ?? 0;
  const { data: history } = trpc.sliders.getHistory.useQuery(
    { axisId: effectiveAxisId, days: dateRange },
    { enabled: !!effectiveAxisId }
  );
  const selectedAxis = axes?.find(a => a.id === effectiveAxisId);

  // Transform data for recharts — BUG 1 FIX: use clientTimestamp instead of timestamp
  const chartData = history?.map((state: any) => ({
    date: new Date(state.clientTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: state.value,
    fullDate: new Date(state.clientTimestamp).toLocaleDateString(),
  })) || [];

  // Calculate trend
  const calculateTrend = () => {
    if (!chartData || chartData.length < 2) return 0;
    const first = chartData[0].value;
    const last = chartData[chartData.length - 1].value;
    return last - first;
  };

  const trend = calculateTrend();

  if (!axes || axes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Emotional Trends
          </CardTitle>
          <CardDescription>Track your emotional state changes over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Create your first emotional axis to start tracking trends.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Emotional Trends
            </CardTitle>
            <CardDescription>
              {selectedAxis ? `${selectedAxis.leftLabel} ↔ ${selectedAxis.rightLabel}` : 'Select an axis'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={dateRange === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(7)}
            >
              7D
            </Button>
            <Button
              variant={dateRange === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(30)}
            >
              30D
            </Button>
            <Button
              variant={dateRange === 90 ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(90)}
            >
              90D
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No calibration data yet. Complete your first slider calibration to see trends.
            </p>
          </div>
        ) : (
          <>
            {/* Trend Summary */}
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trend over {dateRange} days</p>
                  <p className="text-2xl font-bold">
                    {trend > 0 ? '+' : ''}{trend.toFixed(1)} points
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Direction</p>
                  <p className={`text-lg font-semibold ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                    {trend > 0 ? `Toward ${selectedAxis?.rightLabel}` : trend < 0 ? `Toward ${selectedAxis?.leftLabel}` : 'Stable'}
                  </p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ 
                    value: `${selectedAxis?.leftLabel} ← → ${selectedAxis?.rightLabel}`, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: any) => [`${value}`, 'Value']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                  name={`${selectedAxis?.leftLabel} ↔ ${selectedAxis?.rightLabel}`}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Axis Selector — BUG 2 FIX: wire up onClick to setSelectedAxisId */}
            {axes && axes.length > 1 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {axes.map((axis: any) => (
                  <Button
                    key={axis.id}
                    variant={axis.id === effectiveAxisId ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAxisId(axis.id)}
                  >
                    {axis.leftLabel} ↔ {axis.rightLabel}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
