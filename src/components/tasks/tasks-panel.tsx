

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { collectionTasks as initialCollectionTasks, customers, vehicles as initialVehicles, drivers as initialDrivers, users } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Info, MapPin, Trash2, Weight, Truck, User, MoreHorizontal, Edit, Loader2, PlusCircle, Copy, AlertTriangle, FileText, MessageSquare, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { placeholderImages } from '@/lib/placeholder-images';
import type { CollectionTask, TaskStatus, Vehicle, Driver, TaskReport, Comment, User as UserType } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Dialog, DialogHeader, DialogFooter, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import TasksSummary from './tasks-summary';
import { format, addDays, addMonths, addWeeks, isBefore, isEqual, parseISO, isPast, isSameDay, startOfToday } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '../ui/calendar';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ReportForm } from './report-form';
import { ScrollArea } from '../ui/scroll-area';
import { Comments } from './comments';

const statusMap: { [key in TaskStatus]: string } = {
  'Pending': '대기중',
  'In Progress': '수거중',
  'Completed': '완료',
  'Cancelled': '취소'
};

const statusVariant: { [key in TaskStatus]: "default" | "secondary" | "destructive" | "outline" } = {
  'Completed': 'default',
  'In Progress': 'secondary',
  'Pending': 'outline',
  'Cancelled': 'destructive',
};
const statuses = Object.keys(statusMap) as TaskStatus[];

const materialTypeMap: { [key: string]: string } = {
    'Plastic': '플라스틱',
    'Glass': '유리',
    'Paper': '종이',
    'Metal': '금속',
    'Mixed': '혼합'
};
const materialTypes = Object.keys(materialTypeMap) as (keyof typeof materialTypeMap)[];

const newTaskFormSchema = z.object({
    customerId: z.string().min(1, "고객사를 선택해주세요."),
    materialType: z.enum(materialTypes),
    address: z.string().min(5, "주소를 5자 이상 입력해주세요."),
    scheduledDate: z.date({ required_error: "수거 예정일을 선택해주세요." }),
    isRecurring: z.boolean().default(false),
    recurringType: z.enum(['weekly', 'monthly']).optional(),
    recurringEndDate: z.date().optional(),
}).refine(data => {
    if (data.isRecurring) {
        return !!data.recurringType && !!data.recurringEndDate;
    }
    return true;
}, {
    message: "반복 설정을 완료해주세요.",
    path: ["recurringType"],
});
type NewTaskFormValues = z.infer<typeof newTaskFormSchema>;

const updateTaskFormSchema = z.object({
    customerId: z.string().min(1, "고객사를 선택해주세요."),
    materialType: z.enum(materialTypes),
    address: z.string().min(5, "주소를 5자 이상 입력해주세요."),
    scheduledDate: z.date({ required_error: "수거 예정일을 선택해주세요." }),
});
type UpdateTaskFormValues = z.infer<typeof updateTaskFormSchema>;


