
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Mail, Phone, User, Link as LinkIcon } from "lucide-react";

export default function ContactPanel() {
  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight">개발사 연락처</h1>
        <p className="text-muted-foreground mt-2">
          솔루션 개발 및 유지보수 관련 문의는 아래 연락처로 해주세요.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">DX Consulting (디엑스컨설팅)</CardTitle>
          <p className="text-muted-foreground pt-1">귀사의 비즈니스 혁신을 위한 최고의 파트너</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">이홍열 대표</span>
          </div>
          <div className="flex items-center gap-4">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <a href="https://dxconsulting.co.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              https://dxconsulting.co.kr
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <a href="mailto:tomilee@dxconsulting.co.kr" className="text-blue-600 hover:underline">
              tomilee@dxconsulting.co.kr
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span>010-2294-7981</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <a href="https://dxconsulting.co.kr" target="_blank" rel="noopener noreferrer">
              <LinkIcon className="mr-2 h-4 w-4" />
              서비스 소개서 보기
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
