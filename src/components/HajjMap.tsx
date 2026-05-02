import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Crosshair } from 'lucide-react';

// Fix for default marker icons in React/Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const HAJJ_LOCATIONS = [
  { id: 'miqat', name: 'Ihram (Miqat)', lat: 21.6322, lng: 40.4287, desc: 'Boundary point to enter Ihram state.' },
  { id: 'mina', name: 'Mina', lat: 21.4133, lng: 39.8933, desc: 'The city of tents where pilgrims stay.' },
  { id: 'arafat', name: 'Arafat', lat: 21.3547, lng: 39.9840, desc: 'Mount of Mercy, the pinnacle of Hajj.' },
  { id: 'muzdalifah', name: 'Muzdalifah', lat: 21.3881, lng: 39.9329, desc: 'Area between Arafat and Mina for the night stay.' },
  { id: 'jamarat', name: 'Jamarat', lat: 21.4217, lng: 39.8772, desc: 'Site for the stoning of the pillars ritual.' },
  { id: 'haram', name: 'Masjid al-Haram', lat: 21.4225, lng: 39.8262, desc: 'The Grand Mosque in Makkah.' }
];

function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: false, watch: true }).on("locationfound", (e) => {
      setPosition(e.latlng);
    });
  }, [map]);

  return position === null ? null : (
    <Circle 
      center={position} 
      radius={100} 
      pathOptions={{ color: '#D4AF37', fillColor: '#D4AF37', fillOpacity: 0.3 }}
    >
      <Popup>You are here</Popup>
    </Circle>
  );
}

function PanToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

export default function HajjMap() {
  const [selectedLocation, setSelectedLocation] = useState(HAJJ_LOCATIONS[1]); // Default to Mina
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.4133, 39.8933]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center">
        {HAJJ_LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            onClick={() => {
                setSelectedLocation(loc);
                setMapCenter([loc.lat, loc.lng]);
            }}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
              selectedLocation.id === loc.id 
                ? 'bg-brand-primary text-brand-depth border-brand-primary' 
                : 'bg-white/5 text-slate-400 border-white/5 hover:border-brand-primary/40'
            }`}
          >
            {loc.name}
          </button>
        ))}
      </div>

      <div className="relative h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%', background: '#020617' }}
          className="z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {HAJJ_LOCATIONS.map((loc) => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]}>
              <Popup>
                <div className="p-2 space-y-1">
                  <h4 className="font-bold text-brand-depth">{loc.name}</h4>
                  <p className="text-xs text-slate-600">{loc.desc}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          <LocationMarker />
          <PanToLocation lat={selectedLocation.lat} lng={selectedLocation.lng} />
        </MapContainer>

        {/* Legend/Info Overlay */}
        <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none">
            <div className="glass-panel p-6 rounded-3xl border-brand-primary/20 max-w-sm ml-auto pointer-events-auto">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                        <MapPin size={20} />
                    </div>
                    <h4 className="font-black text-white">{selectedLocation.name}</h4>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    {selectedLocation.desc}
                </p>
            </div>
        </div>
      </div>

      <div className="flex justify-center">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Crosshair size={12} className="text-brand-primary" />
            Enable location services to see your proximity to sites
        </p>
      </div>
    </div>
  );
}
