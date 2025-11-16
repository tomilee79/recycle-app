
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, type CalendarProps } from "@/components/ui/calendar";
import { collectionTasks as initialCollectionTasks, customers } from "@/lib/mock-data";
import { format, isSameDay } from 'date-fns';
import { Badge } from '../ui/badge';
import type { CollectionTask, Customer } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { Calendar as CalendarIcon, MapPin, Trash2, CheckCircle, Clock, PlusCircle, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { DayContent, DayProps } from 'react-day-picker';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';


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
const materialTypes = Object.keys(materialTypeMap) as (keyof typeof materialTypeMap)[];


const scheduleFormSchema = z.object({
    customerId: z.string().min(1, "고객사를 선택해주세요."),
    materialType: z.enum(materialTypes),
    address: z.string().min(5, "주소를 5자 이상 입력해주세요."),
    scheduledDate: z.date({ required_error: "수거 예정일을 선택해주세요." }),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export default function SchedulePanel() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<CollectionTask[]>(initialCollectionTasks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerFilter, setCustomerFilter] = useState('all');
  const { toast } = useToast();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
        customerId: '',
        materialType: 'Plastic',
        address: '',
        scheduledDate: new Date(),
    }
  });

  const watchedCustomerId = form.watch('customerId');

  useEffect(() => {
    if (watchedCustomerId) {
      const customer = customers.find(c => c.id === watchedCustomerId);
      if (customer) {
        form.setValue('address', customer.address, { shouldValidate: true });
      }
    }
  }, [watchedCustomerId, form]);


  const scheduledDays = useMemo(() => {
    const days = new Set<string>();
    tasks.forEach(task => {
      days.add(task.scheduledDate);
    });
    return Array.from(days).map(day => new Date(day));
  }, [tasks]);

  const selectedDayTasks = useMemo(() => {
    if (!date) return [];
    const filteredByDay = tasks.filter(task => isSameDay(new Date(task.scheduledDate), date));
    const filteredByCustomer = customerFilter === 'all' 
      ? filteredByDay 
      : filteredByDay.filter(task => task.customerId === customerFilter);
    return filteredByCustomer.sort((a, b) => a.id.localeCompare(b.id));
  }, [date, tasks, customerFilter]);

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
  
  const onScheduleSubmit: SubmitHandler<ScheduleFormValues> = (data) => {
    const newTaskId = `T${String(tasks.length + 1).padStart(2, '0')}`;
    
    const newTask: CollectionTask = {
        id: newTaskId,
        vehicleId: '',
        customerId: data.customerId,
        materialType: data.materialType,
        address: data.address,
        location: { lat: 37.5665 + (Math.random() - 0.5) * 0.1, lng: 126.9780 + (Math.random() - 0.5) * 0.1 },
        status: 'Pending',
        scheduledDate: format(data.scheduledDate, 'yyyy-MM-dd'),
        collectedWeight: 0,
    };
    setTasks(prev => [newTask, ...prev]);
    toast({ title: "일정 등록됨", description: "새로운 수거 일정이 성공적으로 등록되었습니다." });
    setIsFormOpen(false);
    form.reset({
      customerId: '',
      materialType: 'Plastic',
      address: '',
      scheduledDate: new Date(),
    });
  };

  const CustomDay: CalendarProps['components']['Day'] = (props: DayProps) => {
    const isScheduled = scheduledDays.some(scheduledDay => isSameDay(props.date, scheduledDay));
    return (
      <div className="relative">
        <DayContent {...props} />
        {isScheduled && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />}
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
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
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="size-5" />
                        {date ? format(date, 'yyyy년 MM월 dd일') : '날짜를 선택하세요'}
                    </CardTitle>
                    <CardDescription>선택된 날짜의 수거 목록입니다.</CardDescription>
                </div>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                         <Button><PlusCircle className="mr-2"/>새 일정 추가</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>새 수거 일정 추가</DialogTitle>
                            <DialogDescription>새로운 수거 일정 정보를 입력합니다.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onScheduleSubmit)} className="space-y-4">
                                <FormField control={form.control} name="scheduledDate" render={({ field }) => (
                                    <FormItem className="flex flex-col"><FormLabel>수거 예정일</FormLabel>
                                        <Popover><PopoverTrigger asChild>
                                            <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>날짜 선택</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl>
                                        </PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover><FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="customerId" render={({ field }) => (
                                    <FormItem><FormLabel>고객사</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="고객사를 선택하세요" /></SelectTrigger></FormControl>
                                            <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="materialType" render={({ field }) => (
                                    <FormItem><FormLabel>폐기물 종류</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="종류를 선택하세요" /></SelectTrigger></FormControl>
                                            <SelectContent>{materialTypes.map(type => <SelectItem key={type} value={type}>{materialTypeMap[type]}</SelectItem>)}</SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>주소</FormLabel><FormControl><Input placeholder="상세 주소를 입력하세요" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                
                                <DialogFooter className="pt-4">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}일정 등록</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
             <div className="mt-4">
                <Select value={customerFilter} onValueChange={setCustomerFilter}>
                    <SelectTrigger className="w-[240px]">
                        <SelectValue placeholder="고객사 필터" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">모든 고객사</SelectItem>
                        {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent className="flex-grow pt-2">
            <ScrollArea className="h-96">
                <div className="space-y-4 pr-4">
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

  