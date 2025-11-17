

'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDataStore } from "@/hooks/use-data-store";
import type { CollectionTask, Vehicle, Priority } from "@/lib/types";
import { useMemo, useState } from "react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Truck, MapPin, Trash2, GripVertical, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

const ItemTypes = {
  TASK: 'task',
};

const priorityMap: { [key in Priority]: { text: string; color: string; } } = {
    'High': { text: '높음', color: 'border-red-500 bg-red-50' },
    'Medium': { text: '보통', color: 'border-yellow-500 bg-yellow-50' },
    'Low': { text: '낮음', color: 'border-gray-300 bg-gray-50' },
};


interface TaskCardProps {
  task: CollectionTask;
  index: number;
  columnId: string;
  onMove: (taskId: string, targetColumnId: string, targetIndex?: number, targetVehicleId?: string) => void;
}

const TaskCard = ({ task, index, columnId, onMove }: TaskCardProps) => {
  const { customers } = useDataStore();
  const getCustomerName = (customerId: string) => customers.find(c => c.id === customerId)?.name || 'N/A';
  
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { id: task.id, index, columnId, vehicleId: task.vehicleId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <>
      {preview(
        <div className={cn("p-3 border-l-4 rounded-lg bg-card shadow-sm cursor-grab relative", priorityMap[task.priority].color)} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <div ref={drag} className="absolute right-1 top-1/2 -translate-y-1/2 cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical size={16} />
            </div>
            <p className="font-semibold text-sm pr-4">{getCustomerName(task.customerId)}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="size-3" /> {task.address}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Trash2 className="size-3" /> {task.materialType}
            </p>
        </div>
      )}
    </>
  );
};


interface ColumnProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onDrop: (item: { id: string, columnId: string, vehicleId?: string }) => void;
  className?: string;
}

const KanbanColumn = ({ id, title, children, onDrop, className }: ColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: { id: string, columnId: string, vehicleId?: string }) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className={cn("rounded-lg flex flex-col", isOver && 'bg-muted')}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-grow p-4 pt-0">
        <div className={cn("space-y-3", className)}>
          {children}
        </div>
      </ScrollArea>
    </div>
  );
};

interface VehicleLaneProps {
  vehicle: Vehicle;
  tasks: CollectionTask[];
  onMoveTask: (taskId: string, targetColumnId: string, targetIndex: number, targetVehicleId: string) => void;
}

