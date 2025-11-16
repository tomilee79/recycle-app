'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { predictMaterialType, type PredictMaterialTypeOutput } from '@/ai/flows/predict-material-type';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  location: z.string().min(3, "위치는 최소 3자 이상이어야 합니다."),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "시간을 HH:MM 형식으로 입력해주세요."),
});

type FormValues = z.infer<typeof formSchema>;

export default function PredictPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictMaterialTypeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "도심 주거 지역",
      time: "09:30",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const prediction = await predictMaterialType(data);
      setResult(prediction);
    } catch (e: any) {
      setError("예측을 가져오는데 실패했습니다. 다시 시도해주세요.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full border">
                <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle className="font-headline">재료 유형 예측</CardTitle>
                <CardDescription>위치와 시간을 기반으로 재료 유형을 예측합니다.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>위치</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 도심 주거 지역" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시간 (24시간 형식)</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 09:30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                재료 예측
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <div className="text-center mt-6 flex items-center justify-center space-x-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>예측 생성 중...</span>
        </div>
      )}

      {result && (
        <Card className="mt-6 animate-in fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-headline">예측 결과</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-muted-foreground">예측된 재료</p>
                <Badge variant="secondary" className="text-base">{result.predictedMaterialType}</Badge>
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">신뢰도</p>
                    <p className="font-semibold">{(result.confidenceLevel * 100).toFixed(0)}%</p>
                </div>
                <Progress value={result.confidenceLevel * 100} />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="mt-6 text-destructive text-center p-4 bg-destructive/10 rounded-md">{error}</div>
      )}
    </div>
  );
}
