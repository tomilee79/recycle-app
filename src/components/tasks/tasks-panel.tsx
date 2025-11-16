
'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { collectionTasks as initialCollectionTasks, customers, vehicles, drivers } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Info, MapPin, Trash2, Weight, Truck, User, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { placeholderImages } from '@/lib/placeholder-images';
import type { CollectionTask, TaskStatus, Vehicle, Driver } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

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

export default function TasksPanel() {
  const [tasks, setTasks] = useState<CollectionTask[]>(initialCollectionTasks);
  const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const sitePhoto = placeholderImages.find(p => p.id === 'collection-site');

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
  
  const handleAssignVehicle = useCallback((taskId: string, vehicleId: string, driver: string) => {
      setTasks(prevTasks => prevTasks.map(task => 
          task.id === taskId ? { ...task, vehicleId, driver, status: 'Pending' } : task
      ));
      toast({
          title: "차량 배정 완료",
          description: `작업에 차량(${vehicleId}) 및 운전자(${driver})가 배정되었습니다.`,
      })
      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => prev ? {...prev, vehicleId, driver, status: 'Pending'} : null);
      }
  }, [selectedTask, toast]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const statusMatch = statusFilter === 'All' || task.status === statusFilter;
      const searchTerm = search.toLowerCase();
      const searchMatch = getCustomerName(task.customerId).toLowerCase().includes(searchTerm) ||
                          task.address.toLowerCase().includes(searchTerm);
      return statusMatch && searchMatch;
    }).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }, [tasks, statusFilter, search]);
  
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
      if (selectedRowKeys.size === filteredTasks.length) {
          setSelectedRowKeys(new Set());
      } else {
          setSelectedRowKeys(new Set(filteredTasks.map(t => t.id)));
      }
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>작업 관리</CardTitle>
              <CardDescription>모든 수거 작업을 조회하고 관리합니다.</CardDescription>
            </div>
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
                <TableHead className="w-[50px]"><Checkbox checked={selectedRowKeys.size > 0 && selectedRowKeys.size === filteredTasks.length} onCheckedChange={handleSelectAllRows}/></TableHead>
                <TableHead>예정일</TableHead>
                <TableHead>고객사</TableHead>
                <TableHead>주소</TableHead>
                <TableHead>품목</TableHead>
                <TableHead>배정 차량</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} data-state={selectedRowKeys.has(task.id) ? "selected" : ""}>
                   <TableCell><Checkbox checked={selectedRowKeys.has(task.id)} onCheckedChange={() => handleSelectRow(task.id)}/></TableCell>
                  <TableCell onClick={() => handleRowClick(task)} className="cursor-pointer">{task.scheduledDate}</TableCell>
                  <TableCell onClick={() => handleRowClick(task)} className="cursor-pointer font-medium">{getCustomerName(task.customerId)}</TableCell>
                  <TableCell onClick={() => handleRowClick(task)} className="cursor-pointer">{task.address}</TableCell>
                  <TableCell onClick={() => handleRowClick(task)} className="cursor-pointer">{materialTypeMap[task.materialType]}</TableCell>
                  <TableCell onClick={() => handleRowClick(task)} className="cursor-pointer">{getVehicle(task.vehicleId)?.name || '미배정'}</TableCell>
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
                        {statuses.filter(s => s !== task.status).map(status => (
                          <DropdownMenuItem key={status} onSelect={() => handleStatusChange([task.id], status)}>
                            {statusMap[status]}으로 변경
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                           <AssignVehicleForm taskId={selectedTask.id} onAssign={handleAssignVehicle}/>
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

function AssignVehicleForm({ taskId, onAssign }: { taskId: string; onAssign: (taskId: string, vehicleId: string, driver: string) => void }) {
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const availableVehicles = useMemo(() => vehicles.filter(v => v.status === 'Idle'), []);
    const selectedVehicle = useMemo(() => availableVehicles.find(v => v.id === selectedVehicleId), [availableVehicles, selectedVehicleId]);

    const handleSubmit = () => {
        if (selectedVehicle) {
            onAssign(taskId, selectedVehicle.id, selectedVehicle.driver);
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
