'use client';

import { useState, useEffect } from 'react';
import { APIProvider, Map, useMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Card } from '@/components/ui/card';
import { Route } from 'lucide-react';
import type { OptimizeRouteOutput } from '@/ai/flows/schemas';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface RouteMapProps {
  route: OptimizeRouteOutput | null;
  apiKey: string;
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
    if (!directionsRenderer || !route || route.optimizedRoute.length < 2) return;

    const directionsService = new google.maps.DirectionsService();

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
          directionsRenderer.setDirections(result);
          
          if (result && result.routes && result.routes[0]) {
            const bounds = result.routes[0].bounds;
            if (bounds) {
              map?.fitBounds(bounds);
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

export function RouteMap({ route, apiKey }: RouteMapProps) {
  const position = { lat: 40.7128, lng: -74.0060 }; // Default center

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
  
  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={position}
        defaultZoom={11}
        mapId="ecotrack-route-map"
        className="h-full w-full"
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {route && (
            <>
                <Directions route={route} />
                 {/* The markers are now implicitly handled by DirectionsRenderer results */}
            </>
        )}
      </Map>
    </APIProvider>
  );
}
