
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, UserCircle } from 'lucide-react';
import { users } from '@/lib/mock-data';

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요."),
  newPassword: z.string().min(6, "새 비밀번호는 최소 6자 이상이어야 합니다."),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "새 비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const currentUser = users[0]; // Mock current user

export default function MyAccountPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<PasswordFormValues> = async (data) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, you would verify the current password and then update it.
      toast({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      });
      form.reset();
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
            <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary/10 rounded-full border">
                    <UserCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>내 정보</CardTitle>
                    <CardDescription>현재 로그인된 계정 정보입니다.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">이름</p>
                <p>{currentUser.name}</p>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">이메일</p>
                <p>{currentUser.email}</p>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">역할</p>
                <p>{currentUser.role}</p>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">계정 생성일</p>
                <p>{currentUser.createdAt}</p>
            </div>
        </CardContent>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
             <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary/10 rounded-full border">
                    <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>비밀번호 변경</CardTitle>
                    <CardDescription>새로운 비밀번호를 설정합니다.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>현재 비밀번호</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>새 비밀번호</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>새 비밀번호 확인</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                비밀번호 변경
                </Button>
            </CardFooter>
            </form>
        </Form>
      </Card>
    </div>
  );
}
