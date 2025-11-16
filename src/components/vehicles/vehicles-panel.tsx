import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { vehicles } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusMap: { [key: string]: string } = {
  'On Route': '운행중',
  'Completed': '완료',
  'Maintenance': '정비중',
  'Idle': '대기중'
};

const typeMap: { [key: string]: string } = {
  'Truck': '트럭',
  'Van': '밴',
  'Electric': '전기차'
};

export default function VehiclesPanel() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>차량 관리</CardTitle>
        <CardDescription>전체 차량 목록입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>차량</TableHead>
              <TableHead>차종</TableHead>
              <TableHead>톤수 (kg)</TableHead>
              <TableHead>운전자</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.name}</TableCell>
                <TableCell>{typeMap[vehicle.type]}</TableCell>
                <TableCell>{vehicle.capacity.toLocaleString()}</TableCell>
                <TableCell>{vehicle.driver}</TableCell>
                <TableCell>
                  <Badge variant={
                    vehicle.status === 'On Route' ? 'default' : 
                    vehicle.status === 'Completed' ? 'secondary' : 
                    vehicle.status === 'Maintenance' ? 'destructive' : 'outline'
                  }>
                    {statusMap[vehicle.status]}
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
