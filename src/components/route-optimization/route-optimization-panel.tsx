
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { collectionTasks } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Route, Bot, Loader2, Wand2, Plus, X, Trash2 } from 'lucide-react';
import { optimizeRoute, type OptimizeRouteOutput } from '@/ai/flows/optimize-route-flow';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { RouteMap } from './route-map';
import type { OptimizeRouteLocation } from '@/ai/flows/schemas';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';


export default function RouteOptimizationPanel() {
    const [selectedTasks, setSelectedTasks] = useState<OptimizeRouteLocation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [optimizedRoute, setOptimizedRoute] = useState<OptimizeRouteOutput | null>(null);
    
    const startPoint = { id: "start_end", address: "서울시 강남구 본사 차고지" };

    const handleTaskSelection = (task: OptimizeRouteLocation, selected: boolean) => {
        setOptimizedRoute(null); // Clear optimized route on selection change
        setError(null);
        setSelectedTasks(prev => 
            selected ? [...prev, task] : prev.filter(t => t.id !== task.id)
        );
    };

    const handleOptimize = async () => {
        if (selectedTasks.length < 1) {
            setError("최적화를 위해 최소 1개 이상의 수거지를 선택해야 합니다.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setOptimizedRoute(null);

        try {
            const result = await optimizeRoute({
                startPoint: startPoint.address,
                locations: selectedTasks,
            });
            setOptimizedRoute(result);
        } catch (e: any) {
            setError("경로 최적화에 실패했습니다. 다시 시도해주세요.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedTasks([]);
        setOptimizedRoute(null);
        setError(null);
    }
    
    const pendingTasks = useMemo(() => collectionTasks.filter(task => task.status === 'Pending' || task.status === 'In Progress'), []);
    const selectedTaskIds = useMemo(() => new Set(selectedTasks.map(t => t.id)), [selectedTasks]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[calc(100vh-8rem)]">
            <div className="lg:col-span-1 flex flex-col gap-6">
                 <Card className="flex flex-col shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full border">
                                <Bot className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="font-headline">경로 최적화</CardTitle>
                                <CardDescription>경로를 만들고 최적 경로를 계산합니다.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">선택된 수거지 ({selectedTasks.length})</h3>
                             <Button variant="ghost" size="sm" onClick={handleReset} disabled={selectedTasks.length === 0}>
                                <Trash2 className="mr-2"/>
                                초기화
                            </Button>
                        </div>
                        <ScrollArea className="flex-grow border rounded-md p-2 h-48">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                                    <Route className="size-4" />
                                    <span>{startPoint.address} (출발지)</span>
                                </div>
                                {selectedTasks.length > 0 ? selectedTasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                        <span className="text-sm font-medium leading-none">{task.address}</span>
                                        <Button variant="ghost" size="icon" className="size-6" onClick={() => handleTaskSelection(task, false)}>
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                )) : <p className="text-sm text-center text-muted-foreground py-4">지도 또는 아래 목록에서 수거지를 추가하세요.</p>}
                                {selectedTasks.length > 0 && (
                                    <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                                        <Route className="size-4" />
                                        <span>{startPoint.address} (도착지)</span>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="flex-col items-stretch gap-4">
                        {error && (
                            <Alert variant="destructive">
                                <Route className="h-4 w-4" />
                                <AlertTitle>오류</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button onClick={handleOptimize} disabled={isLoading || selectedTasks.length === 0}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2" />}
                            최적 경로 계산
                        </Button>
                    </CardFooter>
                </Card>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>대기중인 수거 목록</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-64">
                             <div className="space-y-2">
                                {pendingTasks.map(task => (
                                    <div key={task.id} className={cn("flex items-center justify-between p-2 rounded-md transition-colors", selectedTaskIds.has(task.id) ? "bg-primary/10" : "hover:bg-muted/50")}>
                                        <div>
                                            <p className="text-sm font-medium">{task.address}</p>
                                            <p className="text-xs text-muted-foreground">{task.materialType}</p>
                                        </div>
                                        <Button size="sm" variant={selectedTaskIds.has(task.id) ? "secondary" : "ghost"} onClick={() => handleTaskSelection({id: task.id, address: task.address}, !selectedTaskIds.has(task.id))}>
                                            {selectedTaskIds.has(task.id) ? <X className="mr-2" /> : <Plus className="mr-2" />}
                                            {selectedTaskIds.has(task.id) ? "제거" : "추가"}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2 min-h-[50vh] lg:min-h-full">
                <Card className="h-full w-full shadow-lg relative">
                    {optimizedRoute && (
                         <div className="absolute top-4 left-4 z-10 bg-background/80 p-3 rounded-lg shadow-lg border max-w-md">
                            <h4 className="font-semibold flex items-center gap-2"><Route className="text-primary"/> AI 추천 경로</h4>
                            <p className="text-xs text-muted-foreground mt-1">{optimizedRoute.reasoning}</p>
                            <ol className="list-decimal list-inside mt-2 text-sm space-y-1">
                                {optimizedRoute.optimizedRoute.map((loc, index) => <li key={`${loc.id}-${index}`}>{loc.address}</li>)}
                            </ol>
                        </div>
                    )}
                    <RouteMap 
                        pendingTasks={pendingTasks}
                        selectedTasks={selectedTasks}
                        optimizedRoute={optimizedRoute}
                        onTaskSelect={handleTaskSelection}
                    />
                </Card>
            </div>
        </div>
    );
}

