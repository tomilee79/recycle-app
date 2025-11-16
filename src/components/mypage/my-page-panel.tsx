
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyAccountPanel from "./my-account-panel";
import PreferencesPanel from "./preferences-panel";

export default function MyPagePanel() {
  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">내 계정</TabsTrigger>
          <TabsTrigger value="preferences">환경설정</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="mt-6">
            <MyAccountPanel />
        </TabsContent>
        <TabsContent value="preferences" className="mt-6">
            <PreferencesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
