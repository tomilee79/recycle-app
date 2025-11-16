'use client';
import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { vehicles } from '@/lib/mock-data';
import { Truck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Vehicle } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface MapPanelProps {
  selectedVehicle: Vehicle | null;
  onVehicleSelect: (vehicle: Vehicle | null) => void;
  cameraState: any; // Kept for compatibility but not used
}

// Map image dimensions
const MAP_WIDTH = 1280;
const MAP_HEIGHT = 960;

// Geo bounds of the map image (approximate for Seoul/Gyeonggi area)
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


export default function MapPanel({ selectedVehicle, onVehicleSelect }: MapPanelProps) {

  const getPinStyling = (status: string, isSelected: boolean) => {
    let color = 'text-muted-foreground';

    switch (status) {
      case 'On Route':
        color = 'text-primary';
        break;
      case 'Completed':
        color = 'text-green-600';
        break;
      case 'Maintenance':
        color = 'text-destructive';
        break;
    }
    
    if (isSelected) {
      return {
        color: 'text-accent-foreground',
        bgColor: 'bg-accent/80',
        size: 'h-8 w-8',
      };
    }

    return { color, bgColor: 'bg-background/60', size: 'h-7 w-7' };
  };

  return (
    <Card className="h-full w-full overflow-hidden shadow-lg relative">
      <TooltipProvider>
        <Image
          src="/images/map.png"
          alt="Map of Seoul and Gyeonggi area"
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          className="object-cover w-full h-full"
          priority
        />
        
        {vehicles.map((vehicle) => {
          const isSelected = selectedVehicle?.id === vehicle.id;
          const { color, bgColor, size } = getPinStyling(vehicle.status, isSelected);
          const { x, y } = convertLatLngToPixels(vehicle.location.lat, vehicle.location.lng);

          return (
             <Tooltip key={vehicle.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg',
                    bgColor,
                    size
                  )}
                  style={{ left: `${x}px`, top: `${y}px`, zIndex: isSelected ? 10 : 1 }}
                  onClick={() => onVehicleSelect(vehicle)}
                >
                  <Truck className={cn('h-4 w-4', color)} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className='font-bold'>{vehicle.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </Card>
  );
}