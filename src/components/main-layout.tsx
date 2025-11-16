
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
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  BarChart3,
  Truck,
  Settings,
  Bot,
  LogOut,
  Users,
  Building2,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import DashboardPanel from '@/components/dashboard/dashboard-panel';
import ReportsPanel from '@/components/reports/reports-panel';
import VehiclesPanel from '@/components/vehicles/vehicles-panel';
import DriversPanel from '@/components/drivers/drivers-panel';
import CustomersPanel from '@/components/customers/customers-panel';
import PredictPanel from '@/components/predict/predict-panel';
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


type View = 'dashboard' | 'reports' | 'vehicles' | 'drivers' | 'customers' | 'predict';

export function MainLayout() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const auth = useAuth();

  const handleLogout = () => {
    auth.signOut();
  };

  const viewTitles: { [key in View]: string } = {
    dashboard: '대시보드',
    reports: '정산 보고서',
    vehicles: '차량 관리',
    drivers: '직원 관리',
    customers: '고객 관리',
    predict: 'AI 예측',
  };


  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardPanel />;
      case 'reports':
        return <ReportsPanel />;
      case 'vehicles':
        return <VehiclesPanel />;
      case 'drivers':
        return <DriversPanel />;
      case 'customers':
        return <CustomersPanel />;
      case 'predict':
        return <PredictPanel />;
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
                tooltip={{ children: '대시보드' }}
              >
                <LayoutDashboard />
                <span>대시보드</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('reports')}
                isActive={activeView === 'reports'}
                tooltip={{ children: '정산 보고서' }}
              >
                <BarChart3 />
                <span>보고서</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('vehicles')}
                isActive={activeView === 'vehicles'}
                tooltip={{ children: '차량 관리' }}
              >
                <Truck />
                <span>차량</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('drivers')}
                isActive={activeView === 'drivers'}
                tooltip={{ children: '직원 관리' }}
              >
                <Users />
                <span>직원</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('customers')}
                isActive={activeView === 'customers'}
                tooltip={{ children: '고객 관리' }}
              >
                <Building2 />
                <span>고객</span>
              </SidebarMenuButton>
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
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="my-2 bg-sidebar-border" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: '설정' }}>
                <Settings />
                <span>설정</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
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
