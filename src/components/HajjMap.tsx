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

export default function HajjMap({ 
  isPremium, 
  onShowPremium 
}: { 
  isPremium: boolean;
  onShowPremium: () => void;
}) {
  const [selectedLocation, setSelectedLocation] = useState(HAJJ_LOCATIONS[1]); // Default to Mina
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.4133, 39.8933]);

  if (!isPremium) {
    return (
      <div className="relative h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col items-center justify-center p-8 bg-brand-sidebar/40">
        <div className="absolute inset-0 bg-brand-depth/60 backdrop-blur-sm z-10" />
        <div className="absolute inset-0 grayscale opacity-20 pointer-events-none">
           <MapContainer 
            center={mapCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            dragging={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </MapContainer>
        </div>
        <div className="relative z-20 text-center space-y-6 max-w-sm">
           <div className="w-20 h-20 bg-brand-primary/20 rounded-3xl mx-auto flex items-center justify-center text-brand-primary border border-brand-primary/30">
              <Navigation size={40} className="animate-pulse" />
           </div>
           <h3 className="text-2xl font-black text-white uppercase italic tracking-tight leading-none">Holy Journey Tracker</h3>
           <p className="text-slate-400 text-xs font-medium leading-relaxed">
             Join the sacred pilgrimage with real-time location tracking for Hajj and Umrah. Interactive map of holy sites included in our Premium Sanctuary.
           </p>
           <button 
             onClick={onShowPremium}
             className="w-full bg-brand-primary text-brand-depth font-black py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-primary/20"
           >
              Unlock Sacred Map
           </button>
        </div>
      </div>
    );
  }

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
            <Marker 
              key={loc.id} 
              position={[loc.lat, loc.lng]}
              eventHandlers={{
                click: () => {
                  setSelectedLocation(loc);
                  setMapCenter([loc.lat, loc.lng]);
                }
              }}
            >
              <Popup>
                <div className="p-3 space-y-2 max-w-[200px]">
                  <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <MapPin size={14} className="text-amber-600 shrink-0" />
                    <span>{loc.name}</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{loc.desc}</p>
                  <div className="pt-2">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-900 text-amber-400 font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-wider hover:bg-slate-800 transition-colors pointer-events-auto"
                    >
                      <Navigation size={10} className="fill-amber-400" />
                      Navigate To
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          <LocationMarker />
          <PanToLocation lat={selectedLocation.lat} lng={selectedLocation.lng} />
        </MapContainer>

        {/* Legend/Info Overlay */}
        <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none">
            <div className="glass-panel p-6 rounded-3xl border border-brand-primary/20 max-w-sm ml-auto pointer-events-auto bg-slate-950/90 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                        <MapPin size={20} />
                    </div>
                    <h4 className="font-black text-white text-base">{selectedLocation.name}</h4>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    {selectedLocation.desc}
                </p>

                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation.lat},${selectedLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full bg-brand-primary text-brand-depth font-black py-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform duration-150 pointer-events-auto shadow-xl shadow-brand-primary/10 cursor-pointer"
                >
                  <Navigation size={12} className="fill-current" />
                  Navigate to {selectedLocation.name}
                </a>
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
