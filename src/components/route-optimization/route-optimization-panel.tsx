'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { collectionTasks } from "@/lib/mock-data";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Route, Bot, Loader2, Wand2 } from 'lucide-react';
import { optimizeRoute } from '@/ai/flows/optimize-route-flow';
import type { OptimizeRouteOutput } from '@/ai/flows/schemas';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { RouteMap } from './route-map';

type CollectionTaskItem = {
    id: string;
    address: string;
};

export default function RouteOptimizationPanel() {
    const [selectedTasks, setSelectedTasks] = useState<CollectionTaskItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [optimizedRoute, setOptimizedRoute] = useState<OptimizeRouteOutput | null>(null);
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const handleCheckboxChange = (task: CollectionTaskItem, checked: boolean) => {
        setSelectedTasks(prev => 
            checked ? [...prev, task] : prev.filter(t => t.id !== task.id)
        );
    };

    const handleOptimize = async () => {
        if (selectedTasks.length < 2) {
            setError("최적화를 위해 최소 2개 이상의 수거지를 선택해야 합니다.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setOptimizedRoute(null);

        try {
            const result = await optimizeRoute({
                startPoint: "본사 차고지, New York", // Assuming a start point
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
    
    const pendingTasks = collectionTasks.filter(task => task.status === 'Pending' || task.status === 'In Progress');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[calc(100vh-8rem)]">
            <Card className="lg:col-span-1 flex flex-col shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full border">
                            <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="font-headline">경로 최적화</CardTitle>
                            <CardDescription>수거지를 선택하여 최적 경로를 계산합니다.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col gap-4">
                    <Label>수거지 목록</Label>
                    <ScrollArea className="flex-grow border rounded-md p-4">
                        <div className="space-y-4">
                            {pendingTasks.map(task => (
                                <div key={task.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={task.id}
                                        onCheckedChange={(checked) => handleCheckboxChange({id: task.id, address: task.address}, !!checked)}
                                    />
                                    <label htmlFor={task.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {task.address}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="flex-col items-start gap-4">
                     {error && (
                        <Alert variant="destructive">
                            <Route className="h-4 w-4" />
                            <AlertTitle>오류</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Button onClick={handleOptimize} disabled={isLoading || selectedTasks.length < 2}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 />}
                        최적 경로 계산
                    </Button>
                </CardFooter>
            </Card>

            <div className="lg:col-span-2 min-h-[50vh] lg:min-h-full">
                <Card className="h-full w-full shadow-lg relative">
                    {optimizedRoute && (
                         <div className="absolute top-4 left-4 z-10 bg-background/80 p-3 rounded-lg shadow-lg border max-w-md">
                            <h4 className="font-semibold flex items-center gap-2"><Route className="text-primary"/> AI 추천 경로</h4>
                            <p className="text-xs text-muted-foreground mt-1">{optimizedRoute.reasoning}</p>
                            <ol className="list-decimal list-inside mt-2 text-sm space-y-1">
                                {optimizedRoute.optimizedRoute.map(loc => <li key={loc.id}>{loc.address}</li>)}
                            </ol>
                        </div>
                    )}
                    <RouteMap route={optimizedRoute} apiKey={apiKey!} />
                </Card>
            </div>
        </div>
    );
}
