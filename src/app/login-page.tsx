
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ShieldAlert } from 'lucide-react';
import { EcoTrackLogo } from '@/components/icons';
import { useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  email: z.string().email("유효하지 않은 이메일 주소입니다."),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
});

type FormValues = z.infer<typeof formSchema>;

const MOCK_ADMIN_EMAIL = "admin@ecotrack.com";
const MOCK_ADMIN_PASSWORD = "password123";

export default function LoginPage() {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);

    if (data.email === MOCK_ADMIN_EMAIL && data.password === MOCK_ADMIN_PASSWORD) {
      try {
        // We use anonymous sign-in to simulate a logged-in state without a real user
        initiateAnonymousSignIn(auth);
        // The useUser hook will detect the auth change and redirect.
      } catch (e: any) {
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
        console.error(e);
        setIsLoading(false);
      }
    } else {
      // Simulate network delay
      setTimeout(() => {
        setError("잘못된 정보입니다. 다시 시도해주세요.");
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <EcoTrackLogo className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="font-headline">리사이클에 오신 것을 환영합니다</CardTitle>
          <CardDescription>계속하려면 관리자 정보를 입력하세요</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@ecotrack.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>로그인 실패</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                로그인
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
