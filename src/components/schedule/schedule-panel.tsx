
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { collectionTasks, customers } from "@/lib/mock-data";
import { format, isSameDay } from 'date-fns';
import { Badge } from '../ui/badge';
import type { CollectionTask } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { Calendar as CalendarIcon, MapPin, Trash2, CheckCircle, Clock } from 'lucide-react';


const statusMap: { [key: string]: string } = {
  'Pending': '대기중',
  'In Progress': '수거중',
  'Completed': '완료',
  'Cancelled': '취소'
};

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
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

  const scheduledDays = useMemo(() => {
    const days = new Set<string>();
    collectionTasks.forEach(task => {
      days.add(task.scheduledDate);
    });
    return Array.from(days).map(day => new Date(day));
  }, []);

  const selectedDayTasks = useMemo(() => {
    if (!date) return [];
    return collectionTasks.filter(task => isSameDay(new Date(task.scheduledDate), date));
  }, [date]);

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || '알수없음';
  }

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
                modifiers={{ scheduled: scheduledDays }}
                modifiersStyles={{
                    scheduled: { 
                        fontWeight: 'bold',
                        color: 'hsl(var(--primary))'
                    }
                }}
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
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold">{getCustomerName(task.customerId)}</p>
                            <Badge variant={statusVariant[task.status]}>{statusMap[task.status]}</Badge>
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
