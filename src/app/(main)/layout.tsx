
'use client';

import React from 'react';
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
  Settings,
  LogOut,
  Users,
  Building2,
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

type View = 'dashboard' | 'billing' | 'notifications' | 'vehicles' | 'drivers' | 'driver-performance' | 'customers' | 'contracts' | 'predict' | 'waste-analysis' | 'route-optimization' | 'schedule' | 'tasks' | 'mypage' | 'todos' | 'quotes' | 'users' | 'admin' | 'contact';


export default function MainLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const activeView = (params.view || 'dashboard') as View;
  
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
    dashboard: '실시간 배차 현황',
    billing: '정산 관리',
    notifications: '알림 센터',
    vehicles: '차량 및 장비 관리',
    drivers: '직원 관리',
    'driver-performance': '성과 대시보드',
    customers: '고객 목록',
    contracts: '계약 관리',
    predict: 'AI 예측',
    'waste-analysis': '상세 폐기물 분석',
    'route-optimization': 'AI 경로 최적화',
    schedule: '일정 관리',
    tasks: '작업 관리',
    mypage: '마이페이지',
    todos: '할일 관리',
    quotes: '견적 관리',
    users: '사용자 관리',
    admin: '관리자',
    contact: '개발사 연락처',
  };
  
  const userAvatar = placeholderImages.find(p => p.id === 'user-avatar');

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <EcoTrackLogo className="size-8 text-primary" />
            <span className="text-lg font-semibold text-sidebar-foreground">에코트랙</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === 'dashboard'}
                tooltip={{ children: '실시간 배차 현황' }}
                asChild
              >
                <Link href="/dashboard"><Truck /><span>실시간 배차 현황</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton
                    isActive={activeView === 'schedule'}
                    tooltip={{ children: '일정 관리' }}
                    asChild
                >
                    <Link href="/schedule"><Calendar /><span>일정 관리</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === 'tasks'}
                tooltip={{ children: '작업 관리' }}
                asChild
              >
               <Link href="/tasks"><ClipboardList /><span>작업 관리</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === 'todos'}
                tooltip={{ children: '할일 관리' }}
                asChild
              >
                <Link href="/todos"><CheckSquare /><span>할일 관리</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                isActive={activeView === 'quotes'}
                tooltip={{ children: '견적 관리' }}
                asChild
                >
                <Link href="/quotes"><FileText /><span>견적 관리</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === 'contracts'}
                tooltip={{ children: '계약 관리' }}
                asChild
              >
                <Link href="/contracts"><FileSignature /><span>계약 관리</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === 'billing'}
                tooltip={{ children: '정산 관리' }}
                asChild
              >
                <Link href="/billing"><Receipt /><span>정산 관리</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton
                    isActive={activeView === 'customers'}
                    tooltip={{ children: '고객 목록' }}
                    asChild
                >
                    <Link href="/customers"><Users2 /><span>고객 목록</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton
                    isActive={activeView === 'drivers'}
                    tooltip={{ children: '직원 관리' }}
                    asChild
                >
                    <Link href="/drivers"><Users /><span>직원 관리</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                    isActive={activeView === 'notifications'}
                    tooltip={{ children: '알림 센터' }}
                    asChild
                >
                    <Link href="/notifications"><Bell /><span>알림 센터</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === 'waste-analysis'}
                tooltip={{ children: '상세 폐기물 분석' }}
                asChild
              >
                <Link href="/waste-analysis"><PieChart /><span>폐기물 분석</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === 'route-optimization'}
                tooltip={{ children: 'AI 경로 최적화' }}
                asChild
              >
               <Link href="/route-optimization"><Route /><span>경로 최적화</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === 'vehicles'}
                tooltip={{ children: '차량 및 장비 관리' }}
                asChild
              >
                <Link href="/vehicles"><LayoutDashboard /><span>차량 및 장비</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === 'predict'}
                tooltip={{ children: 'AI 예측' }}
                asChild
              >
                <Link href="/predict"><Bot /><span>AI 예측</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === 'users'} asChild>
                    <Link href="/users"><Users /><span>사용자 관리</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === 'admin'} asChild>
                    <Link href="/admin"><UserCog /><span>관리자</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === 'driver-performance'} asChild>
                    <Link href="/driver-performance"><Medal/><span>성과 대시보드</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === 'mypage'}
                tooltip={{ children: '마이페이지' }}
                asChild
              >
                <Link href="/mypage"><User /><span>마이페이지</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === 'contact'}
                tooltip={{ children: '개발사 연락처' }}
                asChild
              >
                <Link href="/contact"><Info /><span>개발사 연락처</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="my-2 bg-sidebar-border" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <div className="flex w-full items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={userAvatar?.imageUrl} alt="User" data-ai-hint={userAvatar?.imageHint}/>
                    <AvatarFallback>관리자</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold">관리자</span>
                    <span className="text-xs text-sidebar-foreground/70">
                      Administrator
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
                    <LogOut />
                    <span>로그아웃</span>
                  </Button>
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
            </SidebarMenuItem>
          </SidebarMenu>
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
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
