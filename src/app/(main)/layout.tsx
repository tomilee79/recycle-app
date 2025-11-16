

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type View = 'dashboard' | 'billing' | 'notifications' | 'vehicles' | 'drivers' | 'driver-performance' | 'customers' | 'contracts' | 'predict' | 'waste-analysis' | 'route-optimization' | 'schedule' | 'tasks' | 'settings' | 'todos' | 'quotes' | 'users' | 'contact';

const CollapsibleSidebarMenu = ({
  title,
  icon,
  activeView,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  activeView: View;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const { state } = useSidebar();
  const isActive = React.Children.toArray(children).some(child => 
      React.isValidElement(child) && child.props.isActive
  );

  return (
    <Collapsible defaultOpen={defaultOpen || isActive}>
      <CollapsibleTrigger asChild>
        <SidebarMenuButton 
            isActive={isActive && state === 'expanded'}
            className="justify-between"
            tooltip={{children: title}}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </div>
          <ChevronDown className={cn("transition-transform duration-200", "group-data-[state=open]:rotate-180")} />
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>{children}</SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

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
    drivers: '직원 목록',
    'driver-performance': '운전자 성과',
    customers: '고객 목록',
    contracts: '계약 관리',
    predict: 'AI 예측',
    'waste-analysis': '상세 폐기물 분석',
    'route-optimization': 'AI 경로 최적화',
    schedule: '일정 관리',
    tasks: '작업 관리',
    settings: '설정',
    todos: '할일 관리',
    quotes: '견적 관리',
    users: '사용자 관리',
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
              <Link href="/dashboard" passHref>
                <SidebarMenuButton
                  isActive={activeView === 'dashboard'}
                  tooltip={{ children: '실시간 배차 현황' }}
                  asChild
                >
                  <a><Truck /><span>실시간 배차 현황</span></a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <Link href="/schedule" passHref>
                    <SidebarMenuButton
                        isActive={activeView === 'schedule'}
                        tooltip={{ children: '일정 관리' }}
                        asChild
                    >
                        <a><Calendar /><span>일정 관리</span></a>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/tasks" passHref>
                <SidebarMenuButton
                  isActive={activeView === 'tasks'}
                  tooltip={{ children: '작업 관리' }}
                  asChild
                >
                 <a><ClipboardList /><span>작업 관리</span></a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/todos" passHref>
                <SidebarMenuButton
                  isActive={activeView === 'todos'}
                  tooltip={{ children: '할일 관리' }}
                  asChild
                >
                  <a><CheckSquare /><span>할일 관리</span></a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <Link href="/quotes" passHref>
                    <SidebarMenuButton
                    isActive={activeView === 'quotes'}
                    tooltip={{ children: '견적 관리' }}
                    asChild
                    >
                    <a><FileText /><span>견적 관리</span></a>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/billing" passHref>
                <SidebarMenuButton
                  isActive={activeView === 'billing'}
                  tooltip={{ children: '정산 관리' }}
                  asChild
                >
                  <a><Receipt /><span>정산 관리</span></a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/notifications" passHref>
                    <SidebarMenuButton
                        isActive={activeView === 'notifications'}
                        tooltip={{ children: '알림 센터' }}
                        asChild
                    >
                        <a><Bell /><span>알림 센터</span></a>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/waste-analysis" passHref>
                <SidebarMenuButton
                  isActive={activeView === 'waste-analysis'}
                  tooltip={{ children: '상세 폐기물 분석' }}
                  asChild
                >
                  <a><PieChart /><span>폐기물 분석</span></a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/route-optimization" passHref>
                <SidebarMenuButton
                  isActive={activeView === 'route-optimization'}
                  tooltip={{ children: 'AI 경로 최적화' }}
                  asChild
                >
                 <a><Route /><span>경로 최적화</span></a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/vehicles" passHref>
                <SidebarMenuButton
                  isActive={activeView === 'vehicles'}
                  tooltip={{ children: '차량 및 장비 관리' }}
                  asChild
                >
                  <a><LayoutDashboard /><span>차량 및 장비</span></a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <CollapsibleSidebarMenu
                title="직원 관리"
                icon={<Users />}
                activeView={activeView}
                defaultOpen={['drivers', 'driver-performance'].includes(activeView)}
              >
                  <Link href="/drivers" passHref>
                    <SidebarMenuSubButton isActive={activeView === 'drivers'} asChild>
                        <a><ClipboardList /><span>직원 목록</span></a>
                    </SidebarMenuSubButton>
                  </Link>
                  <Link href="/driver-performance" passHref>
                    <SidebarMenuSubButton isActive={activeView === 'driver-performance'} asChild>
                        <a><Medal/><span>성과 대시보드</span></a>
                    </SidebarMenuSubButton>
                  </Link>
              </CollapsibleSidebarMenu>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <CollapsibleSidebarMenu
                title="고객 관리"
                icon={<Building2 />}
                activeView={activeView}
                defaultOpen={['customers', 'contracts'].includes(activeView)}
              >
                  <Link href="/customers" passHref>
                    <SidebarMenuSubButton isActive={activeView === 'customers'} asChild>
                        <a><Users2 /><span>고객 목록</span></a>
                    </SidebarMenuSubButton>
                  </Link>
                  <Link href="/contracts" passHref>
                    <SidebarMenuSubButton isActive={activeView === 'contracts'} asChild>
                        <a><FileSignature/><span>계약 관리</span></a>
                    </SidebarMenuSubButton>
                  </Link>
              </CollapsibleSidebarMenu>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <Link href="/predict" passHref>
                <SidebarMenuButton
                  isActive={activeView === 'predict'}
                  tooltip={{ children: 'AI 예측' }}
                  asChild
                >
                  <a><Bot /><span>AI 예측</span></a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/users" passHref>
                <SidebarMenuButton
                  isActive={activeView === 'users'}
                  tooltip={{ children: '사용자 관리' }}
                  asChild
                >
                 <a><Users /><span>사용자 관리</span></a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/settings" passHref>
                <SidebarMenuButton
                  isActive={activeView === 'settings'}
                  tooltip={{ children: '설정' }}
                  asChild
                >
                  <a><Settings /><span>설정</span></a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/contact" passHref>
                <SidebarMenuButton
                  isActive={activeView === 'contact'}
                  tooltip={{ children: '개발사 연락처' }}
                  asChild
                >
                  <a><Info /><span>개발사 연락처</span></a>
                </SidebarMenuButton>
              </Link>
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
