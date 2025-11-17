
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, SlidersHorizontal, Settings, FileClock, Building } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Switch } from '../ui/switch';

const settingsFormSchema = z.object({
  defaultWeightUnit: z.enum(['kg', 'ton']),
  defaultCurrency: z.enum(['KRW', 'USD']),
  autoGenerateReports: z.boolean(),
  defaultCustomerTier: z.enum(['Bronze', 'Silver', 'Gold', 'VIP', 'VVIP']),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SystemSettingsPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      defaultWeightUnit: 'kg',
      defaultCurrency: 'KRW',
      autoGenerateReports: false,
      defaultCustomerTier: 'Bronze',
    },
  });

  const onSubmit: SubmitHandler<SettingsFormValues> = async (data) => {
    setIsLoading(true);
    // Simulate API call to save settings
    setTimeout(() => {
      toast({
        title: "설정 저장됨",
        description: "시스템 환경설정이 성공적으로 저장되었습니다.",
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
               <div className="flex items-center gap-3">
                     <div className="p-2 bg-primary/10 rounded-full border">
                        <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>기본 단위 설정</CardTitle>
                        <CardDescription>시스템 전체에서 사용될 기본 단위를 설정합니다.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="defaultWeightUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>무게 단위</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="kg">킬로그램 (kg)</SelectItem>
                            <SelectItem value="ton">톤 (ton)</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="defaultCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>통화 단위</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="KRW">대한민국 원 (₩)</SelectItem>
                            <SelectItem value="USD">미국 달러 ($)</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
               <div className="flex items-center gap-3">
                     <div className="p-2 bg-primary/10 rounded-full border">
                        <Building className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>고객 관리 설정</CardTitle>
                        <CardDescription>신규 고객 관련 기본 설정을 관리합니다.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
               <FormField
                control={form.control}
                name="defaultCustomerTier"
                render={({ field }) => (
                  <FormItem className="max-w-sm">
                    <FormLabel>신규 고객 기본 등급</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Bronze">Bronze</SelectItem>
                            <SelectItem value="Silver">Silver</SelectItem>
                            <SelectItem value="Gold">Gold</SelectItem>
                             <SelectItem value="VIP">VIP</SelectItem>
                            <SelectItem value="VVIP">VVIP</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
           <Card className="shadow-lg">
            <CardHeader>
               <div className="flex items-center gap-3">
                     <div className="p-2 bg-primary/10 rounded-full border">
                        <FileClock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>자동화 설정</CardTitle>
                        <CardDescription>반복적인 작업을 자동화합니다.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
               <FormField
                control={form.control}
                name="autoGenerateReports"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">월간 정산 보고서 자동 생성</FormLabel>
                      <CardDescription>
                        매월 1일, 전월의 수거 데이터를 기반으로 정산 보고서를 자동으로 생성합니다.
                      </CardDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
             <CardFooter>
                <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                설정 저장
                </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
