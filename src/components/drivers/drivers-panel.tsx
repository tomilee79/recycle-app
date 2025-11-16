import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { drivers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function DriversPanel() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>직원 관리</CardTitle>
        <CardDescription>모든 직원의 개요입니다.</CardDescription>
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
  );
}
