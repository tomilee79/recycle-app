
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import type { CollectionTask, TaskReport } from '@/lib/types';
import { Loader2, Upload, File } from 'lucide-react';
import { useState } from 'react';

const reportFormSchema = z.object({
  collectedWeight: z.coerce.number().min(0, "수거량은 0 이상이어야 합니다."),
  notes: z.string().optional(),
  photo: z.any().optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
  task: CollectionTask;
  onSave: (taskId: string, report: Omit<TaskReport, 'comments'>) => void;
}

export function ReportForm({ task, onSave }: ReportFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(task.report?.photoUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      collectedWeight: task.report?.collectedWeight || task.collectedWeight || 0,
      notes: task.report?.notes || '',
      photo: null,
    },
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<ReportFormValues> = (data) => {
    const reportData: Omit<TaskReport, 'comments'> = {
        reportDate: task.report?.reportDate || new Date().toISOString().split('T')[0],
        collectedWeight: data.collectedWeight,
        notes: data.notes,
        photoUrl: photoPreview || undefined,
    }
    onSave(task.id, reportData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="collectedWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>실제 수거량 (kg)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>특이사항</FormLabel>
              <FormControl>
                <Textarea placeholder="수거 관련 특이사항을 입력하세요... (예: 추가 수거 요청, 오염 심각 등)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>현장 사진</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                    <Input id="picture" type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                    <label htmlFor="picture" className="flex-1 cursor-pointer">
                        <div className="border-2 border-dashed rounded-md p-4 text-center text-muted-foreground hover:bg-muted/50">
                            <Upload className="mx-auto h-8 w-8"/>
                            <p className="mt-1 text-sm">사진을 업로드하려면 클릭하거나 파일을 드래그하세요</p>
                        </div>
                    </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {fileName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground border p-2 rounded-md">
                <File className="h-4 w-4"/>
                <span>{fileName}</span>
            </div>
        )}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            보고서 저장
          </Button>
        </div>
      </form>
    </Form>
  );
}
