
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, ComposedChart, Line, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { reportData } from "@/lib/mock-data";

export default function ReportsPanel() {
  const chartConfig = {
    plastic: { label: "플라스틱", color: "hsl(var(--chart-1))" },
    glass: { label: "유리", color: "hsl(var(--chart-2))" },
    paper: { label: "종이", color: "hsl(var(--chart-3))" },
    metal: { label: "금속", color: "hsl(var(--chart-4))" },
    mixed: { label: "혼합", color: "hsl(var(--chart-5))" },
    revenue: { label: "매출액", color: "hsl(var(--primary))" },
  } as const;

  const monthNames: { [key: string]: string } = {
    Jan: '1월',
    Feb: '2월',
    Mar: '3월',
    Apr: '4월',
    May: '5월',
    Jun: '6월',
  };

  const localizedReportData = reportData.map(d => ({...d, month: monthNames[d.month] || d.month}));

  return (
    <div className="grid gap-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>월별 수거 및 매출 현황</CardTitle>
          <CardDescription>월별 재활용품 수거량(톤) 및 총 매출액(만원)입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer>
              <ComposedChart data={localizedReportData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  tickMargin={10} 
                  axisLine={false} 
                  stroke="#888888"
                  fontSize={12}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value} T`}
                />
                 <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--primary))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 10000).toFixed(1)}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent 
                    indicator="dot" 
                    formatter={(value, name) => {
                      if (name === 'revenue') {
                        return `${(Number(value) / 10000).toLocaleString()}만원`;
                      }
                      return `${value} T`;
                    }}
                  />}
                />
                <Legend />
                <Bar dataKey="plastic" yAxisId="left" stackId="a" fill="var(--color-plastic)" radius={[0, 0, 0, 0]} barSize={30}/>
                <Bar dataKey="glass" yAxisId="left" stackId="a" fill="var(--color-glass)" radius={[0, 0, 0, 0]} barSize={30}/>
                <Bar dataKey="paper" yAxisId="left" stackId="a" fill="var(--color-paper)" radius={[0, 0, 0, 0]} barSize={30}/>
                <Bar dataKey="metal" yAxisId="left" stackId="a" fill="var(--color-metal)" radius={[0, 0, 0, 0]} barSize={30}/>
                <Bar dataKey="mixed" yAxisId="left" stackId="a" fill="var(--color-mixed)" radius={[4, 4, 0, 0]} barSize={30}/>
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} yAxisId="right" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
