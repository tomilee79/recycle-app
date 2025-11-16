
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { customers, quotes as initialQuotes } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, FileText, Trash2, X, Search, FileSignature, MoreHorizontal, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Quote, QuoteItem, QuoteStatus } from '@/lib/types';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

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
  items: z.array(quoteItemSchema).min(1, "최소 1개의 항목을 추가해야 합니다."),
  notes: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

export default function QuotesPanel() {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | QuoteStatus>('All');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch('items');
  const watchedStatus = form.watch('status');

  const calculateTotals = useCallback((items: any[]) => {
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, []);

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name && (name.startsWith('items.') && (name.endsWith('.quantity') || name.endsWith('.unitPrice')))) {
        const items = form.getValues('items');
        items.forEach((item, index) => {
          items[index].total = (item.quantity || 0) * (item.unitPrice || 0);
        });
        form.setValue('items', items, { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleNewQuote = () => {
    setSelectedQuote(null);
    const newQuoteId = `Q-${format(new Date(), 'yyyy')}-${String(quotes.length + 1).padStart(3, '0')}`;
    form.reset({
      id: newQuoteId,
      customerId: '',
      status: 'Draft',
      items: [{ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 }],
      notes: '',
    });
    setIsSheetOpen(true);
  };

  const handleRowClick = (quote: Quote) => {
    setSelectedQuote(quote);
    form.reset({
      id: quote.id,
      customerId: quote.customerId,
      status: quote.status,
      items: quote.items.map(item => ({...item})),
      notes: quote.notes || '',
    });
    setIsSheetOpen(true);
  };
  
  const handleDelete = (quoteId: string) => {
      setQuotes(quotes.filter(q => q.id !== quoteId));
      if (selectedQuote?.id === quoteId) {
        setIsSheetOpen(false);
      }
      toast({
          title: "견적 삭제됨",
          description: `${quoteId} 견적이 성공적으로 삭제되었습니다.`,
          variant: "destructive"
      });
  }

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
  
  const getCustomerName = (customerId: string) => customers.find(c => c.id === customerId)?.name || '알수없음';
  
  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
        const customerName = getCustomerName(q.customerId).toLowerCase();
        const searchTerm = search.toLowerCase();
        const statusMatch = filter === 'All' || q.status === filter;
        const searchMatch = customerName.includes(searchTerm) || q.id.toLowerCase().includes(searchTerm);
        return statusMatch && searchMatch;
    }).sort((a, b) => new Date(b.quoteDate).getTime() - new Date(a.quoteDate).getTime());
  }, [quotes, filter, search]);

  const {
    currentPage,
    setCurrentPage,
    paginatedData,
    totalPages,
  } = usePagination(filteredQuotes, 10);

  const { subtotal, tax, total } = useMemo(() => calculateTotals(watchItems || []), [watchItems, calculateTotals]);

  const handleConvertToContract = () => {
      if (!selectedQuote) return;
      // In a real app, this would navigate to a new contract page with pre-filled data.
      // For this mock-up, we just show a toast.
      toast({
          title: "계약 생성됨",
          description: `${selectedQuote.id} 견적을 기반으로 신규 계약이 생성되었습니다.`,
      });
      setIsSheetOpen(false);
  }

  const handleCloneQuote = (quoteToClone: Quote) => {
    setSelectedQuote(null);
    const newQuoteId = `Q-${format(new Date(), 'yyyy')}-${String(quotes.length + 1).padStart(3, '0')}`;
    form.reset({
      id: newQuoteId,
      customerId: quoteToClone.customerId,
      status: 'Draft',
      items: quoteToClone.items.map(item => ({ ...item, id: `item-${Date.now()}-${Math.random()}` })),
      notes: quoteToClone.notes,
    });
    setIsSheetOpen(true);
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>견적 관리</CardTitle>
                <CardDescription>모든 견적을 생성, 조회, 수정 및 관리합니다.</CardDescription>
              </div>
              <Button onClick={handleNewQuote}>
                  <PlusCircle className="mr-2"/>
                  새 견적 작성
              </Button>
            </div>
             <div className="flex items-center justify-between gap-2 pt-4">
                <div className="flex gap-2">
                    {(['All', 'Draft', 'Sent', 'Accepted', 'Rejected'] as const).map(f => (
                        <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                            {f === 'All' ? '전체' : quoteStatusMap[f]}
                        </Button>
                    ))}
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="고객사명, 견적번호 검색..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>견적 번호</TableHead>
                <TableHead>고객사</TableHead>
                <TableHead>견적일</TableHead>
                <TableHead>총액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right w-[80px]">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((quote) => (
                <TableRow key={quote.id} onClick={() => handleRowClick(quote)} className="cursor-pointer">
                  <TableCell className="font-medium">{quote.id}</TableCell>
                  <TableCell>{getCustomerName(quote.customerId)}</TableCell>
                  <TableCell>{quote.quoteDate}</TableCell>
                  <TableCell>{quote.total.toLocaleString()}원</TableCell>
                  <TableCell>
                    <Badge variant={quoteStatusVariant[quote.status]}>
                      {quoteStatusMap[quote.status]}
                    </Badge>
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
                            <DropdownMenuItem onSelect={() => handleCloneQuote(quote)}>
                                <Copy className="mr-2 h-4 w-4" />
                                <span>복제</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
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
                              <AlertDialogAction onClick={() => handleDelete(quote.id)}>삭제 확인</AlertDialogAction>
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
                    <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }} disabled={currentPage === 1} />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <PaginationItem key={page}>
                            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(page); }} isActive={currentPage === page}>
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }} disabled={currentPage === totalPages} />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </CardFooter>
      </Card>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-3xl w-full">
            <SheetHeader>
                <SheetTitle className="text-2xl flex items-center gap-2">
                    <FileText/> {selectedQuote ? `견적 수정: ${selectedQuote.id}` : '새 견적 작성'}
                </SheetTitle>
                <SheetDescription>
                    {selectedQuote ? '견적 내용을 수정하고 상태를 변경할 수 있습니다.' : '새로운 견적을 생성합니다.'}
                </SheetDescription>
            </SheetHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4 h-full flex flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto pr-6">
                <div className="grid grid-cols-2 gap-4">
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>견적 상태</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="상태를 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                             {(Object.keys(quoteStatusMap) as QuoteStatus[]).map(status => (
                                 <SelectItem key={status} value={status}>{quoteStatusMap[status]}</SelectItem>
                             ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">견적 항목</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {fields.map((field, index) => (
                           <div key={field.id} className="flex gap-2 items-end">
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel className={cn(index !== 0 && "sr-only")}>항목</FormLabel>
                                            <Input {...field} placeholder="예: 폐 플라스틱 처리비"/>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem className="w-20">
                                            <FormLabel className={cn(index !== 0 && "sr-only")}>수량</FormLabel>
                                            <Input type="number" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.unitPrice`}
                                    render={({ field }) => (
                                        <FormItem className="w-32">
                                            <FormLabel className={cn(index !== 0 && "sr-only")}>단가</FormLabel>
                                            <Input type="number" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="w-32">
                                     <p className={cn("text-sm font-medium leading-none", index !== 0 && "sr-only")}>합계</p>
                                     <p className="p-2 h-10 flex items-center">{watchItems?.[index]?.total.toLocaleString() ?? 0}원</p>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="size-4 text-destructive"/>
                                </Button>
                           </div>
                        ))}
                         <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => append({ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 })}
                        >
                            항목 추가
                        </Button>
                         {form.formState.errors.items && typeof form.formState.errors.items === 'object' && 'message' in form.formState.errors.items && <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>}
                    </CardContent>
                </Card>

                 <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between"><span>소계</span><span>{subtotal.toLocaleString()}원</span></div>
                        <div className="flex justify-between"><span>세금 (10%)</span><span>{tax.toLocaleString()}원</span></div>
                        <div className="flex justify-between font-bold text-lg"><span>총계</span><span>{total.toLocaleString()}원</span></div>
                    </div>
                 </div>
                 
                 <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>메모</FormLabel>
                            <FormControl>
                                <Textarea placeholder="견적 관련 메모를 입력하세요..." {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                 />

              </div>
              <div className="flex justify-between items-center pt-6">
                <div>
                  <Button type="submit" disabled={form.formState.isSubmitting || watchedStatus === 'Accepted'}>
                      {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {selectedQuote ? '견적 저장' : '견적 생성'}
                  </Button>
                   {selectedQuote && watchedStatus === 'Accepted' && (
                       <Button type="button" variant="secondary" onClick={handleConvertToContract} className="ml-2">
                           <FileSignature className="mr-2" />
                           계약으로 전환
                       </Button>
                   )}
                </div>
                {selectedQuote && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
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
                                <AlertDialogAction onClick={() => handleDelete(selectedQuote.id)}>삭제 확인</AlertDialogAction>
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

    