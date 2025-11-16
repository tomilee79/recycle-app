'use client';

import { useParams } from 'next/navigation';
import BillingPanel from '@/components/billing/billing-panel';
import ContactPanel from '@/components/contact/contact-panel';
import ContractsPanel from '@/components/contracts/contracts-panel';
import CustomersPanel from '@/components/customers/customers-panel';
import DashboardPanel from '@/components/dashboard/dashboard-panel';
import DriverPerformancePanel from '@/components/drivers/driver-performance-panel';
import DriversPanel from '@/components/drivers/drivers-panel';
import NotificationsPanel from '@/components/notifications/notifications-panel';
import PredictPanel from '@/components/predict/predict-panel';
import QuotesPanel from '@/components/quotes/quotes-panel';
import RouteOptimizationPanel from '@/components/route-optimization/route-optimization-panel';
import SchedulePanel from '@/components/schedule/schedule-panel';
import MyPagePanel from '@/components/mypage/my-page-panel';
import TasksPanel from '@/components/tasks/tasks-panel';
import TodosPanel from '@/components/todos/todos-panel';
import UsersPanel from '@/components/users/users-panel';
import AdminPanel from '@/components/admin/admin-panel';
import VehiclesPanel from '@/components/vehicles/vehicles-panel';
import WasteAnalysisPanel from '@/components/waste-analysis/waste-analysis-panel';

export default function ViewPage() {
  const params = useParams();
  const view = params.view as string;

  switch (view) {
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
    case 'tasks':
      return <TasksPanel />;
    case 'todos':
      return <TodosPanel />;
    case 'quotes':
      return <QuotesPanel />;
    case 'users':
      return <UsersPanel />;
    case 'admin':
      return <AdminPanel />;
    case 'mypage':
      return <MyPagePanel />;
    case 'contact':
        return <ContactPanel />;
    default:
      return <DashboardPanel />;
  }
}
