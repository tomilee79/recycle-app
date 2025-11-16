
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CollectionTask } from '@/lib/types';
import { ListChecks, Clock, Truck, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TasksSummaryProps {
  tasks: CollectionTask[];
}

export default function TasksSummary({ tasks }: TasksSummaryProps) {
  const summary = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const completedToday = tasks.filter(t => t.status === 'Completed' && t.scheduledDate === today).length;
    
    return { totalTasks, pendingTasks, inProgressTasks, completedToday };
  }, [tasks]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 작업 수</CardTitle>
          <ListChecks className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalTasks}</div>
          <p className="text-xs text-muted-foreground">시스템에 등록된 모든 작업</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">대기중인 작업</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.pendingTasks}</div>
          <p className="text-xs text-muted-foreground">차량 배정 및 수거 대기중</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">진행중인 작업</CardTitle>
          <Truck className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.inProgressTasks}</div>
          <p className="text-xs text-muted-foreground">현재 수거가 진행중인 작업</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">오늘 완료된 작업</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{summary.completedToday}</div>
          <p className="text-xs text-muted-foreground">오늘 날짜로 완료 처리된 작업</p>
        </CardContent>
      </Card>
    </div>
  );
}

    