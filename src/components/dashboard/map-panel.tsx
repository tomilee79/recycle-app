
'use client';
import React from 'react';
import { Card } from '@/components/ui/card';
import type { Vehicle } from '@/lib/types';
import { Map } from 'lucide-react';

interface MapPanelProps {
  selectedVehicle: Vehicle | null;
  onVehicleSelect: (vehicle: Vehicle | null) => void;
  cameraState: any; // Kept for compatibility but not used
}

export default function MapPanel({ selectedVehicle, onVehicleSelect }: MapPanelProps) {
  return (
    <Card className="h-full w-full overflow-hidden shadow-lg relative flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
            <Map className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">지도 화면</h3>
            <p className="text-sm">지도 화면 이 부분은 지도 화면이고, 추후에 개발될 예정입니다.</p>
        </div>
    </Card>
  );
}
