
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { customers, contracts as initialContracts } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Search, FileSignature, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Contract, ContractItem, ContractStatus } from '@/lib/types';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';

const contractStatusMap: { [key in ContractStatus]: string } = {
  'Active': '활성',
  'Expiring': '만료 예정',
  'Terminated': '종료',
};

const contractStatusVariant: { [key in ContractStatus]: "default" | "destructive" | "secondary" } = {
  'Active': 'default',
  'Expiring': 'destructive',
  'Terminated': 'secondary',
};

const contractItemSchema = z.object({
    id: z.string(),
    materialType: z.string().min(1, "품목을 입력해주세요."),
    unitPrice: z.coerce.number().min(0, "단가는 0 이상이어야 합니다."),
});

const contractFormSchema = z.object({
  id: z.string(),
  customerId: z.string().min(1, "고객사를 선택해주세요."),
  contractNumber: z.string(),
  status: z.enum(['Active', 'Expiring', 'Terminated']),
  startDate: z.date({ required_error: "시작일을 선택해주세요." }),
  endDate: z.date({ required_error: "종료일을 선택해주세요." }),
  items: z.array(contractItemSchema).min(1, "최소 1개의 품목을 추가해야 합니다."),
  notes: z.string().optional(),
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

export default function ContractsPanel() {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | ContractStatus>('All');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const getCustomerName = (customerId: string) => customers.find(c => c.id === customerId)?.name || '알수없음';

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
  });
  
  const filteredContractsMemo = useMemo(() => {
    return contracts.filter(c => {
        const customerName = getCustomerName(c.customerId).toLowerCase();
        const searchTerm = search.toLowerCase();
        const statusMatch = filter === 'All' || c.status === filter;
        const searchMatch = customerName.includes(searchTerm) || c.contractNumber.toLowerCase().includes(searchTerm);
        return statusMatch && searchMatch;
    });
  }, [contracts, filter, search]);
  
  const {
    currentPage,
    setCurrentPage,
    paginatedData: paginatedContracts,
    totalPages,
  } = usePagination(filteredContractsMemo, 10);


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const openDialog = (contract: Contract | null) => {
    setSelectedContract(contract);
    if (contract) {
        form.reset({
            ...contract,
            startDate: new Date(contract.startDate),
            endDate: new Date(contract.endDate),
        });
    } else {
        const newId = `CT${String(contracts.length + 1).padStart(3, '0')}`;
        const newNumber = `C${format(new Date(), 'yyyyMMdd')}-${String(contracts.length + 1).padStart(3, '0')}`;
        form.reset({
            id: newId,
            contractNumber: newNumber,
            customerId: '',
            status: 'Active',
            startDate: new Date(),
            endDate: addDays(new Date(), 365),
            items: [{ id: `item-${Date.now()}`, materialType: '', unitPrice: 0 }],
            notes: '',
        });
    }
    setIsDialogOpen(true);
  }

  const onSubmit: SubmitHandler<ContractFormValues> = (data) => {
    const newContract: Contract = {
        ...data,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: format(data.endDate, 'yyyy-MM-dd'),
    };

    if (selectedContract) {
      setContracts(contracts.map(c => c.id === newContract.id ? newContract : c));
      toast({ title: "계약 수정됨", description: `${newContract.contractNumber} 계약이 성공적으로 수정되었습니다.` });
    } else {
      setContracts([newContract, ...contracts]);
      toast({ title: "계약 생성됨", description: `${newContract.contractNumber} 계약이 성공적으로 생성되었습니다.` });
    }
    setIsDialogOpen(false);
  };
  

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>계약 관리</CardTitle>
            <CardDescription>모든 고객 계약을 생성, 조회, 수정 및 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex gap-2">
                    {(['All', 'Active', 'Expiring', 'Terminated'] as const).map(f => (
                        <Button key={f} variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
                            {f === 'All' ? '전체' : contractStatusMap[f]}
                        </Button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="고객사명, 계약번호 검색..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button onClick={() => openDialog(null)}>
                        <PlusCircle className="mr-2"/>
                        신규 계약
                    </Button>
                </div>
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>계약번호</TableHead>
                <TableHead>고객사</TableHead>
                <TableHead>시작일</TableHead>
                <TableHead>종료일</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContracts.map((contract) => (
                <TableRow key={contract.id} onClick={() => openDialog(contract)} className="cursor-pointer">
                  <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                  <TableCell>{getCustomerName(contract.customerId)}</TableCell>
                  <TableCell>{contract.startDate}</TableCell>
                  <TableCell>{contract.endDate}</TableCell>
                  <TableCell>
                    <Badge variant={contractStatusVariant[contract.status]}>
                      {contractStatusMap[contract.status]}
                    </Badge>
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
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }} disabled={currentPage === 1}/>
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(page); }} isActive={currentPage === page}>
                        {page}
                        </PaginationLink>
                    </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }} disabled={currentPage === totalPages}/>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </CardFooter>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl w-full">
            <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                    <FileSignature/> {selectedContract ? '계약 수정' : '신규 계약 작성'}
                </DialogTitle>
                <DialogDescription>
                    {selectedContract ? `계약번호: ${selectedContract.contractNumber}` : '새로운 계약 정보를 입력합니다.'}
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto pr-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="customerId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>고객사</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="고객사를 선택하세요" /></SelectTrigger></FormControl>
                          <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                  )}/>
                  <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem>
                        <FormLabel>계약 상태</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="상태를 선택하세요" /></SelectTrigger></FormControl>
                          <SelectContent>
                             {(Object.keys(contractStatusMap) as ContractStatus[]).map(status => (
                                 <SelectItem key={status} value={status}>{contractStatusMap[status]}</SelectItem>
                             ))}
                          </SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                  )}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="startDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>계약 시작일</FormLabel>
                            <Popover><PopoverTrigger asChild>
                                <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>날짜 선택</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl>
                            </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                            </PopoverContent></Popover><FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="endDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>계약 종료일</FormLabel>
                            <Popover><PopoverTrigger asChild>
                                <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>날짜 선택</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl>
                            </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                            </PopoverContent></Popover><FormMessage />
                        </FormItem>
                    )}/>
                </div>
                
                <Card>
                    <CardHeader><CardTitle className="text-base">계약 품목 및 단가</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {fields.map((field, index) => (
                           <div key={field.id} className="flex gap-2 items-end">
                                <FormField control={form.control} name={`items.${index}.materialType`} render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className={cn(index !== 0 && "sr-only")}>품목</FormLabel>
                                        <Input {...field} placeholder="예: 폐 플라스틱"/>
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => (
                                    <FormItem className="w-40">
                                        <FormLabel className={cn(index !== 0 && "sr-only")}>단가 (원/kg)</FormLabel>
                                        <Input type="number" {...field} />
                                    </FormItem>
                                )}/>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="size-4 text-destructive"/></Button>
                           </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ id: `item-${Date.now()}`, materialType: '', unitPrice: 0 })}>
                            품목 추가
                        </Button>
                    </CardContent>
                </Card>
                 
                 <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                        <FormLabel>특이사항</FormLabel>
                        <FormControl><Textarea placeholder="계약 관련 특이사항을 입력하세요..." {...field} /></FormControl>
                    </FormItem>
                 )}/>
                <DialogFooter className="pt-4 pr-6">
                    <Button type="submit">
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {selectedContract ? '계약 저장' : '계약 생성'}
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

    

    