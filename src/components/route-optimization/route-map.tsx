
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import type { OptimizeRouteLocation, OptimizeRouteOutput } from '@/ai/flows/schemas';
import type { CollectionTask } from '@/lib/types';
import { Route } from 'lucide-react';

interface RouteMapProps {
  pendingTasks: CollectionTask[];
  selectedTasks: OptimizeRouteLocation[];
  optimizedRoute: OptimizeRouteOutput | null;
  onTaskSelect: (task: OptimizeRouteLocation, selected: boolean) => void;
}

export function RouteMap({ pendingTasks, selectedTasks, optimizedRoute, onTaskSelect }: RouteMapProps) {
  return (
    <Card className="h-full w-full overflow-hidden shadow-lg relative flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
            <Route className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">AI 경로 최적화 지도</h3>
            <p className="text-sm">지도 기능은 데모를 위해 비활성화되었습니다.</p>
        </div>
    </Card>
  );
}
