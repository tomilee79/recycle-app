
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, type CalendarProps } from "@/components/ui/calendar";
import { collectionTasks, customers } from "@/lib/mock-data";
import { format, isSameDay } from 'date-fns';
import { Badge } from '../ui/badge';
import type { CollectionTask } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { Calendar as CalendarIcon, MapPin, Trash2, CheckCircle, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { DayContent, DayProps } from 'react-day-picker';

const statusMap: { [key in CollectionTask['status']]: string } = {
  'Pending': '대기중',
  'In Progress': '수거중',
  'Completed': '완료',
  'Cancelled': '취소'
};

const statusVariant: { [key in CollectionTask['status']]: "default" | "secondary" | "destructive" | "outline" } = {
    'Completed': 'default',
    'In Progress': 'secondary',
    'Pending': 'outline',
    'Cancelled': 'destructive',
};

const materialTypeMap: { [key: string]: string } = {
    'Plastic': '플라스틱',
    'Glass': '유리',
    'Paper': '종이',
    'Metal': '금속',
    'Mixed': '혼합'
};

export default function SchedulePanel() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<CollectionTask[]>(collectionTasks);
  const { toast } = useToast();

  const scheduledDays = useMemo(() => {
    const days = new Set<string>();
    tasks.forEach(task => {
      days.add(task.scheduledDate);
    });
    return Array.from(days).map(day => new Date(day));
  }, [tasks]);

  const selectedDayTasks = useMemo(() => {
    if (!date) return [];
    return tasks.filter(task => isSameDay(new Date(task.scheduledDate), date));
  }, [date, tasks]);

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || '알수없음';
  }

  const handleStatusChange = useCallback((taskId: string, newStatus: CollectionTask['status']) => {
    setTasks(prevTasks => 
        prevTasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
        )
    );
    toast({
        title: '상태 변경 완료',
        description: `작업 상태가 '${statusMap[newStatus]}'(으)로 변경되었습니다.`,
    });
  }, [toast]);
  
  const CustomDay: CalendarProps['components']['Day'] = (props: DayProps) => {
    const isScheduled = scheduledDays.some(scheduledDay => isSameDay(props.date, scheduledDay));
    return (
      <div className="relative">
        <DayContent {...props} />
        {isScheduled && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>일간/월간 수거 일정</CardTitle>
            <CardDescription>달력에서 날짜를 선택하여 일별 수거 작업을 확인하세요.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0"
                components={{ Day: CustomDay }}
            />
        </CardContent>
      </Card>
      
      <Card className="shadow-lg flex flex-col">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="size-5" />
                {date ? format(date, 'yyyy년 MM월 dd일') : '날짜를 선택하세요'}
            </CardTitle>
            <CardDescription>선택된 날짜의 수거 목록입니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
            <ScrollArea className="h-96">
                <div className="space-y-4">
                {selectedDayTasks.length > 0 ? (
                    selectedDayTasks.map(task => (
                    <div key={task.id} className="p-3 border rounded-lg bg-muted/20">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold">{getCustomerName(task.customerId)}</p>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-auto p-0 font-normal">
                                        <Badge variant={statusVariant[task.status]} className="cursor-pointer">
                                            {statusMap[task.status]}
                                        </Badge>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {(Object.keys(statusMap) as Array<CollectionTask['status']>).filter(status => status !== task.status).map(status => (
                                        <DropdownMenuItem key={status} onSelect={() => handleStatusChange(task.id, status)}>
                                            {statusMap[status]}으로 변경
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p className="flex items-center gap-2"><MapPin className="size-4"/> {task.address}</p>
                            <p className="flex items-center gap-2"><Trash2 className="size-4"/> {materialTypeMap[task.materialType]}</p>
                            {task.status === 'Completed' ? (
                                <p className="flex items-center gap-2"><CheckCircle className="size-4 text-primary"/> 완료 시간: {task.completedTime}</p>
                            ) : (
                                <p className="flex items-center gap-2"><Clock className="size-4"/> 예정 시간: 오전</p>
                            )}
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>선택된 날짜에 수거 일정이 없습니다.</p>
                    </div>
                )}
                </div>
            </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
