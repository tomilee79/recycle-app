
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Switch } from '../ui/switch';

const securitySettingsSchema = z.object({
  sessionTimeout: z.string(),
  forceTwoFactor: z.boolean(),
});

type SecuritySettingsFormValues = z.infer<typeof securitySettingsSchema>;

export default function SecuritySettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      sessionTimeout: '30',
      forceTwoFactor: false,
    },
  });

  const onSubmit: SubmitHandler<SecuritySettingsFormValues> = async (data) => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "설정 저장됨",
        description: "보안 설정이 성공적으로 저장되었습니다.",
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
                      <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                      <CardTitle>계정 보안</CardTitle>
                      <CardDescription>시스템 접근 및 계정 보안 관련 설정을 관리합니다.</CardDescription>
                  </div>
              </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="sessionTimeout"
              render={({ field }) => (
                <FormItem className='max-w-sm'>
                  <FormLabel>세션 타임아웃</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="15">15분</SelectItem>
                          <SelectItem value="30">30분</SelectItem>
                          <SelectItem value="60">1시간</SelectItem>
                          <SelectItem value="never">없음</SelectItem>
                      </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    이 시간 동안 활동이 없으면 자동으로 로그아웃됩니다.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="forceTwoFactor"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2"><Lock /> 2단계 인증(2FA) 강제</FormLabel>
                    <CardDescription>
                      모든 관리자가 로그인 시 2단계 인증을 필수로 사용하도록 설정합니다.
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
          <CardFooter className="justify-end">
              <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              보안 설정 저장
              </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
