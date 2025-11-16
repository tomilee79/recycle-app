
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { customers, contracts as initialContracts } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Search, FileSignature, Trash2, MoreHorizontal, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Contract, ContractItem, ContractStatus } from '@/lib/types';
import { format, addYears, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';


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
type SortableField = 'contractNumber' | 'customerName' | 'startDate' | 'endDate' | 'status';

export default function ContractsPanel() {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | ContractStatus>('All');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableField; direction: 'ascending' | 'descending' } | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const getCustomerInfo = (customerId: string) => customers.find(c => c.id === customerId) || { name: '알수없음', address: '알수없음'};

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
  });
  
  const filteredContractsMemo = useMemo(() => {
    let filtered = contracts
        .map(c => ({...c, customerName: getCustomerInfo(c.customerId).name}))
        .filter(c => {
            const searchTerm = search.toLowerCase();
            const statusMatch = filter === 'All' || c.status === filter;
            const searchMatch = c.customerName.toLowerCase().includes(searchTerm) || c.contractNumber.toLowerCase().includes(searchTerm);
            return statusMatch && searchMatch;
        });
        
    if (sortConfig !== null) {
        filtered.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    } else {
        filtered.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }
    
    return filtered;
  }, [contracts, filter, search, sortConfig]);
  
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

  const openSheetForNew = () => {
    setSelectedContract(null);
    const newId = `CT${String(contracts.length + 1).padStart(3, '0')}`;
    const newNumber = `C${format(new Date(), 'yyyyMMdd')}-${String(contracts.length + 1).padStart(3, '0')}`;
    form.reset({
        id: newId,
        contractNumber: newNumber,
        customerId: '',
        status: 'Active',
        startDate: new Date(),
        endDate: addYears(new Date(), 1),
        items: [{ id: `item-${Date.now()}`, materialType: '', unitPrice: 0 }],
        notes: '',
    });
    setIsSheetOpen(true);
  }

  const openSheetForEdit = (contract: Contract) => {
    setSelectedContract(contract);
    form.reset({
        ...contract,
        startDate: new Date(contract.startDate),
        endDate: new Date(contract.endDate),
    });
    setIsSheetOpen(true);
  }

  const handleCloneContract = (contractToClone: Contract) => {
    setSelectedContract(null);
    const newId = `CT${String(contracts.length + 1).padStart(3, '0')}`;
    const newNumber = `C${format(new Date(), 'yyyyMMdd')}-${String(contracts.length + 1).padStart(3, '0')}`;
    form.reset({
      ...contractToClone,
      id: newId,
      contractNumber: newNumber,
      status: 'Active',
      startDate: new Date(),
      endDate: addDays(new Date(), 365),
    });
    setIsSheetOpen(true);
    toast({ title: "계약 복제됨", description: `기존 계약을 바탕으로 새 계약 초안이 생성되었습니다.` });
  };
  
  const closeSheet = () => {
    setIsSheetOpen(false);
    setSelectedContract(null);
  };

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
    closeSheet();
  };
  
  const handleDelete = (contractIds: string[]) => {
      setContracts(contracts.filter(c => !contractIds.includes(c.id)));
      toast({
          title: "계약 삭제됨",
          description: `${contractIds.length}개의 계약이 삭제되었습니다.`,
          variant: 'destructive',
      });
      if(selectedContract && contractIds.includes(selectedContract.id)) {
          closeSheet();
      }
      setSelectedRowKeys(new Set());
  }
  
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

  const handleSelectRow = (id: string) => {
    setSelectedRowKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAllRows = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(new Set(paginatedContracts.map(c => c.id)));
    } else {
      setSelectedRowKeys(new Set());
    }
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
                <div className="flex items-center gap-2">
                    {(['All', 'Active', 'Expiring', 'Terminated'] as const).map(f => (
                        <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                            {f === 'All' ? '전체' : contractStatusMap[f]}
                        </Button>
                    ))}
                    {selectedRowKeys.size > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    선택 삭제 ({selectedRowKeys.size})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        이 작업은 되돌릴 수 없습니다. 선택된 {selectedRowKeys.size}개의 계약이 영구적으로 삭제됩니다.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(Array.from(selectedRowKeys))}>삭제 확인</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
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
                    <Button onClick={openSheetForNew}>
                        <PlusCircle className="mr-2"/>
                        신규 계약
                    </Button>
                </div>
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={paginatedContracts.length > 0 && selectedRowKeys.size === paginatedContracts.length}
                    onCheckedChange={(checked) => handleSelectAllRows(!!checked)}
                  />
                </TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('contractNumber')}>계약번호{getSortIcon('contractNumber')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('customerName')}>고객사{getSortIcon('customerName')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('startDate')}>시작일{getSortIcon('startDate')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('endDate')}>종료일{getSortIcon('endDate')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('status')}>상태{getSortIcon('status')}</Button></TableHead>
                <TableHead className="text-right w-16">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContracts.map((contract) => (
                <TableRow key={contract.id} data-state={selectedRowKeys.has(contract.id) && "selected"}>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={selectedRowKeys.has(contract.id)}
                        onCheckedChange={() => handleSelectRow(contract.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium cursor-pointer" onClick={() => openSheetForEdit(contract)}>{contract.contractNumber}</TableCell>
                  <TableCell className="cursor-pointer" onClick={() => openSheetForEdit(contract)}>{getCustomerInfo(contract.customerId).name}</TableCell>
                  <TableCell className="cursor-pointer" onClick={() => openSheetForEdit(contract)}>{contract.startDate}</TableCell>
                  <TableCell className="cursor-pointer" onClick={() => openSheetForEdit(contract)}>{contract.endDate}</TableCell>
                  <TableCell className="cursor-pointer" onClick={() => openSheetForEdit(contract)}>
                    <Badge variant={contractStatusVariant[contract.status]}>
                      {contractStatusMap[contract.status]}
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
                              <DropdownMenuItem onSelect={() => handleCloneContract(contract)}>
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
                                  이 작업은 되돌릴 수 없습니다. {contract.contractNumber} 계약이 영구적으로 삭제됩니다.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete([contract.id])}>삭제 확인</AlertDialogAction>
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
      
      <Sheet open={isSheetOpen} onOpenChange={closeSheet}>
        <SheetContent className="sm:max-w-3xl w-full flex flex-col">
            <SheetHeader>
                <SheetTitle className="text-2xl flex items-center gap-2">
                    <FileSignature/> {selectedContract ? '계약 수정' : '신규 계약 작성'}
                </SheetTitle>
                <SheetDescription>
                    {selectedContract ? `계약번호: ${selectedContract.contractNumber}` : '새로운 계약 정보를 입력합니다.'}
                </SheetDescription>
            </SheetHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
              <div className="space-y-4 mt-4 overflow-y-auto pr-6 flex-1">
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
                </div>
                <div className="flex justify-between items-center pt-4 pr-6 mt-auto">
                    <Button type="submit">
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {selectedContract ? '계약 저장' : '계약 생성'}
                    </Button>
                    {selectedContract && (
                        <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive">
                                <Trash2 className="mr-2"/>삭제
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>정말로 이 계약을 삭제하시겠습니까?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    이 작업은 되돌릴 수 없습니다. 이 계약은 영구적으로 삭제됩니다.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete([selectedContract.id])}>삭제 확인</AlertDialogAction>
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

    

    
