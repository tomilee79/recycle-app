
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const preferencesFormSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
});

type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

export default function PreferencesPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
    },
  });

  const onSubmit: SubmitHandler<PreferencesFormValues> = async (data) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "설정 저장됨",
        description: "알림 설정이 성공적으로 저장되었습니다.",
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
           <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary/10 rounded-full border">
                    <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>알림 설정</CardTitle>
                    <CardDescription>시스템 알림 수신 방법을 설정합니다.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-base">이메일 알림</Label>
              <p className="text-sm text-muted-foreground">
                중요 업데이트 및 요약 정보를 이메일로 받습니다.
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={form.watch('emailNotifications')}
              onCheckedChange={(checked) => form.setValue('emailNotifications', checked)}
            />
          </div>
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications" className="text-base">푸시 알림</Label>
              <p className="text-sm text-muted-foreground">
                실시간 긴급 알림을 앱 푸시로 받습니다.
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={form.watch('pushNotifications')}
              onCheckedChange={(checked) => form.setValue('pushNotifications', checked)}
            />
          </div>
        </CardContent>
        <CardFooter>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                알림 설정 저장
            </Button>
        </CardFooter>
        </form>
      </Card>
    </div>
  );
}
