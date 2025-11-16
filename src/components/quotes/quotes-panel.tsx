

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { customers, quotes as initialQuotes, users } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, FileText, Trash2, X, Search, FileSignature, MoreHorizontal, Copy, ArrowUp, ArrowDown, Upload, Paperclip, BarChart, PieChart, TrendingUp, FileCheck, CircleDotDashed, Mail, Printer, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Quote, QuoteItem, QuoteStatus, Attachment, StatusHistory } from '@/lib/types';
import { format, addDays, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval, formatISO, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const quoteStatusMap: { [key in QuoteStatus]: string } = {
  'Draft': '초안',
  'Sent': '전송됨',
  'Accepted': '승인됨',
  'Rejected': '거절됨',
};

const quoteStatusVariant: { [key in QuoteStatus]: "default" | "secondary" | "destructive" | "outline" } = {
  'Accepted': 'default',
  'Sent': 'secondary',
  'Draft': 'outline',
  'Rejected': 'destructive',
};

const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string(),
});

const statusHistorySchema = z.object({
    status: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected']),
    date: z.string(),
});

const quoteItemSchema = z.object({
    id: z.string(),
    description: z.string().min(1, "항목을 입력해주세요."),
    quantity: z.coerce.number().min(1, "수량은 1 이상이어야 합니다."),
    unitPrice: z.coerce.number().min(0, "단가는 0 이상이어야 합니다."),
    total: z.number(),
});

