
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell, Legend, Tooltip as RechartsTooltip, Line, ComposedChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { collectionTasks, customers } from "@/lib/mock-data";
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const materialTypeMap: { [key: string]: string } = {
    'Plastic': '플라스틱',
    'Glass': '유리',
    'Paper': '종이',
    'Metal': '금속',
    'Mixed': '혼합'
};

const materialTypeColors: { [key: string]: string } = {
    '플라스틱': 'hsl(var(--chart-1))',
    '유리': 'hsl(var(--chart-2))',
    '종이': 'hsl(var(--chart-3))',
    '금속': 'hsl(var(--chart-4))',
    '혼합': 'hsl(var(--chart-5))'
};

export default function WasteAnalysisPanel() {
  const { wasteByType, wasteByCustomer, wasteByTime } = useMemo(() => {
    const wasteByType = collectionTasks.reduce((acc, task) => {
      if (task.status === 'Completed') {
        const key = materialTypeMap[task.materialType] || task.materialType;
        acc[key] = (acc[key] || 0) + task.collectedWeight;
      }
      return acc;
    }, {} as { [key: string]: number });

    const wasteByCustomer = collectionTasks.reduce((acc, task) => {
        if (task.status === 'Completed' && task.customerId) {
          const customer = customers.find(c => c.id === task.customerId);
          const customerName = customer ? customer.name : '알 수 없음';
          acc[customerName] = (acc[customerName] || 0) + task.collectedWeight;
        }
        return acc;
      }, {} as { [key: string]: number });

    const wasteByTime = collectionTasks.reduce((acc, task) => {
        if (task.status === 'Completed' && task.completedTime) {
            const hour = parseInt(task.completedTime.split(':')[0], 10);
            const hourKey = `${String(hour).padStart(2, '0')}:00`;
            if (!acc[hourKey]) {
                acc[hourKey] = { total: 0, plastic: 0, glass: 0, paper: 0, metal: 0, mixed: 0 };
            }
            acc[hourKey].total += task.collectedWeight;
            
            const materialKey = task.materialType.toLowerCase() as 'plastic' | 'glass' | 'paper' | 'metal' | 'mixed';
            if (materialKey in acc[hourKey]) {
              acc[hourKey][materialKey] += task.collectedWeight;
            }
        }
        return acc;
    }, {} as {[key: string]: {total: number, plastic: number, glass: number, paper: number, metal: number, mixed: number}});


    return { 
        wasteByType: Object.entries(wasteByType).map(([name, value]) => ({ name, value })),
        wasteByCustomer: Object.entries(wasteByCustomer).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10),
        wasteByTime: Object.entries(wasteByTime).map(([hour, values]) => ({ hour, ...values })).sort((a, b) => a.hour.localeCompare(b.hour))
    };
  }, []);

  const chartConfigWasteType = {
    value: { label: "수거량 (kg)" },
    ...Object.fromEntries(Object.keys(materialTypeMap).map((key) => [materialTypeMap[key], { label: materialTypeMap[key], color: materialTypeColors[materialTypeMap[key]] }]))
  };
  
  const chartConfigCustomer = {
    value: { label: "수거량 (kg)", color: "hsl(var(--primary))" }
  };
  
  const chartConfigTime = {
    total: { label: "총 수거량", color: "hsl(var(--primary))" },
    plastic: { label: "플라스틱", color: materialTypeColors['플라스틱'] },
    glass: { label: "유리", color: materialTypeColors['유리'] },
    paper: { label: "종이", color: materialTypeColors['종이'] },
    metal: { label: "금속", color: materialTypeColors['금속'] },
    mixed: { label: "혼합", color: materialTypeColors['혼합'] },
  };

  return (
    <Tabs defaultValue="type" className="space-y-4">
        <TabsList>
            <TabsTrigger value="type">종류별 분석</TabsTrigger>
            <TabsTrigger value="customer">고객사별 분석</TabsTrigger>
            <TabsTrigger value="time">시간대별 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="type">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>폐기물 종류별 분포</CardTitle>
                    <CardDescription>수거 완료된 폐기물의 종류별 분포입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigWasteType} className="h-[400px] w-full">
                        <ResponsiveContainer>
                        <PieChart>
                            <RechartsTooltip 
                            cursor={false}
                            content={<ChartTooltipContent hideLabel formatter={(value, name) => `${(value as number).toLocaleString()} kg`} />} 
                            />
                            <Pie data={wasteByType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={120} labelLine={false} label={({ percent, name }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                            {wasteByType.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={chartConfigWasteType[entry.name]?.color} />
                            ))}
                            </Pie>
                            <Legend />
                        </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="customer">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>고객사별 수거량</CardTitle>
                    <CardDescription>상위 10개 고객사의 총 수거량(kg)입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigCustomer} className="h-[400px] w-full">
                        <ResponsiveContainer>
                        <BarChart data={wasteByCustomer} layout="vertical" margin={{ left: 10, right: 30 }}>
                            <CartesianGrid horizontal={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={80} interval={0}/>
                            <XAxis type="number" dataKey="value" tickFormatter={(value) => `${value / 1000}t`} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" formatter={(value) => `${(value as number).toLocaleString()} kg`}/>}
                            />
                            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                        </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="time">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>시간대별 수거량 분석</CardTitle>
                    <CardDescription>시간대별 총 수거량 및 종류별 수거량(kg) 추이입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigTime} className="h-[400px] w-full">
                        <ResponsiveContainer>
                        <ComposedChart data={wasteByTime}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickFormatter={(value) => `${value / 1000}t`} />
                            <ChartTooltip content={<ChartTooltipContent indicator="dot" formatter={(value, name) => `${(value as number).toLocaleString()} kg`} />} />
                            <Legend />
                            <Bar dataKey="plastic" stackId="a" fill="var(--color-plastic)" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="glass" stackId="a" fill="var(--color-glass)" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="paper" stackId="a" fill="var(--color-paper)" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="metal" stackId="a" fill="var(--color-metal)" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="mixed" stackId="a" fill="var(--color-mixed)" radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} dot={false} />
                        </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}
