
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckSquare, Plus, Trash2, Edit, Save, Calendar as CalendarIcon, AlertTriangle, X } from "lucide-react";
import { cn } from '@/lib/utils';
import type { Todo, Priority } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format, isPast, startOfToday, isSameDay } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';

const initialTodos: Todo[] = [
  { id: 1, text: '주간 운영 보고서 작성', completed: false, priority: 'High', dueDate: new Date() },
  { id: 2, text: '신규 고객사(Recycle Corp) 계약 조건 확인', completed: false, priority: 'High', dueDate: new Date(new Date().setDate(new Date().getDate() + 2)) },
  { id: 3, text: 'V004 차량 정비 일정 조율', completed: true, priority: 'Medium', dueDate: new Date(new Date().setDate(new Date().getDate() - 1)) },
  { id: 4, text: '분기별 실적 데이터 분석', completed: false, priority: 'Medium', dueDate: new Date(new Date().setDate(new Date().getDate() + 5)) },
  { id: 5, text: '사무용품 재고 확인 및 주문', completed: false, priority: 'Low', dueDate: new Date(new Date().setDate(new Date().getDate() + 7)) },
  { id: 6, text: '2분기 마케팅 캠페인 기획', completed: false, priority: 'High', dueDate: new Date(new Date().setDate(new Date().getDate() + 1)) },
];

const priorityMap: { [key in Priority]: { text: string; color: string; value: number; } } = {
    High: { text: '높음', color: 'bg-red-500', value: 3 },
    Medium: { text: '보통', color: 'bg-yellow-500', value: 2 },
    Low: { text: '낮음', color: 'bg-green-500', value: 1 },
};

