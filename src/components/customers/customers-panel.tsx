
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { customers as initialCustomers, contracts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { PlusCircle, Building, User, FileText, Loader2, Users2, Search, Trash2, Edit, Save, X, ChevronLeft, ChevronRight } from "lucide-react";
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


const activityTypeMap: { [key: string]: string } = {
    '상담': 'bg-blue-500',
    '클레임': 'bg-red-500',
    '영업 기회': 'bg-yellow-500',
    '계약': 'bg-green-500',
};

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
    customerForm.reset({ name: '', address: '', contactPerson: '' });
    setIsSheetOpen(true);
  }

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setSelectedCustomer(null);
    setIsEditingCustomer(false);
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
    
    setCustomers(prev => prev.map(c => 
      c.id === selectedCustomer.id 
        ? { ...c, activityHistory: [newActivity, ...c.activityHistory] } 
        : c
    ));
    setSelectedCustomer(prev => prev ? { ...prev, activityHistory: [newActivity, ...prev.activityHistory] } : null);
    
    toast({
      title: "활동 기록 추가 완료",
      description: `${selectedCustomer.name}의 새로운 활동이 기록되었습니다.`,
    });
    
    activityForm.reset();
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
                return (
                  <TableRow key={customer.id} onClick={() => handleRowClick(customer)} className="cursor-pointer">
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.contactPerson}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>
                      {contract ? (<Badge variant={contract.status === 'Active' ? 'default' : contract.status === 'Expiring' ? 'destructive' : 'secondary'}>{contract.status === 'Active' ? '활성' : '만료 예정'}</Badge>) : (<Badge variant="outline">계약 없음</Badge>)}
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
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }} disabled={currentPage === 1}>
                            <ChevronLeft className="h-4 w-4" />
                            <span>이전</span>
                        </PaginationPrevious>
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (<PaginationItem key={page}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(page); }} isActive={currentPage === page}>{page}</PaginationLink></PaginationItem>))}
                    <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }} disabled={currentPage === totalPages}>
                             <span>다음</span>
                            <ChevronRight className="h-4 w-4" />
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
                            <Button type="button" variant="ghost" onClick={() => setIsEditingCustomer(false)}><X className="mr-2"/>취소</Button>
                        </div>
                    </form>
                </Form>
            ) : selectedCustomer && (
                <>
                <SheetHeader className="pr-12">
                    <div className="flex justify-between items-start">
                        <div>
                            <SheetTitle className="font-headline text-2xl flex items-center gap-2"><Users2/> {selectedCustomer.name}</SheetTitle>
                            <SheetDescription className="flex items-center gap-4 pt-1">
                                <span className="flex items-center gap-1.5"><User className="size-4"/> {selectedCustomer.contactPerson}</span>
                                <span className="flex items-center gap-1.5"><Building className="size-4"/> {selectedCustomer.address}</span>
                            </SheetDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsEditingCustomer(true)}><Edit className="mr-2"/>수정</Button>
                    </div>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-8rem)] mt-6 pr-6">
                <div className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><PlusCircle/> 새 활동 기록</CardTitle></CardHeader>
                        <Form {...activityForm}>
                            <form onSubmit={activityForm.handleSubmit(onActivitySubmit)}>
                                <CardContent className="space-y-4">
                                <FormField control={activityForm.control} name="type" render={({ field }) => (<FormItem><FormLabel>활동 유형</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="유형을 선택하세요" /></SelectTrigger></FormControl><SelectContent><SelectItem value="상담">상담</SelectItem><SelectItem value="클레임">클레임</SelectItem><SelectItem value="영업 기회">영업 기회</SelectItem><SelectItem value="계약">계약</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                                <FormField control={activityForm.control} name="content" render={({ field }) => (<FormItem><FormLabel>활동 내용</FormLabel><FormControl><Textarea placeholder="상세 내용을 입력하세요..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                </CardContent>
                                <CardFooter><Button type="submit" disabled={activityForm.formState.isSubmitting}>{activityForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}기록 추가</Button></CardFooter>
                            </form>
                        </Form>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText/> 활동 이력</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                            {selectedCustomer.activityHistory.length > 0 ? selectedCustomer.activityHistory.map(activity => (
                                <div key={activity.id} className="relative pl-6">
                                    <div className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${activityTypeMap[activity.type]}`}></div>
                                    <div className="flex justify-between items-center"><p className="font-semibold text-sm">{activity.type}</p><p className="text-xs text-muted-foreground">{activity.date}</p></div>
                                    <p className="text-sm text-muted-foreground mt-1">{activity.content}</p>
                                    <p className="text-xs text-muted-foreground text-right mt-1">담당: {activity.manager}</p>
                                </div>
                            )) : (<p className="text-sm text-muted-foreground text-center py-4">활동 이력이 없습니다.</p>)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                </ScrollArea>
                <div className="absolute bottom-6 right-6">
                    <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2"/>고객 삭제</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>정말로 이 고객을 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 작업은 되돌릴 수 없습니다. 이 고객과 관련된 모든 활동 이력이 영구적으로 삭제됩니다.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCustomer}>삭제 확인</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                </>
            )}
        </SheetContent>
      </Sheet>
    </>
  );
}
