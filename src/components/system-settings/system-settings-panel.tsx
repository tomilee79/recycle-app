
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSettings from "./general-settings";
import NotificationSettings from "./notification-settings";
import SecuritySettings from "./security-settings";
import DataSettings from "./data-settings";

export default function SystemSettingsPanel() {
  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">일반</TabsTrigger>
          <TabsTrigger value="notifications">알림</TabsTrigger>
          <TabsTrigger value="security">보안</TabsTrigger>
          <TabsTrigger value="data">데이터</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-6">
            <GeneralSettings />
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
            <NotificationSettings />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
            <SecuritySettings />
        </TabsContent>
        <TabsContent value="data" className="mt-6">
            <DataSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
