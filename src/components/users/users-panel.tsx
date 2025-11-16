
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { users as initialUsers } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Search, Trash2, UserPlus, Users, ShieldCheck, Shield, UserCog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import type { User, UserRole, UserStatus } from '@/lib/types';
import { format } from 'date-fns';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';


const roleMap: { [key in UserRole]: { label: string; icon: React.ElementType, variant: "default" | "secondary" | "outline" } } = {
  'Super Admin': { label: '최고 관리자', icon: ShieldCheck, variant: 'default' },
  'Manager Admin': { label: '중간 관리자', icon: Shield, variant: 'secondary' },
  'User': { label: '일반 사용자', icon: UserCog, variant: 'outline' },
};
const roles = Object.keys(roleMap) as UserRole[];

const statusMap: { [key in UserStatus]: { label: string, variant: "default" | "destructive" } } = {
  'Active': { label: '활성', variant: 'default' },
  'Disabled': { label: '비활성', variant: 'destructive' },
};
const statuses = Object.keys(statusMap) as UserStatus[];

const userFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다."),
  email: z.string().email("유효한 이메일 주소여야 합니다."),
  role: z.enum(roles),
  status: z.enum(statuses).optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const CURRENT_USER_ID = 'U001'; // Mock current user for safety check

export default function UsersPanel() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [filters, setFilters] = useState({ role: 'All', status: 'All' });
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
  });

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const roleMatch = filters.role === 'All' || user.role === filters.role;
      const statusMatch = filters.status === 'All' || user.status === filters.status;
      const searchMatch = user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
      return roleMatch && statusMatch && searchMatch;
    });
  }, [users, filters, search]);

  const {
    currentPage,
    setCurrentPage,
    paginatedData: paginatedUsers,
    totalPages,
  } = usePagination(filteredUsers, 7);

  const openSheet = (user: User | null) => {
    setSelectedUser(user);
    if (user) {
      form.reset(user);
    } else {
      form.reset({
        name: '',
        email: '',
        role: 'User',
      });
    }
    setIsSheetOpen(true);
  };
  
  const closeSheet = () => {
    setIsSheetOpen(false);
    setSelectedUser(null);
  };

  const onSubmit: SubmitHandler<UserFormValues> = (data) => {
    if (selectedUser) {
      // Update User
      setUsers(users.map(u => (u.id === selectedUser.id ? { ...u, ...data } : u)));
      toast({ title: "사용자 업데이트됨", description: `${data.name}의 정보가 성공적으로 수정되었습니다.` });
    } else {
      // Create User
      const newUser: User = {
        id: `U${String(users.length + 1).padStart(3, '0')}`,
        ...data,
        status: 'Active',
        createdAt: format(new Date(), 'yyyy-MM-dd'),
      };
      setUsers([newUser, ...users]);
      toast({ title: "사용자 생성됨", description: `${data.name} 계정이 성공적으로 생성되었습니다.` });
    }
    closeSheet();
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    setUsers(users.filter(u => u.id !== selectedUser.id));
    toast({
      title: "사용자 삭제됨",
      description: `${selectedUser.name} 계정이 영구적으로 삭제되었습니다.`,
      variant: 'destructive',
    });
    closeSheet();
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>사용자 관리</CardTitle>
              <CardDescription>모든 사용자를 생성, 조회, 수정 및 관리합니다.</CardDescription>
            </div>
            <Button onClick={() => openSheet(null)}>
              <UserPlus className="mr-2"/>새 사용자 추가
            </Button>
          </div>
          <div className="flex items-center justify-between gap-2 pt-4">
            <div className="flex gap-2">
              <Select value={filters.role} onValueChange={(value) => setFilters(f => ({ ...f, role: value }))}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="역할 필터" /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="All">모든 역할</SelectItem>
                      {roles.map(r => <SelectItem key={r} value={r}>{roleMap[r].label}</SelectItem>)}
                  </SelectContent>
              </Select>
               <Select value={filters.status} onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="상태 필터" /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="All">모든 상태</SelectItem>
                      {statuses.map(s => <SelectItem key={s} value={s}>{statusMap[s].label}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="이름 또는 이메일로 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>이름</TableHead><TableHead>이메일</TableHead><TableHead>역할</TableHead><TableHead>상태</TableHead><TableHead>등록일</TableHead></TableRow></TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} onClick={() => openSheet(user)} className="cursor-pointer">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                      <Badge variant={roleMap[user.role].variant} className="gap-1">
                          {React.createElement(roleMap[user.role].icon, { className: 'size-3'})}
                          {roleMap[user.role].label}
                      </Badge>
                  </TableCell>
                  <TableCell><Badge variant={statusMap[user.status].variant}>{statusMap[user.status].label}</Badge></TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }} disabled={currentPage === 1}/>
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(page); }} isActive={currentPage === page}>
                        {page}
                        </PaginationLink>
                    </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }} disabled={currentPage === totalPages}/>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </CardFooter>
      </Card>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
            <SheetHeader>
                <SheetTitle className="text-2xl flex items-center gap-2">
                    <UserPlus/> {selectedUser ? '사용자 정보 수정' : '새 사용자 추가'}
                </SheetTitle>
                <SheetDescription>{selectedUser ? '사용자의 역할과 상태를 수정합니다.' : '새로운 사용자 정보를 입력합니다.'}</SheetDescription>
            </SheetHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>이름</FormLabel><FormControl><Input {...field} readOnly={!!selectedUser} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>이메일</FormLabel><FormControl><Input type="email" {...field} readOnly={!!selectedUser} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem><FormLabel>역할</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="역할을 선택하세요" /></SelectTrigger></FormControl>
                            <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{roleMap[r].label}</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                    </FormItem>
                )}/>
                {selectedUser && (
                  <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>상태</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="상태를 선택하세요" /></SelectTrigger></FormControl>
                              <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{statusMap[s].label}</SelectItem>)}</SelectContent>
                          </Select><FormMessage />
                      </FormItem>
                  )}/>
                )}
                <div className="flex justify-between items-center pt-6">
                  <Button type="submit">{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{selectedUser ? '저장' : '추가'}</Button>
                  {selectedUser && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive" disabled={selectedUser.id === CURRENT_USER_ID}>
                          <Trash2 className="mr-2"/>삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 작업은 되돌릴 수 없습니다. {selectedUser.name} 사용자가 영구적으로 삭제됩니다.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>삭제 확인</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
            </form>
            </Form>
        </SheetContent>
      </Sheet>
    </>
  );
}
