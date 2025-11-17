
'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { drivers, vehicles, collectionTasks } from "@/lib/mock-data";
import { Medal, Users, CheckCircle, Truck, TrendingUp, DraftingCompass } from 'lucide-react';
import type { Driver, CollectionTask } from '@/lib/types';
import { format, parseISO, startOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

interface DriverStats extends Driver {
  completedTasks: number;
  totalWeight: number;
  totalDistance: number;
  avgWeightPerTask: number;
  assignedVehicle: string;
}

export default function DriverPerformancePanel() {
  const { driverStats, vehicleStats, monthlyStats } = useMemo(() => {
    const completedTasks = collectionTasks.filter(task => task.status === 'Completed');

    // Driver-centric stats
    const driverStatsMap: { [key: string]: { tasks: CollectionTask[], totalWeight: number, totalDistance: number } } = {};
    for (const driver of drivers) {
        driverStatsMap[driver.name] = { tasks: [], totalWeight: 0, totalDistance: 0 };
    }
    for (const task of completedTasks) {
        if (task.driver && driverStatsMap[task.driver]) {
            driverStatsMap[task.driver].tasks.push(task);
            driverStatsMap[task.driver].totalWeight += task.collectedWeight;
            driverStatsMap[task.driver].totalDistance += task.distance || 0;
        }
    }
    const finalDriverStats: DriverStats[] = drivers.map(driver => {
        const stats = driverStatsMap[driver.name];
        const assignedVehicle = vehicles.find(v => v.driver === driver.name);
        return {
            ...driver,
            completedTasks: stats.tasks.length,
            totalWeight: stats.totalWeight,
            totalDistance: stats.totalDistance,
            avgWeightPerTask: stats.tasks.length > 0 ? stats.totalWeight / stats.tasks.length : 0,
            assignedVehicle: assignedVehicle?.name || 'N/A',
        };
    }).sort((a, b) => b.totalWeight - a.totalWeight);


    // Vehicle-centric stats
    const vehicleStatsMap: { [key: string]: number } = {};
    for (const task of completedTasks) {
        const vehicle = vehicles.find(v => v.id === task.vehicleId);
        if (vehicle) {
            vehicleStatsMap[vehicle.name] = (vehicleStatsMap[vehicle.name] || 0) + task.collectedWeight;
        }
    }
    const finalVehicleStats = Object.entries(vehicleStatsMap).map(([name, totalWeight]) => ({ name, totalWeight })).sort((a, b) => b.totalWeight - a.totalWeight);


    // Monthly stats
    const monthlyStatsMap: { [key: string]: { totalWeight: number, taskCount: number } } = {};
    for (const task of completedTasks) {
        const monthKey = format(parseISO(task.scheduledDate), 'yyyy-MM');
        if (!monthlyStatsMap[monthKey]) {
            monthlyStatsMap[monthKey] = { totalWeight: 0, taskCount: 0 };
        }
        monthlyStatsMap[monthKey].totalWeight += task.collectedWeight;
        monthlyStatsMap[monthKey].taskCount += 1;
    }
    const finalMonthlyStats = Object.entries(monthlyStatsMap).map(([month, data]) => ({
        month,
        totalWeight: data.totalWeight,
        avgWeight: data.taskCount > 0 ? data.totalWeight / data.taskCount : 0,
    })).sort((a, b) => a.month.localeCompare(b.month));

    return { driverStats: finalDriverStats, vehicleStats: finalVehicleStats, monthlyStats: finalMonthlyStats };
  }, []);

  const totalCompletedTasks = driverStats.reduce((acc, driver) => acc + driver.completedTasks, 0);
  const totalCompletedWeight = driverStats.reduce((acc, driver) => acc + driver.totalWeight, 0);

  const chartConfigDriver = { totalWeight: { label: "총 수거량 (kg)", color: "hsl(var(--chart-1))" } };
  const chartConfigVehicle = { totalWeight: { label: "총 수거량 (kg)", color: "hsl(var(--chart-2))" } };
  const chartConfigMonthly = { totalWeight: { label: "월 총 수거량 (kg)", color: "hsl(var(--chart-1))" }, avgWeight: { label: "월 평균 수거량 (kg)", color: "hsl(var(--chart-3))" } };
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">이달의 우수 운전자</CardTitle><Medal className="h-4 w-4 text-amber-500" /></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{driverStats[0]?.name || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">총 {driverStats[0]?.totalWeight.toLocaleString() || 0} kg 수거</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">총 완료된 수거 건수</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalCompletedTasks}</div>
                <p className="text-xs text-muted-foreground">모든 운전자의 완료 건수 합계</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">총 수거량</CardTitle><TrendingUp className="h-4 w-4 text-blue-500" /></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{(totalCompletedWeight / 1000).toFixed(1)} 톤</div>
                <p className="text-xs text-muted-foreground">모든 운전자의 총 수거량 합계</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">건당 평균 수거량</CardTitle><DraftingCompass className="h-4 w-4 text-purple-500" /></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalCompletedTasks > 0 ? (totalCompletedWeight / totalCompletedTasks).toFixed(1) : 0} kg</div>
                <p className="text-xs text-muted-foreground">전체 평균 수거 효율</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle>운전자별 수거량 비교</CardTitle>
            <CardDescription>운전자별 총 수거량(kg) 순위입니다.</CardDescription>
            </CardHeader>
            <CardContent>
            <ChartContainer config={chartConfigDriver} className="h-[350px] w-full">
                <ResponsiveContainer>
                <BarChart data={driverStats} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={60} interval={0}/>
                    <XAxis type="number" dataKey="totalWeight" tickFormatter={(value) => `${value / 1000}t`} />
                    <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value) => `${(value as number).toLocaleString()} kg`} />} />
                    <Bar dataKey="totalWeight" fill="var(--color-totalWeight)" radius={4} />
                </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
            </CardContent>
        </Card>
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>차량별 수거량 비교</CardTitle>
                <CardDescription>차량별 총 수거량(kg)을 비교합니다.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfigVehicle} className="h-[350px] w-full">
                    <ResponsiveContainer>
                    <BarChart data={vehicleStats} layout="vertical" margin={{ left: 10, right: 30 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={80} interval={0}/>
                        <XAxis type="number" dataKey="totalWeight" tickFormatter={(value) => `${value / 1000}t`} />
                        <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value) => `${(value as number).toLocaleString()} kg`} />} />
                        <Bar dataKey="totalWeight" fill="var(--color-totalWeight)" radius={4} />
                    </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>월별 성과 추이</CardTitle>
          <CardDescription>전체 운전자의 월별 총 수거량 및 평균 수거량 추이입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigMonthly} className="h-[350px] w-full">
            <ResponsiveContainer>
              <LineChart data={monthlyStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} stroke="#888888" fontSize={12} />
                <YAxis yAxisId="left" stroke="var(--color-totalWeight)" tickFormatter={(value) => `${value / 1000}t`} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--color-avgWeight)" tickFormatter={(value) => `${value.toLocaleString()} kg`}/>
                <RechartsTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="totalWeight" name="월 총 수거량" stroke="var(--color-totalWeight)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="avgWeight" name="건당 평균 수거량" stroke="var(--color-avgWeight)" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
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
                <TableHead>건당 평균 (kg)</TableHead>
                <TableHead>총 운행 거리 (km)</TableHead>
                <TableHead>담당 차량</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driverStats.map((driver, index) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {index < 3 ? <Medal className={cn("size-4", index === 0 && "text-amber-400", index === 1 && "text-slate-400", index === 2 && "text-orange-400")}/> : <span className='w-4 inline-block'></span>}
                    {index + 1}
                    </TableCell>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.completedTasks}</TableCell>
                  <TableCell>{driver.totalWeight.toLocaleString()}</TableCell>
                  <TableCell>{driver.avgWeightPerTask.toFixed(1)}</TableCell>
                  <TableCell>{driver.totalDistance.toFixed(1)}</TableCell>
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
