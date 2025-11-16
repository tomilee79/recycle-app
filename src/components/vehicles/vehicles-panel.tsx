
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { vehicles as initialVehicles, drivers, customers, equipments as initialEquipments } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wrench, Package, Truck, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Vehicle, Equipment } from '@/lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const statusMap: { [key: string]: string } = {
  'On Route': '운행중',
  'Completed': '완료',
  'Maintenance': '정비중',
  'Idle': '대기중'
};

const statusOptions: Vehicle['status'][] = ['On Route', 'Idle', 'Maintenance', 'Completed'];

const typeMap: { [key: string]: string } = {
  'Truck': '트럭',
  'Van': '밴',
  'Electric': '전기차'
};

const equipmentStatusMap: { [key: string]: string } = {
  'In Use': '사용중',
  'Available': '사용 가능',
  'Maintenance': '정비중'
};

const equipmentTypeMap: { [key: string]: string } = {
  'Roll-off Box': '암롤 박스',
  'Container': '컨테이너'
};

const formSchema = z.object({
  customerId: z.string().min(1, "고객을 선택해주세요."),
  vehicleId: z.string().min(1, "차량을 선택해주세요."),
  driverId: z.string().min(1, "운전자를 선택해주세요."),
});

type FormValues = z.infer<typeof formSchema>;

export default function VehiclesPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [equipments, setEquipments] = useState<Equipment[]>(initialEquipments);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: '',
      vehicleId: '',
      driverId: ''
    }
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setIsSubmitting(true);
    console.log("New Dispatch Data:", data);
    setTimeout(() => {
      toast({
        title: "배차 등록 완료",
        description: "새로운 배차 정보가 성공적으로 등록되었습니다.",
      });
      setIsSubmitting(false);
      setIsModalOpen(false);
      form.reset();
    }, 1000);
  };
  
  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleSheetClose = () => {
    setSelectedVehicle(null);
  };
  
  const handleStatusChange = (vehicleId: string, newStatus: Vehicle['status']) => {
    setVehicles(prevVehicles => 
      prevVehicles.map(v => 
        v.id === vehicleId ? { ...v, status: newStatus } : v
      )
    );
    toast({
      title: '상태 변경 완료',
      description: `차량 ID ${vehicleId}의 상태가 '${statusMap[newStatus]}'으로 변경되었습니다.`,
    })
  };

  const filteredVehicles = useMemo(() => 
    vehicles.filter(vehicle => 
      vehicle.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      vehicle.id.toLowerCase().includes(vehicleSearch.toLowerCase())
    ), [vehicles, vehicleSearch]);

  const filteredEquipments = useMemo(() =>
    equipments.filter(equipment =>
      equipment.id.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
      equipment.location.toLowerCase().includes(equipmentSearch.toLowerCase())
    ), [equipments, equipmentSearch]);

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>차량 및 장비 관리</CardTitle>
            <CardDescription>전체 차량 및 장비 목록과 상태를 관리합니다.</CardDescription>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>새 배차 등록</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>새 배차 등록</DialogTitle>
                <DialogDescription>새로운 배차 정보를 입력해주세요.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>고객사</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="고객사를 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>차량</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="배차할 차량을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicles.filter(v => v.status === 'Idle').map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="driverId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>운전자</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="담당 운전자를 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {drivers.filter(d => d.isAvailable).map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      배차 등록
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vehicles">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vehicles">차량 목록</TabsTrigger>
              <TabsTrigger value="equipment">장비 목록</TabsTrigger>
            </TabsList>
            <TabsContent value="vehicles" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="차량명, 운전자, ID로 검색..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>차량</TableHead>
                    <TableHead>차종</TableHead>
                    <TableHead>톤수 (kg)</TableHead>
                    <TableHead>운전자</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} onClick={() => handleVehicleClick(vehicle)} className="cursor-pointer">
                      <TableCell className="font-medium">{vehicle.name}</TableCell>
                      <TableCell>{typeMap[vehicle.type]}</TableCell>
                      <TableCell>{vehicle.capacity.toLocaleString()}</TableCell>
                      <TableCell>{vehicle.driver}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-auto p-0">
                              <Badge variant={
                                vehicle.status === 'On Route' ? 'default' : 
                                vehicle.status === 'Completed' ? 'secondary' : 
                                vehicle.status === 'Maintenance' ? 'destructive' : 'outline'
                              } className="cursor-pointer">
                                {statusMap[vehicle.status]}
                              </Badge>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {statusOptions.filter(s => s !== vehicle.status).map(status => (
                              <DropdownMenuItem key={status} onSelect={() => handleStatusChange(vehicle.id, status)}>
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
            </TabsContent>
            <TabsContent value="equipment" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="장비 ID 또는 위치로 검색..."
                  value={equipmentSearch}
                  onChange={(e) => setEquipmentSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>장비 ID</TableHead>
                    <TableHead>종류</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>현재 위치</TableHead>
                    <TableHead className="text-right">최근 점검일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipments.map((item: Equipment) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{equipmentTypeMap[item.type]}</TableCell>
                      <TableCell>
                        <Badge variant={
                            item.status === 'In Use' ? 'default' :
                            item.status === 'Available' ? 'secondary' :
                            'destructive'
                        }>
                          {equipmentStatusMap[item.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell className="text-right">{item.lastInspected}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Sheet open={!!selectedVehicle} onOpenChange={(open) => !open && handleSheetClose()}>
        <SheetContent className="sm:max-w-xl w-full">
          {selectedVehicle && (
            <>
              <SheetHeader>
                <SheetTitle className="font-headline text-2xl flex items-center gap-2">
                  <Truck className="text-primary"/> {selectedVehicle.name} - 차량 상세 정보
                </SheetTitle>
                <SheetDescription>
                  {selectedVehicle.driver} 기사님 / {typeMap[selectedVehicle.type]} / {selectedVehicle.capacity}kg
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">현재 상태</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">상태</span>
                      <Badge variant={
                          selectedVehicle.status === 'On Route' ? 'default' : 
                          selectedVehicle.status === 'Completed' ? 'secondary' : 
                          selectedVehicle.status === 'Maintenance' ? 'destructive' : 'outline'
                      }>
                        {statusMap[selectedVehicle.status]}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">현재 적재량</span>
                        <span>{selectedVehicle.load.toLocaleString()}kg / {selectedVehicle.capacity.toLocaleString()}kg</span>
                      </div>
                      <Progress value={(selectedVehicle.load / selectedVehicle.capacity) * 100} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Wrench />정비 이력</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedVehicle.maintenanceHistory.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>날짜</TableHead>
                            <TableHead>내용</TableHead>
                            <TableHead className="text-right">비용</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedVehicle.maintenanceHistory.map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{record.date}</TableCell>
                              <TableCell>{record.description}</TableCell>
                              <TableCell className="text-right">{record.cost.toLocaleString()} 원</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground">정비 이력이 없습니다.</p>
                    )}
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Package />배정된 장비</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {equipments.filter(e => e.location === selectedVehicle.id).length > 0 ? (
                        equipments.filter(e => e.location === selectedVehicle.id).map(eq => (
                            <div key={eq.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                                <span className="font-medium">{eq.id} - {equipmentTypeMap[eq.type]}</span>
                                <Badge variant="secondary">{equipmentStatusMap[eq.status]}</Badge>
                            </div>
                        ))
                    ) : (
                      <p className="text-sm text-muted-foreground">배정된 장비가 없습니다.</p>
                    )}
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
