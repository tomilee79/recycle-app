'use client';

import { useUser } from '@/firebase';
import { MainLayout } from '@/components/main-layout';
import LoginPage from '@/app/login-page';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <MainLayout />;
  }

  return <LoginPage />;
}
