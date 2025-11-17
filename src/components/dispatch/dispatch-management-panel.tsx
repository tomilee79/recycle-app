
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDataStore } from "@/hooks/use-data-store";
import type { CollectionTask, Vehicle } from "@/lib/types";
import { useMemo, useState } from "react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Truck, MapPin, Trash2, User, Search, Edit, MoreHorizontal, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { cn } from "@/lib/utils";


const ItemTypes = {
  TASK: 'task',
}

interface TaskCardProps {
  task: CollectionTask;
  onAssign: (taskId: string, vehicleId: string) => void;
  onEdit: (task: CollectionTask) => void;
  onDelete: (task: CollectionTask) => void;
  availableVehicles: Vehicle[];
}

const TaskCard = ({ task, onAssign, onEdit, onDelete, availableVehicles }: TaskCardProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const getCustomerName = (customerId: string) => useDataStore.getState().customers.find(c => c.id === customerId)?.name || 'N/A';

  return (
    <div
      ref={drag}
      className="p-3 border rounded-lg bg-card shadow-sm cursor-grab"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex justify-between items-start">
        <p className="font-semibold text-sm">{getCustomerName(task.customerId)}</p>
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="size-4"/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => onEdit(task)}><Edit className="mr-2"/>수정</DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}><Trash2 className="mr-2"/>삭제</DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>정말로 이 작업을 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>이 작업은 되돌릴 수 없습니다. 작업 정보가 영구적으로 삭제됩니다.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(task)}>삭제 확인</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
        <MapPin className="size-3" /> {task.address}
      </p>
      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
        <Trash2 className="size-3" /> {task.materialType}
      </p>
       <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="mt-2 w-full">차량 배정</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {availableVehicles.length > 0 ? (
              availableVehicles.map(v => (
                <DropdownMenuItem key={v.id} onSelect={() => onAssign(task.id, v.id)}>
                  {v.name} ({v.driver})
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>배차 가능한 차량 없음</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
    </div>
  )
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const { updateTask, setVehicles, setDrivers, drivers } = useDataStore.getState();
  const { toast } = useToast();
  const isAvailable = vehicle.status === 'Idle' && drivers.find(d => d.name === vehicle.driver)?.isAvailable;

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    canDrop: () => isAvailable,
    drop: (item: { id: string }) => {
      const taskId = item.id;
      const driver = drivers.find(d => d.name === vehicle.driver);

      if (!driver || !driver.isAvailable) {
        toast({
            title: "배차 불가",
            description: "해당 운전자는 현재 배차 가능한 상태가 아닙니다.",
            variant: "destructive",
        });
        return;
      }
      
      updateTask(taskId, { vehicleId: vehicle.id, driver: vehicle.driver, status: 'In Progress' });
      
      setVehicles(useDataStore.getState().vehicles.map(v => 
        v.id === vehicle.id ? { ...v, status: 'On Route' } : v
      ));
      
      setDrivers(drivers.map(d => 
        d.id === driver.id ? { ...d, isAvailable: false } : d
      ));

      toast({
        title: "배차 완료",
        description: `작업 #${taskId}이(가) 차량 ${vehicle.name}에 배정되었습니다.`,
      });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [vehicle.id, drivers]);
  
  const statusMap: { [key in Vehicle['status']]: string } = {
    'On Route': '운행중',
    'Idle': '대기중',
    'Maintenance': '정비중',
    'Completed': '완료',
  };

  const statusVariant: { [key in Vehicle['status']]: "default" | "secondary" | "destructive" | "outline" } = {
    'On Route': 'default',
    'Idle': 'secondary',
    'Maintenance': 'destructive',
    'Completed': 'outline',
  };

  return (
    <div
      ref={drop}
      className={cn(
        'p-4 border rounded-lg transition-colors',
        isAvailable ? 'bg-muted/30' : 'bg-gray-100/50 opacity-60',
        isOver && canDrop && 'bg-primary/20 border-primary',
        !canDrop && isOver && 'bg-destructive/20 border-destructive'
      )}
    >
      <div className="flex justify-between items-center">
        <p className="font-semibold flex items-center gap-2"><Truck className="size-4 text-primary" />{vehicle.name}</p>
        <Badge variant={statusVariant[vehicle.status]}>{statusMap[vehicle.status]}</Badge>
      </div>
       <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
        <User className="size-4" /> {vehicle.driver}
      </div>
      <div className="space-y-1 mt-2 text-xs">
        <div className="flex justify-between">
            <span className="font-medium">적재량</span>
            <span>{vehicle.load}kg / {vehicle.capacity}kg</span>
        </div>
        <Progress value={(vehicle.load / vehicle.capacity) * 100} />
      </div>
      {!isAvailable && isOver && (
        <div className="flex items-center gap-2 text-xs text-destructive mt-2">
          <AlertTriangle className="size-4"/>
          <span>배차 불가 차량입니다.</span>
        </div>
      )}
    </div>
  )
}

export default function DispatchManagementPanel() {
  const { collectionTasks, vehicles, drivers, updateTask, deleteTask } = useDataStore();
  const [taskSearch, setTaskSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const { toast } = useToast();

  const { pendingTasks, allVehicles } = useMemo(() => {
    const pending = collectionTasks
      .filter(task => task.status === 'Pending' && !task.vehicleId)
      .filter(task => 
        task.address.toLowerCase().includes(taskSearch.toLowerCase()) || 
        (useDataStore.getState().customers.find(c => c.id === task.customerId)?.name || '').toLowerCase().includes(taskSearch.toLowerCase())
      );

    const all = vehicles.filter(vehicle =>
        vehicle.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        vehicle.driver.toLowerCase().includes(vehicleSearch.toLowerCase())
    );

    return { pendingTasks: pending, allVehicles: all };
  }, [collectionTasks, vehicles, taskSearch, vehicleSearch]);

  const handleAssign = (taskId: string, vehicleId: string) => {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      const driver = drivers.find(d => d.name === vehicle?.driver);
      
      if (!vehicle || !driver || !driver.isAvailable) {
        toast({
            title: "배차 불가",
            description: "선택한 차량 또는 운전자가 배차 가능한 상태가 아닙니다.",
            variant: "destructive",
        });
        return;
      }
      
      useDataStore.getState().updateTask(taskId, { vehicleId, driver: driver.name, status: 'In Progress' });
      useDataStore.getState().setVehicles(vehicles.map(v => v.id === vehicleId ? { ...v, status: 'On Route' } : v));
      useDataStore.getState().setDrivers(drivers.map(d => d.id === driver.id ? { ...d, isAvailable: false } : d));

      toast({
        title: "배차 완료",
        description: `작업 #${taskId}이(가) 차량 ${vehicle.name}에 배정되었습니다.`,
      });
  }

  const handleEdit = (task: CollectionTask) => {
    // This would typically open a modal/sheet from the tasks-panel or a shared component
    // For now, we'll just log it.
    console.log("Editing task:", task);
    toast({
        title: "기능 준비 중",
        description: "작업 수정 기능은 현재 구현 중입니다.",
    });
  }

  const handleDelete = (task: CollectionTask) => {
    deleteTask(task.id);
    toast({
        title: "작업 삭제됨",
        description: `작업 #${task.id}이(가) 삭제되었습니다.`,
        variant: "destructive",
    });
  }

  const totalTasks = useDataStore.getState().collectionTasks.length;
  const pendingRate = totalTasks > 0 ? (pendingTasks.length / totalTasks) * 100 : 0;
  
  const availableVehicles = allVehicles.filter(v => {
      const driver = drivers.find(d => d.name === v.driver);
      return v.status === 'Idle' && driver?.isAvailable;
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[calc(100vh-12rem)]">
        <Card className="shadow-lg flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>배정 대기 작업 ({pendingTasks.length})</CardTitle>
              <div className="text-sm text-muted-foreground">{pendingRate.toFixed(0)}%</div>
            </div>
            <Progress value={pendingRate} className="h-2 mt-2"/>
            <div className="relative pt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="고객사명, 주소로 검색..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    className="pl-9"
                />
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-0">
            <ScrollArea className="h-[calc(100vh-22rem)] pr-4 -mr-4">
              <div className="space-y-3">
                {pendingTasks.length > 0 ? (
                  pendingTasks.map(task => 
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onAssign={handleAssign}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        availableVehicles={availableVehicles}
                    />)
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                    <p>배정 대기 중인 작업이 없습니다.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle>전체 차량 목록 ({allVehicles.length})</CardTitle>
             <div className="relative pt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="차량명, 운전자로 검색..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    className="pl-9"
                />
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-0">
            <ScrollArea className="h-[calc(100vh-20rem)] pr-4 -mr-4">
                <div className="space-y-3">
                    {allVehicles.length > 0 ? (
                      allVehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                        <p>등록된 차량이 없습니다.</p>
                      </div>
                    )}
                </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
}
