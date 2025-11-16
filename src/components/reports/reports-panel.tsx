'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { reportData } from "@/lib/mock-data";

export default function ReportsPanel() {
  const chartConfig = {
    plastic: { label: "Plastic", color: "hsl(var(--chart-1))" },
    glass: { label: "Glass", color: "hsl(var(--chart-2))" },
    paper: { label: "Paper", color: "hsl(var(--chart-3))" },
    metal: { label: "Metal", color: "hsl(var(--chart-4))" },
    mixed: { label: "Mixed", color: "hsl(var(--chart-5))" },
  } as const;

  return (
    <div className="grid gap-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Monthly Collection Volume</CardTitle>
          <CardDescription>Total weight (in tons) of recycled materials collected per month.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer>
              <BarChart data={reportData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
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
