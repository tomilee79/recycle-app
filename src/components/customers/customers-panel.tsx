

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { customers as initialCustomers, contracts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { PlusCircle, Building, User, FileText, Loader2, Users2, Search, Trash2, Edit, Save, X, MessageSquare, Handshake, ShieldAlert, CirclePlus, NotepadText, Star, TrendingUp, HandCoins } from "lucide-react";
import type { Customer, SalesActivity, Contract, CustomerTier } from '@/lib/types';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { subDays, parseISO, startOfMonth } from 'date-fns';

const activityTypeMap: { [key: string]: { icon: React.ElementType, color: string } } = {
    '상담': { icon: MessageSquare, color: 'text-blue-500' },
    '클레임': { icon: ShieldAlert, color: 'text-red-500' },
    '영업 기회': { icon: Handshake, color: 'text-yellow-500' },
    '계약': { icon: FileText, color: 'text-green-500' },
};
const activityTypes = Object.keys(activityTypeMap);

const tierMap: { [key in CustomerTier]: { label: string, color: string, icon: React.ElementType } } = {
    'VVIP': { label: 'VVIP', color: 'bg-purple-600 text-white', icon: Star },
    'VIP': { label: 'VIP', color: 'bg-yellow-500 text-white', icon: Star },
    'Gold': { label: 'Gold', color: 'bg-amber-400 text-white', icon: Star },
    'Silver': { label: 'Silver', color: 'bg-gray-400 text-white', icon: Star },
    'Bronze': { label: 'Bronze', color: 'bg-orange-400 text-white', icon: Star },
};

const newActivitySchema = z.object({
    type: z.enum(['상담', '클레임', '영업 기회', '계약']),
    content: z.string().min(10, "최소 10자 이상 입력해주세요."),
});

const customerFormSchema = z.object({
    name: z.string().min(2, "고객사명은 최소 2자 이상이어야 합니다."),
    address: z.string().optional(),
    contactPerson: z.string().optional(),
    tier: z.enum(['VVIP', 'VIP', 'Gold', 'Silver', 'Bronze']),
});

type NewActivityFormValues = z.infer<typeof newActivitySchema>;
type CustomerFormValues = z.infer<typeof customerFormSchema>;

export default function CustomersPanel() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [filters, setFilters] = useState({ tier: 'All', search: '' });
  const { toast } = useToast();

  const dashboardData = useMemo(() => {
    const totalCustomers = customers.length;
    const contractedCustomers = new Set(contracts.filter(c => c.status !== 'Terminated').map(c => c.customerId)).size;
    const newCustomersLast30Days = customers.filter(c => parseISO(c.activityHistory[c.activityHistory.length - 1]?.date || '1970-01-01') > subDays(new Date(), 30)).length;
    const contractStatusDistribution = contracts.reduce((acc, contract) => {
        const status = contract.status === 'Expiring' ? '만료 예정' : contract.status === 'Active' ? '활성' : '종료';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });
    
    const monthlyNewCustomers = customers.reduce((acc, customer) => {
        const joinDate = parseISO(customer.activityHistory[customer.activityHistory.length - 1]?.date || '1970-01-01');
        const monthKey = `${joinDate.getFullYear()}-${String(joinDate.getMonth() + 1).padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });
    
    return {
        totalCustomers,
        contractedCustomers,
        newCustomersLast30Days,
        contractStatusChartData: Object.entries(contractStatusDistribution).map(([name, value]) => ({ name, value })),
        newCustomersChartData: Object.entries(monthlyNewCustomers).map(([name, customers]) => ({ month: name, customers })).sort((a,b) => a.month.localeCompare(b.month)),
    };
  }, [customers, contracts]);

  const activityForm = useForm<NewActivityFormValues>({
    resolver: zodResolver(newActivitySchema),
    defaultValues: { type: '상담', content: '' },
  });

  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
  });

  const filteredCustomers = useMemo(() => 
    customers.filter(c => {
        const searchMatch = c.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                            c.address.toLowerCase().includes(filters.search.toLowerCase());
        const tierMatch = filters.tier === 'All' || c.tier === filters.tier;
        return searchMatch && tierMatch;
    }), [customers, filters]);

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
        tier: customer.tier,
    });
    setIsSheetOpen(true);
  };
  
  const handleNewCustomerClick = () => {
    setSelectedCustomer(null);
    setIsEditingCustomer(true);
    setIsAddingActivity(false);
    customerForm.reset({ name: '', address: '', contactPerson: '', tier: 'Bronze' });
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
            name: data.name,
            address: data.address || '',
            contactPerson: data.contactPerson || '',
            tier: data.tier,
            activityHistory: [{
                id: 'A000',
                date: new Date().toISOString().split('T')[0],
                type: '상담',
                content: '신규 고객 등록',
                manager: '관리자'
            }]
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

  const CustomerDashboard = () => {
     const chartConfigStatus = {
        value: { label: "고객 수" },
        "활성": { label: "활성", color: "hsl(var(--chart-2))" },
        "만료 예정": { label: "만료 예정", color: "hsl(var(--chart-4))" },
        "종료": { label: "종료", color: "hsl(var(--muted))" },
    };
    const chartConfigNew = {
        customers: { label: "신규 고객", color: "hsl(var(--primary))" }
    }

    return (
        <div className="space-y-6 mt-4">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">총 고객 수</CardTitle><Users2 className="h-4 w-4 text-muted-foreground"/></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{dashboardData.totalCustomers}</div><p className="text-xs text-muted-foreground">시스템에 등록된 모든 고객사</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">계약 고객 수</CardTitle><Handshake className="h-4 w-4 text-muted-foreground"/></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{dashboardData.contractedCustomers}</div><p className="text-xs text-muted-foreground">현재 활성 또는 만료 예정 계약 보유</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">신규 고객 (30일)</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground"/></CardHeader>
                    <CardContent><div className="text-2xl font-bold">+{dashboardData.newCustomersLast30Days}</div><p className="text-xs text-muted-foreground">최근 30일 내 등록된 신규 고객</p></CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>계약 상태 분포</CardTitle><CardDescription>현재 모든 계약의 상태 분포입니다.</CardDescription></CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfigStatus} className="h-64 w-full">
                            <ResponsiveContainer>
                                <PieChart>
                                    <RechartsTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Pie data={dashboardData.contractStatusChartData} dataKey="value" nameKey="name" innerRadius={50}>
                                        {dashboardData.contractStatusChartData.map(entry => <Cell key={entry.name} fill={chartConfigStatus[entry.name as keyof typeof chartConfigStatus]?.color} />)}
                                    </Pie>
                                    <Legend/>
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>월별 신규 고객 추이</CardTitle><CardDescription>지난 몇 달간의 신규 고객 확보 추세입니다.</CardDescription></CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfigNew} className="h-64 w-full">
                            <ResponsiveContainer>
                                <BarChart data={dashboardData.newCustomersChartData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
                                    <YAxis />
                                    <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <Bar dataKey="customers" fill="var(--color-customers)" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
  }

  return (
    <Card className="shadow-lg">
      <Tabs defaultValue="list">
        <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>고객 관리</CardTitle>
                <CardDescription>고객 현황 대시보드 및 상세 목록을 관리합니다.</CardDescription>
              </div>
              <TabsList>
                  <TabsTrigger value="dashboard">대시보드</TabsTrigger>
                  <TabsTrigger value="list">목록</TabsTrigger>
              </TabsList>
            </div>
        </CardHeader>
        <TabsContent value="dashboard">
            <CardContent>
                <CustomerDashboard />
            </CardContent>
        </TabsContent>
        <TabsContent value="list">
            <CardContent>
                <div className="flex items-center justify-between gap-2 my-4">
                    <div className="flex gap-2">
                        <Select value={filters.tier} onValueChange={(value) => setFilters(f => ({ ...f, tier: value }))}>
                            <SelectTrigger className="w-[180px]"><SelectValue placeholder="등급 필터" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">모든 등급</SelectItem>
                                {Object.keys(tierMap).map(t => <SelectItem key={t} value={t}>{tierMap[t as CustomerTier].label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="고객명, 주소로 검색..." value={filters.search} onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))} className="pl-9" />
                      </div>
                      <Button onClick={handleNewCustomerClick}><PlusCircle className="mr-2" />신규 고객</Button>
                    </div>
                </div>
              <Table>
                <TableHeader><TableRow><TableHead>고객명</TableHead><TableHead>등급</TableHead><TableHead>담당자</TableHead><TableHead>주소</TableHead><TableHead>계약 상태</TableHead></TableRow></TableHeader>
                <TableBody>
                  {paginatedCustomers.map((customer) => {
                    const contract = getCustomerContract(customer.id);
                    const statusConfig = {
                        'Active': { text: '활성', variant: 'default', icon: FileText },
                        'Expiring': { text: '만료 예정', variant: 'destructive', icon: ShieldAlert },
                    } as const;
                    const contractDisplay = contract ? statusConfig[contract.status as keyof typeof statusConfig] : null;
                    const tierInfo = tierMap[customer.tier];

                    return (
                      <TableRow key={customer.id} onClick={() => handleRowClick(customer)} className="cursor-pointer">
                        <TableCell className="font-medium">{customer.name}</TableCell>
                         <TableCell><Badge className={cn("gap-1 text-white", tierInfo.color)}>{React.createElement(tierInfo.icon, {className: 'size-3'})} {tierInfo.label}</Badge></TableCell>
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
                        <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }}/></PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (<PaginationItem key={page}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(page); }} isActive={currentPage === page}>{page}</PaginationLink></PaginationItem>))}
                        <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}/></PaginationItem>
                    </PaginationContent>
                </Pagination>
            </CardFooter>
        </TabsContent>
      </Tabs>

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent className="sm:max-w-2xl w-full">
            <ScrollArea className="h-full pr-6">
                <SheetHeader>
                    <div className="flex justify-between items-start">
                        {isEditingCustomer ? (
                            <div className="w-full">
                                <Form {...customerForm}>
                                    <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-4">
                                        <SheetTitle className="font-headline text-2xl flex items-center gap-2"><Users2/> {selectedCustomer ? '고객 정보 수정' : '신규 고객 추가'}</SheetTitle>
                                        <SheetDescription>{selectedCustomer ? '고객사의 기본 정보를 수정합니다.' : '새로운 고객사 정보를 입력합니다.'}</SheetDescription>
                                        <FormField control={customerForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>고객사명 <span className="text-destructive">*</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                        <FormField control={customerForm.control} name="tier" render={({ field }) => (<FormItem><FormLabel>고객 등급</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{Object.keys(tierMap).map(t=><SelectItem key={t} value={t}>{tierMap[t as CustomerTier].label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                                        <FormField control={customerForm.control} name="address" render={({ field }) => (<FormItem><FormLabel>주소</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                        <FormField control={customerForm.control} name="contactPerson" render={({ field }) => (<FormItem><FormLabel>담당자명</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button type="button" variant="ghost" onClick={() => selectedCustomer ? setIsEditingCustomer(false) : handleSheetClose()}>취소</Button>
                                            <Button type="submit" disabled={customerForm.formState.isSubmitting}>{customerForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}저장</Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        ) : selectedCustomer && (
                            <>
                            <div>
                                <div className="flex items-center gap-2">
                                    <SheetTitle className="font-headline text-2xl flex items-center gap-2"><Users2/> {selectedCustomer.name}</SheetTitle>
                                    <Badge className={cn("gap-1 text-white", tierMap[selectedCustomer.tier].color)}>{React.createElement(tierMap[selectedCustomer.tier].icon, {className: 'size-3'})} {tierMap[selectedCustomer.tier].label}</Badge>
                                </div>
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
                            </>
                        )}
                    </div>
                </SheetHeader>
                
                {selectedCustomer && !isEditingCustomer && (
                    <div className="mt-6 space-y-8">
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
                )}
            </ScrollArea>
        </SheetContent>
      </Sheet>
    </Card>
  );
}

