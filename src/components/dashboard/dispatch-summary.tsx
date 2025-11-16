'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vehicles } from "@/lib/mock-data";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart3, CheckCircle, Truck, XCircle } from "lucide-react";

export default function DispatchSummary() {
  const totalDispatches = vehicles.length;
  const completedDispatches = vehicles.filter(v => v.status === 'Completed').length;
  const onRouteDispatches = vehicles.filter(v => v.status === 'On Route').length;
  const idleDispatches = vehicles.filter(v => v.status === 'Idle').length;
  const maintenanceDispatches = vehicles.filter(v => v.status === 'Maintenance').length;

  const unprocessedDispatches = onRouteDispatches + idleDispatches;

  const chartData = [
    { name: '운행중', value: onRouteDispatches, color: 'hsl(var(--primary))' },
    { name: '완료', value: completedDispatches, color: 'hsl(var(--chart-2))' },
    { name: '대기중', value: idleDispatches, color: 'hsl(var(--chart-4))' },
    { name: '정비중', value: maintenanceDispatches, color: 'hsl(var(--destructive))' },
  ];

  const statusMap: { [key: string]: string } = {
    'On Route': '운행중',
    'Completed': '완료',
    'Maintenance': '정비중',
    'Idle': '대기중'
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 배차 건수</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDispatches}</div>
          <p className="text-xs text-muted-foreground">오늘의 모든 배차 차량</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">완료 건수</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedDispatches}</div>
          <p className="text-xs text-muted-foreground">운행을 완료한 차량</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">미처리 건수</CardTitle>
          <XCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{unprocessedDispatches}</div>
          <p className="text-xs text-muted-foreground">운행중 또는 대기중인 차량</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">상태별 요약</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[80px] -mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} innerRadius={25}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
