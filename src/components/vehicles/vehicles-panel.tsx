
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { vehicles, drivers, customers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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

const formSchema = z.object({
  customerId: z.string().min(1, "고객을 선택해주세요."),
  vehicleId: z.string().min(1, "차량을 선택해주세요."),
  driverId: z.string().min(1, "운전자를 선택해주세요."),
});

type FormValues = z.infer<typeof formSchema>;

export default function VehiclesPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: '',
      vehicleId: '',
      driverId: ''
    }
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setIsSubmitting(true);
    console.log("New Dispatch Data:", data);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "배차 등록 완료",
        description: "새로운 배차 정보가 성공적으로 등록되었습니다.",
      });
      setIsSubmitting(false);
      setIsModalOpen(false);
      form.reset();
    }, 1000);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>차량 관리</CardTitle>
          <CardDescription>전체 차량 목록입니다.</CardDescription>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>새 배차 등록</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>새 배차 등록</DialogTitle>
              <DialogDescription>새로운 배차 정보를 입력해주세요.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>고객</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="고객사를 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>차량</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="차량을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map(vehicle => (
                            <SelectItem key={vehicle.id} value={vehicle.id} disabled={vehicle.status !== 'Idle'}>
                              {vehicle.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="driverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>운전자</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="운전자를 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {drivers.map(driver => (
                            <SelectItem key={driver.id} value={driver.id} disabled={!driver.isAvailable}>
                              {driver.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    등록하기
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
