
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
import { Loader2, UserPlus } from 'lucide-react';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';

const formSchema = z.object({
  email: z.string().email("유효하지 않은 이메일 주소입니다."),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // 2. Add user info to 'admin_users' collection in Firestore
      const userDocRef = doc(firestore, 'admin_users', user.uid);
      const adminUserData = {
        uid: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
        role: 'admin'
      };
      
      // Use non-blocking write
      setDocumentNonBlocking(userDocRef, adminUserData, { merge: true });

      toast({
        title: "관리자 등록 성공",
        description: `${user.email} 계정이 성공적으로 등록되었습니다.`,
      });

      form.reset();

    } catch (error: any) {
      console.error("Error creating admin user:", error);
      let errorMessage = "계정 등록 중 오류가 발생했습니다. 다시 시도해주세요.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "이미 사용 중인 이메일입니다.";
      }
      toast({
        variant: "destructive",
        title: "등록 실패",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-full border">
                <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle>새 관리자 등록</CardTitle>
                <CardDescription>새로운 관리자 계정을 등록합니다.</CardDescription>
            </div>
          </div>
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
                    <Input type="email" placeholder="admin@example.com" {...field} />
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
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              등록하기
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
