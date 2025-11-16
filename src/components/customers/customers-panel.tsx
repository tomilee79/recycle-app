'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { customers as initialCustomers, contracts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { PlusCircle, Building, User, FileText, Loader2, Users2, Search, Trash2, Edit, Save, X, ChevronLeft, ChevronRight, MessageSquare, Handshake, ShieldAlert, CirclePlus, NotepadText } from "lucide-react";
import type { Customer, SalesActivity, Contract } from '@/lib/types';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';


const activityTypeMap: { [key: string]: { icon: React.ElementType, color: string } } = {
    '상담': { icon: MessageSquare, color: 'text-blue-500' },
    '클레임': { icon: ShieldAlert, color: 'text-red-500' },
    '영업 기회': { icon: Handshake, color: 'text-yellow-500' },
    '계약': { icon: FileText, color: 'text-green-500' },
};
const activityTypes = Object.keys(activityTypeMap);

const newActivitySchema = z.object({
    type: z.enum(['상담', '클레임', '영업 기회', '계약']),
    content: z.string().min(10, "최소 10자 이상 입력해주세요."),
});

const customerFormSchema = z.object({
    name: z.string().min(2, "고객사명은 최소 2자 이상이어야 합니다."),
    address: z.string().min(5, "주소는 최소 5자 이상이어야 합니다."),
    contactPerson: z.string().min(2, "담당자명은 최소 2자 이상이어야 합니다."),
});

type NewActivityFormValues = z.infer<typeof newActivitySchema>;
type CustomerFormValues = z.infer<typeof customerFormSchema>;

