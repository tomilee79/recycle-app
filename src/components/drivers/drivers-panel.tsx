
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { drivers as initialDrivers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowRight, PlusCircle, Search, Trash2, Edit, MoreHorizontal, Save, X } from "lucide-react";
import type { Driver } from '@/lib/types';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';


const driverFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "이름은 2자 이상이어야 합니다."),
  contact: z.string().regex(/^[0-9]{3}-[0-9]{3,4}-[0-9]{4}$/, "010-1234-5678 형식으로 입력해주세요."),
  email: z.string().email("유효한 이메일 주소여야 합니다."),
  password: z.string().optional().refine(val => !val || val.length >= 6, {
    message: "비밀번호는 최소 6자 이상이어야 합니다.",
  }),
  isAvailable: z.boolean(),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

export default function DriversPanel() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [search, setSearch] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const { toast } = useToast();

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
  });

  const filteredDrivers = useMemo(() =>
    drivers.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.contact.includes(search) ||
      d.email.toLowerCase().includes(search.toLowerCase())
    ),
    [drivers, search]
  );
  
  const {
    currentPage,
    setCurrentPage,
    paginatedData,
    totalPages,
  } = usePagination(filteredDrivers, 8);


  const openSheet = (driver: Driver | null) => {
    setSelectedDriver(driver);
    if (driver) {
      form.reset({
        id: driver.id,
        name: driver.name,
        contact: driver.contact,
        email: driver.email,
        password: '',
        isAvailable: driver.isAvailable,
      });
    } else {
      form.reset({ id: undefined, name: '', contact: '', email: '', password: '', isAvailable: true });
    }
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setSelectedDriver(null);
  };
  
  const onSubmit = (data: DriverFormValues) => {
    if (selectedDriver) { // Update
      setDrivers(drivers.map(d => (d.id === selectedDriver.id ? { ...d, ...data } : d)));
      toast({ title: "직원 정보 수정", description: `${data.name} 님의 정보가 수정되었습니다.` });
    } else { // Create
      const newDriver: Driver = {
        id: `D${String(drivers.length + 1).padStart(3, '0')}`,
        name: data.name,
        email: data.email,
        contact: data.contact,
        isAvailable: data.isAvailable,
      };
      setDrivers([newDriver, ...drivers]);
      toast({ title: "직원 추가 완료", description: `${data.name} 님이 새로운 직원으로 등록되었습니다.` });
    }
    closeSheet();
  };

  const handleDelete = (id: string) => {
    setDrivers(drivers.filter(d => d.id !== id));
    toast({ title: "직원 삭제 완료", description: "직원 정보가 삭제되었습니다.", variant: "destructive" });
    closeSheet();
  }

  const handleToggleAvailability = (id: string, isAvailable: boolean) => {
    setDrivers(drivers.map(d => (d.id === id ? { ...d, isAvailable } : d)));
     toast({
      title: "상태 변경",
      description: `직원의 배차 가능 상태가 ${isAvailable ? "'가능'" : "'배차중'"}으로 변경되었습니다.`,
    });
  }

  return (
    <>
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>직원 관리</CardTitle>
              <CardDescription>
                시스템 계정(로그인) 관리는 '사용자 관리' 메뉴에서, 직원의 성과 분석은 '성과 대시보드'에서 확인하세요.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/driver-performance')}>
                성과 대시보드로 이동 <ArrowRight className="ml-2"/>
              </Button>
              <Button onClick={() => openSheet(null)}>
                <PlusCircle className="mr-2"/>새 직원 추가
              </Button>
            </div>
          </div>
          <div className="relative pt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="이름, 연락처 또는 이메일로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead className="w-[120px]">배차 가능</TableHead>
                <TableHead className="text-right w-[80px]">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((driver) => (
                <TableRow key={driver.id} onClick={() => openSheet(driver)} className="cursor-pointer">
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>{driver.contact}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                       <Switch
                        id={`available-${driver.id}`}
                        checked={driver.isAvailable}
                        onCheckedChange={(checked) => handleToggleAvailability(driver.id, checked)}
                      />
                      <Label htmlFor={`available-${driver.id}`} className={cn(driver.isAvailable ? 'text-green-600' : 'text-yellow-600')}>
                        {driver.isAvailable ? '가능' : '배차중'}
                      </Label>
                    </div>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <AlertDialog>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>삭제</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                          </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  이 작업은 되돌릴 수 없습니다. {driver.name} 직원의 정보가 영구적으로 삭제됩니다.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(driver.id)}>삭제 확인</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Pagination>
            <PaginationContent>
                <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }} disabled={currentPage === 1}/></PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (<PaginationItem key={page}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(page); }} isActive={currentPage === page}>{page}</PaginationLink></PaginationItem>))}
                <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }} disabled={currentPage === totalPages}/></PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>

    <Sheet open={isSheetOpen} onOpenChange={closeSheet}>
        <SheetContent className="sm:max-w-md">
            <SheetHeader>
                <SheetTitle>{selectedDriver ? '직원 정보 수정' : '새 직원 추가'}</SheetTitle>
                <SheetDescription>{selectedDriver ? '직원의 정보를 수정합니다.' : '새로운 직원 정보를 입력합니다.'}</SheetDescription>
            </SheetHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>이름</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="contact" render={({ field }) => (<FormItem><FormLabel>연락처</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>이메일 (로그인 ID)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>비밀번호</FormLabel><FormControl><Input type="password" placeholder={selectedDriver ? '변경할 경우에만 입력' : '••••••••'} {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField
                    control={form.control}
                    name="isAvailable"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>배차 가능</FormLabel>
                                <FormMessage />
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                    />
                <div className="flex justify-between items-center pt-4">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {selectedDriver ? '저장' : '추가'}
                  </Button>
                </div>
            </form>
            </Form>
        </SheetContent>
      </Sheet>
    </>
  );
}

    