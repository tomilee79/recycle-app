
'use client';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Card } from '@/components/ui/card';
import { vehicles } from '@/lib/mock-data';
import { Truck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';


export default function MapPanel() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const position = { lat: 37.5665, lng: 126.9780 }; // 서울 중심

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

  const getPinStyling = (status: string) => {
    switch (status) {
      case 'On Route':
        return { background: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary-foreground))', glyphColor: 'hsl(var(--primary-foreground))' };
      case 'Completed':
        return { background: 'hsl(var(--chart-2))', borderColor: 'hsl(var(--primary-foreground))', glyphColor: 'hsl(var(--primary-foreground))' };
      case 'Maintenance':
        return { background: 'hsl(var(--destructive))', borderColor: 'hsl(var(--destructive-foreground))', glyphColor: 'hsl(var(--destructive-foreground))' };
      case 'Idle':
      default:
        return { background: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--background))', glyphColor: 'hsl(var(--background))' };
    }
  };

  return (
    <APIProvider apiKey={apiKey}>
      <Card className="h-full w-full overflow-hidden shadow-lg">
        <Map
          defaultCenter={position}
          defaultZoom={11}
          mapId="ecotrack-map"
          className="h-full w-full"
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapTypeId='roadmap'
          styles={[
            {
              "featureType": "all",
              "elementType": "labels.text.fill",
              "stylers": [
                { "color": "#7c93a3" },
                { "lightness": "-10" }
              ]
            },
            {
              "featureType": "administrative.country",
              "elementType": "geometry",
              "stylers": [
                { "visibility": "on" }
              ]
            },
            {
              "featureType": "administrative.country",
              "elementType": "geometry.stroke",
              "stylers": [
                { "color": "#a0a4a5" }
              ]
            },
            {
              "featureType": "administrative.province",
              "elementType": "geometry.stroke",
              "stylers": [
                { "color": "#62838e" }
              ]
            },
            {
              "featureType": "landscape",
              "elementType": "geometry.fill",
              "stylers": [
                { "color": "#dde3e3" }
              ]
            },
            {
              "featureType": "landscape.man_made",
              "elementType": "geometry.stroke",
              "stylers": [
                { "color": "#3f4a51" },
                { "weight": "0.30" }
              ]
            },
            {
              "featureType": "poi",
              "elementType": "all",
              "stylers": [
                { "visibility": "simplified" }
              ]
            },
            {
              "featureType": "poi.attraction",
              "elementType": "all",
              "stylers": [
                { "visibility": "on" }
              ]
            },
            {
              "featureType": "poi.business",
              "elementType": "all",
              "stylers": [
                { "visibility": "off" }
              ]
            },
            {
              "featureType": "poi.government",
              "elementType": "all",
              "stylers": [
                { "visibility": "on" }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "geometry.fill",
              "stylers": [
                { "color": "#a5b0b3" }
              ]
            },
            {
              "featureType": "road",
              "elementType": "geometry.fill",
              "stylers": [
                { "color": "#FFFFFF" }
              ]
            },
            {
              "featureType": "road",
              "elementType": "geometry.stroke",
              "stylers": [
                { "color": "#a0a4a5" }
              ]
            },
            {
              "featureType": "water",
              "elementType": "geometry.fill",
              "stylers": [
                { "color": "#a2daf2" }
              ]
            }
          ]}
        >
        <TooltipProvider>
          {vehicles.map((vehicle) => {
            const { background, borderColor, glyphColor } = getPinStyling(vehicle.status);
            return (
              <Tooltip key={vehicle.id}>
                <TooltipTrigger asChild>
                  <AdvancedMarker position={vehicle.location} title={vehicle.name}>
                    <Pin background={background} borderColor={borderColor} glyphColor={glyphColor}>
                      <Truck />
                    </Pin>
                  </AdvancedMarker>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='font-bold'>{vehicle.name}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          </TooltipProvider>
        </Map>
      </Card>
    </APIProvider>
  );
}
