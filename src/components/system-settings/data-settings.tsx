
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database, HardDrive, History } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const dataSettingsSchema = z.object({
  retentionPeriod: z.string(),
  backupFrequency: z.string(),
});

type DataSettingsFormValues = z.infer<typeof dataSettingsSchema>;

export default function DataSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<DataSettingsFormValues>({
    resolver: zodResolver(dataSettingsSchema),
    defaultValues: {
      retentionPeriod: '3',
      backupFrequency: 'daily',
    },
  });

  const onSubmit: SubmitHandler<DataSettingsFormValues> = async (data) => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "설정 저장됨",
        description: "데이터 관리 설정이 성공적으로 저장되었습니다.",
      });
      setIsLoading(false);
    }, 1000);
  };
  
  const handleBackupNow = () => {
    toast({
        title: "백업 시작됨",
        description: "시스템 데이터 백업이 시작되었습니다. 완료 시 알림이 전송됩니다.",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
             <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary/10 rounded-full border">
                      <Database className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                      <CardTitle>데이터 관리</CardTitle>
                      <CardDescription>데이터 보존 및 백업 정책을 설정합니다.</CardDescription>
                  </div>
              </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="retentionPeriod"
              render={({ field }) => (
                <FormItem className='max-w-sm'>
                  <FormLabel className="flex items-center gap-2"><History/> 데이터 보존 기간</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="1">1년</SelectItem>
                          <SelectItem value="3">3년</SelectItem>
                          <SelectItem value="5">5년</SelectItem>
                          <SelectItem value="forever">영구 보존</SelectItem>
                      </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    완료된 작업 및 관련 데이터의 보존 기간을 설정합니다.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="backupFrequency"
              render={({ field }) => (
                <FormItem className='max-w-sm'>
                  <FormLabel className="flex items-center gap-2"><HardDrive/> 자동 백업 주기</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="daily">매일</SelectItem>
                          <SelectItem value="weekly">매주</SelectItem>
                          <SelectItem value="monthly">매월</SelectItem>
                      </SelectContent>
                  </Select>
                   <p className="text-sm text-muted-foreground">
                    시스템 데이터를 정기적으로 백업하는 주기를 설정합니다.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='max-w-sm'>
                <Button type="button" variant="outline" onClick={handleBackupNow}>지금 백업</Button>
                 <p className="text-sm text-muted-foreground mt-2">
                    현재 시스템 데이터를 즉시 백업합니다.
                </p>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
              <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              데이터 설정 저장
              </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
