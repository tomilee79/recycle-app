

'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { collectionTasks, customers, vehicles, drivers } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, ClipboardList, Info, MapPin, Trash2, Weight, Truck, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { placeholderImages } from '@/lib/placeholder-images';
import type { CollectionTask, TaskStatus, Vehicle, Driver } from '@/lib/types';

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
  const [tasks, setTasks] = useState<CollectionTask[]>(collectionTasks);
  const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  
  const sitePhoto = placeholderImages.find(p => p.id === 'collection-site');

  const getCustomerName = (customerId: string) => customers.find(c => c.id === customerId)?.name || 'N/A';
  
  const getVehicle = (vehicleId: string): Vehicle | undefined => vehicles.find(v => v.id === vehicleId);
  
  const getDriver = (driverName: string): Driver | undefined => drivers.find(d => d.name === driverName);
  
  const handleRowClick = (task: CollectionTask) => {
    setSelectedTask(task);
  };
  
  const handleSheetClose = () => {
    setSelectedTask(null);
  };

  const handleStatusChange = useCallback((taskId: string, newStatus: TaskStatus) => {
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

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const statusMatch = statusFilter === 'All' || task.status === statusFilter;
      const searchTerm = search.toLowerCase();
      const searchMatch = getCustomerName(task.customerId).toLowerCase().includes(searchTerm) ||
                          task.address.toLowerCase().includes(searchTerm);
      return statusMatch && searchMatch;
    }).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }, [tasks, statusFilter, search]);

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
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">모든 상태</SelectItem>
                  {statuses.map(s => <SelectItem key={s} value={s}>{statusMap[s]}</SelectItem>)}
                </SelectContent>
              </Select>
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
                <TableRow key={task.id} onClick={() => handleRowClick(task)} className="cursor-pointer">
                  <TableCell>{task.scheduledDate}</TableCell>
                  <TableCell className="font-medium">{getCustomerName(task.customerId)}</TableCell>
                  <TableCell>{task.address}</TableCell>
                  <TableCell>{materialTypeMap[task.materialType]}</TableCell>
                  <TableCell>{getVehicle(task.vehicleId)?.name || '미배정'}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
                          <DropdownMenuItem key={status} onSelect={() => handleStatusChange(task.id, status)}>
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
            const driver = vehicle ? getDriver(vehicle.driver) : undefined;
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
                        <span>{driver ? `${driver.name} (${driver.contact})` : '미배정'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </>
  );
}
