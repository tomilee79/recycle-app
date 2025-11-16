
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { drivers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

export default function DriversPanel() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>직원 목록</CardTitle>
              <CardDescription>
                시스템 계정(로그인) 관리는 '사용자 관리' 메뉴에서, 직원의 성과 분석은 '성과 대시보드'에서 확인하세요.
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/driver-performance')}>
              성과 대시보드로 이동 <ArrowRight className="ml-2"/>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>배차 가능 여부</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.contact}</TableCell>
                  <TableCell>
                    <Badge variant={driver.isAvailable ? 'default' : 'secondary'} className={cn(driver.isAvailable ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600")}>
                      {driver.isAvailable ? '가능' : '배차중'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
