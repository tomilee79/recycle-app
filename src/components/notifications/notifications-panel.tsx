
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { notifications } from "@/lib/mock-data";
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Bell, AlertTriangle, Info, XCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function NotificationsPanel() {
  const getIcon = (type: 'Warning' | 'Info' | 'Error') => {
    switch (type) {
      case 'Warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'Info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'Error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>알림 센터</CardTitle>
        <CardDescription>최근 발생한 중요 이벤트 목록입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border",
                !notification.isRead && "bg-blue-50 dark:bg-blue-900/20"
              )}
            >
              <div className="mt-1">{getIcon(notification.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: ko })}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
              </div>
              {!notification.isRead && (
                 <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
