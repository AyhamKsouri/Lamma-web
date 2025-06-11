import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';

interface MapPickerProps {
  onLocationSelect: (coords: { lat: number; lng: number }, address: string) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ onLocationSelect }) => {
  const [markerPosition, setMarkerPosition] = useState<L.LatLngLiteral>({
    lat: 36.8065,
    lng: 10.1815,
  });

  const DraggableMarker = () => {
    useMapEvents({
      click(e) {
        setMarkerPosition(e.latlng);

        // Simple reverse geocoding
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`)
          .then(res => res.json())
          .then(data => {
            const address = data.display_name || '';
            onLocationSelect(e.latlng, address);
          });
      },
    });

    return <Marker position={markerPosition} />;
  };

  return (
    <MapContainer
      center={markerPosition}
      zoom={13}
      scrollWheelZoom={true}
      style={{
        height: '400px',   // or 100% of the parent
        width: '100%',     // makes it responsive
        borderRadius: '12px',
      }}
    >

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker />
    </MapContainer>
  );
};

export default MapPicker;
