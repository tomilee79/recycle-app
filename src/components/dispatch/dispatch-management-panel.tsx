
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDataStore } from "@/hooks/use-data-store";
import type { CollectionTask, Vehicle } from "@/lib/types";
import { useMemo, useState } from "react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Truck, MapPin, Trash2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ItemTypes = {
  TASK: 'task',
}

interface TaskCardProps {
  task: CollectionTask;
}

const TaskCard = ({ task }: TaskCardProps) => {
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
      <p className="font-semibold text-sm">{getCustomerName(task.customerId)}</p>
      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
        <MapPin className="size-3" /> {task.address}
      </p>
      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
        <Trash2 className="size-3" /> {task.materialType}
      </p>
    </div>
  )
}

interface VehicleDropzoneProps {
  vehicle: Vehicle;
}

const VehicleDropzone = ({ vehicle }: VehicleDropzoneProps) => {
  const { updateTask, setVehicles, setDrivers } = useDataStore.getState();
  const { toast } = useToast();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: { id: string }) => {
      const taskId = item.id;
      const driver = useDataStore.getState().drivers.find(d => d.name === vehicle.driver);

      if (!driver || !driver.isAvailable) {
        toast({
            title: "배차 불가",
            description: "해당 운전자는 현재 배차 가능한 상태가 아닙니다.",
            variant: "destructive",
        });
        return;
      }
      
      // Update task
      updateTask(taskId, { vehicleId: vehicle.id, driver: vehicle.driver, status: 'In Progress' });
      
      // Update vehicle status
      setVehicles(useDataStore.getState().vehicles.map(v => 
        v.id === vehicle.id ? { ...v, status: 'On Route' } : v
      ));
      
      // Update driver status
      setDrivers(useDataStore.getState().drivers.map(d => 
        d.id === driver.id ? { ...d, isAvailable: false } : d
      ));

      toast({
        title: "배차 완료",
        description: `작업 #${taskId}이(가) 차량 ${vehicle.name}에 배정되었습니다.`,
      });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`p-4 border rounded-lg transition-colors ${isOver ? 'bg-primary/20 border-primary' : 'bg-muted/50'}`}
    >
      <div className="flex justify-between items-center">
        <p className="font-semibold flex items-center gap-2"><Truck className="size-4 text-primary" />{vehicle.name}</p>
        <p className="text-xs text-muted-foreground">{vehicle.type} / {vehicle.capacity}kg</p>
      </div>
      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
        <User className="size-4" /> {vehicle.driver}
      </div>
    </div>
  )
}


export default function DispatchManagementPanel() {
  const { collectionTasks, vehicles, drivers } = useDataStore();

  const { pendingTasks, availableVehicles } = useMemo(() => {
    const pending = collectionTasks.filter(task => task.status === 'Pending' && !task.vehicleId);
    
    const available = vehicles.filter(vehicle => {
      const driver = drivers.find(d => d.name === vehicle.driver);
      return driver?.isAvailable && vehicle.status === 'Idle';
    });

    return { pendingTasks: pending, availableVehicles: available };
  }, [collectionTasks, vehicles, drivers]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[calc(100vh-12rem)]">
        <Card className="shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle>배정 대기 작업 ({pendingTasks.length})</CardTitle>
            <CardDescription>아래 작업을 드래그하여 오른쪽 차량에 배차하세요.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-3">
                {pendingTasks.length > 0 ? (
                  pendingTasks.map(task => <TaskCard key={task.id} task={task} />)
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>배정 대기 중인 작업이 없습니다.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle>배차 가능 차량 ({availableVehicles.length})</CardTitle>
             <CardDescription>현재 배차 가능한 유휴 상태의 차량 목록입니다.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ScrollArea className="h-full pr-4">
                <div className="space-y-3">
                    {availableVehicles.length > 0 ? (
                      availableVehicles.map(vehicle => <VehicleDropzone key={vehicle.id} vehicle={vehicle} />)
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>현재 배차 가능한 차량이 없습니다.</p>
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
