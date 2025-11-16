

'use client';

import React, { useState } from 'react';
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
  BarChart3,
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
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import DashboardPanel from '@/components/dashboard/dashboard-panel';
import BillingPanel from '@/components/billing/billing-panel';
import VehiclesPanel from '@/components/vehicles/vehicles-panel';
import DriversPanel from '@/components/drivers/drivers-panel';
import CustomersPanel from '@/components/customers/customers-panel';
import ContractsPanel from '@/components/contracts/contracts-panel';
import SettingsPanel from '@/components/settings/settings-panel';
import PredictPanel from '@/components/predict/predict-panel';
import NotificationsPanel from '@/components/notifications/notifications-panel';
import WasteAnalysisPanel from '@/components/waste-analysis/waste-analysis-panel';
import DriverPerformancePanel from '@/components/drivers/driver-performance-panel';
import RouteOptimizationPanel from '@/components/route-optimization/route-optimization-panel';
import SchedulePanel from '@/components/schedule/schedule-panel';
import TodosPanel from '@/components/todos/todos-panel';
import QuotesPanel from '@/components/quotes/quotes-panel';
import { EcoTrackLogo } from '@/components/icons';
import { placeholderImages } from '@/lib/placeholder-images';
import { useAuth } from '@/firebase';
import { Button } from './ui/button';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { cn } from '@/lib/utils';


type View = 'dashboard' | 'billing' | 'notifications' | 'vehicles' | 'drivers' | 'driver-performance' | 'customers' | 'contracts' | 'predict' | 'waste-analysis' | 'route-optimization' | 'schedule' | 'settings' | 'todos' | 'quotes';

const CollapsibleSidebarMenu = ({
  title,
  icon,
  activeView,
  children,
  onTitleClick,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  activeView: View;
  children: React.ReactNode;
  onTitleClick: () => void;
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
            onClick={onTitleClick}
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

export function MainLayout() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const auth = useAuth();

  const handleLogout = () => {
    auth.signOut();
  };

  const viewTitles: { [key in View]: string } = {
    dashboard: '실시간 배차 현황',
    billing: '대금 관리',
    notifications: '알림 센터',
    vehicles: '차량 관리',
    drivers: '직원 목록',
    'driver-performance': '운전자 성과',
    customers: '고객 목록',
    contracts: '계약 관리',
    predict: 'AI 예측',
    'waste-analysis': '상세 폐기물 분석',
    'route-optimization': 'AI 경로 최적화',
    schedule: '일정 관리',
    todos: '할일 관리',
    quotes: '견적 관리',
    settings: '설정',
  };


  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardPanel />;
      case 'billing':
        return <BillingPanel />;
      case 'notifications':
        return <NotificationsPanel />;
      case 'vehicles':
        return <VehiclesPanel />;
      case 'drivers':
        return <DriversPanel />;
      case 'driver-performance':
        return <DriverPerformancePanel />;
      case 'customers':
        return <CustomersPanel />;
      case 'contracts':
        return <ContractsPanel />;
      case 'predict':
        return <PredictPanel />;
      case 'waste-analysis':
        return <WasteAnalysisPanel />;
      case 'route-optimization':
        return <RouteOptimizationPanel />;
      case 'schedule':
        return <SchedulePanel />;
      case 'todos':
        return <TodosPanel />;
      case 'quotes':
        return <QuotesPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <DashboardPanel />;
    }
  };
  
  const userAvatar = placeholderImages.find(p => p.id === 'user-avatar');

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
                onClick={() => setActiveView('dashboard')}
                isActive={activeView === 'dashboard'}
                tooltip={{ children: '실시간 배차 현황' }}
              >
                <Truck />
                <span>실시간 배차 현황</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('schedule')}
                isActive={activeView === 'schedule'}
                tooltip={{ children: '일정 관리' }}
              >
                <Calendar />
                <span>일정 관리</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('todos')}
                isActive={activeView === 'todos'}
                tooltip={{ children: '할일 관리' }}
              >
                <CheckSquare />
                <span>할일 관리</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('quotes')}
                isActive={activeView === 'quotes'}
                tooltip={{ children: '견적 관리' }}
              >
                <FileText />
                <span>견적 관리</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('billing')}
                isActive={activeView === 'billing'}
                tooltip={{ children: '대금 관리' }}
              >
                <Receipt />
                <span>대금 관리</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => setActiveView('notifications')}
                    isActive={activeView === 'notifications'}
                    tooltip={{ children: '알림 센터' }}
                >
                    <Bell />
                    <span>알림 센터</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('waste-analysis')}
                isActive={activeView === 'waste-analysis'}
                tooltip={{ children: '상세 폐기물 분석' }}
              >
                <PieChart />
                <span>폐기물 분석</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('route-optimization')}
                isActive={activeView === 'route-optimization'}
                tooltip={{ children: 'AI 경로 최적화' }}
              >
                <Route />
                <span>경로 최적화</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('vehicles')}
                isActive={activeView === 'vehicles'}
                tooltip={{ children: '차량 관리' }}
              >
                <LayoutDashboard />
                <span>차량</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <CollapsibleSidebarMenu
                title="직원 관리"
                icon={<Users />}
                activeView={activeView}
                onTitleClick={() => setActiveView('drivers')}
                defaultOpen={['drivers', 'driver-performance'].includes(activeView)}
              >
                  <SidebarMenuSubButton
                    onClick={() => setActiveView('drivers')}
                    isActive={activeView === 'drivers'}
                  >
                    <span>직원 목록</span>
                  </SidebarMenuSubButton>
                  <SidebarMenuSubButton
                    onClick={() => setActiveView('driver-performance')}
                    isActive={activeView === 'driver-performance'}
                  >
                    <Medal/>
                    <span>성과 대시보드</span>
                  </SidebarMenuSubButton>
              </CollapsibleSidebarMenu>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <CollapsibleSidebarMenu
                title="고객 관리"
                icon={<Building2 />}
                activeView={activeView}
                onTitleClick={() => setActiveView('customers')}
                defaultOpen={['customers', 'contracts'].includes(activeView)}
              >
                  <SidebarMenuSubButton
                    onClick={() => setActiveView('customers')}
                    isActive={activeView === 'customers'}
                  >
                    <Users2 />
                    <span>고객 목록</span>
                  </SidebarMenuSubButton>
                  <SidebarMenuSubButton
                    onClick={() => setActiveView('contracts')}
                    isActive={activeView === 'contracts'}
                  >
                    <FileSignature/>
                    <span>계약 관리</span>
                  </SidebarMenuSubButton>
              </CollapsibleSidebarMenu>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('predict')}
                isActive={activeView === 'predict'}
                tooltip={{ children: 'AI 예측' }}
              >
                <Bot />
                <span>AI 예측</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('settings')}
                isActive={activeView === 'settings'}
                tooltip={{ children: '설정' }}
              >
                <Settings />
                <span>설정</span>
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
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
