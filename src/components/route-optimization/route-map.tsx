
'use client';

import { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, useMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Card } from '@/components/ui/card';
import { Route } from 'lucide-react';
import type { OptimizeRouteLocation, OptimizeRouteOutput } from '@/ai/flows/schemas';
import type { CollectionTask } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface RouteMapProps {
  apiKey: string;
  pendingTasks: CollectionTask[];
  selectedTasks: OptimizeRouteLocation[];
  optimizedRoute: OptimizeRouteOutput | null;
  onTaskSelect: (task: OptimizeRouteLocation, selected: boolean) => void;
}

const Directions = ({ route }: { route: OptimizeRouteOutput }) => {
  const map = useMap();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!map) return;
    const renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // We will use our own markers
        polylineOptions: {
            strokeColor: 'hsl(var(--primary))',
            strokeOpacity: 0.8,
            strokeWeight: 6,
        },
    });
    renderer.setMap(map);
    setDirectionsRenderer(renderer);
    return () => {
      renderer.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (!directionsRenderer || !route || route.optimizedRoute.length < 2) {
      directionsRenderer?.setDirections({routes: []}); // Clear previous route
      return;
    };

    const directionsService = new google.maps.DirectionsService();
    
    // The AI flow now includes the start point in the optimized route.
    const origin = route.optimizedRoute[0].address;
    const destination = route.optimizedRoute[route.optimizedRoute.length - 1].address;
    const waypoints = route.optimizedRoute.slice(1, -1).map(loc => ({
      location: loc.address,
      stopover: true,
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setError(null);
          directionsRenderer.setDirections(result);
          
          if (result && result.routes && result.routes[0]) {
            const bounds = result.routes[0].bounds;
            if (bounds) {
              map?.fitBounds(bounds, 100); // Add padding
            }
          }
          
        } else {
          setError(`경로를 찾을 수 없습니다: ${status}`);
          console.error(`Directions request failed due to ${status}`);
        }
      }
    );

  }, [directionsRenderer, route, map]);

  if (error) {
    return (
        <div className="absolute top-4 left-4 z-10">
            <Alert variant="destructive">
                <Route className="h-4 w-4" />
                <AlertTitle>경로 계산 오류</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
    );
  }

  return null;
};

export function RouteMap({ apiKey, pendingTasks, selectedTasks, optimizedRoute, onTaskSelect }: RouteMapProps) {
  const center = useMemo(() => {
    if (pendingTasks.length === 0) return { lat: 37.5665, lng: 126.9780 }; // 서울 중심
    const avgLat = pendingTasks.reduce((sum, task) => sum + task.location.lat, 0) / pendingTasks.length;
    const avgLng = pendingTasks.reduce((sum, task) => sum + task.location.lng, 0) / pendingTasks.length;
    return { lat: avgLat, lng: avgLng };
  }, [pendingTasks]);


  if (!apiKey) {
    return (
      <Card className="h-full flex items-center justify-center bg-muted">
        <div className="text-center text-muted-foreground p-4">
          <h3 className="font-semibold text-lg mb-2">Google Maps API 키가 없습니다</h3>
          <p className="text-sm">.env.local 파일에 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY를 추가해주세요.</p>
        </div>
      </Card>
    );
  }

  const selectedTaskIds = new Set(selectedTasks.map(t => t.id));
  const optimizedTaskIdsInOrder = optimizedRoute ? optimizedRoute.optimizedRoute.map(t => t.id) : [];

  const startPointLocation = { lat: 37.508, lng: 127.06 }; // 강남구 본사 차고지 (가상)

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={12}
        mapId="ecotrack-route-map"
        className="h-full w-full"
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {optimizedRoute && <Directions route={optimizedRoute} />}
        
        {/* Render markers for pending tasks */}
        {pendingTasks.map((task) => {
            const isSelected = selectedTaskIds.has(task.id);
            const optimizedIndex = optimizedTaskIdsInOrder.indexOf(task.id);
            const isInOptimizedRoute = optimizedIndex !== -1;
            
            // Do not render if it's part of the optimized route, it will be rendered by the next block
            if(isInOptimizedRoute) return null;

            return (
              <AdvancedMarker
                key={task.id}
                position={task.location}
                onClick={() => onTaskSelect({ id: task.id, address: task.address }, !isSelected)}
              >
                  <Pin
                    background={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                    glyphColor={isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted))'}
                    borderColor={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                  />
              </AdvancedMarker>
            );
        })}
        
        {/* Render numbered markers for optimized route */}
        {optimizedRoute && optimizedRoute.optimizedRoute.map((task, index) => {
            const collectionTask = pendingTasks.find(p => p.id === task.id);
            const location = task.id === 'start_end' ? startPointLocation : collectionTask?.location;
            
            if (!location) return null;

            // First item is start/end point, don't make it clickable to deselect
            if (index === 0) {
              return (
                 <AdvancedMarker key={`optimized-${task.id}`} position={location}>
                    <Pin background={'hsl(var(--accent))'} borderColor={'hsl(var(--accent))'} glyphColor={'hsl(var(--accent-foreground))'}>
                      <Route/>
                    </Pin>
                  </AdvancedMarker>
              )
            }

            return (
              <AdvancedMarker
                key={`optimized-${task.id}`}
                position={location}
              >
                <Pin background={'hsl(var(--primary))'} borderColor={'hsl(var(--primary))'} glyphColor={'hsl(var(--primary-foreground))'}>
                    {index}
                </Pin>
              </AdvancedMarker>
            );
        })}

      </Map>
    </APIProvider>
  );
}
