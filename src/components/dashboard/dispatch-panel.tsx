'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { vehicles, collectionTasks } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Truck, User, MapPin, Trash2, Weight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import type { Vehicle } from '@/lib/types';

const statusMap: { [key: string]: string } = {
  'On Route': '운행중',
  'Completed': '완료',
  'Maintenance': '정비중',
  'Idle': '대기중'
};

export default function DispatchPanel() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const sitePhoto = placeholderImages.find(p => p.id === 'collection-site');

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleSheetClose = () => {
    setSelectedVehicle(null);
  };
  
  const selectedTask = collectionTasks.find(task => task.vehicleId === selectedVehicle?.id);

  return (
    <>
      <Card className="h-full flex flex-col shadow-lg">
        <CardHeader>
          <CardTitle>실시간 배차 현황</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-6 pt-0">
              {vehicles.map((vehicle) => (
                <Card 
                  key={vehicle.id} 
                  className="bg-card/50 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleVehicleClick(vehicle)}
                >
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2 font-headline">
                        <Truck className="text-primary"/>
                        {vehicle.name}
                      </CardTitle>
                      <Badge variant={
                          vehicle.status === 'On Route' ? 'default' : 
                          vehicle.status === 'Completed' ? 'secondary' : 
                          vehicle.status === 'Maintenance' ? 'destructive' : 'outline'
                      }>
                        {statusMap[vehicle.status]}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 pt-1">
                      <User className="size-4" />
                      <span>{vehicle.driver}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">현재 적재량</span>
                        <span>{vehicle.load}kg / {vehicle.capacity}kg</span>
                      </div>
                      <Progress value={(vehicle.load / vehicle.capacity) * 100} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Sheet open={!!selectedVehicle} onOpenChange={(open) => !open && handleSheetClose()}>
        <SheetContent className="sm:max-w-lg w-full">
          {selectedVehicle && (
            <>
              <SheetHeader>
                <SheetTitle className="font-headline text-2xl">{selectedVehicle.name} - 배차 상세</SheetTitle>
                <SheetDescription>
                  {selectedVehicle.driver} 기사님
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">수거 현장 사진</CardTitle>
                  </CardHeader>
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
                  <CardHeader>
                     <CardTitle className="text-lg">상세 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                     <div className="flex items-center gap-3">
                        <Info className="size-5 text-muted-foreground" />
                        <span className="font-medium">현재 상태:</span>
                        <Badge variant={
                          selectedVehicle.status === 'On Route' ? 'default' :
                          selectedVehicle.status === 'Completed' ? 'secondary' :
                          selectedVehicle.status === 'Maintenance' ? 'destructive' : 'outline'
                        }>{statusMap[selectedVehicle.status]}</Badge>
                     </div>
                     {selectedTask && (
                       <>
                         <div className="flex items-center gap-3">
                            <MapPin className="size-5 text-muted-foreground" />
                            <span className="font-medium">수거지:</span>
                            <span>{selectedTask.address}</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <Trash2 className="size-5 text-muted-foreground" />
                            <span className="font-medium">폐기물 종류:</span>
                            <span>{selectedTask.materialType}</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <Weight className="size-5 text-muted-foreground" />
                            <span className="font-medium">수거량:</span>
                            <span>{selectedTask.collectedWeight} kg</span>
                         </div>
                       </>
                     )}
                     <div className="flex items-center gap-3">
                        <Truck className="size-5 text-muted-foreground" />
                        <span className="font-medium">배정 차량:</span>
                        <span>{selectedVehicle.name} ({selectedVehicle.type})</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <User className="size-5 text-muted-foreground" />
                        <span className="font-medium">담당 기사:</span>
                        <span>{selectedVehicle.driver}</span>
                     </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
