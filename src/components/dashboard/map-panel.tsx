
'use client';
import React, { useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, MapCameraChangedEvent, CameraState } from '@vis.gl/react-google-maps';
import { Card } from '@/components/ui/card';
import { vehicles } from '@/lib/mock-data';
import { Truck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Vehicle } from '@/lib/types';

interface MapPanelProps {
  selectedVehicle: Vehicle | null;
  onVehicleSelect: (vehicle: Vehicle | null) => void;
  cameraState: Partial<CameraState>;
}

const MapController = ({ cameraState }: { cameraState: Partial<CameraState> }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !cameraState.center) return;
    map.moveCamera(cameraState);
  }, [map, cameraState]);

  return null;
}

export default function MapPanel({ selectedVehicle, onVehicleSelect, cameraState }: MapPanelProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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

  const getPinStyling = (status: string, isSelected: boolean) => {
    let background = 'hsl(var(--muted-foreground))';
    let borderColor = 'hsl(var(--background))';
    let glyphColor = 'hsl(var(--background))';

    switch (status) {
      case 'On Route':
        background = 'hsl(var(--primary))';
        borderColor = 'hsl(var(--primary-foreground))';
        glyphColor = 'hsl(var(--primary-foreground))';
        break;
      case 'Completed':
        background = 'hsl(var(--chart-2))';
        borderColor = 'hsl(var(--primary-foreground))';
        glyphColor = 'hsl(var(--primary-foreground))';
        break;
      case 'Maintenance':
        background = 'hsl(var(--destructive))';
        borderColor = 'hsl(var(--destructive-foreground))';
        glyphColor = 'hsl(var(--destructive-foreground))';
        break;
      default: // Idle
        break;
    }
    
    if (isSelected) {
      background = 'hsl(var(--accent))';
      borderColor = 'hsl(var(--accent-foreground))';
      glyphColor = 'hsl(var(--accent-foreground))';
    }

    return { background, borderColor, glyphColor };
  };

  return (
    <APIProvider apiKey={apiKey}>
      <Card className="h-full w-full overflow-hidden shadow-lg">
        <Map
          key={JSON.stringify(cameraState)} // Re-mount map on camera state change to ensure controller works
          defaultCenter={cameraState.center}
          defaultZoom={cameraState.zoom}
          mapId="ecotrack-map"
          className="h-full w-full"
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapTypeId='roadmap'
          styles={[
            { "featureType": "all", "elementType": "labels.text.fill", "stylers": [ { "color": "#7c93a3" }, { "lightness": "-10" } ] },
            { "featureType": "administrative.country", "elementType": "geometry", "stylers": [ { "visibility": "on" } ] },
            { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [ { "color": "#a0a4a5" } ] },
            { "featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [ { "color": "#62838e" } ] },
            { "featureType": "landscape", "elementType": "geometry.fill", "stylers": [ { "color": "#dde3e3" } ] },
            { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [ { "color": "#3f4a51" }, { "weight": "0.30" } ] },
            { "featureType": "poi", "elementType": "all", "stylers": [ { "visibility": "simplified" } ] },
            { "featureType": "poi.attraction", "elementType": "all", "stylers": [ { "visibility": "on" } ] },
            { "featureType": "poi.business", "elementType": "all", "stylers": [ { "visibility": "off" } ] },
            { "featureType": "poi.government", "elementType": "all", "stylers": [ { "visibility": "on" } ] },
            { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [ { "color": "#a5b0b3" } ] },
            { "featureType": "road", "elementType": "geometry.fill", "stylers": [ { "color": "#FFFFFF" } ] },
            { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#a0a4a5" } ] },
            { "featureType": "water", "elementType": "geometry.fill", "stylers": [ { "color": "#a2daf2" } ] }
          ]}
        >
          <MapController cameraState={cameraState} />
          <TooltipProvider>
            {vehicles.map((vehicle) => {
              const isSelected = selectedVehicle?.id === vehicle.id;
              const { background, borderColor, glyphColor } = getPinStyling(vehicle.status, isSelected);
              
              return (
                <Tooltip key={vehicle.id}>
                  <TooltipTrigger asChild>
                    <AdvancedMarker 
                      position={vehicle.location} 
                      title={vehicle.name}
                      onClick={() => onVehicleSelect(vehicle)}
                    >
                       <Pin background={background} borderColor={borderColor} glyphColor={glyphColor} scale={isSelected ? 1.2 : 1}>
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
