
'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { drivers, vehicles, collectionTasks } from "@/lib/mock-data";
import { Medal, Users, CheckCircle } from 'lucide-react';
import type { Driver } from '@/lib/types';

interface DriverStats extends Driver {
  completedTasks: number;
  totalWeight: number;
  assignedVehicle: string;
}

export default function DriverPerformancePanel() {
  const driverStats = useMemo(() => {
    const stats: DriverStats[] = drivers.map(driver => {
      const assignedVehicle = vehicles.find(v => v.driver === driver.name);
      
      const tasksForDriver = collectionTasks.filter(task => 
        task.vehicleId === assignedVehicle?.id && task.status === 'Completed'
      );

      const completedTasks = tasksForDriver.length;
      const totalWeight = tasksForDriver.reduce((sum, task) => sum + task.collectedWeight, 0);

      return {
        ...driver,
        completedTasks,
        totalWeight,
        assignedVehicle: assignedVehicle?.name || 'N/A',
      };
    });

    return stats.sort((a, b) => b.totalWeight - a.totalWeight);
  }, []);

  const chartConfig = {
    totalWeight: {
      label: "총 수거량 (kg)",
      color: "hsl(var(--primary))",
    },
  };
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 운전자 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
            <p className="text-xs text-muted-foreground">시스템에 등록된 모든 운전자</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">이달의 우수 운전자</CardTitle>
                <Medal className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{driverStats[0]?.name || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                    총 {driverStats[0]?.totalWeight.toLocaleString() || 0} kg 수거
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 완료된 수거 건수</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {driverStats.reduce((acc, driver) => acc + driver.completedTasks, 0)}
                </div>
                <p className="text-xs text-muted-foreground">모든 운전자의 완료 건수 합계</p>
            </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>운전자별 수거량 비교</CardTitle>
          <CardDescription>운전자별 총 수거량(kg) 순위입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer>
              <BarChart data={driverStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis 
                  dataKey="name"
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
                  tickFormatter={(value) => `${value} kg`}
                />
                <RechartsTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="totalWeight" fill="var(--color-totalWeight)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>운전자별 성과 요약</CardTitle>
          <CardDescription>모든 운전자의 상세 성과 지표입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>순위</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>완료 건수</TableHead>
                <TableHead>총 수거량 (kg)</TableHead>
                <TableHead>담당 차량</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driverStats.map((driver, index) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.completedTasks}</TableCell>
                  <TableCell>{driver.totalWeight.toLocaleString()}</TableCell>
                  <TableCell>{driver.assignedVehicle}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
