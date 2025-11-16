
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { customers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { differenceInDays, parseISO } from 'date-fns';

const contractStatusMap: { [key: string]: string } = {
  'Active': '활성',
  'Inactive': '비활성',
  'Pending': '대기'
};

const contractStatusVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
    'Active': 'default',
    'Inactive': 'destructive',
    'Pending': 'secondary'
};

export default function CustomersPanel() {

  const isExpiryImminent = (expiryDate: string) => {
    const today = new Date();
    const date = parseISO(expiryDate);
    const daysDifference = differenceInDays(date, today);
    return daysDifference >= 0 && daysDifference <= 30;
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>고객 관리</CardTitle>
        <CardDescription>전체 고객사 목록 및 계약 정보입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>고객명</TableHead>
              <TableHead>담당자</TableHead>
              <TableHead>계약 상태</TableHead>
              <TableHead className="text-right">계약 만료일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.contactPerson}</TableCell>
                <TableCell>
                  <Badge variant={contractStatusVariant[customer.contractStatus]}>
                    {contractStatusMap[customer.contractStatus]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isExpiryImminent(customer.expiryDate) && (
                       <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <AlertTriangle className="size-4 text-destructive" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>계약 만료 30일 전</p>
                            </TooltipContent>
                        </Tooltip>
                       </TooltipProvider>
                    )}
                    <span>{customer.expiryDate}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