const VehicleLane = ({ vehicle, tasks, onMoveTask }: VehicleLaneProps) => {
  const { drivers } = useDataStore();
  const isAvailable = vehicle.status === 'Idle' && (drivers.find(d => d.name === vehicle.driver)?.isAvailable ?? false);
  
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    canDrop: () => isAvailable,
    drop: (item: { id: string }) => {
      onMoveTask(item.id, 'InProgress', tasks.length, vehicle.id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [vehicle.id, tasks.length]);
  
  const statusMap: { [key in Vehicle['status']]: string } = { 'On Route': '운행중', 'Idle': '대기중', 'Maintenance': '정비중', 'Completed': '완료' };
  const statusVariant: { [key in Vehicle['status']]: "default" | "secondary" | "destructive" | "outline" } = { 'On Route': 'default', 'Idle': 'secondary', 'Maintenance': 'destructive', 'Completed': 'outline' };

  return (
    <div ref={drop} className={cn("p-3 border rounded-lg", isOver && canDrop && "bg-primary/20", isOver && !canDrop && "bg-destructive/20")}>
        <div className="flex justify-between items-center mb-2">
            <p className="font-semibold flex items-center gap-2"><Truck className="size-4 text-primary"/>{vehicle.name}</p>
            <Badge variant={statusVariant[vehicle.status]}>{statusMap[vehicle.status]}</Badge>
        </div>
        <div className="space-y-2 min-h-16">
            {tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} columnId={`InProgress_${vehicle.id}`} onMove={(taskId, targetCol, targetIndex) => onMoveTask(taskId, targetCol, targetIndex ?? 0, vehicle.id)} />
            ))}
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
  const { collectionTasks, vehicles, updateTask, setDrivers, drivers, setTasks } = useDataStore();
  const { toast } = useToast();

  const handleMoveTask = (taskId: string, targetColumnId: string, targetIndex: number, targetVehicleId?: string) => {
    const task = collectionTasks.find(t => t.id === taskId);
    if (!task) return;

    let newTasks = [...collectionTasks];
    const sourceTaskIndex = newTasks.findIndex(t => t.id === taskId);
    newTasks.splice(sourceTaskIndex, 1);

    if (targetColumnId === 'InProgress') {
      if (!targetVehicleId) return;

      const vehicle = vehicles.find(v => v.id === targetVehicleId);
      const driver = drivers.find(d => d.name === vehicle?.driver);
      
      if (!vehicle || !driver || !driver.isAvailable) {
        toast({ title: "배차 불가", description: "선택한 차량 또는 운전자가 배차 가능한 상태가 아닙니다.", variant: "destructive" });
        return; // Do not move
      }

      task.vehicleId = targetVehicleId;
      task.driver = driver.name;
      task.status = 'In Progress';
      const vehicleTasks = newTasks.filter(t => t.vehicleId === targetVehicleId);
      vehicleTasks.splice(targetIndex, 0, task);
      newTasks = [...newTasks.filter(t => t.vehicleId !== targetVehicleId), ...vehicleTasks];

      setDrivers(drivers.map(d => d.id === driver.id ? { ...d, isAvailable: false } : d));
      toast({ title: "배차 완료", description: `작업 #${task.id}이(가) 차량 ${vehicle.name}에 배정되었습니다.` });

    } else if (targetColumnId === 'Pending') {
        const oldDriverName = task.driver;
        task.vehicleId = '';
        task.driver = undefined;
        task.status = 'Pending';
        newTasks.splice(targetIndex, 0, task);
        if(oldDriverName) {
            setDrivers(drivers.map(d => d.name === oldDriverName ? {...d, isAvailable: true} : d));
        }

    } else if (targetColumnId === 'Issues') {
        task.status = 'Cancelled'; // Or a new 'Issue' status
        newTasks.splice(targetIndex, 0, task);
    }

    setTasks(newTasks);
  };
  
  const { pendingTasks, inProgressTasks, issueTasks } = useMemo(() => {
    const pending = collectionTasks.filter(task => task.status === 'Pending' && !task.vehicleId);
    const inProgress: { [key: string]: CollectionTask[] } = {};
    vehicles.forEach(v => {
      inProgress[v.id] = collectionTasks.filter(t => t.vehicleId === v.id && t.status === 'In Progress').sort((a, b) => a.id.localeCompare(b.id)); // Should use order field
    });
    const issues = collectionTasks.filter(task => task.status === 'Cancelled'); // Using Cancelled as Issue for now
    
    return { pendingTasks: pending, inProgressTasks: inProgress, issueTasks: issues };
  }, [collectionTasks, vehicles]);
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-[calc(100vh-12rem)]">
        <Card className="shadow-lg">
            <KanbanColumn id="Pending" title={`대기 작업 (${pendingTasks.length})`} onDrop={(item) => handleMoveTask(item.id, 'Pending', 0)}>
                {pendingTasks.length > 0 ? (
                    pendingTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} columnId="Pending" onMove={handleMoveTask} />
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                        <p>배정 대기 중인 작업이 없습니다.</p>
                    </div>
                )}
            </KanbanColumn>
        </Card>
        <Card className="shadow-lg">
            <KanbanColumn id="InProgress" title="차량별 경로" onDrop={() => {}}>
              {vehicles.filter(v => v.status === 'Idle' || v.status === 'On Route').map(vehicle => (
                <VehicleLane key={vehicle.id} vehicle={vehicle} tasks={inProgressTasks[vehicle.id] || []} onMoveTask={handleMoveTask} />
              ))}
            </KanbanColumn>
        </Card>
         <Card className="shadow-lg">
            <KanbanColumn id="Issues" title={`이슈 작업 (${issueTasks.length})`} onDrop={(item) => handleMoveTask(item.id, 'Issues', 0)}>
                {issueTasks.length > 0 ? (
                    issueTasks.map((task, index) => (
                        <TaskCard key={task.id} task={{...task, priority: 'High'}} index={index} columnId="Issues" onMove={handleMoveTask} />
                    ))
                 ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                        <p>이슈가 발생한 작업이 없습니다.</p>
                    </div>
                )}
            </KanbanColumn>
        </Card>
      </div>
    </DndProvider>
  );
}