const quoteFormSchema = z.object({
  id: z.string(),
  customerId: z.string().min(1, "고객사를 선택해주세요."),
  status: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected']),
  statusHistory: z.array(statusHistorySchema).optional(),
  items: z.array(quoteItemSchema).min(1, "최소 1개의 항목을 추가해야 합니다."),
  notes: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;
type SortableField = 'id' | 'customerName' | 'quoteDate' | 'total' | 'status';

export default function QuotesPanel() {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [initialStatus, setInitialStatus] = useState<QuoteStatus | null>(null);
  const [filter, setFilter] = useState<'All' | QuoteStatus>('All');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableField; direction: 'ascending' | 'descending' } | null>(null);
  const { toast } = useToast();

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
  });

  const getCustomerName = useCallback((customerId: string) => customers.find(c => c.id === customerId)?.name || '알수없음', []);
  
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const { fields: attachments, append: appendAttachment, remove: removeAttachment } = useFieldArray({
    control: form.control,
    name: "attachments",
  });
  
  const watchItems = form.watch('items');
  const watchedStatus = form.watch('status');

  useEffect(() => {
    if (watchedStatus && initialStatus && watchedStatus !== initialStatus) {
      const newHistoryEntry: StatusHistory = { status: watchedStatus, date: formatISO(new Date()) };
      const currentHistory = form.getValues('statusHistory') || [];
      form.setValue('statusHistory', [...currentHistory, newHistoryEntry]);
      setInitialStatus(watchedStatus); 
    }
  }, [watchedStatus, initialStatus, form]);

  useEffect(() => {
    if (!watchItems) return;
    watchItems.forEach((item, index) => {
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      const newTotal = quantity * unitPrice;
      if (item.total !== newTotal) {
        update(index, { ...item, total: newTotal });
      }
    });
  }, [watchItems, update]);


  const dashboardData = useMemo(() => {
    const totalQuotes = quotes.length;
    const acceptedQuotes = quotes.filter(q => q.status === 'Accepted');
    const pendingQuotes = quotes.filter(q => q.status === 'Draft' || q.status === 'Sent');
    const totalAcceptedValue = acceptedQuotes.reduce((sum, q) => sum + q.total, 0);

    const monthlyData = Array.from({ length: 6 }).map((_, i) => {
      const month = subMonths(new Date(), 5 - i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthLabel = format(month, 'yyyy-MM');
      
      const monthlyAccepted = quotes.filter(q => q.status === 'Accepted' && isWithinInterval(parseISO(q.quoteDate), { start: monthStart, end: monthEnd })).length;
      const monthlyRejected = quotes.filter(q => q.status === 'Rejected' && isWithinInterval(parseISO(q.quoteDate), { start: monthStart, end: monthEnd })).length;

      return { name: monthLabel, accepted: monthlyAccepted, rejected: monthlyRejected };
    });

    const statusDistribution = quotes.reduce((acc, q) => {
        const statusLabel = quoteStatusMap[q.status];
        acc[statusLabel] = (acc[statusLabel] || 0) + 1;
        return acc;
    }, {} as {[key: string]: number});

    return {
      totalQuotes,
      acceptedCount: acceptedQuotes.length,
      pendingCount: pendingQuotes.length,
      totalAcceptedValue,
      monthlyChartData: monthlyData,
      statusChartData: Object.entries(statusDistribution).map(([name, value]) => ({ name, value })),
    };
  }, [quotes]);

  const sortedAndFilteredQuotes = useMemo(() => {
    let filteredQuotes = quotes
      .map(q => ({ ...q, customerName: getCustomerName(q.customerId) }))
      .filter(q => {
        const searchTerm = search.toLowerCase();
        const statusMatch = filter === 'All' || q.status === filter;
        const searchMatch = q.customerName.toLowerCase().includes(searchTerm) || q.id.toLowerCase().includes(searchTerm);
        return statusMatch && searchMatch;
      });

    if (sortConfig !== null) {
      filteredQuotes.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    } else {
        filteredQuotes.sort((a, b) => new Date(b.quoteDate).getTime() - new Date(a.quoteDate).getTime());
    }

    return filteredQuotes;
  }, [quotes, filter, search, sortConfig, getCustomerName]);
  
  const {
    currentPage,
    setCurrentPage,
    paginatedData,
    totalPages,
  } = usePagination(sortedAndFilteredQuotes, 10);

  const calculateTotals = useCallback((items: any[]) => {
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, []);

  const handleNewQuote = () => {
    setSelectedQuote(null);
    const newQuoteId = `Q-${format(new Date(), 'yyyy')}-${String(quotes.length + 1).padStart(3, '0')}`;
    form.reset({
      id: newQuoteId,
      customerId: '',
      status: 'Draft',
      statusHistory: [{ status: 'Draft', date: formatISO(new Date()) }],
      items: [{ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 }],
      notes: '',
      attachments: [],
    });
    setInitialStatus('Draft');
    setIsSheetOpen(true);
  };
  
  const handleCloneQuote = (quoteToClone: Quote) => {
    const newQuoteId = `Q-${format(new Date(), 'yyyy')}-${String(quotes.length + 1).padStart(3, '0')}`;
    setSelectedQuote(null);
    form.reset({
      ...quoteToClone,
      id: newQuoteId,
      status: 'Draft',
      statusHistory: [{ status: 'Draft', date: formatISO(new Date()) }],
    });
    setInitialStatus('Draft');
    setIsSheetOpen(true);
  };

  const handleRowClick = (quote: Quote) => {
    setSelectedQuote(quote);
    form.reset({
      id: quote.id,
      customerId: quote.customerId,
      status: quote.status,
      statusHistory: quote.statusHistory || [{ status: quote.status, date: formatISO(parseISO(quote.quoteDate)) }],
      items: quote.items.map(item => ({...item})),
      notes: quote.notes || '',
      attachments: quote.attachments || [],
    });
    setInitialStatus(quote.status);
    setIsSheetOpen(true);
  };

  const onSubmit: SubmitHandler<QuoteFormValues> = (data) => {
    const { subtotal, tax, total } = calculateTotals(data.items);
    const newQuote: Quote = {
        ...data,
        quoteDate: selectedQuote ? selectedQuote.quoteDate : format(new Date(), 'yyyy-MM-dd'),
        expiryDate: selectedQuote ? selectedQuote.expiryDate : format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        subtotal,
        tax,
        total,
    };

    if (selectedQuote) {
      setQuotes(quotes.map(q => q.id === newQuote.id ? newQuote : q));
      toast({ title: "견적 업데이트됨", description: `${newQuote.id} 견적이 성공적으로 업데이트되었습니다.` });
    } else {
      setQuotes([newQuote, ...quotes]);
      toast({ title: "견적 생성됨", description: `${newQuote.id} 견적이 성공적으로 생성되었습니다.` });
    }
    setIsSheetOpen(false);
  };
  
  const { subtotal, tax, total } = useMemo(() => calculateTotals(watchItems || []), [watchItems, calculateTotals]);

  const handleConvertToContract = () => {
      if (!selectedQuote) return;
      toast({
          title: "계약 생성됨",
          description: `${selectedQuote.id} 견적을 기반으로 신규 계약이 생성되었습니다.`,
      });
      setIsSheetOpen(false);
  }
  
  const handlePrint = () => {
      window.print();
  }

  const handleEmail = () => {
      if (!selectedQuote) return;
      const customer = customers.find(c => c.id === selectedQuote.customerId);
      const customerEmail = customer ? `${customer.contactPerson.toLowerCase().replace(' ', '.')}@example.com` : '';
      const subject = `[리사이클] 견적서 (${selectedQuote.id}) 송부의 건`;
      const body = `
안녕하세요, ${customer?.name || ''} ${customer?.contactPerson || ''}님.

리사이클입니다.
요청하신 견적서(${selectedQuote.id})를 첨부하여 보내드립니다.

총 견적 금액: ${selectedQuote.total.toLocaleString()}원

내용 확인 후 회신 부탁드립니다.

감사합니다.
리사이클 드림
      `.trim().replace(/\n/g, '%0A');

      window.location.href = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const requestSort = (key: SortableField) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortableField) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const handleFileDrop = (files: FileList | null) => {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        appendAttachment({
            id: `att-${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file)
        });
    }
  }

  return (
    <>
    <Card className="shadow-lg">
      <Tabs defaultValue="dashboard">
        <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>견적 관리</CardTitle>
                <CardDescription>견적 대시보드 및 상세 목록을 관리합니다.</CardDescription>
              </div>
              <TabsList>
                  <TabsTrigger value="dashboard">대시보드</TabsTrigger>
                  <TabsTrigger value="list">목록</TabsTrigger>
              </TabsList>
            </div>
        </CardHeader>
        <TabsContent value="dashboard">
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">총 견적 수</CardTitle><FileText className="h-4 w-4 text-muted-foreground"/></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{dashboardData.totalQuotes}</div><p className="text-xs text-muted-foreground">시스템에 등록된 모든 견적</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">승인된 견적</CardTitle><FileCheck className="h-4 w-4 text-green-500"/></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{dashboardData.acceptedCount}</div><p className="text-xs text-muted-foreground">계약으로 이어진 견적</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">대기중 견적</CardTitle><CircleDotDashed className="h-4 w-4 text-yellow-500"/></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{dashboardData.pendingCount}</div><p className="text-xs text-muted-foreground">초안 및 전송된 견적</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">총 승인액</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground"/></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{dashboardData.totalAcceptedValue.toLocaleString()} 원</div><p className="text-xs text-muted-foreground">모든 승인 견적의 합계</p></CardContent>
                    </Card>
                </div>
                 <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>월별 견적 추이</CardTitle><CardDescription>지난 6개월간의 견적 승인/거절 추이입니다.</CardDescription></CardHeader>
                        <CardContent>
                            <ChartContainer config={{ accepted: { label: '승인', color: 'hsl(var(--chart-2))' }, rejected: { label: '거절', color: 'hsl(var(--chart-5))' } }} className="h-64 w-full">
                                <RechartsBarChart data={dashboardData.monthlyChartData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
                                    <YAxis />
                                    <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <Legend />
                                    <Bar dataKey="accepted" fill="var(--color-accepted)" radius={4} />
                                    <Bar dataKey="rejected" fill="var(--color-rejected)" radius={4} />
                                </RechartsBarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>견적 상태 분포</CardTitle><CardDescription>현재 모든 견적의 상태 분포입니다.</CardDescription></CardHeader>
                        <CardContent>
                             <ChartContainer config={Object.fromEntries(Object.entries(quoteStatusMap).map(([k,v]) => [v, {label: v, color: `hsl(var(--${quoteStatusVariant[k as QuoteStatus]}))`}] )) } className="h-64 w-full">
                                <RechartsPieChart>
                                    <RechartsTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Pie data={dashboardData.statusChartData} dataKey="value" nameKey="name" innerRadius={50}>
                                        {dashboardData.statusChartData.map(entry => <Cell key={entry.name} fill={ `var(--color-${entry.name})` } />)}
                                    </Pie>
                                    <Legend/>
                                </RechartsPieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </TabsContent>
        <TabsContent value="list">
          <CardContent>
            <div className="flex items-center justify-between gap-2 py-4">
              <div className="flex gap-2">
                  {(['All', 'Draft', 'Sent', 'Accepted', 'Rejected'] as const).map(f => (
                      <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                          {f === 'All' ? '전체' : quoteStatusMap[f]}
                      </Button>
                  ))}
              </div>
              <div className='flex gap-2'>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="고객사명, 견적번호 검색..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                 <Button onClick={handleNewQuote}>
                    <PlusCircle className="mr-2"/>
                    새 견적 작성
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Button variant="ghost" onClick={() => requestSort('id')}>견적 번호{getSortIcon('id')}</Button></TableHead>
                  <TableHead><Button variant="ghost" onClick={() => requestSort('customerName')}>고객사{getSortIcon('customerName')}</Button></TableHead>
                  <TableHead><Button variant="ghost" onClick={() => requestSort('quoteDate')}>견적일{getSortIcon('quoteDate')}</Button></TableHead>
                  <TableHead><Button variant="ghost" onClick={() => requestSort('total')}>총액{getSortIcon('total')}</Button></TableHead>
                  <TableHead><Button variant="ghost" onClick={() => requestSort('status')}>상태{getSortIcon('status')}</Button></TableHead>
                  <TableHead className="w-16">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((quote) => (
                  <TableRow key={quote.id} onClick={() => handleRowClick(quote)} className="cursor-pointer">
                    <TableCell className="font-medium">{quote.id}</TableCell>
                    <TableCell>{quote.customerName}</TableCell>
                    <TableCell>{quote.quoteDate}</TableCell>
                    <TableCell>{quote.total.toLocaleString()}원</TableCell>
                    <TableCell>
                      <Badge variant={quoteStatusVariant[quote.status]}>
                        {quoteStatusMap[quote.status]}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                       <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => handleCloneQuote(quote)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    <span>복제</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
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
                                    이 작업은 되돌릴 수 없습니다. {quote.id} 견적이 영구적으로 삭제됩니다.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                        setQuotes(quotes.filter(q => q.id !== quote.id));
                                        toast({ title: "견적 삭제됨", description: `${quote.id} 견적이 삭제되었습니다.`, variant: "destructive"});
                                    }}>삭제 확인</AlertDialogAction>
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
        </TabsContent>
      </Tabs>
    </Card>
      
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent className="sm:max-w-4xl w-full flex flex-col">
          <SheetHeader>
              <SheetTitle className="text-2xl flex items-center gap-2">
                  <FileText/> {selectedQuote ? `견적 수정: ${selectedQuote.id}` : '새 견적 작성'}
              </SheetTitle>
              <SheetDescription>
                  {selectedQuote ? '견적 내용을 수정하고 상태를 변경할 수 있습니다.' : '새로운 견적을 생성합니다.'}
              </SheetDescription>
          </SheetHeader>
          <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
            <div className="space-y-6 mt-4 overflow-y-auto pr-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="customerId" render={({ field }) => ( <FormItem><FormLabel>고객사</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="고객사를 선택하세요" /></SelectTrigger></FormControl><SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                 <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>견적 상태</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="상태를 선택하세요" /></SelectTrigger></FormControl><SelectContent>{(Object.keys(quoteStatusMap) as QuoteStatus[]).map(status => (<SelectItem key={status} value={status}>{quoteStatusMap[status]}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)}/>
              </div>
              <Card>
                  <CardHeader><CardTitle className="text-base">견적 항목</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                      {fields.map((field, index) => (
                         <div key={field.id} className="flex gap-2 items-end">
                              <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => ( <FormItem className="flex-1"><FormLabel className={cn(index !== 0 && "sr-only")}>항목</FormLabel><Input {...field} placeholder="예: 폐 플라스틱 처리비"/><FormMessage /></FormItem>)}/>
                              <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => ( <FormItem className="w-20"><FormLabel className={cn(index !== 0 && "sr-only")}>수량</FormLabel><Input type="number" {...field} /><FormMessage /></FormItem>)}/>
                              <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => ( <FormItem className="w-32"><FormLabel className={cn(index !== 0 && "sr-only")}>단가</FormLabel><Input type="number" {...field} /><FormMessage /></FormItem>)}/>
                              <div className="w-32"><p className={cn("text-sm font-medium leading-none", index !== 0 && "sr-only")}>합계</p><p className="p-2 h-10 flex items-center">{((watchItems?.[index]?.total || 0)).toLocaleString()}원</p></div>
                              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="size-4 text-destructive"/></Button>
                         </div>
                      ))}
                       <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 })}>항목 추가</Button>
                       {form.formState.errors.items && typeof form.formState.errors.items === 'object' && 'message' in form.formState.errors.items && <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>}
                  </CardContent>
                  <CardFooter className="justify-end">
                      <div className="w-64 space-y-2">
                          <div className="flex justify-between"><span>소계</span><span>{subtotal.toLocaleString()}원</span></div>
                          <div className="flex justify-between"><span>세금 (10%)</span><span>{tax.toLocaleString()}원</span></div>
                          <div className="flex justify-between font-bold text-lg"><span>총계</span><span>{total.toLocaleString()}원</span></div>
                      </div>
                  </CardFooter>
              </Card>
              <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>메모</FormLabel><FormControl><Textarea placeholder="견적 관련 메모를 입력하세요..." {...field} /></FormControl></FormItem>)}/>
              <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Paperclip/>첨부 파일</CardTitle></CardHeader>
                  <CardContent>
                      <div className="space-y-2">
                          <label htmlFor="file-upload" onDrop={(e) => { e.preventDefault(); handleFileDrop(e.dataTransfer.files); }} onDragOver={(e) => e.preventDefault()} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"><div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-4 text-muted-foreground" /><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭</p><p className="text-xs text-muted-foreground">PDF, JPG, PNG 등</p></div><Input id="file-upload" type="file" className="hidden" multiple onChange={(e) => handleFileDrop(e.target.files)}/></label>
                          {attachments.map((att, index) => (
                              <div key={att.id} className="flex items-center justify-between p-2 rounded-md border"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{att.name}</span><span className="text-xs text-muted-foreground">({(att.size / 1024).toFixed(1)} KB)</span></div><Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAttachment(index)}><X className="h-4 w-4"/></Button></div>
                          ))}
                      </div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><History />상태 변경 이력</CardTitle></CardHeader>
                  <CardContent>
                      <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:h-full before:w-0.5 before:bg-border">
                          {(form.getValues('statusHistory') || []).map((history, index) => (
                              <div key={index} className="relative">
                                  <div className="absolute -left-2.5 top-1 h-6 w-6 rounded-full bg-background flex items-center justify-center ring-4 ring-background"><FileCheck className="size-4 text-primary" /></div>
                                  <div className="pl-8">
                                      <p className="font-semibold text-sm">상태 변경: {quoteStatusMap[history.status]}</p>
                                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(parseISO(history.date), { addSuffix: true, locale: ko })}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </CardContent>
              </Card>
            </div>
              <div className="flex justify-between items-center pt-6 pr-6 mt-auto">
                <div className="flex gap-2">
                  <Button type="submit" disabled={form.formState.isSubmitting || watchedStatus === 'Accepted'}>
                      {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {selectedQuote ? '견적 저장' : '견적 생성'}
                  </Button>
                   {selectedQuote && watchedStatus === 'Accepted' && (
                       <Button type="button" variant="secondary" onClick={handleConvertToContract}>
                           <FileSignature className="mr-2" />
                           계약으로 전환
                       </Button>
                   )}
                   {selectedQuote && (
                    <div className="flex gap-2">
                       <Button type="button" variant="outline" onClick={handlePrint}><Printer className="mr-2"/>인쇄</Button>
                       <Button type="button" variant="outline" onClick={handleEmail}><Mail className="mr-2"/>이메일 전송</Button>
                    </div>
                   )}
                </div>
                {selectedQuote && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive">
                                <Trash2 className="mr-2"/>
                                삭제
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    이 작업은 되돌릴 수 없습니다. {selectedQuote.id} 견적이 영구적으로 삭제됩니다.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                    setQuotes(quotes.filter(q => q.id !== selectedQuote.id));
                                    setIsSheetOpen(false);
                                    toast({ title: "견적 삭제됨", description: `${selectedQuote.id} 견적이 삭제되었습니다.`, variant: "destructive"});
                                }}>삭제 확인</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
              </div>
          </form>
          </Form>
      </SheetContent>
    </Sheet>
    </>
  );
}
