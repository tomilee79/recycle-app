
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, type CalendarProps } from "@/components/ui/calendar";
import { collectionTasks as initialCollectionTasks, customers } from "@/lib/mock-data";
import { format, isSameDay, parseISO } from 'date-fns';
import { Badge } from '../ui/badge';
import type { CollectionTask } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { Calendar as CalendarIcon, MapPin, Trash2, CheckCircle, Clock, PlusCircle, Loader2, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { DayContent, DayProps } from 'react-day-picker';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Checkbox } from '../ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const statusMap: { [key in CollectionTask['status']]: string } = {
  'Pending': '대기중',
  'In Progress': '수거중',
  'Completed': '완료',
  'Cancelled': '취소'
};
const statuses = Object.keys(statusMap) as CollectionTask['status'][];

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
  const [editingTask, setEditingTask] = useState<CollectionTask | null>(null);
  const [customerFilter, setCustomerFilter] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
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

  const openForm = (task: CollectionTask | null) => {
    setEditingTask(task);
    if (task) {
        form.reset({
            ...task,
            scheduledDate: parseISO(task.scheduledDate),
        });
    } else {
        form.reset({
            customerId: '',
            materialType: 'Plastic',
            address: '',
            scheduledDate: date || new Date(),
        });
    }
    setIsFormOpen(true);
  }

  const handleDelete = () => {
    if (!editingTask) return;
    setTasks(prev => prev.filter(t => t.id !== editingTask.id));
    toast({
        title: "일정 삭제됨",
        description: "수거 일정이 삭제되었습니다.",
        variant: "destructive"
    });
    setIsFormOpen(false);
    setEditingTask(null);
  }


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

  useEffect(() => {
    setSelectedRowKeys(new Set());
  }, [date, customerFilter]);

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || '알수없음';
  }

  const handleStatusChange = useCallback((taskIds: string[], newStatus: CollectionTask['status']) => {
    setTasks(prevTasks => 
        prevTasks.map(task => 
            taskIds.includes(task.id) ? { ...task, status: newStatus } : task
        )
    );
    toast({
        title: '상태 변경 완료',
        description: `선택된 작업 상태가 '${statusMap[newStatus]}'(으)로 변경되었습니다.`,
    });
    setSelectedRowKeys(new Set());
  }, [toast]);
  
  const onScheduleSubmit: SubmitHandler<ScheduleFormValues> = (data) => {
      if (editingTask) {
        // Update existing task
        const updatedTask: CollectionTask = {
            ...editingTask,
            ...data,
            scheduledDate: format(data.scheduledDate, 'yyyy-MM-dd'),
        };
        setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
        toast({ title: "일정 수정됨", description: "수거 일정이 성공적으로 수정되었습니다." });
      } else {
        // Create new task
        const newTaskId = `T${String(tasks.length + 1).padStart(2, '0')}`;
        const newTask: CollectionTask = {
            id: newTaskId,
            vehicleId: '',
            ...data,
            location: { lat: 37.5665 + (Math.random() - 0.5) * 0.1, lng: 126.9780 + (Math.random() - 0.5) * 0.1 },
            status: 'Pending',
            scheduledDate: format(data.scheduledDate, 'yyyy-MM-dd'),
            collectedWeight: 0,
        };
        setTasks(prev => [newTask, ...prev]);
        toast({ title: "일정 등록됨", description: "새로운 수거 일정이 성공적으로 등록되었습니다." });
      }

    setIsFormOpen(false);
    setEditingTask(null);
  };
  
  const handleSelectRow = (id: string) => {
      setSelectedRowKeys(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
              newSet.delete(id);
          } else {
              newSet.add(id);
          }
          return newSet;
      });
  };

  const handleSelectAllRows = () => {
      if (selectedRowKeys.size === selectedDayTasks.length && selectedDayTasks.length > 0) {
          setSelectedRowKeys(new Set());
      } else {
          setSelectedRowKeys(new Set(selectedDayTasks.map(t => t.id)));
      }
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
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>일간/월간 수거 일정</CardTitle>
            <CardDescription>달력에서 날짜를 선택하여 일별 수거 작업을 확인하고 관리하세요.</CardDescription>
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
                 <Button onClick={() => openForm(null)}><PlusCircle className="mr-2"/>새 일정 추가</Button>
            </div>
             <div className="flex items-center justify-between gap-2 mt-4">
                <div className="flex gap-2 items-center">
                  <Select value={customerFilter} onValueChange={setCustomerFilter}>
                      <SelectTrigger className="w-[240px]">
                          <SelectValue placeholder="고객사 필터" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">모든 고객사</SelectItem>
                          {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                  </Select>
                  {selectedRowKeys.size > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                선택 항목 상태 변경 ({selectedRowKeys.size}) <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {statuses.map(status => (
                                <DropdownMenuItem key={status} onSelect={() => handleStatusChange(Array.from(selectedRowKeys), status)}>
                                    {statusMap[status]}으로 변경
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-grow pt-2">
           <ScrollArea className="h-96">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedRowKeys.size > 0 && selectedRowKeys.size === selectedDayTasks.length}
                                    onCheckedChange={handleSelectAllRows}
                                    disabled={selectedDayTasks.length === 0}
                                />
                            </TableHead>
                            <TableHead>고객사</TableHead>
                            <TableHead>주소</TableHead>
                            <TableHead>품목</TableHead>
                            <TableHead>상태</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedDayTasks.length > 0 ? (
                            selectedDayTasks.map(task => (
                                <TableRow key={task.id} data-state={selectedRowKeys.has(task.id) ? 'selected' : ''}>
                                    <TableCell>
                                        <Checkbox checked={selectedRowKeys.has(task.id)} onCheckedChange={() => handleSelectRow(task.id)} />
                                    </TableCell>
                                    <TableCell className="font-medium cursor-pointer" onClick={() => openForm(task)}>
                                        {getCustomerName(task.customerId)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground cursor-pointer" onClick={() => openForm(task)}>
                                        {task.address}
                                    </TableCell>
                                    <TableCell className="cursor-pointer" onClick={() => openForm(task)}>
                                        {materialTypeMap[task.materialType]}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-auto p-0 font-normal">
                                                    <Badge variant={statusVariant[task.status]} className="cursor-pointer">
                                                        {statusMap[task.status]}
                                                    </Badge>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {statuses.filter(status => status !== task.status).map(status => (
                                                    <DropdownMenuItem key={status} onSelect={() => handleStatusChange([task.id], status)}>
                                                        {statusMap[status]}으로 변경
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    선택된 날짜에 수거 일정이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if (!isOpen) { setEditingTask(null); } setIsFormOpen(isOpen); }}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>{editingTask ? '일정 수정' : '새 수거 일정 추가'}</DialogTitle>
                  <DialogDescription>{editingTask ? '수거 일정 정보를 수정합니다.' : '새로운 수거 일정 정보를 입력합니다.'}</DialogDescription>
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
                      
                      <DialogFooter className="pt-4 sm:justify-between">
                         {editingTask ? (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button type="button" variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4"/>삭제
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            이 작업은 되돌릴 수 없습니다. 이 수거 일정은 영구적으로 삭제됩니다.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>취소</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete}>삭제 확인</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         ) : <div></div>}
                          <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingTask ? '저장' : '일정 등록'}</Button>
                      </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
    </div>
  );
}

    