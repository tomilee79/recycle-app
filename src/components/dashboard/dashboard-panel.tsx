
'use client';

import { useState } from 'react';
import DispatchPanel from "@/components/dashboard/dispatch-panel";
import MapPanel from "@/components/dashboard/map-panel";
import DispatchSummary from "@/components/dashboard/dispatch-summary";
import type { Vehicle } from '@/lib/types';
import type { CameraState } from '@vis.gl/react-google-maps';

export default function DashboardPanel() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [cameraState, setCameraState] = useState<Partial<CameraState>>({
    center: { lat: 37.5665, lng: 126.9780 },
    zoom: 11,
  });

  const handleVehicleSelect = (vehicle: Vehicle | null) => {
    setSelectedVehicle(vehicle);
    if (vehicle) {
      setCameraState({ center: vehicle.location, zoom: 14 });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DispatchSummary />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[calc(100vh-8rem-10rem)]">
        <div className="lg:col-span-2 min-h-[50vh] lg:min-h-full">
          <MapPanel 
            selectedVehicle={selectedVehicle}
            onVehicleSelect={handleVehicleSelect}
            cameraState={cameraState}
          />
        </div>
        <div className="lg:col-span-1 min-h-[50vh] lg:min-h-full">
          <DispatchPanel 
            selectedVehicle={selectedVehicle}
            onVehicleSelect={handleVehicleSelect}
          />
        </div>
      </div>
    </div>
  );
}
