
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, Building } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const generalSettingsSchema = z.object({
  defaultWeightUnit: z.enum(['kg', 'ton']),
  defaultCurrency: z.enum(['KRW', 'USD']),
  defaultCustomerTier: z.enum(['Bronze', 'Silver', 'Gold', 'VIP', 'VVIP']),
});

type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;

export default function GeneralSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      defaultWeightUnit: 'kg',
      defaultCurrency: 'KRW',
      defaultCustomerTier: 'Bronze',
    },
  });

  const onSubmit: SubmitHandler<GeneralSettingsFormValues> = async (data) => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "설정 저장됨",
        description: "일반 설정이 성공적으로 저장되었습니다.",
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <CardContent className="space-y-6">
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
                  <FormItem>
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
        </div>
        <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                일반 설정 저장
            </Button>
        </div>
      </form>
    </Form>
  );
}
