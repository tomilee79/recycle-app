
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { collectionTasks, customers } from "@/lib/mock-data";
import { useMemo } from "react";

const materialTypeMap: { [key: string]: string } = {
    'Plastic': '플라스틱',
    'Glass': '유리',
    'Paper': '종이',
    'Metal': '금속',
    'Mixed': '혼합'
};

const materialTypeColors: { [key: string]: string } = {
    'Plastic': 'hsl(var(--chart-1))',
    'Glass': 'hsl(var(--chart-2))',
    'Paper': 'hsl(var(--chart-3))',
    'Metal': 'hsl(var(--chart-4))',
    'Mixed': 'hsl(var(--chart-5))'
};

export default function WasteAnalysisPanel() {
  const { wasteByType, wasteByCustomer } = useMemo(() => {
    const wasteByType = collectionTasks.reduce((acc, task) => {
      if (task.status === 'Completed') {
        const key = materialTypeMap[task.materialType] || task.materialType;
        acc[key] = (acc[key] || 0) + task.collectedWeight;
      }
      return acc;
    }, {} as { [key: string]: number });

    const wasteByCustomer = collectionTasks.reduce((acc, task) => {
        if (task.status === 'Completed') {
          const customer = customers.find(c => c.id === task.customerId);
          const customerName = customer ? customer.name : '알 수 없음';
          acc[customerName] = (acc[customerName] || 0) + task.collectedWeight;
        }
        return acc;
      }, {} as { [key: string]: number });

    return { 
        wasteByType: Object.entries(wasteByType).map(([name, value]) => ({ name, value })),
        wasteByCustomer: Object.entries(wasteByCustomer).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    };
  }, []);

  const chartConfigWasteType = {
    value: { label: "수거량 (kg)" },
    ...Object.fromEntries(Object.entries(materialTypeMap).map(([key, value]) => [value, { label: value, color: materialTypeColors[key] }]))
  };
  
  const chartConfigCustomer = {
    value: { label: "수거량 (kg)", color: "hsl(var(--primary))" }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>폐기물 종류별 분석</CardTitle>
          <CardDescription>수거 완료된 폐기물의 종류별 분포입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigWasteType} className="h-[300px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <RechartsTooltip 
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />} 
                />
                <Pie data={wasteByType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {wasteByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartConfigWasteType[entry.name]?.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>고객사별 수거량</CardTitle>
          <CardDescription>주요 고객사별 총 수거량(kg)입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigCustomer} className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart data={wasteByCustomer} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid horizontal={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={80} />
                <XAxis type="number" dataKey="value" tickFormatter={(value) => `${value / 1000}t`} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
