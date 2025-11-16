import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { vehicles } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Truck, User } from "lucide-react";
import { cn } from "@/lib/utils";

const statusMap: { [key: string]: string } = {
  'On Route': '운행중',
  'Completed': '완료',
  'Maintenance': '정비중',
  'Idle': '대기중'
};

export default function DispatchPanel() {
  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle>실시간 배차 현황</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-full">
          <div className="space-y-4 p-6 pt-0">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="bg-card/50 hover:bg-muted/50 transition-colors">
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
  );
}
