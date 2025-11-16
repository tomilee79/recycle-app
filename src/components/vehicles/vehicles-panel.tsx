import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { vehicles } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function VehiclesPanel() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Vehicle Fleet</CardTitle>
        <CardDescription>An overview of all vehicles in the fleet.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Tonnage (kg)</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.name}</TableCell>
                <TableCell>{vehicle.type}</TableCell>
                <TableCell>{vehicle.capacity.toLocaleString()}</TableCell>
                <TableCell>{vehicle.driver}</TableCell>
                <TableCell>
                  <Badge variant={
                    vehicle.status === 'On Route' ? 'default' : 
                    vehicle.status === 'Completed' ? 'secondary' : 
                    vehicle.status === 'Maintenance' ? 'destructive' : 'outline'
                  }>
                    {vehicle.status}
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
