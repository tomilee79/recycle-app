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
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import DashboardPanel from '@/components/dashboard/dashboard-panel';
import ReportsPanel from '@/components/reports/reports-panel';
import PerformancePanel from '@/components/performance/performance-panel';
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


type View = 'dashboard' | 'reports' | 'performance' | 'predict';

export function MainLayout() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const auth = useAuth();

  const handleLogout = () => {
    auth.signOut();
  };


  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardPanel />;
      case 'reports':
        return <ReportsPanel />;
      case 'performance':
        return <PerformancePanel />;
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
            <span className="text-lg font-semibold text-sidebar-foreground">EcoTrack</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('dashboard')}
                isActive={activeView === 'dashboard'}
                tooltip={{ children: 'Dashboard' }}
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('reports')}
                isActive={activeView === 'reports'}
                tooltip={{ children: 'Settlement Reports' }}
              >
                <BarChart3 />
                <span>Reports</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('performance')}
                isActive={activeView === 'performance'}
                tooltip={{ children: 'Performance' }}
              >
                <Truck />
                <span>Performance</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('predict')}
                isActive={activeView === 'predict'}
                tooltip={{ children: 'AI Prediction' }}
              >
                <Bot />
                <span>AI Prediction</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="my-2 bg-sidebar-border" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: 'Settings' }}>
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <div className="flex w-full items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={userAvatar?.imageUrl} alt="User" data-ai-hint={userAvatar?.imageHint}/>
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold">Admin</span>
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
                    <span>Logout</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be returned to the login page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
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
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
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
