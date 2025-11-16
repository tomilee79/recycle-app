
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
          <CardTitle>직원 목록</CardTitle>
          <CardDescription>
            직원(사용자)의 생성, 역할 부여, 정보 수정 등 모든 관리는 '사용자 관리' 메뉴에서 통합하여 진행할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/users')}>
            사용자 관리 메뉴로 이동 <ArrowRight className="ml-2"/>
          </Button>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>현재 배차 가능한 운전자</CardTitle>
          <CardDescription>현재 운행중이 아니며, 배차가 가능한 운전자 목록입니다.</CardDescription>
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
              {drivers.filter(d => d.isAvailable).map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.contact}</TableCell>
                  <TableCell>
                    <Badge variant={driver.isAvailable ? 'default' : 'secondary'} className={cn(driver.isAvailable ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600")}>
                      {driver.isAvailable ? '가능' : '불가능'}
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
