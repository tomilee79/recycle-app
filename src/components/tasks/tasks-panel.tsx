
'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { collectionTasks as initialCollectionTasks, customers, vehicles as initialVehicles, drivers as initialDrivers } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Info, MapPin, Trash2, Weight, Truck, User, MoreHorizontal, Edit, Loader2, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { placeholderImages } from '@/lib/placeholder-images';
import type { CollectionTask, TaskStatus, Vehicle, Driver } from '@/lib/types';
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
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '../ui/calendar';


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


const updateTaskFormSchema = z.object({
  collectedWeight: z.coerce.number().min(0, "수거량은 0 이상이어야 합니다.").default(0),
  status: z.enum(statuses),
});
type UpdateTaskFormValues = z.infer<typeof updateTaskFormSchema>;

const newTaskFormSchema = z.object({
    customerId: z.string().min(1, "고객사를 선택해주세요."),
    materialType: z.enum(materialTypes),
    address: z.string().min(5, "주소를 5자 이상 입력해주세요."),
    scheduledDate: z.date({ required_error: "수거 예정일을 선택해주세요." }),
});
type NewTaskFormValues = z.infer<typeof newTaskFormSchema>;


export default function TasksPanel() {
  const [tasks, setTasks] = useState<CollectionTask[]>(initialCollectionTasks);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);

  const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
  const [editingTask, setEditingTask] = useState<CollectionTask | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const sitePhoto = placeholderImages.find(p => p.id === 'collection-site');
  
  const updateForm = useForm<UpdateTaskFormValues>({
    resolver: zodResolver(updateTaskFormSchema),
  });

  const newForm = useForm<NewTaskFormValues>({
      resolver: zodResolver(newTaskFormSchema)
  });

  const getCustomerName = (customerId: string) => customers.find(c => c.id === customerId)?.name || 'N/A';
  const getVehicle = (vehicleId: string): Vehicle | undefined => vehicles.find(v => v.id === vehicleId);
  
  const handleRowClick = (task: CollectionTask) => {
    setSelectedTask(task);
  };
  
  const handleSheetClose = () => {
    setSelectedTask(null);
  };

  const handleStatusChange = useCallback((taskIds: string[], newStatus: TaskStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (taskIds.includes(task.id)) {
            const oldStatus = task.status;
            // When a task is no longer 'In Progress'
            if (oldStatus === 'In Progress' && (newStatus === 'Completed' || newStatus === 'Cancelled')) {
                const driverName = task.driver;
                if (driverName) {
                    setDrivers(prevDrivers => prevDrivers.map(d => d.name === driverName ? {...d, isAvailable: true} : d));
                    setVehicles(prevVehicles => prevVehicles.map(v => v.driver === driverName ? {...v, status: 'Idle'} : v));
                }
            }
            // When a task becomes 'In Progress'
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
  }, [toast]);
  
  const handleAssignVehicle = useCallback((taskId: string, vehicleId: string) => {
    const vehicleToAssign = vehicles.find(v => v.id === vehicleId);
    if (!vehicleToAssign || !vehicleToAssign.driver) return;
    
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, vehicleId: vehicleToAssign.id, driver: vehicleToAssign.driver, status: 'In Progress' } : task
    ));
    setVehicles(prevVehicles => prevVehicles.map(v => v.id === vehicleId ? { ...v, status: 'On Route' } : v));
    setDrivers(prevDrivers => prevDrivers.map(d => d.name === vehicleToAssign.driver ? { ...d, isAvailable: false } : d));

    toast({
      title: "차량 배정 완료",
      description: `작업에 차량(${vehicleToAssign.name}) 및 운전자(${vehicleToAssign.driver})가 배정되었습니다.`,
    });

    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? {...prev, vehicleId: vehicleToAssign.id, driver: vehicleToAssign.driver, status: 'In Progress'} : null);
    }
  }, [vehicles, selectedTask, toast]);

  const handleUpdateTask: SubmitHandler<UpdateTaskFormValues> = (data) => {
    if (!editingTask) return;
    
    const taskIds = [editingTask.id];
    const newStatus = data.status;

    // Apply status change logic from handleStatusChange
    setTasks(prevTasks =>
        prevTasks.map(task => {
            if (task.id === editingTask.id) {
                const oldStatus = task.status;
                if (oldStatus === 'In Progress' && (newStatus === 'Completed' || newStatus === 'Cancelled')) {
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
                return { ...task, ...data };
            }
            return task;
        })
    );
    
    toast({
      title: "작업 업데이트",
      description: `작업(#${editingTask.id}) 정보가 업데이트 되었습니다.`
    });
    setEditingTask(null);
  }

  const handleCreateTask: SubmitHandler<NewTaskFormValues> = (data) => {
      const newTaskId = `T${String(tasks.length + 1).padStart(3, '0')}`;
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
      toast({ title: "작업 등록됨", description: "새로운 수거 작업이 성공적으로 등록되었습니다." });
      setIsNewTaskModalOpen(false);
      newForm.reset();
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
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />새 작업 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>새 작업 추가</DialogTitle>
                          <DialogDescription>새로운 수거 작업을 시스템에 등록합니다.</DialogDescription>
                      </DialogHeader>
                      <Form {...newForm}>
                          <form onSubmit={newForm.handleSubmit(handleCreateTask)} className="space-y-4 py-4">
                              <FormField control={newForm.control} name="scheduledDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>수거 예정일</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>날짜 선택</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                              <FormField control={newForm.control} name="customerId" render={({ field }) => (<FormItem><FormLabel>고객사</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="고객사를 선택하세요" /></SelectTrigger></FormControl><SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                              <FormField control={newForm.control} name="materialType" render={({ field }) => (<FormItem><FormLabel>폐기물 종류</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="종류를 선택하세요" /></SelectTrigger></FormControl><SelectContent>{materialTypes.map(type => <SelectItem key={type} value={type}>{materialTypeMap[type]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                              <FormField control={newForm.control} name="address" render={({ field }) => (<FormItem><FormLabel>주소</FormLabel><FormControl><Input placeholder="상세 주소를 입력하세요" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                              <DialogFooter><Button type="submit" disabled={newForm.formState.isSubmitting}>{newForm.formState.isSubmitting && <Loader2 className="mr-2"/>}작업 등록</Button></DialogFooter>
                          </form>
                      </Form>
                  </DialogContent>
              </Dialog>
            </div>
            <div className="flex items-center justify-between gap-2 pt-4">
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
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="고객사명 또는 주소로 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                  <TableHead>수거량</TableHead>
                  <TableHead>배정 차량</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right w-[80px]">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTasks.map((task) => (
                  <TableRow key={task.id} data-state={selectedRowKeys.has(task.id) ? "selected" : ""}>
                     <TableCell>
                          <Checkbox checked={selectedRowKeys.has(task.id)} onCheckedChange={() => handleSelectRow(task.id)}/>
                     </TableCell>
                    <TableCell onClick={() => handleRowClick(task)} className="cursor-pointer">{task.scheduledDate}</TableCell>
                    <TableCell onClick={() => handleRowClick(task)} className="cursor-pointer font-medium">{getCustomerName(task.customerId)}</TableCell>
                    <TableCell onClick={() => handleRowClick(task)} className="cursor-pointer">{task.address}</TableCell>
                    <TableCell onClick={() => handleRowClick(task)} className="cursor-pointer">{materialTypeMap[task.materialType]}</TableCell>
                    <TableCell onClick={() => handleRowClick(task)} className="cursor-pointer">{task.collectedWeight > 0 ? `${task.collectedWeight.toLocaleString()}kg` : '미수거'}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
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
                      <Dialog>
                         <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setEditingTask(task); updateForm.reset({ collectedWeight: task.collectedWeight, status: task.status }); }}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          <span>수정</span>
                                      </DropdownMenuItem>
                                    </DialogTrigger>
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
                          <DialogContent>
                              <DialogHeader>
                                  <DialogTitle>작업 결과 수정</DialogTitle>
                                  <DialogDescription>
                                      작업 #{task.id}의 수거량과 상태를 업데이트합니다.
                                  </DialogDescription>
                              </DialogHeader>
                              <Form {...updateForm}>
                                  <form onSubmit={updateForm.handleSubmit(handleUpdateTask)} className="space-y-4 py-4">
                                      <FormField control={updateForm.control} name="collectedWeight" render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>수거량 (kg)</FormLabel>
                                              <FormControl>
                                                  <Input type="number" {...field} />
                                              </FormControl>
                                              <FormMessage />
                                          </FormItem>
                                      )}/>
                                      <FormField control={updateForm.control} name="status" render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>상태</FormLabel>
                                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                  <FormControl>
                                                      <SelectTrigger>
                                                          <SelectValue placeholder="상태를 선택하세요" />
                                                      </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                      {statuses.map(s => <SelectItem key={s} value={s}>{statusMap[s]}</SelectItem>)}
                                                  </SelectContent>
                                              </Select>
                                              <FormMessage />
                                          </FormItem>
                                      )}/>
                                      <DialogFooter>
                                          <Button type="submit" disabled={updateForm.formState.isSubmitting}>
                                              {updateForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                              저장
                                          </Button>
                                      </DialogFooter>
                                  </form>
                              </Form>
                          </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
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
        <SheetContent className="sm:max-w-lg w-full">
          {selectedTask && (() => {
            const vehicle = getVehicle(selectedTask.vehicleId);
            return (
              <>
                <SheetHeader>
                  <SheetTitle className="font-headline text-2xl">작업 상세: {selectedTask.id}</SheetTitle>
                  <SheetDescription>
                    {getCustomerName(selectedTask.customerId)} / {selectedTask.scheduledDate}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <Card>
                    <CardHeader><CardTitle className="text-lg">수거 현장 사진</CardTitle></CardHeader>
                    <CardContent>
                      {sitePhoto && (
                        <Image
                          src={sitePhoto.imageUrl}
                          alt="수거 현장 사진"
                          width={600}
                          height={400}
                          className="rounded-lg object-cover w-full aspect-video"
                          data-ai-hint={sitePhoto.imageHint}
                        />
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-lg">상세 정보</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div className="flex items-center gap-3">
                        <Info className="size-5 text-muted-foreground" />
                        <span className="font-medium">현재 상태:</span>
                        <Badge variant={statusVariant[selectedTask.status]}>{statusMap[selectedTask.status]}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="size-5 text-muted-foreground" />
                        <span className="font-medium">수거지:</span>
                        <span>{selectedTask.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Trash2 className="size-5 text-muted-foreground" />
                        <span className="font-medium">폐기물 종류:</span>
                        <span>{materialTypeMap[selectedTask.materialType]}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Weight className="size-5 text-muted-foreground" />
                        <span className="font-medium">예상/수거량:</span>
                        <span>{selectedTask.collectedWeight > 0 ? `${selectedTask.collectedWeight.toLocaleString()} kg` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Truck className="size-5 text-muted-foreground" />
                        <span className="font-medium">배정 차량:</span>
                        <span>{vehicle ? `${vehicle.name} (${vehicle.type})` : '미배정'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="size-5 text-muted-foreground" />
                        <span className="font-medium">담당 기사:</span>
                        <span>{selectedTask.driver || '미배정'}</span>
                      </div>
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
                </div>
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

    