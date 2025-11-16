
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { collectionTasks, customers, vehicles } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, ClipboardList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { CollectionTask, TaskStatus } from '@/lib/types';

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
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const getCustomerName = (customerId: string) => customers.find(c => c.id === customerId)?.name || 'N/A';
  const getVehicleName = (vehicleId: string) => vehicles.find(v => v.id === vehicleId)?.name || '미배정';

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
              <TableRow key={task.id}>
                <TableCell>{task.scheduledDate}</TableCell>
                <TableCell className="font-medium">{getCustomerName(task.customerId)}</TableCell>
                <TableCell>{task.address}</TableCell>
                <TableCell>{materialTypeMap[task.materialType]}</TableCell>
                <TableCell>{getVehicleName(task.vehicleId)}</TableCell>
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
  );
}
