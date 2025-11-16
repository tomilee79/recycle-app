import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { drivers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function DriversPanel() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Driver Management</CardTitle>
        <CardDescription>An overview of all drivers.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Availability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell className="font-medium">{driver.name}</TableCell>
                <TableCell>{driver.contact}</TableCell>
                <TableCell>
                  <Badge variant={driver.isAvailable ? 'default' : 'secondary'} className={cn(driver.isAvailable ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600")}>
                    {driver.isAvailable ? 'Available' : 'Unavailable'}
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
