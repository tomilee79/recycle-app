'use client';

import { useUser } from '@/firebase';
import { MainLayout } from '@/components/main-layout';
import LoginPage from '@/app/login-page';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Prevent brief flash of login page on initial load if user is already logged in.
    if (!isUserLoading) {
      setShowLogin(true);
    }
  }, [isUserLoading]);


  if (isUserLoading && !showLogin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <MainLayout />;
  }

  if (showLogin) {
    return <LoginPage />;
  }

  // Fallback for initial render before useEffect runs
  return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
}