export default function TasksPanel() {
  const [tasks, setTasks] = useState<CollectionTask[]>(initialCollectionTasks);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);

  const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const sitePhoto = placeholderImages.find(p => p.id === 'collection-site');

  const newForm = useForm<NewTaskFormValues>({
      resolver: zodResolver(newTaskFormSchema),
      defaultValues: {
          isRecurring: false,
          recurringType: undefined,
          recurringEndDate: undefined,
      }
  });

  const updateForm = useForm<UpdateTaskFormValues>({
    resolver: zodResolver(updateTaskFormSchema),
  });

  useEffect(() => {
    if (selectedTask && isEditing) {
      updateForm.reset({
        customerId: selectedTask.customerId,
        materialType: selectedTask.materialType,
        address: selectedTask.address,
        scheduledDate: parseISO(selectedTask.scheduledDate),
      });
    }
  }, [selectedTask, isEditing, updateForm]);

  const getCustomerName = (customerId: string) => customers.find(c => c.id === customerId)?.name || 'N/A';
  const getVehicle = (vehicleId: string): Vehicle | undefined => vehicles.find(v => v.id === vehicleId);
  
  const handleRowClick = (task: CollectionTask) => {
    setSelectedTask(task);
  };
  
  const handleSheetClose = () => {
    setSelectedTask(null);
    setIsEditing(false);
  };

  const handleStatusChange = useCallback((taskIds: string[], newStatus: TaskStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (taskIds.includes(task.id)) {
            const oldStatus = task.status;
            if ((oldStatus === 'In Progress') && (newStatus === 'Completed' || newStatus === 'Cancelled')) {
                const driverName = task.driver;
                if (driverName) {
                    setDrivers(prevDrivers => prevDrivers.map(d => d.name === driverName ? {...d, isAvailable: true} : d));
                    setVehicles(prevVehicles => prevVehicles.map(v => v.driver === driverName ? {...v, status: 'Idle'} : v));
                }
            }
            if (newStatus === 'In Progress' && task.driver) {
                const driverName = task.driver;
                setDrivers(prevDrivers => prevDrivers.map(d => d.name === driverName ? {...d, isAvailable: false} : d));
                setVehicles(prevVehicles => prevVehicles.map(v => v.driver === driverName ? {...v, status: 'On Route'} : v));
            }
          return { ...task, status: newStatus };
        }
        return task;
      })
    );
    toast({
      title: '상태 변경 완료',
      description: `선택된 작업 상태가 '${statusMap[newStatus]}'(으)로 변경되었습니다.`,
    });
    setSelectedRowKeys(new Set());
  }, [toast]);
  
  const handleDeleteTasks = useCallback((taskIds: string[]) => {
      setTasks(prevTasks => prevTasks.filter(task => !taskIds.includes(task.id)));
      toast({
          title: "작업 삭제 완료",
          description: `${taskIds.length}개의 작업이 삭제되었습니다.`,
          variant: "destructive",
      });
      setSelectedRowKeys(new Set());
      if (selectedTask && taskIds.includes(selectedTask.id)) {
        handleSheetClose();
      }
  }, [toast, selectedTask]);
  
  const handleAssignVehicle = useCallback((taskId: string, vehicleId: string) => {
    const vehicleToAssign = vehicles.find(v => v.id === vehicleId);
    if (!vehicleToAssign || !vehicleToAssign.driver) return;
    
    let newStatus: TaskStatus = 'Pending';
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        newStatus = task.status === 'Pending' ? 'In Progress' : task.status;
        if (task.status !== newStatus) {
            handleStatusChange([taskId], newStatus);
        }
        return { ...task, vehicleId: vehicleToAssign.id, driver: vehicleToAssign.driver, status: newStatus };
      }
      return task;
    }));
    
    if (newStatus === 'In Progress') {
        setDrivers(prevDrivers => prevDrivers.map(d => d.name === vehicleToAssign.driver ? {...d, isAvailable: false} : d));
        setVehicles(prevVehicles => prevVehicles.map(v => v.id === vehicleId ? {...v, status: 'On Route'} : v));
    }
    
    toast({
      title: "차량 배정 완료",
      description: `작업에 차량(${vehicleToAssign.name}) 및 운전자(${vehicleToAssign.driver})가 배정되었습니다.`,
    });

    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? {...prev, vehicleId: vehicleToAssign.id, driver: vehicleToAssign.driver, status: newStatus} : null);
    }
  }, [vehicles, selectedTask, toast, handleStatusChange]);

  const handleCreateTask: SubmitHandler<NewTaskFormValues> = (data) => {
      let newTasks: CollectionTask[] = [];
      const baseTaskData = {
          customerId: data.customerId,
          materialType: data.materialType,
          address: data.address,
          location: { lat: 37.5665 + (Math.random() - 0.5) * 0.1, lng: 126.9780 + (Math.random() - 0.5) * 0.1 },
          status: 'Pending' as TaskStatus,
          vehicleId: '',
          collectedWeight: 0,
          report: null,
      };

      if (data.isRecurring && data.recurringType && data.recurringEndDate) {
          let currentDate = data.scheduledDate;
          while (isBefore(currentDate, data.recurringEndDate) || isEqual(currentDate, data.recurringEndDate)) {
              newTasks.push({
                  ...baseTaskData,
                  id: `T${Date.now()}-${newTasks.length}`,
                  scheduledDate: format(currentDate, 'yyyy-MM-dd'),
              });
              if (data.recurringType === 'weekly') {
                  currentDate = addWeeks(currentDate, 1);
              } else if (data.recurringType === 'monthly') {
                  currentDate = addMonths(currentDate, 1);
              }
          }
      } else {
          newTasks.push({
              ...baseTaskData,
              id: `T${Date.now()}`,
              scheduledDate: format(data.scheduledDate, 'yyyy-MM-dd'),
          });
      }

      setTasks(prev => [...newTasks, ...prev]);
      toast({ title: "작업 등록됨", description: `${newTasks.length}개의 새로운 수거 작업이 성공적으로 등록되었습니다.` });
      setIsNewTaskModalOpen(false);
      newForm.reset();
  }

  const handleUpdateTask: SubmitHandler<UpdateTaskFormValues> = (data) => {
    if (!selectedTask) return;
    const updatedTask = {
      ...selectedTask,
      ...data,
      scheduledDate: format(data.scheduledDate, 'yyyy-MM-dd'),
    };
    setTasks(tasks.map(t => (t.id === selectedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
    toast({ title: '작업 정보 수정됨', description: '작업의 기본 정보가 성공적으로 수정되었습니다.' });
    setIsEditing(false);
  };
  
  const handleSaveReport = (taskId: string, reportData: Omit<TaskReport, 'comments'>) => {
      setTasks(prevTasks => prevTasks.map(task => {
          if (task.id === taskId) {
              const updatedReport = { ...(task.report || { comments: [] }), ...reportData };
              const updatedTask = { ...task, report: updatedReport, collectedWeight: reportData.collectedWeight, status: 'Completed' as TaskStatus };
              if (selectedTask?.id === taskId) {
                setSelectedTask(updatedTask);
              }
              return updatedTask;
          }
          return task;
      }));
      handleStatusChange([taskId], 'Completed');
      toast({ title: "보고서 저장됨", description: `작업(#${taskId})의 보고서가 저장되었습니다.` });
      setIsEditing(false);
  }

  const handleSaveComment = (taskId: string, comment: Comment) => {
    setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
            const newReport = task.report ? { ...task.report, comments: [...(task.report.comments || []), comment] } : null;
            const updatedTask = { ...task, report: newReport };
            if (selectedTask?.id === taskId) {
              setSelectedTask(updatedTask);
            }
            return updatedTask;
        }
        return task;
    }));
  }
  
  const handleSaveReply = (taskId: string, commentId: string, reply: Comment) => {
    setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId && task.report?.comments) {
            const newComments = task.report.comments.map(comment => {
                if (comment.id === commentId) {
                    return { ...comment, replies: [...(comment.replies || []), reply] };
                }
                return comment;
            });
            const newReport = { ...task.report, comments: newComments };
            const updatedTask = { ...task, report: newReport };
             if (selectedTask?.id === taskId) {
              setSelectedTask(updatedTask);
            }
            return updatedTask;
        }
        return task;
    }));
  }

  const handleCloneTask = (taskToClone: CollectionTask) => {
      newForm.reset({
          customerId: taskToClone.customerId,
          materialType: taskToClone.materialType,
          address: taskToClone.address,
          scheduledDate: new Date(),
          isRecurring: false,
      });
      setIsNewTaskModalOpen(true);
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const statusMatch = statusFilter === 'All' || task.status === statusFilter;
      const searchTerm = search.toLowerCase();
      const searchMatch = getCustomerName(task.customerId).toLowerCase().includes(searchTerm) ||
                          task.address.toLowerCase().includes(searchTerm);
      return statusMatch && searchMatch;
    }).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }, [tasks, statusFilter, search]);

  const {
    currentPage,
    setCurrentPage,
    paginatedData: paginatedTasks,
    totalPages,
  } = usePagination(filteredTasks, 10);
  
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
      if (selectedRowKeys.size === paginatedTasks.length && paginatedTasks.length > 0) {
          setSelectedRowKeys(new Set());
      } else {
          setSelectedRowKeys(new Set(paginatedTasks.map(t => t.id)));
      }
  };
  
  const availableVehicles = useMemo(() => vehicles.filter(v => {
    const driver = drivers.find(d => d.name === v.driver);
    return driver ? driver.isAvailable : false;
  }), [vehicles, drivers]);


  return (
    <>
      <div className="space-y-6">
        <TasksSummary tasks={tasks} />
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>작업 관리</CardTitle>
                <CardDescription>모든 수거 작업을 조회하고 관리합니다.</CardDescription>
              </div>
               <Dialog open={isNewTaskModalOpen} onOpenChange={setIsNewTaskModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => newForm.reset({ isRecurring: false, scheduledDate: new Date(), recurringType: undefined, recurringEndDate: undefined })}>
                    <PlusCircle className="mr-2 h-4 w-4" />새 작업 추가
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>새 작업 추가</DialogTitle>
                    <DialogDescription>새로운 수거 작업을 시스템에 등록합니다. 반복 작업을 설정할 수 있습니다.</DialogDescription>
                  </DialogHeader>
                  <Form {...newForm}>
                      <form onSubmit={newForm.handleSubmit(handleCreateTask)} className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                              <FormField control={newForm.control} name="customerId" render={({ field }) => (<FormItem><FormLabel>고객사</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="고객사를 선택하세요" /></SelectTrigger></FormControl><SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                              <FormField control={newForm.control} name="materialType" render={({ field }) => (<FormItem><FormLabel>폐기물 종류</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="종류를 선택하세요" /></SelectTrigger></FormControl><SelectContent>{materialTypes.map(type => <SelectItem key={type} value={type}>{materialTypeMap[type]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                          </div>
                          <FormField control={newForm.control} name="address" render={({ field }) => (<FormItem><FormLabel>주소</FormLabel><FormControl><Input placeholder="상세 주소를 입력하세요" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                          <FormField control={newForm.control} name="isRecurring" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>반복 작업 설정</FormLabel></div><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)}/>
                          {newForm.watch('isRecurring') && (
                              <Card className="p-4 bg-muted/50">
                                  <div className="grid grid-cols-3 gap-4 items-end">
                                      <FormField control={newForm.control} name="scheduledDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>시작일</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>날짜 선택</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                                      <FormField control={newForm.control} name="recurringType" render={({ field }) => (
                                          <FormItem><FormLabel>반복 주기</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 h-10"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="weekly" /></FormControl><FormLabel className="font-normal">매주</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="monthly" /></FormControl><FormLabel className="font-normal">매월</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
                                      )}/>
                                      <FormField control={newForm.control} name="recurringEndDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>종료일</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>날짜 선택</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < (newForm.getValues('scheduledDate') || new Date())} initialFocus/></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                                  </div>
                              </Card>
                          )}
                          {!newForm.watch('isRecurring') && (
                            <>
                              <FormField control={newForm.control} name="scheduledDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>예정일</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>날짜 선택</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover><FormMessage /></FormItem>)} />
                            </>
                          )}
                          <DialogFooter>
                            <Button type="submit" disabled={newForm.formState.isSubmitting}>{newForm.formState.isSubmitting && <Loader2 className="mr-2"/>}작업 등록</Button>
                          </DialogFooter>
                      </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2 py-4">
              <div className="flex gap-2 items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="상태 필터" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">모든 상태</SelectItem>
                    {statuses.map(s => <SelectItem key={s} value={s}>{statusMap[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
                {selectedRowKeys.size > 0 && (
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                              일괄 작업 ({selectedRowKeys.size})
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                          {statuses.map(status => (
                              <DropdownMenuItem key={status} onSelect={() => handleStatusChange(Array.from(selectedRowKeys), status)}>
                                  {statusMap[status]}으로 상태 변경
                              </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4"/>선택 항목 삭제
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        이 작업은 되돌릴 수 없습니다. 선택된 {selectedRowKeys.size}개의 작업이 영구적으로 삭제됩니다.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteTasks(Array.from(selectedRowKeys))}>삭제 확인</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="flex gap-2">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="고객사명 또는 주소로 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                  </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                      <Checkbox 
                          checked={selectedRowKeys.size > 0 && paginatedTasks.length > 0 && selectedRowKeys.size === paginatedTasks.length}
                          onCheckedChange={handleSelectAllRows}
                          disabled={paginatedTasks.length === 0}
                      />
                  </TableHead>
                  <TableHead>예정일</TableHead>
                  <TableHead>고객사</TableHead>
                  <TableHead>주소</TableHead>
                  <TableHead>품목</TableHead>
                  <TableHead className="text-center">수거량</TableHead>
                  <TableHead className="text-center">배정 차량</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right w-[80px]">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTasks.map((task) => {
                    const isOverdue = !task.status.match(/Completed|Cancelled/) && isPast(parseISO(task.scheduledDate)) && !isSameDay(parseISO(task.scheduledDate), startOfToday());
                    return (
                        <TableRow key={task.id} data-state={selectedRowKeys.has(task.id) ? "selected" : ""}>
                            <TableCell>
                                <Checkbox checked={selectedRowKeys.has(task.id)} onCheckedChange={() => handleSelectRow(task.id)}/>
                            </TableCell>
                            <TableCell onClick={() => handleRowClick(task)} className={cn("cursor-pointer", isOverdue && "text-destructive")}>
                                <div className='flex items-center gap-2'>
                                  {isOverdue && <AlertTriangle className="size-4" />}
                                  {task.scheduledDate}
                                </div>
                            </TableCell>
                            <TableCell onClick={() => handleRowClick(task)} className="cursor-pointer font-medium">{getCustomerName(task.customerId)}</TableCell>
                            <TableCell onClick={() => handleRowClick(task)} className="cursor-pointer">{task.address}</TableCell>
                            <TableCell onClick={() => handleRowClick(task)} className="cursor-pointer">{materialTypeMap[task.materialType]}</TableCell>
                            <TableCell onClick={() => handleRowClick(task)} className="cursor-pointer text-center">{task.collectedWeight > 0 ? `${task.collectedWeight.toLocaleString()}kg` : '미수거'}</TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()} className="text-center">
                            {task.vehicleId ? (
                                <span onClick={() => handleRowClick(task)} className="cursor-pointer">{getVehicle(task.vehicleId)?.name || '미배정'}</span>
                            ) : (
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-auto p-1 font-normal text-blue-600">배정하기</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {availableVehicles.length > 0 ? availableVehicles.map(v => (
                                        <DropdownMenuItem key={v.id} onSelect={() => handleAssignVehicle(task.id, v.id)}>
                                            {v.name} ({v.driver})
                                        </DropdownMenuItem>
                                    )) : <DropdownMenuItem disabled>배정 가능한 차량 없음</DropdownMenuItem>}
                                </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-auto p-0 font-normal">
                                    <Badge variant={statusVariant[task.status]} className="cursor-pointer">{statusMap[task.status]}</Badge>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                {statuses.filter(s => s !== task.status).map(s => (
                                    <DropdownMenuItem key={s} onSelect={() => handleStatusChange([task.id], s)}>{statusMap[s]}으로 변경</DropdownMenuItem>
                                ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </TableCell>
                            <TableCell className="text-right">
                                <AlertDialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => handleCloneTask(task)}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                <span>복제</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator/>
                                            <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>삭제</span>
                                            </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                이 작업은 되돌릴 수 없습니다. 이 작업은 영구적으로 삭제됩니다.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>취소</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteTasks([task.id])}>삭제 확인</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    )
                })}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="justify-center">
              <Pagination>
                  <PaginationContent>
                      <PaginationItem>
                          <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }} disabled={currentPage === 1}/>
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <PaginationItem key={page}>
                          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(page); }} isActive={currentPage === page}>
                          {page}
                          </PaginationLink>
                      </PaginationItem>
                      ))}
                      <PaginationItem>
                          <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }} disabled={currentPage === totalPages}/>
                      </PaginationItem>
                  </PaginationContent>
              </Pagination>
          </CardFooter>
        </Card>
      </div>

      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && handleSheetClose()}>
        <SheetContent className="sm:max-w-xl w-full">
          {selectedTask && (() => {
            const vehicle = getVehicle(selectedTask.vehicleId);
            const currentUser = users[0]; // Mock current user
            return (
              <>
                <SheetHeader>
                   <div className="flex justify-between items-start">
                    <div>
                      <SheetTitle className="font-headline text-2xl">작업 상세: {selectedTask.id}</SheetTitle>
                      <SheetDescription>
                        {getCustomerName(selectedTask.customerId)} / {selectedTask.scheduledDate}
                      </SheetDescription>
                    </div>
                    {isEditing ? (
                        <div className="flex gap-2">
                           <Button size="sm" onClick={() => setIsEditing(false)} variant="outline"><X className="mr-2"/> 취소</Button>
                        </div>
                    ) : (
                       <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}><Edit className="mr-2"/>정보/보고서 수정</Button>
                    )}
                  </div>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="mt-6 space-y-6 pr-6 pb-6">
                  
                  <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">작업 기본 정보</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <Form {...updateForm}>
                          <form onSubmit={updateForm.handleSubmit(handleUpdateTask)} className="space-y-4">
                            <FormField control={updateForm.control} name="scheduledDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>예정일</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>날짜 선택</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover><FormMessage /></FormItem>)} />
                            <FormField control={updateForm.control} name="customerId" render={({ field }) => (<FormItem><FormLabel>고객사</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                            <FormField control={updateForm.control} name="address" render={({ field }) => (<FormItem><FormLabel>주소</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={updateForm.control} name="materialType" render={({ field }) => (<FormItem><FormLabel>품목</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{materialTypes.map(type => <SelectItem key={type} value={type}>{materialTypeMap[type]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                            <div className="flex justify-end">
                                <Button type="submit" size="sm" disabled={updateForm.formState.isSubmitting}><Save className="mr-2"/>정보 저장</Button>
                            </div>
                          </form>
                        </Form>
                      ) : (
                        <div className="space-y-4 text-sm">
                          <div className="flex items-center gap-3"><Info className="size-5 text-muted-foreground" /><span className="font-medium">현재 상태:</span><Badge variant={statusVariant[selectedTask.status]}>{statusMap[selectedTask.status]}</Badge></div>
                          <div className="flex items-center gap-3"><MapPin className="size-5 text-muted-foreground" /><span className="font-medium">수거지:</span><span>{selectedTask.address}</span></div>
                          <div className="flex items-center gap-3"><Trash2 className="size-5 text-muted-foreground" /><span className="font-medium">폐기물 종류:</span><span>{materialTypeMap[selectedTask.materialType]}</span></div>
                          <div className="flex items-center gap-3"><Truck className="size-5 text-muted-foreground" /><span className="font-medium">배정 차량:</span><span>{vehicle ? `${vehicle.name} (${vehicle.type})` : '미배정'}</span></div>
                          <div className="flex items-center gap-3"><User className="size-5 text-muted-foreground" /><span className="font-medium">담당 기사:</span><span>{selectedTask.driver || '미배정'}</span></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {isEditing ? (
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">보고서 수정</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ReportForm task={selectedTask} onSave={handleSaveReport} />
                        </CardContent>
                     </Card>
                  ) : selectedTask.report ? (
                    <Card>
                      <CardHeader><CardTitle className="text-lg">작업 결과 보고서</CardTitle></CardHeader>
                      <CardContent>
                          {selectedTask.report.photoUrl && (
                              <div className="mb-4">
                                  <Image
                                      src={selectedTask.report.photoUrl}
                                      alt="수거 현장 사진"
                                      width={600}
                                      height={400}
                                      className="rounded-lg object-cover w-full aspect-video"
                                      data-ai-hint="site trash"
                                  />
                              </div>
                          )}
                          <div className="space-y-4 text-sm">
                            <div className="flex items-center gap-3"><Weight className="size-5 text-muted-foreground" /><span className="font-medium">실제 수거량:</span><span>{selectedTask.report.collectedWeight.toLocaleString()} kg</span></div>
                             <div className="flex items-center gap-3"><User className="size-5 text-muted-foreground" /><span className="font-medium">담당 기사:</span><span>{selectedTask.driver || '미배정'}</span></div>
                             <div className="flex items-start gap-3"><FileText className="size-5 text-muted-foreground mt-0.5" /><div className='flex-1'><span className="font-medium">특이사항:</span><p className='text-muted-foreground whitespace-pre-wrap'>{selectedTask.report.notes || '없음'}</p></div></div>
                             <div className="flex items-center gap-3 text-xs text-muted-foreground"><span>보고일: {selectedTask.report.reportDate}</span></div>
                          </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">작업 결과 보고</CardTitle>
                      </CardHeader>
                      <CardContent>
                         <ReportForm task={selectedTask} onSave={handleSaveReport} />
                      </CardContent>
                    </Card>
                  )}
                  
                  {!isEditing && (
                    <>
                    <Card>
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageSquare/>소통 기록</CardTitle></CardHeader>
                        <CardContent>
                            <Comments 
                                comments={selectedTask.report?.comments || []} 
                                users={users as UserType[]}
                                currentUser={currentUser as UserType}
                                taskId={selectedTask.id}
                                onSaveComment={handleSaveComment}
                                onSaveReply={handleSaveReply}
                            />
                        </CardContent>
                    </Card>
                    {!vehicle && (
                        <Card>
                            <CardHeader><CardTitle className="text-lg">차량 배정</CardTitle></CardHeader>
                            <CardContent>
                            <AssignVehicleForm taskId={selectedTask.id} onAssign={handleAssignVehicle} availableVehicles={availableVehicles}/>
                            </CardContent>
                        </Card>
                    )}
                    </>
                  )}
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="mr-2 h-4 w-4" />
                          작업 삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>정말로 이 작업을 삭제하시겠습니까?</AlertDialogTitle>
                          <AlertDialogDescription>
                            이 작업은 되돌릴 수 없습니다. 이 작업과 관련된 모든 정보가 영구적으로 삭제됩니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTasks([selectedTask.id])}>
                            삭제 확인
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
                </ScrollArea>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </>
  );
}

function AssignVehicleForm({ taskId, onAssign, availableVehicles }: { taskId: string; onAssign: (taskId: string, vehicleId: string) => void; availableVehicles: Vehicle[] }) {
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const selectedVehicle = useMemo(() => availableVehicles.find(v => v.id === selectedVehicleId), [availableVehicles, selectedVehicleId]);

    const handleSubmit = () => {
        if (selectedVehicle) {
            onAssign(taskId, selectedVehicle.id);
        }
    }
    
    return (
        <div className="space-y-4">
            <Select onValueChange={setSelectedVehicleId}>
                <SelectTrigger><SelectValue placeholder="차량을 선택하세요" /></SelectTrigger>
                <SelectContent>
                    {availableVehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.type})</SelectItem>)}
                </SelectContent>
            </Select>
            {selectedVehicle && (
                <div className="p-3 bg-muted rounded-md text-sm">
                    <p><b>선택된 차량:</b> {selectedVehicle.name}</p>
                    <p><b>담당 기사:</b> {selectedVehicle.driver}</p>
                </div>
            )}
             <Button onClick={handleSubmit} disabled={!selectedVehicleId} className="w-full">
                <Truck className="mr-2"/>
                차량 배정하기
            </Button>
        </div>
    )
}
