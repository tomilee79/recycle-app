'use client';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Card } from '@/components/ui/card';
import { vehicles } from '@/lib/mock-data';
import { Truck } from 'lucide-react';

export default function MapPanel() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const position = { lat: 40.7128, lng: -74.0060 };

  if (!apiKey) {
    return (
      <Card className="h-full flex items-center justify-center bg-muted">
        <div className="text-center text-muted-foreground p-4">
          <h3 className="font-semibold text-lg mb-2">Google Maps API Key Missing</h3>
          <p className="text-sm">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.</p>
        </div>
      </Card>
    );
  }

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
          {vehicles.map((vehicle) => (
            <AdvancedMarker key={vehicle.id} position={vehicle.location} title={vehicle.name}>
                <div className="p-2 bg-primary rounded-full shadow-lg transition-transform hover:scale-110">
                    <Truck className="text-primary-foreground size-5"/>
                </div>
            </AdvancedMarker>
          ))}
        </Map>
      </Card>
    </APIProvider>
  );
}
