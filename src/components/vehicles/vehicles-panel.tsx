

'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { vehicles as initialVehicles, drivers as initialDrivers, customers, equipments as initialEquipments } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wrench, Package, Truck, Search, PlusCircle, CalendarDays, Edit, Save, Trash2, X, Upload, Download, PackageOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Vehicle, Equipment, Driver } from '@/lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';


const statusMap: { [key in Vehicle['status']]: string } = {
  'On Route': '운행중',
  'Completed': '완료',
  'Maintenance': '정비중',
  'Idle': '대기중'
};
const statusOptions: Vehicle['status'][] = ['On Route', 'Idle', 'Maintenance', 'Completed'];

const typeMap: { [key in Vehicle['type']]: string } = {
  'Truck': '트럭',
  'Van': '밴',
  'Electric': '전기차'
};
const typeOptions = Object.keys(typeMap) as Vehicle['type'][];

const equipmentStatusMap: { [key in Equipment['status']]: string } = {
  'In Use': '사용중',
  'Available': '사용 가능',
  'Maintenance': '정비중'
};
const equipmentStatusOptions = Object.keys(equipmentStatusMap) as Equipment['status'][];


const equipmentTypeMap: { [key in Equipment['type']]: string } = {
  'Roll-off Box': '암롤 박스',
  'Container': '컨테이너'
};
const equipmentTypeOptions = Object.keys(equipmentTypeMap) as Equipment['type'][];

const dispatchFormSchema = z.object({
  customerId: z.string().min(1, "고객을 선택해주세요."),
  vehicleId: z.string().min(1, "차량을 선택해주세요."),
  driverId: z.string().min(1, "운전자를 선택해주세요."),
});

const vehicleFormSchema = z.object({
    name: z.string().min(3, "차량 이름은 3자 이상이어야 합니다."),
    type: z.enum(typeOptions),
    capacity: z.coerce.number().min(100, "용량은 100kg 이상이어야 합니다."),
});

const equipmentFormSchema = z.object({
    id: z.string().min(3, "장비 ID는 3자 이상이어야 합니다."),
    type: z.enum(equipmentTypeOptions),
    status: z.enum(equipmentStatusOptions),
    location: z.string().min(2, "위치를 입력해주세요."),
});

type DispatchFormValues = z.infer<typeof dispatchFormSchema>;
type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;


