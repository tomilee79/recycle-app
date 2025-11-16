
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckSquare, Plus, Trash2, Edit, Save } from "lucide-react";
import { cn } from '@/lib/utils';
import type { Todo, Priority } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

const initialTodos: Todo[] = [
  { id: 1, text: '주간 운영 보고서 작성', completed: false, priority: 'High' },
  { id: 2, text: '신규 고객사(Recycle Corp) 계약 조건 확인', completed: false, priority: 'High' },
  { id: 3, text: 'V004 차량 정비 일정 조율', completed: true, priority: 'Medium' },
  { id: 4, text: '분기별 실적 데이터 분석', completed: false, priority: 'Medium' },
  { id: 5, text: '사무용품 재고 확인 및 주문', completed: false, priority: 'Low' },
];

const priorityMap: { [key in Priority]: { text: string; color: string; } } = {
    High: { text: '높음', color: 'bg-red-500' },
    Medium: { text: '보통', color: 'bg-yellow-500' },
    Low: { text: '낮음', color: 'bg-green-500' },
};


export default function TodosPanel() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<Priority>('Medium');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleAddTodo = () => {
    if (newTodo.trim() === '') return;
    const newTodoItem: Todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      priority: newTodoPriority,
    };
    setTodos(prevTodos => [newTodoItem, ...prevTodos]);
    setNewTodo('');
    setNewTodoPriority('Medium');
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
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  const handleEditStart = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditingText(todo.text);
  };

  const handleEditCancel = () => {
    setEditingTodoId(null);
    setEditingText('');
  };

  const handleEditSave = (id: number) => {
    if (editingText.trim() === '') return;
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, text: editingText } : todo
      )
    );
    handleEditCancel();
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'pending') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

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
          <div className="flex flex-col gap-4 mb-6 p-4 border rounded-lg">
            <Input
              type="text"
              placeholder="새로운 할 일을 입력하세요..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            <div className="flex justify-between items-center">
              <RadioGroup defaultValue="Medium" value={newTodoPriority} onValueChange={(value: Priority) => setNewTodoPriority(value)} className="flex gap-4">
                {(Object.keys(priorityMap) as Priority[]).map(p => (
                  <div key={p} className="flex items-center space-x-2">
                    <RadioGroupItem value={p} id={`p-new-${p}`} />
                    <Label htmlFor={`p-new-${p}`}>{priorityMap[p].text}</Label>
                  </div>
                ))}
              </RadioGroup>
              <Button onClick={handleAddTodo}>
                <Plus className="mr-2" />
                추가
              </Button>
            </div>
          </div>

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
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-4 p-3 rounded-md border bg-muted/20"
                >
                  <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleTodo(todo.id)}
                    disabled={editingTodoId === todo.id}
                  />
                  {editingTodoId === todo.id ? (
                    <Input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEditSave(todo.id)}
                      onBlur={() => handleEditSave(todo.id)}
                      autoFocus
                      className="flex-1"
                    />
                  ) : (
                    <label
                      htmlFor={`todo-${todo.id}`}
                      className={cn(
                        "flex-1 text-sm font-medium cursor-pointer",
                        todo.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {todo.text}
                    </label>
                  )}
                  
                  <div className={cn("flex items-center gap-2", editingTodoId === todo.id && "hidden")}>
                    <div className={cn("text-xs font-semibold text-white px-2 py-0.5 rounded-full flex items-center gap-1", priorityMap[todo.priority].color)}>
                       {priorityMap[todo.priority].text}
                    </div>

                    <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEditStart(todo)}>
                      <Edit className="text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => handleDeleteTodo(todo.id)}>
                      <Trash2 className="text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                   {editingTodoId === todo.id && (
                     <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEditSave(todo.id)}>
                       <Save className="text-primary"/>
                     </Button>
                   )}
                </div>
              ))}
               {filteredTodos.length === 0 && (
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
