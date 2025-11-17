
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Truck,
  LogOut,
  Users,
  Bot,
  Bell,
  PieChart,
  Medal,
  ChevronDown,
  Route,
  Calendar,
  CheckSquare,
  FileText,
  FileSignature,
  Users2,
  Receipt,
  ClipboardList,
  Info,
  User,
  UserCog,
  BookUser,
  FolderKanban,
  Settings2,
  ExternalLink,
  SlidersHorizontal,
  ClipboardEdit,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { EcoTrackLogo } from '@/components/icons';
import { placeholderImages } from '@/lib/placeholder-images';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


type View = 'dashboard' | 'dispatch' | 'billing' | 'vehicles' | 'drivers' | 'driver-performance' | 'customers' | 'contracts' | 'waste-analysis' | 'route-optimization' | 'schedule' | 'tasks' | 'todos' | 'quotes' | 'admin' | 'contact' | 'system-settings';

type MenuGroup = 'operations' | 'crm' | 'resources' | 'system';

const menuGroups: Record<MenuGroup, View[]> = {
  operations: ['dashboard', 'dispatch', 'schedule', 'tasks', 'todos'],
  crm: ['customers', 'quotes', 'contracts', 'billing'],
  resources: ['vehicles', 'drivers', 'driver-performance', 'waste-analysis'],
  system: ['route-optimization', 'admin', 'system-settings'],
};


