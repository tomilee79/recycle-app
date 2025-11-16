'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { reportData } from "@/lib/mock-data";

export default function ReportsPanel() {
  const chartConfig = {
    plastic: { label: "플라스틱", color: "hsl(var(--chart-1))" },
    glass: { label: "유리", color: "hsl(var(--chart-2))" },
    paper: { label: "종이", color: "hsl(var(--chart-3))" },
    metal: { label: "금속", color: "hsl(var(--chart-4))" },
    mixed: { label: "혼합", color: "hsl(var(--chart-5))" },
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
          <CardTitle>월별 수거량</CardTitle>
          <CardDescription>매월 수거된 재활용품의 총 무게 (톤 단위)입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer>
              <BarChart data={localizedReportData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
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
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value} T`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="plastic" stackId="a" fill="var(--color-plastic)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="glass" stackId="a" fill="var(--color-glass)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="paper" stackId="a" fill="var(--color-paper)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="metal" stackId="a" fill="var(--color-metal)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="mixed" stackId="a" fill="var(--color-mixed)" radius={[0, 0, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
