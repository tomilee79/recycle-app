
'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Route, MapPin } from 'lucide-react';
import type { OptimizeRouteLocation, OptimizeRouteOutput } from '@/ai/flows/schemas';
import type { CollectionTask } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';


interface RouteMapProps {
  apiKey: string; // No longer used, but kept for compatibility
  pendingTasks: CollectionTask[];
  selectedTasks: OptimizeRouteLocation[];
  optimizedRoute: OptimizeRouteOutput | null;
  onTaskSelect: (task: OptimizeRouteLocation, selected: boolean) => void;
}

const MAP_WIDTH = 1280;
const MAP_HEIGHT = 960;
const MAP_BOUNDS = {
  north: 37.8,
  south: 36.9,
  west: 126.5,
  east: 127.5,
};

function convertLatLngToPixels(lat: number, lng: number) {
  const latRatio = (lat - MAP_BOUNDS.south) / (MAP_BOUNDS.north - MAP_BOUNDS.south);
  const lngRatio = (lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west);

  return {
    x: lngRatio * MAP_WIDTH,
    y: (1 - latRatio) * MAP_HEIGHT,
  };
}


const RouteLines = ({ route, pendingTasks, startPointLocation }: { route: OptimizeRouteOutput, pendingTasks: CollectionTask[], startPointLocation: {lat: number, lng: number} }) => {
    const points = useMemo(() => {
        return route.optimizedRoute.map(task => {
            const location = task.id === 'start_end' 
                ? startPointLocation 
                : pendingTasks.find(p => p.id === task.id)?.location;
            
            if (!location) return null;
            return convertLatLngToPixels(location.lat, location.lng);
        }).filter(p => p !== null) as {x: number, y: number}[];
    }, [route, pendingTasks, startPointLocation]);

    if (points.length < 2) return null;

    return (
        <svg width={MAP_WIDTH} height={MAP_HEIGHT} className="absolute top-0 left-0 pointer-events-none">
            <polyline
                points={points.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                strokeOpacity="0.7"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
    )
}

export function RouteMap({ pendingTasks, selectedTasks, optimizedRoute, onTaskSelect }: RouteMapProps) {
  const selectedTaskIds = new Set(selectedTasks.map(t => t.id));
  const optimizedTaskIdsInOrder = optimizedRoute ? optimizedRoute.optimizedRoute.map(t => t.id) : [];

  const startPointLocation = { lat: 37.508, lng: 127.06 }; // 강남구 본사 차고지 (가상)

  return (
    <Card className="h-full w-full overflow-hidden shadow-lg relative">
        <Image
          src="/map-background.png"
          alt="Map of Seoul and Gyeonggi area"
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          className="object-cover w-full h-full"
          priority
        />
        
        {optimizedRoute && <RouteLines route={optimizedRoute} pendingTasks={pendingTasks} startPointLocation={startPointLocation}/>}
        
        {/* Render markers for pending tasks not in optimized route */}
        {pendingTasks.map((task) => {
            const isSelected = selectedTaskIds.has(task.id);
            const isInOptimizedRoute = optimizedTaskIdsInOrder.includes(task.id);
            
            if(isInOptimizedRoute) return null;

            const { x, y } = convertLatLngToPixels(task.location.lat, task.location.lng);

            return (
              <div
                key={task.id}
                className={cn(
                    'absolute -translate-x-1/2 -translate-y-1/2 p-1 rounded-full cursor-pointer transition-all shadow-md',
                    isSelected ? 'bg-primary' : 'bg-muted-foreground'
                )}
                style={{ left: `${x}px`, top: `${y}px` }}
                onClick={() => onTaskSelect({ id: task.id, address: task.address }, !isSelected)}
              >
                <MapPin className={cn('size-5', isSelected ? 'text-primary-foreground' : 'text-muted')} />
              </div>
            );
        })}
        
        {/* Render numbered markers for optimized route */}
        {optimizedRoute && optimizedRoute.optimizedRoute.map((task, index) => {
            const collectionTask = pendingTasks.find(p => p.id === task.id);
            const location = task.id === 'start_end' ? startPointLocation : collectionTask?.location;
            
            if (!location) return null;
            
            const { x, y } = convertLatLngToPixels(location.lat, location.lng);

            if (index === 0) { // Start/End Point
              return (
                 <div key={`optimized-${task.id}`} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}px`, top: `${y}px` }}>
                    <div className="p-2 bg-accent rounded-full shadow-lg">
                      <Route className="size-5 text-accent-foreground"/>
                    </div>
                  </div>
              )
            }

            return (
                <div key={`optimized-${task.id}`} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}px`, top: `${y}px` }}>
                    <div className="h-8 w-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-lg border-2 border-white">
                        {index}
                    </div>
                </div>
            );
        })}
    </Card>
  );
}
