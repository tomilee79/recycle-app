
'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDataStore } from "@/hooks/use-data-store";
import type { CollectionTask, Vehicle, Priority, Driver } from "@/lib/types";
import { DndProvider, useDrag, useDrop, type DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Truck, MapPin, Trash2, GripVertical, AlertTriangle, Search, PlusCircle, Edit, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';


const ItemTypes = {
  TASK: 'task',
};

const priorityMap: { [key in Priority]: { text: string; color: string; } } = {
    'High': { text: '높음', color: 'border-red-500 bg-red-50' },
    'Medium': { text: '보통', color: 'border-yellow-500 bg-yellow-50' },
    'Low': { text: '낮음', color: 'border-gray-300 bg-gray-50' },
};

interface TaskDragItem {
  id: string;
  index: number;
  columnId: string;
  vehicleId?: string;
}

interface TaskCardProps {
  task: CollectionTask;
  index: number;
  vehicleId?: string;
  onMove: (draggedId: string, targetId: string | null, targetColumn: string, targetVehicleId?: string) => void;
  onAssign: (taskId: string, vehicleId: string) => void;
  onEdit: (task: CollectionTask) => void;
  onDelete: (task: CollectionTask) => void;
}

const TaskCard = React.forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, index, vehicleId, onMove, onAssign, onEdit, onDelete }, ref) => {
    const customers = useDataStore((state) => state.customers);
    const vehicles = useDataStore((state) => state.vehicles);
    const drivers = useDataStore((state) => state.drivers);
    const getCustomerName = (customerId: string) => customers.find(c => c.id === customerId)?.name || 'N/A';
    const availableVehicles = useMemo(() => vehicles.filter(v => (drivers.find(d => d.name === v.driver)?.isAvailable ?? false)), [vehicles, drivers]);

    const [{ isDragging }, drag, preview] = useDrag(() => ({
      type: ItemTypes.TASK,
      item: { id: task.id, index, columnId: vehicleId ? `InProgress_${vehicleId}` : 'Pending', vehicleId } as TaskDragItem,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    const [, drop] = useDrop({
      accept: ItemTypes.TASK,
      hover: (item: TaskDragItem, monitor: DropTargetMonitor) => {
        if (!ref || (typeof ref === 'object' && !ref.current) || item.id === task.id) {
          return;
        }
        if (vehicleId) { // Only allow reordering within a vehicle lane
            onMove(item.id, task.id, `InProgress_${vehicleId}`, vehicleId);
        }
      },
    });

    const combinedRef = (el: HTMLDivElement) => {
      drag(el);
      drop(el);
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        ref.current = el;
      }
    };
  
    return (
        <div ref={combinedRef} className={cn("p-3 border-l-4 rounded-lg bg-card shadow-sm cursor-grab relative group", priorityMap[task.priority].color)} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical size={16} />
            </div>
            <p className="font-semibold text-sm pr-4">{getCustomerName(task.customerId)}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="size-3" /> {task.address}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Trash2 className="size-3" /> {task.materialType}
            </p>
            {!vehicleId && (
                <div className="flex justify-end items-center mt-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    
                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)}><Edit className="size-4"/></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="size-4"/></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 작업은 되돌릴 수 없습니다. 이 작업은 영구적으로 삭제됩니다.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(task)}>삭제 확인</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
        </div>
    );
  }
);
TaskCard.displayName = 'TaskCard';


interface KanbanColumnProps {
  id: string;
  title: string;
  description: string;
  taskCount: number;
  totalTasks: number;
  children: React.ReactNode;
  onDrop: (item: TaskDragItem) => void;
  className?: string;
}

const KanbanColumn = ({ id, title, description, taskCount, totalTasks, children, onDrop, className }: KanbanColumnProps) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: TaskDragItem) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [onDrop]);

  const progress = totalTasks > 0 ? (taskCount / totalTasks) * 100 : 0;

  return (
    <div ref={drop} className={cn("rounded-lg flex flex-col h-full", isOver && canDrop && 'bg-muted/50')}>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{title} ({taskCount})</CardTitle>
            <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
        </div>
        <CardDescription>{description}</CardDescription>
        <Progress value={progress}/>
      </CardHeader>
      <ScrollArea className="flex-grow p-4 pt-0">
        <div className={cn("space-y-3 min-h-[100px]", className)}>
          {children}
        </div>
      </ScrollArea>
    </div>
  );
};

interface VehicleLaneProps {
  vehicle: Vehicle;
  tasks: CollectionTask[];
  onMoveTask: (draggedId: string, targetId: string | null, targetColumn: string, targetVehicleId?: string) => void;
  onEditTask: (task: CollectionTask) => void;
  onDeleteTask: (task: CollectionTask) => void;
  onAssignTask: (taskId: string, vehicleId: string) => void;
}