export default function VehiclesPanel() {
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [isEditingEquipment, setIsEditingEquipment] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [equipments, setEquipments] = useState<Equipment[]>(initialEquipments);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const { toast } = useToast();

  const dispatchForm = useForm<DispatchFormValues>({
    resolver: zodResolver(dispatchFormSchema),
    defaultValues: { customerId: '', vehicleId: '', driverId: '' }
  });

  const vehicleForm = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
  });

  const equipmentForm = useForm<EquipmentFormValues>({
      resolver: zodResolver(equipmentFormSchema),
  });

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    vehicleForm.reset({
        name: vehicle.name,
        type: vehicle.type,
        capacity: vehicle.capacity,
    });
  };

  const handleEquipmentClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    equipmentForm.reset({
        id: equipment.id,
        type: equipment.type,
        status: equipment.status,
        location: equipment.location,
    });
  };

  const handleVehicleSheetClose = () => {
    setSelectedVehicle(null);
    setIsEditingVehicle(false);
  };
  
  const handleEquipmentSheetClose = () => {
    setSelectedEquipment(null);
    setIsEditingEquipment(false);
  };

  const handleDriverChange = useCallback((vehicleId: string, newDriverId: string) => {
    const newDriver = drivers.find(d => d.id === newDriverId);
    if (!newDriver) return;

    let oldDriverName: string | undefined;

    setVehicles(prevVehicles =>
      prevVehicles.map(v => {
        if (v.id === vehicleId) {
          oldDriverName = v.driver;
          return { ...v, driver: newDriver.name };
        }
        return v;
      })
    );

    setDrivers(prevDrivers =>
      prevDrivers.map(d => {
        if (d.id === newDriverId) return { ...d, isAvailable: false };
        if (oldDriverName && d.name === oldDriverName) return { ...d, isAvailable: true };
        return d;
      })
    );
    
    toast({
        title: '운전자 변경 완료',
        description: `차량 담당 운전자가 ${newDriver.name}님으로 변경되었습니다.`,
    });
  }, [drivers, toast]);

  const handleStatusChange = useCallback((vehicleId: string, newStatus: Vehicle['status']) => {
    let changedVehicle: Vehicle | undefined;
    setVehicles(prevVehicles => 
      prevVehicles.map(v => {
        if (v.id === vehicleId) {
          changedVehicle = { ...v, status: newStatus };
          return changedVehicle;
        }
        return v;
      })
    );

    if (changedVehicle && (newStatus === 'Idle' || newStatus === 'Completed' || newStatus === 'Maintenance')) {
        const driverName = changedVehicle.driver;
        setDrivers(prevDrivers => 
            prevDrivers.map(d => 
                d.name === driverName ? { ...d, isAvailable: true } : d
            )
        );
    }
    
    if (changedVehicle && newStatus === 'On Route') {
        const driverName = changedVehicle.driver;
        setDrivers(prevDrivers =>
            prevDrivers.map(d =>
                d.name === driverName ? { ...d, isAvailable: false } : d
            )
        )
    }

    toast({
      title: '상태 변경 완료',
      description: `차량의 상태가 '${statusMap[newStatus]}'으로 변경되었습니다.`,
    })
  }, [toast]);

  const onDispatchSubmit: SubmitHandler<DispatchFormValues> = (data) => {
    dispatchForm.formState.isSubmitting;
    setTimeout(() => {
      const selectedVehicleData = vehicles.find(v => v.id === data.vehicleId);
      const selectedDriver = drivers.find(d => d.id === data.driverId);

      if (selectedVehicleData && selectedDriver) {
        handleStatusChange(data.vehicleId, 'On Route');
        handleDriverChange(data.vehicleId, data.driverId);
      }

      toast({ title: "배차 등록 완료", description: "새로운 배차 정보가 성공적으로 등록되었습니다." });
      setIsDispatchModalOpen(false);
      dispatchForm.reset();
    }, 1000);
  };
  
  const onVehicleSubmit: SubmitHandler<VehicleFormValues> = (data) => {
    if (selectedVehicle && isEditingVehicle) { // Update vehicle
        const updatedVehicle = { ...selectedVehicle, ...data };
        setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? updatedVehicle : v));
        setSelectedVehicle(updatedVehicle);
        toast({ title: "차량 정보 수정됨", description: `${data.name} 정보가 성공적으로 수정되었습니다.` });
        setIsEditingVehicle(false);
    } else { // Create new vehicle
        const newVehicle: Vehicle = {
            id: `V${String(vehicles.length + 1).padStart(3, '0')}`,
            name: data.name,
            type: data.type,
            capacity: data.capacity,
            driver: '미배정',
            status: 'Idle',
            location: { lat: 37.5665, lng: 126.9780 },
            load: 0,
            maintenanceHistory: [],
            createdAt: format(new Date(), 'yyyy-MM-dd'),
        };
        setVehicles([newVehicle, ...vehicles]);
        toast({ title: "차량 등록됨", description: "새로운 차량이 시스템에 등록되었습니다." });
        setIsVehicleModalOpen(false);
        vehicleForm.reset();
    }
  };

  const onEquipmentSubmit: SubmitHandler<EquipmentFormValues> = (data) => {
    if (selectedEquipment && isEditingEquipment) {
        const updatedEquipment = { ...selectedEquipment, ...data };
        setEquipments(equipments.map(e => e.id === selectedEquipment.id ? updatedEquipment : e));
        setSelectedEquipment(updatedEquipment);
        toast({ title: "장비 정보 수정됨", description: `${data.id} 정보가 성공적으로 수정되었습니다.` });
        setIsEditingEquipment(false);
    } else {
        const newEquipment: Equipment = {
            id: data.id,
            type: data.type,
            status: data.status,
            location: data.location,
            lastInspected: format(new Date(), 'yyyy-MM-dd'),
            createdAt: format(new Date(), 'yyyy-MM-dd'),
        };
        setEquipments([newEquipment, ...equipments]);
        toast({ title: "장비 등록됨", description: "새로운 장비가 시스템에 등록되었습니다." });
        setIsEquipmentModalOpen(false);
        equipmentForm.reset();
    }
  }

  const handleDeleteVehicle = () => {
    if (!selectedVehicle) return;
    setVehicles(vehicles.filter(v => v.id !== selectedVehicle.id));
    toast({
      title: "차량 삭제됨",
      description: `${selectedVehicle.name} 차량이 영구적으로 삭제되었습니다.`,
      variant: 'destructive',
    });
    handleVehicleSheetClose();
  }

  const handleDeleteEquipment = () => {
    if (!selectedEquipment) return;
    setEquipments(equipments.filter(e => e.id !== selectedEquipment.id));
    toast({
        title: "장비 삭제됨",
        description: `${selectedEquipment.id} 장비가 영구적으로 삭제되었습니다.`,
        variant: 'destructive',
    });
    handleEquipmentSheetClose();
  }
  
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

  const {
    currentPage: vehicleCurrentPage,
    setCurrentPage: setVehicleCurrentPage,
    paginatedData: paginatedVehicles,
    totalPages: vehicleTotalPages,
  } = usePagination(filteredVehicles, 5);

  const {
    currentPage: equipmentCurrentPage,
    setCurrentPage: setEquipmentCurrentPage,
    paginatedData: paginatedEquipments,
    totalPages: equipmentTotalPages,
  } = usePagination(filteredEquipments, 5);
  
  const availableDrivers = useMemo(() => drivers.filter(d => d.isAvailable), [drivers]);

  const handleVehicleExport = () => {
    const headers = ["ID", "차량명", "차종", "톤수(kg)", "운전자", "상태", "등록일"];
    const csvContent = [
      headers.join(','),
      ...filteredVehicles.map(v => [v.id, v.name, typeMap[v.type], v.capacity, v.driver, statusMap[v.status], v.createdAt].join(','))
    ].join('\n');
    
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `vehicles_export_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleEquipmentExport = () => {
    const headers = ["ID", "종류", "상태", "현재 위치", "최근 점검일", "등록일"];
    const csvContent = [
      headers.join(','),
      ...filteredEquipments.map(e => [e.id, equipmentTypeMap[e.type], equipmentStatusMap[e.status], e.location, e.lastInspected, e.createdAt].join(','))
    ].join('\n');
    
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `equipments_export_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>차량 및 장비 관리</CardTitle>
          <CardDescription>전체 차량 및 장비 목록과 상태를 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vehicles">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vehicles">차량 목록</TabsTrigger>
              <TabsTrigger value="equipment">장비 목록</TabsTrigger>
            </TabsList>
            <TabsContent value="vehicles" className="space-y-4">
               <div className="flex items-center justify-between gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="차량명, 운전자, ID로 검색..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                     <Dialog>
                        <DialogTrigger asChild><Button variant="outline"><Upload className="mr-2"/>가져오기</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>CSV 파일에서 차량 가져오기</DialogTitle>
                                <DialogDescription>
                                    CSV 파일을 업로드하여 여러 차량을 한 번에 추가합니다. 파일은 'name', 'type', 'capacity' 열을 포함해야 합니다.
                                </DialogDescription>
                            </DialogHeader>
                             <div className="space-y-4 py-4">
                                <Input type="file" accept=".csv" />
                            </div>
                            <DialogFooter>
                                <Button variant="outline">취소</Button>
                                <Button>가져오기</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={handleVehicleExport}><Download className="mr-2"/>내보내기</Button>
                    <Dialog open={isVehicleModalOpen} onOpenChange={setIsVehicleModalOpen}>
                        <DialogTrigger asChild><Button variant="outline" onClick={() => vehicleForm.reset()}><PlusCircle className="mr-2"/>새 차량 등록</Button></DialogTrigger>
                        <DialogContent>
                             <DialogHeader><DialogTitle>새 차량 등록</DialogTitle><DialogDescription>새로운 차량 자산을 시스템에 등록합니다.</DialogDescription></DialogHeader>
                             <Form {...vehicleForm}>
                                <form onSubmit={vehicleForm.handleSubmit(onVehicleSubmit)} className="space-y-4 py-4">
                                    <FormField control={vehicleForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>차량 이름</FormLabel><FormControl><Input placeholder="예: 에코트럭 5호" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={vehicleForm.control} name="type" render={({ field }) => (<FormItem><FormLabel>차종</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="차종 선택" /></SelectTrigger></FormControl><SelectContent>{typeOptions.map(t => <SelectItem key={t} value={t}>{typeMap[t]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                                        <FormField control={vehicleForm.control} name="capacity" render={({ field }) => (<FormItem><FormLabel>용량 (kg)</FormLabel><FormControl><Input type="number" placeholder="예: 5000" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    </div>
                                    <DialogFooter><Button type="submit" disabled={vehicleForm.formState.isSubmitting}>{vehicleForm.formState.isSubmitting && <Loader2 className="mr-2"/>}차량 등록</Button></DialogFooter>
                                </form>
                             </Form>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isDispatchModalOpen} onOpenChange={setIsDispatchModalOpen}>
                      <DialogTrigger asChild><Button><PlusCircle className="mr-2"/>새 배차 등록</Button></DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader><DialogTitle>새 배차 등록</DialogTitle><DialogDescription>새로운 배차 정보를 입력해주세요.</DialogDescription></DialogHeader>
                        <Form {...dispatchForm}>
                          <form onSubmit={dispatchForm.handleSubmit(onDispatchSubmit)} className="space-y-4 py-4">
                            <FormField control={dispatchForm.control} name="customerId" render={({ field }) => (<FormItem><FormLabel>고객사</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="고객사를 선택하세요" /></SelectTrigger></FormControl><SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                            <FormField control={dispatchForm.control} name="vehicleId" render={({ field }) => (<FormItem><FormLabel>차량</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="배차할 차량을 선택하세요" /></SelectTrigger></FormControl><SelectContent>{vehicles.filter(v => v.status === 'Idle').map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                            <FormField control={dispatchForm.control} name="driverId" render={({ field }) => (<FormItem><FormLabel>운전자</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="담당 운전자를 선택하세요" /></SelectTrigger></FormControl><SelectContent>{availableDrivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                            <DialogFooter><Button type="submit" disabled={dispatchForm.formState.isSubmitting}>{dispatchForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}배차 등록</Button></DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                </div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>차량</TableHead><TableHead>차종</TableHead><TableHead>톤수 (kg)</TableHead><TableHead>운전자</TableHead><TableHead>상태</TableHead></TableRow></TableHeader>
                <TableBody>
                  {paginatedVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} onClick={() => handleVehicleClick(vehicle)} className="cursor-pointer">
                      <TableCell className="font-medium">{vehicle.name}</TableCell>
                      <TableCell>{typeMap[vehicle.type]}</TableCell>
                      <TableCell>{vehicle.capacity.toLocaleString()}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-auto p-1 font-normal">{vehicle.driver}</Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {availableDrivers.map(driver => (
                              <DropdownMenuItem key={driver.id} onSelect={() => handleDriverChange(vehicle.id, driver.id)}>{driver.name}</DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-auto p-0"><Badge variant={vehicle.status === 'On Route' ? 'default' : vehicle.status === 'Completed' ? 'secondary' : vehicle.status === 'Maintenance' ? 'destructive' : 'outline'} className="cursor-pointer">{statusMap[vehicle.status]}</Badge></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {statusOptions.filter(s => s !== vehicle.status).map(status => (
                              <DropdownMenuItem key={status} onSelect={() => handleStatusChange(vehicle.id, status)}>{statusMap[status]}으로 변경</DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination>
                <PaginationContent>
                    <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setVehicleCurrentPage(prev => Math.max(1, prev - 1)); }} disabled={vehicleCurrentPage === 1}/></PaginationItem>
                    {Array.from({ length: vehicleTotalPages }, (_, i) => i + 1).map(page => (<PaginationItem key={page}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); setVehicleCurrentPage(page); }} isActive={vehicleCurrentPage === page}>{page}</PaginationLink></PaginationItem>))}
                    <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setVehicleCurrentPage(prev => Math.min(vehicleTotalPages, prev + 1)); }} disabled={vehicleCurrentPage === vehicleTotalPages}/></PaginationItem>
                </PaginationContent>
              </Pagination>
            </TabsContent>
            <TabsContent value="equipment" className="space-y-4">
              <div className="flex items-center justify-between gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="장비 ID 또는 위치로 검색..." value={equipmentSearch} onChange={(e) => setEquipmentSearch(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild><Button variant="outline"><Upload className="mr-2"/>가져오기</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>CSV 파일에서 장비 가져오기</DialogTitle>
                                <DialogDescription>
                                    CSV 파일을 업로드하여 여러 장비를 한 번에 추가합니다.
                                </DialogDescription>
                            </DialogHeader>
                             <div className="space-y-4 py-4">
                                <Input type="file" accept=".csv" />
                            </div>
                            <DialogFooter>
                                <Button variant="outline">취소</Button>
                                <Button>가져오기</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={handleEquipmentExport}><Download className="mr-2"/>내보내기</Button>
                    <Dialog open={isEquipmentModalOpen} onOpenChange={setIsEquipmentModalOpen}>
                        <DialogTrigger asChild><Button variant="outline" onClick={() => equipmentForm.reset()}><PlusCircle className="mr-2"/>새 장비 등록</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>새 장비 등록</DialogTitle><DialogDescription>새로운 장비 자산을 시스템에 등록합니다.</DialogDescription></DialogHeader>
                            <Form {...equipmentForm}>
                                <form onSubmit={equipmentForm.handleSubmit(onEquipmentSubmit)} className="space-y-4 py-4">
                                    <FormField control={equipmentForm.control} name="id" render={({ field }) => (<FormItem><FormLabel>장비 ID</FormLabel><FormControl><Input placeholder="예: E06" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={equipmentForm.control} name="type" render={({ field }) => (<FormItem><FormLabel>종류</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="장비 종류 선택" /></SelectTrigger></FormControl><SelectContent>{equipmentTypeOptions.map(t => <SelectItem key={t} value={t}>{equipmentTypeMap[t]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                                    <FormField control={equipmentForm.control} name="status" render={({ field }) => (<FormItem><FormLabel>상태</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="장비 상태 선택" /></SelectTrigger></FormControl><SelectContent>{equipmentStatusOptions.map(s => <SelectItem key={s} value={s}>{equipmentStatusMap[s]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                                    <FormField control={equipmentForm.control} name="location" render={({ field }) => (<FormItem><FormLabel>현재 위치</FormLabel><FormControl><Input placeholder="예: 본사 차고지, V002" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <DialogFooter><Button type="submit" disabled={equipmentForm.formState.isSubmitting}>{equipmentForm.formState.isSubmitting && <Loader2 className="mr-2"/>}장비 등록</Button></DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>장비 ID</TableHead><TableHead>종류</TableHead><TableHead>상태</TableHead><TableHead>현재 위치</TableHead><TableHead className="text-right">최근 점검일</TableHead></TableRow></TableHeader>
                <TableBody>
                  {paginatedEquipments.map((item: Equipment) => (
                    <TableRow key={item.id} onClick={() => handleEquipmentClick(item)} className="cursor-pointer">
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{equipmentTypeMap[item.type]}</TableCell>
                        <TableCell><Badge variant={item.status === 'In Use' ? 'default' : item.status === 'Available' ? 'secondary' : 'destructive'}>{equipmentStatusMap[item.status]}</Badge></TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell className="text-right">{item.lastInspected}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination>
                <PaginationContent>
                    <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setEquipmentCurrentPage(prev => Math.max(1, prev - 1)); }} disabled={equipmentCurrentPage === 1}/></PaginationItem>
                    {Array.from({ length: equipmentTotalPages }, (_, i) => i + 1).map(page => (<PaginationItem key={page}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); setEquipmentCurrentPage(page); }} isActive={equipmentCurrentPage === page}>{page}</PaginationLink></PaginationItem>))}
                    <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setEquipmentCurrentPage(prev => Math.min(equipmentTotalPages, prev + 1)); }} disabled={equipmentCurrentPage === equipmentTotalPages}/></PaginationItem>
                </PaginationContent>
              </Pagination>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Sheet open={!!selectedVehicle} onOpenChange={(open) => !open && handleVehicleSheetClose()}>
        <SheetContent className="sm:max-w-xl w-full">
          {selectedVehicle && (
            <>
              <SheetHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <SheetTitle className="font-headline text-2xl flex items-center gap-2"><Truck className="text-primary"/> {selectedVehicle.name}</SheetTitle>
                        <SheetDescription>{selectedVehicle.driver} 기사님 / {typeMap[selectedVehicle.type]} / {selectedVehicle.capacity}kg</SheetDescription>
                    </div>
                    {isEditingVehicle ? (
                        <div className="flex gap-2">
                           <Button size="sm" onClick={vehicleForm.handleSubmit(onVehicleSubmit)} disabled={vehicleForm.formState.isSubmitting}>{vehicleForm.formState.isSubmitting ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>} 저장</Button>
                           <Button size="sm" variant="ghost" onClick={() => setIsEditingVehicle(false)}><X className="mr-2"/>취소</Button>
                        </div>
                    ) : (
                       <Button size="sm" variant="outline" onClick={() => setIsEditingVehicle(true)}><Edit className="mr-2"/>정보 수정</Button>
                    )}
                </div>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <Form {...vehicleForm}>
                <form onSubmit={vehicleForm.handleSubmit(onVehicleSubmit)}>
                    <Card>
                        <CardHeader><CardTitle className="text-lg">차량 정보</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {isEditingVehicle ? (
                                <>
                                    <FormField control={vehicleForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>차량 이름</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <div className="grid grid-cols-2 gap-4">
                                    <FormField control={vehicleForm.control} name="type" render={({ field }) => (<FormItem><FormLabel>차종</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{typeOptions.map(t=><SelectItem key={t} value={t}>{typeMap[t]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                                    <FormField control={vehicleForm.control} name="capacity" render={({ field }) => (<FormItem><FormLabel>용량 (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    </div>
                                </>
                            ) : (
                                <>
                                <div className="flex items-center justify-between text-sm"><span className="font-medium text-muted-foreground">ID</span><span>{selectedVehicle.id}</span></div>
                                <div className="flex items-center justify-between text-sm"><span className="font-medium text-muted-foreground">상태</span><Badge variant={selectedVehicle.status === 'On Route' ? 'default' : selectedVehicle.status === 'Completed' ? 'secondary' : selectedVehicle.status === 'Maintenance' ? 'destructive' : 'outline'}>{statusMap[selectedVehicle.status]}</Badge></div>
                                <div><div className="flex justify-between text-sm mb-2"><span className="font-medium">현재 적재량</span><span>{selectedVehicle.load.toLocaleString()}kg / {selectedVehicle.capacity.toLocaleString()}kg</span></div><Progress value={(selectedVehicle.load / selectedVehicle.capacity) * 100} /></div>
                                <div className="flex items-center justify-between text-sm"><span className="font-medium text-muted-foreground">등록일</span><span className="flex items-center gap-1"><CalendarDays className="size-4"/>{selectedVehicle.createdAt}</span></div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </form>
                </Form>

                <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Wrench />정비 이력</CardTitle></CardHeader>
                  <CardContent>
                    {selectedVehicle.maintenanceHistory.length > 0 ? (
                      <Table>
                        <TableHeader><TableRow><TableHead>날짜</TableHead><TableHead>내용</TableHead><TableHead className="text-right">비용</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {selectedVehicle.maintenanceHistory.map((record, index) => (<TableRow key={index}><TableCell>{record.date}</TableCell><TableCell>{record.description}</TableCell><TableCell className="text-right">{record.cost.toLocaleString()} 원</TableCell></TableRow>))}
                        </TableBody>
                      </Table>
                    ) : ( <p className="text-sm text-muted-foreground">정비 이력이 없습니다.</p> )}
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Package />배정된 장비</CardTitle></CardHeader>
                  <CardContent>
                    {equipments.filter(e => e.location === selectedVehicle.id).length > 0 ? (equipments.filter(e => e.location === selectedVehicle.id).map(eq => (<div key={eq.id} className="flex items-center justify-between p-2 rounded-md bg-muted"><span className="font-medium">{eq.id} - {equipmentTypeMap[eq.type]}</span><Badge variant="secondary">{equipmentStatusMap[eq.status]}</Badge></div>))) : ( <p className="text-sm text-muted-foreground">배정된 장비가 없습니다.</p> )}
                  </CardContent>
                </Card>
                 { !isEditingVehicle && 
                    <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="destructive" className="w-full"><Trash2 className="mr-2"/>차량 삭제</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>정말로 이 차량을 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 작업은 되돌릴 수 없습니다. '{selectedVehicle.name}' 차량 정보가 영구적으로 삭제됩니다.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={handleDeleteVehicle}>삭제 확인</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 }
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedEquipment} onOpenChange={(open) => !open && handleEquipmentSheetClose()}>
        <SheetContent className="sm:max-w-xl w-full">
          {selectedEquipment && (
            <>
              <SheetHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <SheetTitle className="font-headline text-2xl flex items-center gap-2"><PackageOpen className="text-primary"/> {selectedEquipment.id}</SheetTitle>
                        <SheetDescription>{equipmentTypeMap[selectedEquipment.type]}</SheetDescription>
                    </div>
                    {isEditingEquipment ? (
                        <div className="flex gap-2">
                           <Button size="sm" onClick={equipmentForm.handleSubmit(onEquipmentSubmit)} disabled={equipmentForm.formState.isSubmitting}>{equipmentForm.formState.isSubmitting ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>} 저장</Button>
                           <Button size="sm" variant="ghost" onClick={() => setIsEditingEquipment(false)}><X className="mr-2"/>취소</Button>
                        </div>
                    ) : (
                       <Button size="sm" variant="outline" onClick={() => setIsEditingEquipment(true)}><Edit className="mr-2"/>정보 수정</Button>
                    )}
                </div>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <Form {...equipmentForm}>
                <form onSubmit={equipmentForm.handleSubmit(onEquipmentSubmit)}>
                    <Card>
                        <CardHeader><CardTitle className="text-lg">장비 정보</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {isEditingEquipment ? (
                                <>
                                    <FormField control={equipmentForm.control} name="id" render={({ field }) => (<FormItem><FormLabel>장비 ID</FormLabel><FormControl><Input {...field} readOnly /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={equipmentForm.control} name="type" render={({ field }) => (<FormItem><FormLabel>종류</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{equipmentTypeOptions.map(t=><SelectItem key={t} value={t}>{equipmentTypeMap[t]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                                    <FormField control={equipmentForm.control} name="status" render={({ field }) => (<FormItem><FormLabel>상태</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{equipmentStatusOptions.map(s=><SelectItem key={s} value={s}>{equipmentStatusMap[s]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                                    <FormField control={equipmentForm.control} name="location" render={({ field }) => (<FormItem><FormLabel>위치</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                </>
                            ) : (
                                <>
                                <div className="flex items-center justify-between text-sm"><span className="font-medium text-muted-foreground">ID</span><span>{selectedEquipment.id}</span></div>
                                <div className="flex items-center justify-between text-sm"><span className="font-medium text-muted-foreground">종류</span><span>{equipmentTypeMap[selectedEquipment.type]}</span></div>
                                <div className="flex items-center justify-between text-sm"><span className="font-medium text-muted-foreground">상태</span><Badge variant={selectedEquipment.status === 'In Use' ? 'default' : selectedEquipment.status === 'Available' ? 'secondary' : 'destructive'}>{equipmentStatusMap[selectedEquipment.status]}</Badge></div>
                                <div className="flex items-center justify-between text-sm"><span className="font-medium text-muted-foreground">현재 위치</span><span>{selectedEquipment.location}</span></div>
                                <div className="flex items-center justify-between text-sm"><span className="font-medium text-muted-foreground">최근 점검일</span><span className="flex items-center gap-1"><CalendarDays className="size-4"/>{selectedEquipment.lastInspected}</span></div>
                                <div className="flex items-center justify-between text-sm"><span className="font-medium text-muted-foreground">등록일</span><span className="flex items-center gap-1"><CalendarDays className="size-4"/>{selectedEquipment.createdAt}</span></div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </form>
                </Form>
                 { !isEditingEquipment && 
                    <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="destructive" className="w-full"><Trash2 className="mr-2"/>장비 삭제</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>정말로 이 장비를 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 작업은 되돌릴 수 없습니다. '{selectedEquipment.id}' 장비 정보가 영구적으로 삭제됩니다.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={handleDeleteEquipment}>삭제 확인</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 }
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
