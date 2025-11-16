import DispatchPanel from "@/components/dashboard/dispatch-panel";
import MapPanel from "@/components/dashboard/map-panel";

export default function DashboardPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[calc(100vh-8rem)]">
      <div className="lg:col-span-2 min-h-[50vh] lg:min-h-full">
        <MapPanel />
      </div>
      <div className="lg:col-span-1 min-h-[50vh] lg:min-h-full">
        <DispatchPanel />
      </div>
    </div>
  );
}