const VehicleLane = ({ vehicle, tasks, onMoveTask, onEditTask, onDeleteTask, onAssignTask }: VehicleLaneProps) => {
  const drivers = useDataStore((state) => state.drivers);
  const isAvailable = vehicle.status === 'Idle' && (drivers.find(d => d.name === vehicle.driver)?.isAvailable ?? false);
  const loadPercentage = (vehicle.load / vehicle.capacity) * 100;
  
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    canDrop: () => isAvailable,
    drop: (item: TaskDragItem) => {
      onMoveTask(item.id, null, `InProgress_${vehicle.id}`, vehicle.id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [vehicle.id, tasks, isAvailable, onMoveTask]);
  
  const statusMap: { [key in Vehicle['status']]: string } = { 'On Route': '운행중', 'Idle': '대기중', 'Maintenance': '정비중', 'Completed': '완료' };
  const statusVariant: { [key in Vehicle['status']]: "default" | "secondary" | "destructive" | "outline" } = { 'On Route': 'default', 'Idle': 'secondary', 'Maintenance': 'destructive', 'Completed': 'outline' };

  return (
    <div ref={drop} className={cn("p-3 border rounded-lg", isOver && canDrop && "bg-primary/20", !isAvailable && "bg-muted/50 opacity-60", isOver && !canDrop && "bg-destructive/20")}>
        <div className="flex justify-between items-center mb-2">
            <p className="font-semibold flex items-center gap-2"><Truck className="size-4 text-primary"/>{vehicle.name}</p>
            <Badge variant={statusVariant[vehicle.status]}>{statusMap[vehicle.status]}</Badge>
        </div>
        <div className="space-y-1 mb-2">
            <Progress value={loadPercentage} className={cn("h-2", loadPercentage > 80 && "bg-yellow-400")}/>
            <p className="text-xs text-right text-muted-foreground">{vehicle.load}kg / {vehicle.capacity}kg</p>
        </div>
        <div className="space-y-2 min-h-16">
            {tasks.map((task, index) => {
                const ref = React.createRef<HTMLDivElement>();
                return <TaskCard ref={ref} key={task.id} task={task} index={index} vehicleId={vehicle.id} onMove={onMoveTask} onAssign={onAssignTask} onEdit={onEditTask} onDelete={onDeleteTask}/>
            })}
        </div>
        {!canDrop && isOver && (
            <div className="flex items-center gap-2 text-xs text-destructive mt-2">
            <AlertTriangle className="size-4"/>
            <span>배차 불가 차량입니다.</span>
            </div>
        )}
    </div>
  )
}

export default function DispatchManagementPanel() {
  const collectionTasks = useDataStore(state => state.collectionTasks);
  const vehicles = useDataStore(state => state.vehicles);
  const drivers = useDataStore(state => state.drivers);
  const customers = useDataStore(state => state.customers);
  const setTasks = useDataStore(state => state.setTasks);
  const deleteTask = useDataStore(state => state.deleteTask);

  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const handleMoveTask = (draggedId: string, targetId: string | null, targetColumn: string, targetVehicleId?: string) => {
    setTasks(prevTasks => {
      const taskToMove = prevTasks.find(t => t.id === draggedId);
      if (!taskToMove) return prevTasks;

      let newTasks = prevTasks.filter(t => t.id !== draggedId);

      if (targetColumn === 'Pending') {
        const updatedTask = { ...taskToMove, vehicleId: '', driver: undefined, status: 'Pending' as const };
        const targetIndex = targetId ? newTasks.findIndex(t => t.id === targetId) : 0;
        newTasks.splice(targetIndex, 0, updatedTask);
        toast({ title: "배차 취소", description: `작업 #${taskToMove.id} 배차가 취소되었습니다.` });
      } else if (targetColumn.startsWith('InProgress_')) {
        const vehicleId = targetVehicleId;
        if (!vehicleId) return prevTasks;

        const vehicle = vehicles.find(v => v.id === vehicleId);
        const driver = drivers.find(d => d.name === vehicle?.driver);
        if (!vehicle || !driver) return prevTasks;

        const updatedTask = { ...taskToMove, vehicleId, driver: driver.name, status: 'In Progress' as const };
        
        let vehicleTasks = newTasks.filter(t => t.vehicleId === vehicleId);
        const otherTasks = newTasks.filter(t => t.vehicleId !== vehicleId);

        const targetIndexInVehicle = targetId ? vehicleTasks.findIndex(t => t.id === targetId) : vehicleTasks.length;
        vehicleTasks.splice(targetIndexInVehicle, 0, updatedTask);
        
        newTasks = [...otherTasks, ...vehicleTasks];

        toast({ title: "배차 업데이트", description: `작업 #${taskToMove.id}이(가) 차량 ${vehicle.name}에 배정되었습니다.` });
      } else if (targetColumn === 'Issues') {
          const updatedTask = { ...taskToMove, status: 'Cancelled' as const };
          const targetIndex = targetId ? newTasks.findIndex(t => t.id === targetId) : newTasks.length;
          newTasks.splice(targetIndex, 0, updatedTask);
          toast({ title: "작업 상태 변경", description: `작업 #${taskToMove.id}이(가) 이슈로 등록되었습니다.` });
      }

      return newTasks;
    });
  };
  
  const handleAssignTask = (taskId: string, vehicleId: string) => {
    handleMoveTask(taskId, null, `InProgress_${vehicleId}`, vehicleId);
  }
  
  const handleEditTask = (task: CollectionTask) => {
     toast({ title: "작업 수정", description: "이 기능은 '작업 관리' 메뉴에서 지원됩니다." });
  };

  const { pendingTasks, inProgressTasks, issueTasks } = useMemo(() => {
    const pending = collectionTasks.filter(task => (task.status === 'Pending' && !task.vehicleId) && (customers.find(c => c.id === task.customerId)?.name.toLowerCase().includes(search.toLowerCase()) || task.address.toLowerCase().includes(search.toLowerCase())));
    const inProgress: { [key: string]: CollectionTask[] } = {};
    vehicles.forEach(v => {
      inProgress[v.id] = collectionTasks.filter(t => t.vehicleId === v.id && t.status === 'In Progress').sort((a, b) => a.id.localeCompare(b.id)); // Should use order field
    });
    const issues = collectionTasks.filter(task => task.status === 'Cancelled');
    
    return { pendingTasks: pending, inProgressTasks: inProgress, issueTasks: issues };
  }, [collectionTasks, vehicles, search, customers]);
  
  const totalTasks = pendingTasks.length + Object.values(inProgressTasks).flat().length + issueTasks.length;
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-[calc(100vh-12rem)]">
        <Card className="shadow-lg h-full flex flex-col">
          <KanbanColumn id="Pending" title="대기 작업" description="배차 대기 중인 작업 목록" taskCount={pendingTasks.length} totalTasks={totalTasks} onDrop={(item) => handleMoveTask(item.id, null, 'Pending')}>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="고객사명, 주소로 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {pendingTasks.length > 0 ? (
                pendingTasks.map((task, index) => {
                    const ref = React.createRef<HTMLDivElement>();
                    return <TaskCard ref={ref} key={task.id} task={task} index={index} onMove={handleMoveTask} onAssign={handleAssignTask} onEdit={handleEditTask} onDelete={(task) => deleteTask(task.id)}/>
                })
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-center py-10">
                    <p>배정 대기 중인 작업이 없습니다.</p>
                </div>
            )}
          </KanbanColumn>
        </Card>
        <Card className="shadow-lg h-full flex flex-col">
            <KanbanColumn id="InProgress" title="차량별 경로" description="운행 중인 차량 및 배정된 작업" taskCount={Object.values(inProgressTasks).flat().length} totalTasks={totalTasks} onDrop={() => {}}>
              {vehicles.map(vehicle => (
                <VehicleLane key={vehicle.id} vehicle={vehicle} tasks={inProgressTasks[vehicle.id] || []} onMoveTask={handleMoveTask} onEditTask={handleEditTask} onDeleteTask={(task) => deleteTask(task.id)} onAssignTask={handleAssignTask} />
              ))}
               {vehicles.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground text-center py-10">
                    <p>등록된 차량이 없습니다.</p>
                </div>
              )}
            </KanbanColumn>
        </Card>
         <Card className="shadow-lg h-full flex flex-col">
            <KanbanColumn id="Issues" title="이슈 작업" description="취소되거나 문제가 발생한 작업" taskCount={issueTasks.length} totalTasks={totalTasks} onDrop={(item) => handleMoveTask(item.id, null, 'Issues')}>
                {issueTasks.length > 0 ? (
                    issueTasks.map((task, index) => {
                      const ref = React.createRef<HTMLDivElement>();
                      return <TaskCard ref={ref} key={task.id} task={{...task, priority: 'High'}} index={index} onMove={handleMoveTask} onAssign={()=>{}} onEdit={handleEditTask} onDelete={(task) => deleteTask(task.id)}/>
                    })
                 ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-center py-10">
                        <p>이슈가 발생한 작업이 없습니다.</p>
                    </div>
                )}
            </KanbanColumn>
        </Card>
      </div>
    </DndProvider>
  );
}