const formSchema = z.object({
  text: z.string().min(1, "할 일을 입력해주세요."),
  priority: z.enum(['High', 'Medium', 'Low']),
  dueDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TodosPanel() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      priority: 'Medium',
      dueDate: undefined,
    },
  });

  const editingForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (editingTodo) {
      editingForm.reset({
        text: editingTodo.text,
        priority: editingTodo.priority,
        dueDate: editingTodo.dueDate,
      });
    }
  }, [editingTodo, editingForm]);

  const handleAddTodo: SubmitHandler<FormValues> = (data) => {
    const newTodoItem: Todo = {
      id: Date.now(),
      text: data.text,
      completed: false,
      priority: data.priority,
      dueDate: data.dueDate,
    };
    setTodos(prevTodos => [newTodoItem, ...prevTodos]);
    form.reset({ text: '', priority: 'Medium', dueDate: undefined });
  };

  const handleToggleTodo = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  const handleEditStart = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleEditCancel = () => {
    setEditingTodo(null);
  };

  const handleEditSave: SubmitHandler<FormValues> = (data) => {
    if (!editingTodo) return;
    setTodos(
      todos.map(todo =>
        todo.id === editingTodo.id ? { ...todo, ...data } : todo
      )
    );
    setEditingTodo(null);
  };

  const sortedAndFilteredTodos = useMemo(() => {
    return todos
      .filter(todo => {
        if (filter === 'pending') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        if (priorityMap[a.priority].value !== priorityMap[b.priority].value) {
            return priorityMap[b.priority].value - priorityMap[a.priority].value;
        }
        if (a.dueDate && b.dueDate) {
            return a.dueDate.getTime() - b.dueDate.getTime();
        }
        return a.id - b.id;
      });
  }, [todos, filter]);

  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-full border">
                  <CheckSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                  <CardTitle className="font-headline text-2xl">할일 관리</CardTitle>
                  <CardDescription>
                      개인적인 할 일이나 팀의 작은 업무들을 관리하세요.
                  </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddTodo)} className="flex flex-col gap-4 mb-6 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem><FormControl><Input placeholder="새로운 할 일을 입력하세요..." {...field} /></FormControl><FormMessage/></FormItem>
                )}
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem><FormControl>
                          <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                            {(Object.keys(priorityMap) as Priority[]).map(p => (
                              <div key={p} className="flex items-center space-x-2">
                                <RadioGroupItem value={p} id={`p-new-${p}`} /><Label htmlFor={`p-new-${p}`}>{priorityMap[p].text}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                      </FormControl></FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem><Popover>
                        <PopoverTrigger asChild>
                          <FormControl><Button variant={"outline"} size="sm" className={cn("w-[150px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "MM/dd") : <span>마감일 설정</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                      </Popover></FormItem>
                    )}
                  />
                </div>
                <Button type="submit"><Plus className="mr-2" />추가</Button>
              </div>
            </form>
          </Form>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {(['all', 'pending', 'completed'] as const).map(f => (
                <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                  {f === 'all' ? '전체' : f === 'pending' ? '진행중' : '완료'}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {todos.length}개의 할 일 중 {completedCount}개 완료
            </p>
          </div>

          <ScrollArea className="h-96 pr-4">
            <div className="space-y-3">
              {sortedAndFilteredTodos.map((todo) => (
                <div key={todo.id}>
                {editingTodo?.id === todo.id ? (
                  <Form {...editingForm}>
                  <form onSubmit={editingForm.handleSubmit(handleEditSave)} className="flex flex-col gap-3 p-3 rounded-md border bg-muted/50">
                      <div className="flex-1">
                          <FormField control={editingForm.control} name="text" render={({ field }) => (<FormItem><Input {...field} autoFocus/></FormItem>)}/>
                      </div>
                      <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                              <FormField control={editingForm.control} name="priority" render={({ field }) => (
                                  <FormItem><RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-2">
                                      {(Object.keys(priorityMap) as Priority[]).map(p => (<div key={p} className="flex items-center space-x-1"><RadioGroupItem value={p} id={`p-edit-${p}`} /><Label htmlFor={`p-edit-${p}`} className="text-xs">{priorityMap[p].text}</Label></div>))}
                                  </RadioGroup></FormItem>
                              )}/>
                              <FormField control={editingForm.control} name="dueDate" render={({ field }) => (
                                  <FormItem><Popover><PopoverTrigger asChild><Button variant={"outline"} size="sm" className={cn("h-7 text-xs w-[100px] pl-2 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "MM/dd") : <span>마감일</span>}<CalendarIcon className="ml-auto h-3 w-3 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
                              )}/>
                          </div>
                          <div className='flex gap-2'>
                            <Button type="submit" size="sm"><Save className="mr-2"/>저장</Button>
                            <Button type="button" variant="ghost" size="sm" onClick={handleEditCancel}><X className="mr-2"/>취소</Button>
                          </div>
                      </div>
                  </form>
                  </Form>
                ) : (
                <div className="flex items-center gap-4 p-3 rounded-md border bg-muted/20">
                  <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleTodo(todo.id)}
                  />
                  <div className="flex-1">
                    <label htmlFor={`todo-${todo.id}`} className={cn("font-medium cursor-pointer", todo.completed && "line-through text-muted-foreground")}>
                      {todo.text}
                    </label>
                    {todo.dueDate && (
                        <div className={cn("text-xs flex items-center gap-1 mt-1", todo.completed ? "text-muted-foreground" : isPast(todo.dueDate) && !isSameDay(todo.dueDate, startOfToday()) ? "text-red-500" : "text-muted-foreground")}>
                            <CalendarIcon className="size-3"/>
                            <span>{format(todo.dueDate, 'MM월 dd일')}</span>
                            {isPast(todo.dueDate) && !isSameDay(todo.dueDate, startOfToday()) && !todo.completed && <AlertTriangle className="size-3"/>}
                        </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn("text-xs font-semibold text-white px-2 py-0.5 rounded-full flex items-center gap-1", priorityMap[todo.priority].color)}>
                       {priorityMap[todo.priority].text}
                    </div>

                    <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEditStart(todo)} disabled={todo.completed}>
                      <Edit className="text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => handleDeleteTodo(todo.id)}>
                      <Trash2 className="text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
                )}
                </div>
              ))}
               {sortedAndFilteredTodos.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  <p>해당하는 할 일이 없습니다.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

    