export default function MainLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const activeView = (params.view || 'dashboard') as View;

  const [openMenuGroup, setOpenMenuGroup] = useState<MenuGroup | null>(() => {
    for (const group in menuGroups) {
        if (menuGroups[group as MenuGroup].includes(activeView)) {
            return group as MenuGroup;
        }
    }
    return 'operations';
  });
  
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const handleLogout = () => {
    auth.signOut();
  };

  const viewTitles: { [key in View]: string } = {
    dashboard: '통합 대시보드',
    dispatch: '배차 관리',
    billing: '정산 관리',
    vehicles: '차량 및 장비 관리',
    drivers: '직원 관리',
    'driver-performance': '성과 대시보드',
    customers: '고객 관리',
    contracts: '계약 관리',
    'waste-analysis': '상세 폐기물 분석',
    'route-optimization': 'AI 경로 최적화',
    schedule: '일정 관리',
    tasks: '작업 관리',
    todos: '할일 관리',
    quotes: '견적 관리',
    admin: '관리자 계정 관리',
    contact: '개발사 연락처',
    'system-settings': '시스템 환경설정',
  };
  
  const userAvatar = placeholderImages.find(p => p.id === 'user-avatar');

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const isGroupActive = (group: MenuGroup) => menuGroups[group].includes(activeView);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <EcoTrackLogo className="size-8 text-primary" />
            <span className="text-lg font-semibold text-sidebar-foreground">리사이클</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <Collapsible open={openMenuGroup === 'operations'} onOpenChange={() => setOpenMenuGroup(openMenuGroup === 'operations' ? null : 'operations')} className="w-full">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isActive={isGroupActive('operations')} className="justify-between">
                  <div className="flex items-center gap-2"><FolderKanban /><span>운영 관리</span></div>
                  <ChevronDown className={cn("size-4 transition-transform", openMenuGroup === 'operations' && "rotate-180")} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenu className="pl-6">
                  <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'dashboard'} asChild><Link href="/dashboard"><LayoutDashboard /><span>통합 대시보드</span></Link></SidebarMenuButton></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'dispatch'} asChild><Link href="/dispatch"><ClipboardEdit /><span>배차 관리</span></Link></SidebarMenuButton></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'schedule'} asChild><Link href="/schedule"><Calendar /><span>일정 관리</span></Link></SidebarMenuButton></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'tasks'} asChild><Link href="/tasks"><ClipboardList /><span>작업 관리</span></Link></SidebarMenuButton></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'todos'} asChild><Link href="/todos"><CheckSquare /><span>할일 관리</span></Link></SidebarMenuButton></SidebarMenuItem>
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={openMenuGroup === 'crm'} onOpenChange={() => setOpenMenuGroup(openMenuGroup === 'crm' ? null : 'crm')} className="w-full">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isActive={isGroupActive('crm')} className="justify-between">
                   <div className="flex items-center gap-2"><BookUser /><span>고객/계약</span></div>
                   <ChevronDown className={cn("size-4 transition-transform", openMenuGroup === 'crm' && "rotate-180")} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenu className="pl-6">
                    <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'customers'} asChild><Link href="/customers"><Users2 /><span>고객 관리</span></Link></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'quotes'} asChild><Link href="/quotes"><FileText /><span>견적 관리</span></Link></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'contracts'} asChild><Link href="/contracts"><FileSignature /><span>계약 관리</span></Link></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'billing'} asChild><Link href="/billing"><Receipt /><span>정산 관리</span></Link></SidebarMenuButton></SidebarMenuItem>
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={openMenuGroup === 'resources'} onOpenChange={() => setOpenMenuGroup(openMenuGroup === 'resources' ? null : 'resources')} className="w-full">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isActive={isGroupActive('resources')} className="justify-between">
                  <div className="flex items-center gap-2"><LayoutDashboard /><span>자원/분석</span></div>
                  <ChevronDown className={cn("size-4 transition-transform", openMenuGroup === 'resources' && "rotate-180")} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenu className="pl-6">
                    <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'vehicles'} asChild><Link href="/vehicles"><Truck /><span>차량 및 장비</span></Link></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'drivers'} asChild><Link href="/drivers"><Users /><span>직원 관리</span></Link></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'driver-performance'} asChild><Link href="/driver-performance"><Medal/><span>성과 대시보드</span></Link></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'waste-analysis'} asChild><Link href="/waste-analysis"><PieChart /><span>폐기물 분석</span></Link></SidebarMenuButton></SidebarMenuItem>
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
            
             <Collapsible open={openMenuGroup === 'system'} onOpenChange={() => setOpenMenuGroup(openMenuGroup === 'system' ? null : 'system')} className="w-full">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isActive={isGroupActive('system')} className="justify-between">
                  <div className="flex items-center gap-2"><Settings2 /><span>AI 및 시스템</span></div>
                  <ChevronDown className={cn("size-4 transition-transform", openMenuGroup === 'system' && "rotate-180")} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenu className="pl-6">
                    <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'route-optimization'} asChild><Link href="/route-optimization"><Route /><span>AI 경로 최적화</span></Link></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'system-settings'} asChild><Link href="/system-settings"><SlidersHorizontal /><span>시스템 환경설정</span></Link></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton isActive={activeView === 'admin'} asChild><Link href="/admin"><UserCog /><span>관리자 계정 관리</span></Link></SidebarMenuButton></SidebarMenuItem>
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
            <Separator className="my-2 bg-sidebar-border" />
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeView === 'contact'} asChild>
                <Link href="/contact"><Info /><span>개발사 연락처</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="https://tally.so/r/jaayl6" target="_blank" rel="noopener noreferrer"><ExternalLink /><span>개발문의</span></a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold font-headline">
              {viewTitles[activeView]}
            </h1>
          </div>
           <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground hidden md:block">
              본 리사이클 업무 관리 솔루션은 DX 컨설팅이 개발하였습니다. 시연 목적의 Demo 이므로 일부는 작동하지 않을 수 있습니다.
            </p>
            <Button variant="ghost" size="icon" asChild>
                <Link href="/notifications">
                    <Bell />
                    <span className="sr-only">알림 센터</span>
                </Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={userAvatar?.imageUrl} alt="User" data-ai-hint={userAvatar?.imageHint}/>
                            <AvatarFallback>관리자</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">관리자</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                Administrator
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/mypage"><User className="mr-2 h-4 w-4" /><span>마이페이지</span></Link>
                    </DropdownMenuItem>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <LogOut className="mr-2 h-4 w-4" /><span>로그아웃</span>
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>정말로 로그아웃 하시겠습니까?</AlertDialogTitle>
                            <AlertDialogDescription>
                            로그인 페이지로 돌아갑니다.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout}>로그아웃</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
