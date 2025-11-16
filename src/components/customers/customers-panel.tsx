
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { customers, contracts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { AlertTriangle, PlusCircle, Building, Calendar, User, FileText, Loader2, Users2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { differenceInDays, parseISO, format } from 'date-fns';
import type { Customer, SalesActivity, Contract } from '@/lib/types';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

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

type NewActivityFormValues = z.infer<typeof newActivitySchema>;


export default function CustomersPanel() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<NewActivityFormValues>({
    resolver: zodResolver(newActivitySchema),
    defaultValues: {
      type: '상담',
      content: '',
    },
  });
  
  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setSelectedCustomer(null);
    form.reset();
  };

  const onActivitySubmit: SubmitHandler<NewActivityFormValues> = (data) => {
    if (!selectedCustomer) return;
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newActivity: SalesActivity = {
        id: `A${Math.floor(Math.random() * 1000)}`,
        date: format(new Date(), 'yyyy-MM-dd'),
        type: data.type,
        content: data.content,
        manager: '관리자' // Mock manager
      };
      
      // This is a mock update. In a real app, you'd update the backend.
      selectedCustomer.activityHistory.unshift(newActivity);
      
      toast({
        title: "활동 기록 추가 완료",
        description: `${selectedCustomer.name}의 새로운 활동이 기록되었습니다.`,
      });
      
      setIsSubmitting(false);
      form.reset();
    }, 1000);
  };

  const getCustomerContract = (customerId: string): Contract | undefined => {
    return contracts.find(c => c.customerId === customerId && c.status !== 'Terminated');
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>고객 목록</CardTitle>
          <CardDescription>전체 고객사 목록 및 기본 정보입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>고객명</TableHead>
                <TableHead>담당자</TableHead>
                <TableHead>주소</TableHead>
                <TableHead>계약 상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => {
                const contract = getCustomerContract(customer.id);
                return (
                  <TableRow key={customer.id} onClick={() => handleRowClick(customer)} className="cursor-pointer">
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.contactPerson}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>
                      {contract ? (
                        <Badge variant={contract.status === 'Active' ? 'default' : contract.status === 'Expiring' ? 'destructive' : 'secondary'}>
                          {contract.status === 'Active' ? '활성' : '만료 예정'}
                        </Badge>
                      ) : (
                        <Badge variant="outline">계약 없음</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent className="sm:max-w-2xl w-full">
            {selectedCustomer && (
                <>
                <SheetHeader className="pr-12">
                    <SheetTitle className="font-headline text-2xl flex items-center gap-2">
                        <Users2/> {selectedCustomer.name}
                    </SheetTitle>
                    <SheetDescription className="flex items-center gap-4 pt-1">
                        <span className="flex items-center gap-1.5"><User className="size-4"/> {selectedCustomer.contactPerson}</span>
                        <span className="flex items-center gap-1.5"><Building className="size-4"/> {selectedCustomer.address}</span>
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="mt-6 space-y-8 pr-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <PlusCircle/> 새 활동 기록
                            </CardTitle>
                        </CardHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onActivitySubmit)}>
                                <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>활동 유형</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="유형을 선택하세요" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="상담">상담</SelectItem>
                                            <SelectItem value="클레임">클레임</SelectItem>
                                            <SelectItem value="영업 기회">영업 기회</SelectItem>
                                            <SelectItem value="계약">계약</SelectItem>
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>활동 내용</FormLabel>
                                        <FormControl>
                                        <Textarea placeholder="상세 내용을 입력하세요..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                </CardContent>
                                <CardFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    기록 추가
                                </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText/> 활동 이력
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                            {selectedCustomer.activityHistory.length > 0 ? selectedCustomer.activityHistory.map(activity => (
                                <div key={activity.id} className="relative pl-6">
                                    <div className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${activityTypeMap[activity.type]}`}></div>
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-sm">{activity.type}</p>
                                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{activity.content}</p>
                                    <p className="text-xs text-muted-foreground text-right mt-1">담당: {activity.manager}</p>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-4">활동 이력이 없습니다.</p>
                            )}
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
