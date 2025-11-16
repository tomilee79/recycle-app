
'use client';
import { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, ComposedChart, Line, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { reportData, settlementData as initialSettlementData, expensesData as initialExpensesData, vehicles, customers } from "@/lib/mock-data";
import type { SettlementData, SettlementStatus, Expense, ExpenseStatus, ExpenseCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Utensils, Construction, Car, MoreHorizontal, Loader2, Trash2, TrendingUp, HandCoins, CircleDotDashed, Banknote, Search, ChevronDown, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '../ui/textarea';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { MonthPicker } from '../ui/month-picker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';


const settlementStatusMap: { [key in SettlementStatus]: string } = {
  'Pending': '청구 대기',
  'Issued': '발행 완료',
  'Paid': '수납 완료',
};
const settlementStatusOptions = Object.keys(settlementStatusMap) as SettlementStatus[];

const settlementStatusVariant: { [key in SettlementStatus]: "default" | "secondary" | "outline" } = {
  'Pending': 'outline',
  'Issued': 'default',
  'Paid': 'secondary',
};

const expenseStatusMap: { [key in ExpenseStatus]: string } = {
  'Pending': '처리 대기',
  'Paid': '지급 완료',
};
const expenseStatusOptions = Object.keys(expenseStatusMap) as ExpenseStatus[];

const expenseStatusVariant: { [key in ExpenseStatus]: "default" | "outline" } = {
  'Pending': 'outline',
  'Paid': 'default',
};

const expenseCategoryMap: { [key in ExpenseCategory]: { label: string; icon: React.ElementType } } = {
    '유류비': { label: '유류비', icon: Car },
    '정비비': { label: '정비비', icon: Construction },
    '통행료': { label: '통행료', icon: Utensils },
    '기타': { label: '기타', icon: MoreHorizontal },
};
const expenseCategoryOptions = Object.keys(expenseCategoryMap) as ExpenseCategory[];

const settlementFormSchema = z.object({
  month: z.date({ required_error: "정산 월을 선택해주세요." }),
  customerName: z.string().min(1, "고객사를 선택해주세요."),
  collectionCount: z.coerce.number().min(0, "수거 횟수는 0 이상이어야 합니다."),
  totalWeight: z.coerce.number().min(0, "총 수거량은 0 이상이어야 합니다."),
  amount: z.coerce.number().min(0, "정산 금액은 0 이상이어야 합니다."),
});
type SettlementFormValues = z.infer<typeof settlementFormSchema>;

const expenseFormSchema = z.object({
  date: z.date({ required_error: "지출일을 선택해주세요." }),
  category: z.enum(expenseCategoryOptions),
  amount: z.coerce.number().min(1, "금액은 1 이상이어야 합니다."),
  description: z.string().min(2, "내용을 2자 이상 입력해주세요."),
  vehicleId: z.string().optional(),
});
type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

const RevenueSummary = ({ data }: { data: SettlementData[] }) => {
    const summary = useMemo(() => {
        const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
        const paidAmount = data.filter(item => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0);
        const pendingAmount = data.filter(item => item.status === 'Pending').reduce((sum, item) => sum + item.amount, 0);
        return { totalAmount, paidAmount, pendingAmount };
    }, [data]);

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">총 정산액</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground"/></CardHeader>
                <CardContent><div className="text-2xl font-bold">{summary.totalAmount.toLocaleString()}원</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">수납 완료액</CardTitle><HandCoins className="h-4 w-4 text-green-500"/></CardHeader>
                <CardContent><div className="text-2xl font-bold">{summary.paidAmount.toLocaleString()}원</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">청구 대기액</CardTitle><CircleDotDashed className="h-4 w-4 text-yellow-500"/></CardHeader>
                <CardContent><div className="text-2xl font-bold">{summary.pendingAmount.toLocaleString()}원</div></CardContent>
            </Card>
        </div>
    )
}

const ExpensesSummary = ({ data }: { data: Expense[] }) => {
    const summary = useMemo(() => {
        const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
        const paidAmount = data.filter(item => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0);
        const pendingAmount = data.filter(item => item.status === 'Pending').reduce((sum, item) => sum + item.amount, 0);
        return { totalAmount, paidAmount, pendingAmount };
    }, [data]);
    
    return (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">총 지출액</CardTitle><Banknote className="h-4 w-4 text-muted-foreground"/></CardHeader>
                <CardContent><div className="text-2xl font-bold">{summary.totalAmount.toLocaleString()}원</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">지급 완료액</CardTitle><HandCoins className="h-4 w-4 text-green-500"/></CardHeader>
                <CardContent><div className="text-2xl font-bold">{summary.paidAmount.toLocaleString()}원</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">처리 대기액</CardTitle><CircleDotDashed className="h-4 w-4 text-yellow-500"/></CardHeader>
                <CardContent><div className="text-2xl font-bold">{summary.pendingAmount.toLocaleString()}원</div></CardContent>
            </Card>
        </div>
    )
}


export default function BillingPanel() {
  const [settlementData, setSettlementData] = useState<SettlementData[]>(initialSettlementData);
  const [expensesData, setExpensesData] = useState<Expense[]>(initialExpensesData);
  const [editingSettlement, setEditingSettlement] = useState<SettlementData | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [settlementFilters, setSettlementFilters] = useState({ customer: 'all', status: 'all', search: '' });
  const [expenseFilters, setExpenseFilters] = useState({ category: 'all', status: 'all', search: '' });
  const [selectedSettlementRows, setSelectedSettlementRows] = useState<Set<string>>(new Set());
  const [selectedExpenseRows, setSelectedExpenseRows] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const filteredSettlements = useMemo(() => {
    return settlementData.filter(item => {
      const customerMatch = settlementFilters.customer === 'all' || item.customerName === settlementFilters.customer;
      const statusMatch = settlementFilters.status === 'all' || item.status === settlementFilters.status;
      const searchMatch = item.customerName.toLowerCase().includes(settlementFilters.search.toLowerCase());
      return customerMatch && statusMatch && searchMatch;
    });
  }, [settlementData, settlementFilters]);

  const filteredExpenses = useMemo(() => {
    return expensesData.filter(item => {
      const categoryMatch = expenseFilters.category === 'all' || item.category === expenseFilters.category;
      const statusMatch = expenseFilters.status === 'all' || item.status === expenseFilters.status;
      const searchMatch = item.description.toLowerCase().includes(expenseFilters.search.toLowerCase()) || (item.vehicleId || '').toLowerCase().includes(expenseFilters.search.toLowerCase());
      return categoryMatch && statusMatch && searchMatch;
    });
  }, [expensesData, expenseFilters]);


  const {
    currentPage: settlementCurrentPage,
    setCurrentPage: setSettlementCurrentPage,
    paginatedData: paginatedSettlementData,
    totalPages: settlementTotalPages,
  } = usePagination(filteredSettlements, 8);

  const {
    currentPage: expenseCurrentPage,
    setCurrentPage: setExpenseCurrentPage,
    paginatedData: paginatedExpenseData,
    totalPages: expenseTotalPages,
  } = usePagination(filteredExpenses, 8);

  const settlementForm = useForm<SettlementFormValues>({
    resolver: zodResolver(settlementFormSchema),
  });
  
  const expenseForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
  });

  const openSettlementDialog = useCallback((settlement: SettlementData | null) => {
    setEditingSettlement(settlement);
    if (settlement) {
      settlementForm.reset({
        ...settlement,
        month: new Date(settlement.month),
      });
    } else {
      settlementForm.reset({
        month: new Date(),
        customerName: '',
        collectionCount: 0,
        totalWeight: 0,
        amount: 0,
      });
    }
    setIsSettlementModalOpen(true);
  }, [settlementForm]);
  
  const openExpenseDialog = useCallback((expense: Expense | null) => {
    setEditingExpense(expense);
    if (expense) {
      expenseForm.reset({
        ...expense,
        date: parseISO(expense.date),
      });
    } else {
      expenseForm.reset({
        date: new Date(),
        category: '유류비',
        amount: 0,
        description: '',
        vehicleId: 'none',
      });
    }
    setIsExpenseModalOpen(true);
  }, [expenseForm]);

  const onSettlementSubmit: SubmitHandler<SettlementFormValues> = (data) => {
    if (editingSettlement) {
      const updatedSettlement: SettlementData = { 
        ...editingSettlement,
        ...data,
        month: format(data.month, 'yyyy-MM'),
      };
      setSettlementData(prev => prev.map(s => s.id === editingSettlement.id ? updatedSettlement : s));
      toast({ title: "정산 내역 수정됨", description: "정산 내역이 성공적으로 수정되었습니다." });
    } else {
      const newSettlement: SettlementData = {
        id: `S${String(settlementData.length + 1).padStart(3, '0')}`,
        ...data,
        month: format(data.month, 'yyyy-MM'),
        status: 'Pending',
      };
      setSettlementData([newSettlement, ...settlementData]);
      toast({ title: "정산 내역 등록됨", description: "새로운 정산 내역이 성공적으로 등록되었습니다." });
    }
    setIsSettlementModalOpen(false);
  };

  const handleDeleteSettlement = (ids: string[]) => {
    setSettlementData(prev => prev.filter(s => !ids.includes(s.id)));
    toast({ title: "정산 내역 삭제됨", description: `${ids.length}개의 정산 내역이 삭제되었습니다.`, variant: "destructive" });
    setIsSettlementModalOpen(false);
    setEditingSettlement(null);
    setSelectedSettlementRows(new Set());
  }
  
  const handleSettlementStatusChange = (ids: string[], newStatus: SettlementStatus) => {
    setSettlementData(prevData =>
      prevData.map(item =>
        ids.includes(item.id) ? { ...item, status: newStatus } : item
      )
    );
    toast({
      title: '상태 변경 완료',
      description: `${ids.length}개 항목의 상태가 '${settlementStatusMap[newStatus]}'(으)로 변경되었습니다.`,
    });
    setSelectedSettlementRows(new Set());
  };

  const handleExpenseStatusChange = (ids: string[], newStatus: ExpenseStatus) => {
    setExpensesData(prevData =>
        prevData.map(item =>
            ids.includes(item.id) ? { ...item, status: newStatus } : item
        )
    );
    toast({
        title: '상태 변경 완료',
        description: `${ids.length}개 항목의 상태가 '${expenseStatusMap[newStatus]}'(으)로 변경되었습니다.`,
    });
    setSelectedExpenseRows(new Set());
  };

  const onExpenseSubmit: SubmitHandler<ExpenseFormValues> = (data) => {
    const expenseData = {
        ...data,
        vehicleId: data.vehicleId === 'none' ? undefined : data.vehicleId
    };

    if (editingExpense) {
      const updatedExpense = { ...editingExpense, ...expenseData, date: format(data.date, 'yyyy-MM-dd') };
      setExpensesData(prev => prev.map(e => e.id === editingExpense.id ? updatedExpense : e));
      toast({ title: "비용 수정됨", description: "비용 항목이 성공적으로 수정되었습니다." });
    } else {
      const newExpense: Expense = {
        id: `EXP${String(expensesData.length + 1).padStart(3, '0')}`,
        date: format(data.date, 'yyyy-MM-dd'),
        category: data.category as ExpenseCategory,
        description: data.description,
        amount: data.amount,
        vehicleId: expenseData.vehicleId,
        status: 'Pending',
      };
      setExpensesData([newExpense, ...expensesData]);
      toast({ title: "비용 등록됨", description: "새로운 비용 항목이 성공적으로 등록되었습니다." });
    }
    setIsExpenseModalOpen(false);
  };
  
  const handleDeleteExpense = (ids: string[]) => {
    setExpensesData(prev => prev.filter(e => !ids.includes(e.id)));
    toast({ title: "비용 삭제됨", description: `${ids.length}개의 비용 항목이 삭제되었습니다.`, variant: "destructive" });
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
    setSelectedExpenseRows(new Set());
  }

  const handleSelectSettlementRow = (id: string, checked: boolean) => {
      setSelectedSettlementRows(prev => {
          const newSet = new Set(prev);
          if (checked) newSet.add(id);
          else newSet.delete(id);
          return newSet;
      });
  }

  const handleSelectAllSettlementRows = (checked: boolean) => {
      if (checked) {
          setSelectedSettlementRows(new Set(paginatedSettlementData.map(r => r.id)));
      } else {
          setSelectedSettlementRows(new Set());
      }
  }

  const handleSelectExpenseRow = (id: string, checked: boolean) => {
      setSelectedExpenseRows(prev => {
          const newSet = new Set(prev);
          if (checked) newSet.add(id);
          else newSet.delete(id);
          return newSet;
      });
  }

  const handleSelectAllExpenseRows = (checked: boolean) => {
      if (checked) {
          setSelectedExpenseRows(new Set(paginatedExpenseData.map(r => r.id)));
      } else {
          setSelectedExpenseRows(new Set());
      }
  }

  const chartConfig = {
    plastic: { label: "플라스틱", color: "hsl(var(--chart-1))" },
    glass: { label: "유리", color: "hsl(var(--chart-2))" },
    paper: { label: "종이", color: "hsl(var(--chart-3))" },
    metal: { label: "금속", color: "hsl(var(--chart-4))" },
    mixed: { label: "혼합", color: "hsl(var(--chart-5))" },
    revenue: { label: "매출액", color: "hsl(var(--primary))" },
  } as const;

  const monthNames: { [key: string]: string } = {
    Jan: '1월', Feb: '2월', Mar: '3월', Apr: '4월', May: '5월', Jun: '6월',
  };

  const localizedReportData = reportData.map(d => ({...d, month: monthNames[d.month] || d.month}));

  return (
    <Tabs defaultValue="revenue">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="revenue">매출 (수금) 관리</TabsTrigger>
            <TabsTrigger value="expenses">비용 (지출) 관리</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue" className="space-y-6 mt-6">
            <RevenueSummary data={settlementData} />
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle>월별 수거 및 매출 현황</CardTitle>
                <CardDescription>월별 재활용품 수거량(톤) 및 총 매출액(만원)입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <ResponsiveContainer>
                    <ComposedChart data={localizedReportData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} stroke="#888888" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} T`} />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--primary))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value, name) => (name === 'revenue' ? `${(Number(value) / 10000).toLocaleString()}만원` : `${value} T`)} />} />
                        <Legend />
                        <Bar dataKey="plastic" yAxisId="left" stackId="a" fill="var(--color-plastic)" radius={[0, 0, 0, 0]} barSize={30}/>
                        <Bar dataKey="glass" yAxisId="left" stackId="a" fill="var(--color-glass)" radius={[0, 0, 0, 0]} barSize={30}/>
                        <Bar dataKey="paper" yAxisId="left" stackId="a" fill="var(--color-paper)" radius={[0, 0, 0, 0]} barSize={30}/>
                        <Bar dataKey="metal" yAxisId="left" stackId="a" fill="var(--color-metal)" radius={[0, 0, 0, 0]} barSize={30}/>
                        <Bar dataKey="mixed" yAxisId="left" stackId="a" fill="var(--color-mixed)" radius={[4, 4, 0, 0]} barSize={30}/>
                        <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} yAxisId="right" />
                    </ComposedChart>
                    </ResponsiveContainer>
                </ChartContainer>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex-row justify-between items-center flex">
                        <div>
                            <CardTitle>월별 상세 정산 내역</CardTitle>
                            <CardDescription>고객사별 정산 내역 및 청구 상태를 관리합니다.</CardDescription>
                        </div>
                        <Button onClick={() => openSettlementDialog(null)}><PlusCircle className="mr-2"/>새 정산 추가</Button>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-4">
                        <div className="flex gap-2 items-center">
                          <Select value={settlementFilters.customer} onValueChange={(value) => setSettlementFilters(f => ({ ...f, customer: value }))}>
                              <SelectTrigger className="w-[180px]"><SelectValue placeholder="고객사 필터" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">모든 고객사</SelectItem>
                                  {customers.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                          <Select value={settlementFilters.status} onValueChange={(value) => setSettlementFilters(f => ({ ...f, status: value }))}>
                              <SelectTrigger className="w-[150px]"><SelectValue placeholder="상태 필터" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">모든 상태</SelectItem>
                                  {settlementStatusOptions.map(s => <SelectItem key={s} value={s}>{settlementStatusMap[s]}</SelectItem>)}
                              </SelectContent>
                          </Select>
                           {selectedSettlementRows.size > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        선택 삭제 ({selectedSettlementRows.size})
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            이 작업은 되돌릴 수 없습니다. 선택된 {selectedSettlementRows.size}개의 정산 내역이 영구적으로 삭제됩니다.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>취소</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteSettlement(Array.from(selectedSettlementRows))}>삭제 확인</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                        <div className="relative w-72">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="고객사명으로 검색..." value={settlementFilters.search} onChange={(e) => setSettlementFilters(f => ({ ...f, search: e.target.value }))} className="pl-9" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"><Checkbox onCheckedChange={(checked) => handleSelectAllSettlementRows(!!checked)} checked={selectedSettlementRows.size === paginatedSettlementData.length && paginatedSettlementData.length > 0} /></TableHead>
                            <TableHead>정산 월</TableHead>
                            <TableHead>고객사</TableHead>
                            <TableHead>수거 횟수</TableHead>
                            <TableHead>총 수거량(kg)</TableHead>
                            <TableHead>정산 금액(원)</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead className="text-right w-16">작업</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {paginatedSettlementData.map((item) => (
                        <TableRow key={item.id} data-state={selectedSettlementRows.has(item.id) && "selected"}>
                            <TableCell><Checkbox checked={selectedSettlementRows.has(item.id)} onCheckedChange={(checked) => handleSelectSettlementRow(item.id, !!checked)} /></TableCell>
                            <TableCell>{item.month}</TableCell>
                            <TableCell className="font-medium">{item.customerName}</TableCell>
                            <TableCell>{item.collectionCount}</TableCell>
                            <TableCell>{item.totalWeight.toLocaleString()}</TableCell>
                            <TableCell>{item.amount.toLocaleString()}</TableCell>
                            <TableCell><Badge variant={settlementStatusVariant[item.status]}>{settlementStatusMap[item.status]}</Badge></TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4"/></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => openSettlementDialog(item)}><Edit className="mr-2"/> 수정</DropdownMenuItem>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>상태 변경</DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    {settlementStatusOptions.filter(s => s !== item.status).map(status => <DropdownMenuItem key={status} onSelect={() => handleSettlementStatusChange([item.id], status)}>{settlementStatusMap[status]}으로 변경</DropdownMenuItem>)}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                        <DropdownMenuSeparator />
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">삭제</DropdownMenuItem></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 정산 내역은 영구적으로 삭제됩니다.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteSettlement([item.id])}>삭제 확인</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
                <CardFooter>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setSettlementCurrentPage(prev => Math.max(1, prev - 1)); }} disabled={settlementCurrentPage === 1}/></PaginationItem>
                            {Array.from({ length: settlementTotalPages }, (_, i) => i + 1).map(page => (<PaginationItem key={page}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); setSettlementCurrentPage(page); }} isActive={settlementCurrentPage === page}>{page}</PaginationLink></PaginationItem>))}
                            <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setSettlementCurrentPage(prev => Math.min(settlementTotalPages, prev + 1)); }} disabled={settlementCurrentPage === settlementTotalPages}/></PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </CardFooter>
            </Card>
        </TabsContent>
        <TabsContent value="expenses" className="space-y-6 mt-6">
             <ExpensesSummary data={expensesData} />
            <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex-row justify-between items-center flex">
                      <div>
                          <CardTitle>비용 (지출) 내역</CardTitle>
                          <CardDescription>차량 유류비, 정비비 등 모든 지출 내역을 관리합니다.</CardDescription>
                      </div>
                      <Button onClick={() => openExpenseDialog(null)}><PlusCircle className="mr-2"/>새 비용 등록</Button>
                  </div>
                   <div className="flex items-center justify-between gap-2 pt-4">
                        <div className="flex gap-2 items-center">
                          <Select value={expenseFilters.category} onValueChange={(value) => setExpenseFilters(f => ({ ...f, category: value }))}>
                              <SelectTrigger className="w-[180px]"><SelectValue placeholder="항목 필터" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">모든 항목</SelectItem>
                                  {expenseCategoryOptions.map(c => <SelectItem key={c} value={c}>{expenseCategoryMap[c].label}</SelectItem>)}
                              </SelectContent>
                          </Select>
                          <Select value={expenseFilters.status} onValueChange={(value) => setExpenseFilters(f => ({ ...f, status: value }))}>
                              <SelectTrigger className="w-[150px]"><SelectValue placeholder="상태 필터" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">모든 상태</SelectItem>
                                  {expenseStatusOptions.map(s => <SelectItem key={s} value={s}>{expenseStatusMap[s]}</SelectItem>)}
                              </SelectContent>
                          </Select>
                          {selectedExpenseRows.size > 0 && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        선택 삭제 ({selectedExpenseRows.size})
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            이 작업은 되돌릴 수 없습니다. 선택된 {selectedExpenseRows.size}개의 비용 내역이 영구적으로 삭제됩니다.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>취소</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteExpense(Array.from(selectedExpenseRows))}>삭제 확인</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                        <div className="relative w-72">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="내용, 차량ID로 검색..." value={expenseFilters.search} onChange={(e) => setExpenseFilters(f => ({ ...f, search: e.target.value }))} className="pl-9" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"><Checkbox onCheckedChange={(checked) => handleSelectAllExpenseRows(!!checked)} checked={selectedExpenseRows.size === paginatedExpenseData.length && paginatedExpenseData.length > 0}/></TableHead>
                                <TableHead>지출일</TableHead>
                                <TableHead>항목</TableHead>
                                <TableHead>내용</TableHead>
                                <TableHead>차량</TableHead>
                                <TableHead>금액</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead className="text-right w-16">작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedExpenseData.map((item) => {
                                const CategoryIcon = expenseCategoryMap[item.category].icon;
                                return (
                                    <TableRow key={item.id} data-state={selectedExpenseRows.has(item.id) && "selected"}>
                                        <TableCell><Checkbox checked={selectedExpenseRows.has(item.id)} onCheckedChange={(checked) => handleSelectExpenseRow(item.id, !!checked)} /></TableCell>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell><div className="flex items-center gap-2"><CategoryIcon className="size-4 text-muted-foreground"/> {item.category}</div></TableCell>
                                        <TableCell className="font-medium">{item.description}</TableCell>
                                        <TableCell>{item.vehicleId || '-'}</TableCell>
                                        <TableCell>{item.amount.toLocaleString()} 원</TableCell>
                                        <TableCell><Badge variant={expenseStatusVariant[item.status]}>{expenseStatusMap[item.status]}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4"/></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => openExpenseDialog(item)}><Edit className="mr-2"/> 수정</DropdownMenuItem>
                                                     <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>상태 변경</DropdownMenuSubTrigger>
                                                        <DropdownMenuPortal>
                                                            <DropdownMenuSubContent>
                                                                {expenseStatusOptions.filter(s => s !== item.status).map(status => <DropdownMenuItem key={status} onSelect={() => handleExpenseStatusChange([item.id], status)}>{expenseStatusMap[status]}으로 변경</DropdownMenuItem>)}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuPortal>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">삭제</DropdownMenuItem></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 비용 항목은 영구적으로 삭제됩니다.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteExpense([item.id])}>삭제 확인</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
                            <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setExpenseCurrentPage(prev => Math.max(1, prev - 1)); }} disabled={expenseCurrentPage === 1}/></PaginationItem>
                            {Array.from({ length: expenseTotalPages }, (_, i) => i + 1).map(page => (<PaginationItem key={page}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); setExpenseCurrentPage(page); }} isActive={expenseCurrentPage === page}>{page}</PaginationLink></PaginationItem>))}
                            <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setExpenseCurrentPage(prev => Math.min(expenseTotalPages, prev + 1)); }} disabled={expenseCurrentPage === expenseTotalPages}/></PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </CardFooter>
            </Card>
        </TabsContent>

        <Dialog open={isSettlementModalOpen} onOpenChange={setIsSettlementModalOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>{editingSettlement ? '정산 내역 수정' : '새 정산 내역 추가'}</DialogTitle><DialogDescription>{editingSettlement ? '정산 내역을 수정합니다.' : '새로운 정산 내역을 입력합니다.'}</DialogDescription></DialogHeader>
                <Form {...settlementForm}>
                <form onSubmit={settlementForm.handleSubmit(onSettlementSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={settlementForm.control} name="month" render={({ field }) => (<FormItem><FormLabel>정산 월</FormLabel><FormControl><MonthPicker date={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={settlementForm.control} name="customerName" render={({ field }) => (
                            <FormItem><FormLabel>고객사</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="고객사 선택" /></SelectTrigger></FormControl>
                                    <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={settlementForm.control} name="collectionCount" render={({ field }) => (<FormItem><FormLabel>수거 횟수</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={settlementForm.control} name="totalWeight" render={({ field }) => (<FormItem><FormLabel>총 수거량(kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <FormField control={settlementForm.control} name="amount" render={({ field }) => (<FormItem><FormLabel>정산 금액(원)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <DialogFooter className="pt-4 sm:justify-between">
                         {editingSettlement ? (<AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive"><Trash2 className="mr-2" /> 삭제</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 작업은 되돌릴 수 없습니다. 이 정산 내역은 영구적으로 삭제됩니다.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteSettlement([editingSettlement!.id])}>삭제 확인</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>) : <div></div>}
                        <Button type="submit" disabled={settlementForm.formState.isSubmitting}>{settlementForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingSettlement ? '저장' : '등록'}</Button>
                    </DialogFooter>
                </form>
                </Form>
            </DialogContent>
        </Dialog>

        <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>{editingExpense ? '비용 수정' : '새 비용 등록'}</DialogTitle><DialogDescription>{editingExpense ? '비용 내역을 수정합니다.' : '새로운 지출 내역을 입력합니다.'}</DialogDescription></DialogHeader>
                <Form {...expenseForm}>
                <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4 py-4">
                    <FormField control={expenseForm.control} name="date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>지출일</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>날짜 선택</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={expenseForm.control} name="category" render={({ field }) => (<FormItem><FormLabel>비용 항목</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="항목을 선택하세요" /></SelectTrigger></FormControl><SelectContent>{expenseCategoryOptions.map(cat => <SelectItem key={cat} value={cat}>{expenseCategoryMap[cat].label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                        <FormField control={expenseForm.control} name="amount" render={({ field }) => (<FormItem><FormLabel>금액 (원)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <FormField control={expenseForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>상세 내용</FormLabel><FormControl><Textarea placeholder="상세 내용을 입력하세요..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={expenseForm.control} name="vehicleId" render={({ field }) => (<FormItem><FormLabel>관련 차량 (선택)</FormLabel><Select onValueChange={field.onChange} value={field.value ?? 'none'}><FormControl><SelectTrigger><SelectValue placeholder="관련 차량을 선택하세요" /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">없음</SelectItem>{vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                    <DialogFooter className="pt-4 sm:justify-between">
                         {editingExpense ? (<AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive"><Trash2 className="mr-2" /> 삭제</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 작업은 되돌릴 수 없습니다. 이 비용 항목은 영구적으로 삭제됩니다.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteExpense([editingExpense!.id])}>삭제 확인</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>) : <div></div>}
                        <Button type="submit" disabled={expenseForm.formState.isSubmitting}>{expenseForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingExpense ? '저장' : '비용 등록'}</Button>
                    </DialogFooter>
                </form>
                </Form>
            </DialogContent>
        </Dialog>
    </Tabs>
  );
}
