
'use client';
import React from 'react';
import { Card } from '@/components/ui/card';
import type { Vehicle } from '@/lib/types';
import { Map } from 'lucide-react';

interface MapPanelProps {
  selectedVehicle: Vehicle | null;
  onVehicleSelect: (vehicle: Vehicle | null) => void;
  cameraState: any;
}

export default function MapPanel({ selectedVehicle, onVehicleSelect }: MapPanelProps) {
  return (
    <Card className="h-full w-full overflow-hidden shadow-lg relative flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
            <Map className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">실시간 차량 위치</h3>
            <p className="text-sm">지도 기능은 데모를 위해 비활성화되었습니다.</p>
        </div>
    </Card>
  );
}