export default function CustomersPanel() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const activityForm = useForm<NewActivityFormValues>({
    resolver: zodResolver(newActivitySchema),
    defaultValues: { type: '상담', content: '' },
  });

  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
  });

  const filteredCustomers = useMemo(() => 
    customers.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.address.toLowerCase().includes(search.toLowerCase())
    ), [customers, search]);

  const {
    currentPage,
    setCurrentPage,
    paginatedData: paginatedCustomers,
    totalPages,
  } = usePagination(filteredCustomers, 10);
  
  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditingCustomer(false);
    setIsAddingActivity(false);
    customerForm.reset({
        name: customer.name,
        address: customer.address,
        contactPerson: customer.contactPerson,
    });
    setIsSheetOpen(true);
  };
  
  const handleNewCustomerClick = () => {
    setSelectedCustomer(null);
    setIsEditingCustomer(true);
    setIsAddingActivity(false);
    customerForm.reset({ name: '', address: '', contactPerson: '' });
    setIsSheetOpen(true);
  }

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setSelectedCustomer(null);
    setIsEditingCustomer(false);
    setIsAddingActivity(false);
    activityForm.reset();
    customerForm.reset();
  };

  const onActivitySubmit: SubmitHandler<NewActivityFormValues> = (data) => {
    if (!selectedCustomer) return;
    
    const newActivity: SalesActivity = {
      id: `A${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString().split('T')[0],
      type: data.type as SalesActivity['type'],
      content: data.content,
      manager: '관리자' // Mock manager
    };
    
    const updatedCustomer = { ...selectedCustomer, activityHistory: [newActivity, ...selectedCustomer.activityHistory] };

    setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
    setSelectedCustomer(updatedCustomer);
    
    toast({
      title: "활동 기록 추가 완료",
      description: `${selectedCustomer.name}의 새로운 활동이 기록되었습니다.`,
    });
    
    activityForm.reset();
    setIsAddingActivity(false);
  };

  const onCustomerSubmit: SubmitHandler<CustomerFormValues> = (data) => {
    if (selectedCustomer) { // Update
        const updatedCustomer = { ...selectedCustomer, ...data };
        setCustomers(customers.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
        setSelectedCustomer(updatedCustomer);
        toast({ title: "고객 정보 수정됨", description: `${data.name}의 정보가 수정되었습니다.` });
    } else { // Create
        const newCustomer: Customer = {
            id: `C${String(customers.length + 1).padStart(3, '0')}`,
            ...data,
            activityHistory: []
        };
        setCustomers([newCustomer, ...customers]);
        toast({ title: "신규 고객 추가됨", description: `${data.name} 고객이 추가되었습니다.` });
        handleSheetClose();
    }
    setIsEditingCustomer(false);
  }

  const handleDeleteCustomer = () => {
    if (!selectedCustomer) return;
    setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
    toast({
        title: "고객 삭제됨",
        description: `${selectedCustomer.name} 고객 정보가 삭제되었습니다.`,
        variant: "destructive"
    });
    handleSheetClose();
  }

  const getCustomerContract = (customerId: string): Contract | undefined => {
    return contracts.find(c => c.customerId === customerId && c.status !== 'Terminated');
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
              <div>
                <CardTitle>고객 목록</CardTitle>
                <CardDescription>전체 고객사 목록 및 기본 정보입니다.</CardDescription>
              </div>
              <Button onClick={handleNewCustomerClick}><PlusCircle className="mr-2" />신규 고객 추가</Button>
          </div>
          <div className="relative pt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                  placeholder="고객명, 주소로 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
              />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>고객명</TableHead><TableHead>담당자</TableHead><TableHead>주소</TableHead><TableHead>계약 상태</TableHead></TableRow></TableHeader>
            <TableBody>
              {paginatedCustomers.map((customer) => {
                const contract = getCustomerContract(customer.id);
                const statusConfig = {
                    'Active': { text: '활성', variant: 'default', icon: FileText },
                    'Expiring': { text: '만료 예정', variant: 'destructive', icon: ShieldAlert },
                } as const;
                const contractDisplay = contract ? statusConfig[contract.status as keyof typeof statusConfig] : null;

                return (
                  <TableRow key={customer.id} onClick={() => handleRowClick(customer)} className="cursor-pointer">
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.contactPerson}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>
                      {contractDisplay ? (
                        <Badge variant={contractDisplay.variant} className="gap-1">
                          {React.createElement(contractDisplay.icon, { className: 'size-3' })}
                          {contractDisplay.text}
                        </Badge>
                      ) : (<Badge variant="outline">계약 없음</Badge>)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }}>
                        </PaginationPrevious>
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (<PaginationItem key={page}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(page); }} isActive={currentPage === page}>{page}</PaginationLink></PaginationItem>))}
                    <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}>
                        </PaginationNext>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </CardFooter>
      </Card>
      
      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent className="sm:max-w-2xl w-full">
            {isEditingCustomer ? (
                <Form {...customerForm}>
                    <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)}>
                        <SheetHeader>
                            <SheetTitle className="font-headline text-2xl flex items-center gap-2">
                                <Users2/> {selectedCustomer ? '고객 정보 수정' : '신규 고객 추가'}
                            </SheetTitle>
                            <SheetDescription>
                                {selectedCustomer ? '고객사의 기본 정보를 수정합니다.' : '새로운 고객사 정보를 입력합니다.'}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                            <FormField control={customerForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>고객사명</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={customerForm.control} name="address" render={({ field }) => (<FormItem><FormLabel>주소</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={customerForm.control} name="contactPerson" render={({ field }) => (<FormItem><FormLabel>담당자명</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        </div>
                        <div className="mt-6 flex justify-between">
                            <Button type="submit" disabled={customerForm.formState.isSubmitting}>
                                {customerForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2"/>저장
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => selectedCustomer ? setIsEditingCustomer(false) : handleSheetClose()}><X className="mr-2"/>취소</Button>
                        </div>
                    </form>
                </Form>
            ) : selectedCustomer && (
                <>
                <SheetHeader className="pr-12">
                    <div className="flex justify-between items-start">
                        <div>
                            <SheetTitle className="font-headline text-2xl flex items-center gap-2"><Users2/> {selectedCustomer.name}</SheetTitle>
                            <SheetDescription className="flex flex-col gap-1.5 pt-2 text-sm">
                                <span className="flex items-center gap-2"><User className="size-4 text-muted-foreground"/> {selectedCustomer.contactPerson}</span>
                                <span className="flex items-center gap-2"><Building className="size-4 text-muted-foreground"/> {selectedCustomer.address}</span>
                            </SheetDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsEditingCustomer(true)}><Edit className="mr-2"/>수정</Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2"/>삭제</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>정말로 이 고객을 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 작업은 되돌릴 수 없습니다. 이 고객과 관련된 모든 활동 이력이 영구적으로 삭제됩니다.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCustomer}>삭제 확인</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-8rem)] mt-6 pr-6">
                <div className="space-y-8">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2"><NotepadText/> 활동 이력</CardTitle>
                            {!isAddingActivity && <Button size="sm" variant="outline" onClick={() => setIsAddingActivity(true)}><CirclePlus className="mr-2"/>기록 추가</Button>}
                        </CardHeader>
                        <CardContent>
                             {isAddingActivity && (
                                <Form {...activityForm}>
                                    <form onSubmit={activityForm.handleSubmit(onActivitySubmit)} className="p-4 border rounded-md mb-6 space-y-4 bg-muted/50">
                                        <FormField control={activityForm.control} name="type" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>활동 유형</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="유형을 선택하세요" /></SelectTrigger></FormControl>
                                                    <SelectContent>{activityTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={activityForm.control} name="content" render={({ field }) => (<FormItem><FormLabel>활동 내용</FormLabel><FormControl><Textarea placeholder="상세 내용을 입력하세요..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="ghost" onClick={() => setIsAddingActivity(false)}>취소</Button>
                                            <Button type="submit" disabled={activityForm.formState.isSubmitting}>{activityForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}기록</Button>
                                        </div>
                                    </form>
                                </Form>
                            )}

                            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:h-full before:w-0.5 before:bg-border">
                            {selectedCustomer.activityHistory.length > 0 ? selectedCustomer.activityHistory.map(activity => {
                                const ActivityIcon = activityTypeMap[activity.type].icon;
                                const iconColor = activityTypeMap[activity.type].color;
                                return (
                                <div key={activity.id} className="relative">
                                    <div className={`absolute -left-2.5 top-1 h-6 w-6 rounded-full bg-background flex items-center justify-center ring-4 ring-background`}>
                                      <ActivityIcon className={cn("size-5", iconColor)} />
                                    </div>
                                    <div className="pl-8">
                                      <div className="flex justify-between items-center"><p className="font-semibold text-sm">{activity.type}</p><p className="text-xs text-muted-foreground">{activity.date}</p></div>
                                      <p className="text-sm text-muted-foreground mt-1">{activity.content}</p>
                                      <p className="text-xs text-muted-foreground text-right mt-1">담당: {activity.manager}</p>
                                    </div>
                                </div>
                                )
                            }) : (<p className="text-sm text-muted-foreground text-center py-4">활동 이력이 없습니다.</p>)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                </ScrollArea>
                </>
            )}
        </SheetContent>
      </Sheet>
    </>
  );
}

    