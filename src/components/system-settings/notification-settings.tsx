
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bell, Mail, Smartphone } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { Switch } from '../ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const notificationSettingsSchema = z.object({
  taskAssigned: z.object({ email: z.boolean(), inApp: z.boolean() }),
  dailyReport: z.object({ email: z.boolean(), inApp: zboolean() }),
  contractExpiring: z.object({ email: z.boolean(), inApp: z.boolean() }),
});

type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;

const notificationEvents = [
    { id: 'taskAssigned', label: '신규 작업 배정 시' },
    { id: 'dailyReport', label: '일일 보고서 생성 시' },
    { id: 'contractExpiring', label: '계약 만료 30일 전' },
] as const;


export default function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      taskAssigned: { email: true, inApp: true },
      dailyReport: { email: true, inApp: false },
      contractExpiring: { email: true, inApp: true },
    },
  });

  const onSubmit: SubmitHandler<NotificationSettingsFormValues> = async (data) => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "설정 저장됨",
        description: "알림 설정이 성공적으로 저장되었습니다.",
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
             <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary/10 rounded-full border">
                      <Bell className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                      <CardTitle>시스템 알림 설정</CardTitle>
                      <CardDescription>특정 이벤트 발생 시 알림을 받을 채널을 설정합니다.</CardDescription>
                  </div>
              </div>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>이벤트</TableHead>
                        <TableHead className="text-center w-40">
                            <div className='flex items-center justify-center gap-2'>
                                <Mail className="size-4" /> 이메일
                            </div>
                        </TableHead>
                        <TableHead className="text-center w-40">
                            <div className='flex items-center justify-center gap-2'>
                                <Smartphone className="size-4" /> 인앱 알림
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {notificationEvents.map((event) => (
                        <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.label}</TableCell>
                            <TableCell className="text-center">
                                <FormField
                                    control={form.control}
                                    name={`${event.id}.email`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </TableCell>
                             <TableCell className="text-center">
                                <FormField
                                    control={form.control}
                                    name={`${event.id}.inApp`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="justify-end">
              <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              알림 설정 저장
              </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
