
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { cn } from '@/lib/utils';
import type { Todo } from '@/lib/types';

const initialTodos: Todo[] = [
  { id: 1, text: '주간 운영 보고서 작성', completed: false },
  { id: 2, text: '신규 고객사(Recycle Corp) 계약 조건 확인', completed: false },
  { id: 3, text: 'V004 차량 정비 일정 조율', completed: true },
];

export default function TodosPanel() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState('');

  const handleAddTodo = () => {
    if (newTodo.trim() === '') return;
    const newTodoItem: Todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
    };
    setTodos(prevTodos => [newTodoItem, ...prevTodos]);
    setNewTodo('');
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

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <CheckSquare className="text-primary"/>
            할일 관리
          </CardTitle>
          <CardDescription>
            개인적인 할 일이나 팀의 작은 업무들을 관리하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2 mb-6">
            <Input
              type="text"
              placeholder="새로운 할 일을 입력하세요..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            <Button onClick={handleAddTodo}>
              <Plus className="mr-2" />
              추가
            </Button>
          </div>

          <ScrollArea className="h-96 pr-4">
            <div className="space-y-3">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-4 p-3 rounded-md border bg-muted/20"
                >
                  <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleTodo(todo.id)}
                  />
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={cn(
                      "flex-1 text-sm font-medium cursor-pointer",
                      todo.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {todo.text}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    <Trash2 className="text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
               {todos.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  <p>등록된 할 일이 없습니다.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
