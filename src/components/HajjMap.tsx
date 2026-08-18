import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Info, 
  ExternalLink, 
  Locate, 
  Clock, 
  Footprints, 
  Layers, 
  Tent, 
  Sparkles,
  Award,
  ChevronRight,
  Search
} from 'lucide-react';

// Fix for Leaflet default icon issues in Vite/React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Marker Icons for all key historical sites
const createSiteIcon = (site: SacredSite, isSelected: boolean) => {
  let emoji = '📍';
  let bgColor = '#8b5cf6';
  let borderColor = '#ffffff';

  // Distinctive iconography for every historical site
  if (site.id === 'kaaba') {
    emoji = '🕋';
    bgColor = '#d97706';
    borderColor = '#fbbf24';
  } else if (site.id === 'safa_marwa') {
    emoji = '👣';
    bgColor = '#059669';
  } else if (site.id === 'mina') {
    emoji = '⛺';
    bgColor = '#10b981';
  } else if (site.id === 'arafat') {
    emoji = '⛰️';
    bgColor = '#ea580c';
  } else if (site.id === 'muzdalifah') {
    emoji = '🌌';
    bgColor = '#4f46e5';
  } else if (site.id === 'jamarat') {
    emoji = '🎯';
    bgColor = '#e11d48';
  } else if (site.id === 'cave_hira') {
    emoji = '📜';
    bgColor = '#7c3aed';
  } else if (site.id === 'cave_thawr') {
    emoji = '🛡️';
    bgColor = '#6366f1';
  } else if (site.id === 'nabawi') {
    emoji = '🕌';
    bgColor = '#16a34a';
    borderColor = '#4ade80';
  } else if (site.id === 'quba') {
    emoji = '🏛️';
    bgColor = '#0284c7';
  } else if (site.id === 'uhud') {
    emoji = '⛰️';
    bgColor = '#c2410c';
  } else if (site.id === 'qiblatayn') {
    emoji = '🧭';
    bgColor = '#2563eb';
  } else if (site.id === 'baqi') {
    emoji = '🌿';
    bgColor = '#0d9488';
  } else if (site.category === 'Kaaba & Sanctuary') {
    emoji = '🕋';
    bgColor = '#eab308';
  } else if (site.category === 'Prophet Sanctuary') {
    emoji = '🕌';
    bgColor = '#06b6d4';
  }

  const size = isSelected ? 48 : 38;

  return L.divIcon({
    className: 'custom-hajj-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${bgColor};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        box-shadow: 0 6px 20px rgba(0,0,0,0.6), 0 0 16px ${bgColor}aa;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? '24px' : '19px'};
        cursor: pointer;
        transform: ${isSelected ? 'scale(1.18)' : 'scale(1)'};
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      ">
        ${emoji}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)]
  });
};

const createUserPinIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="
        width: 22px;
        height: 22px;
        background: #3b82f6;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.35);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

export interface SacredSite {
  id: string;
  name: string;
  arabic: string;
  city: 'Makkah' | 'Madinah';
  category: 'Kaaba & Sanctuary' | 'Hajj Plain' | 'Sacred Mountain' | 'Prophet Sanctuary' | 'Historical Site';
  lat: number;
  lng: number;
  hajjDay?: string;
  significance: string;
  ritualGuide: string;
  visitingTips: string;
  stepNumber?: number;
}

export const SACRED_HISTORICAL_SITES: SacredSite[] = [
  // MAKKAH SITES
  {
    id: 'kaaba',
    name: 'Al-Masjid Al-Haram (The Holy Kaaba)',
    arabic: 'المسجد الحرام والكعبة المشرفة',
    city: 'Makkah',
    category: 'Kaaba & Sanctuary',
    lat: 21.4225,
    lng: 39.8262,
    hajjDay: '8th, 10th-12th Dhul Hijjah',
    significance: 'The holiest site in Islam, the House of Allah built by Prophet Ibrahim and Ismail (AS). One prayer equals 100,000 prayers elsewhere.',
    ritualGuide: 'Tawaf (7 anti-clockwise circuits around Kaaba), 2 Rak\'ahs behind Maqam Ibrahim, drinking Zamzam water, and Sa\'i between Safa and Marwa.',
    visitingTips: 'Ground floor Mataf is reserved for pilgrims in Ihram. Mezzanine floor offers electric golf carts for elderly and disabled pilgrims.',
    stepNumber: 1
  },
  {
    id: 'safa_marwa',
    name: 'Mount Safa & Mount Marwa (Mas\'a)',
    arabic: 'الصفا والمروة (المسعى)',
    city: 'Makkah',
    category: 'Kaaba & Sanctuary',
    lat: 21.4239,
    lng: 39.8277,
    hajjDay: 'Umrah & 10th Dhul Hijjah',
    significance: 'The historic path walked and run by Lady Hajar (RA) searching for water for infant Ismail (AS) before Zamzam welled up.',
    ritualGuide: 'Perform 7 laps starting at Safa and finishing at Marwa (~3.15 km total). Men jog lightly between the green fluorescent light markers.',
    visitingTips: 'Fully air-conditioned 4-story corridor with automated wheelchairs, chilled Zamzam dispensers, and wide resting zones.',
    stepNumber: 2
  },
  {
    id: 'mina',
    name: 'Mina (City of Tents)',
    arabic: 'منى (مدينة الخيام)',
    city: 'Makkah',
    category: 'Hajj Plain',
    lat: 21.4133,
    lng: 39.8933,
    hajjDay: '8th & 11th-13th Dhul Hijjah (Yawm at-Tarwiyah & Ayyam at-Tashreeq)',
    significance: 'The great valley of fireproof air-conditioned tents where over 2 million pilgrims camp during Hajj following the Sunnah.',
    ritualGuide: 'Pray Dhuhr, Asr, Maghrib, Isha (shortened to 2 Rak\'ahs) and Fajr on 8th Dhul Hijjah. Spend nights of Tashreeq here.',
    visitingTips: 'Locate your camp sector and tent number immediately. Free medical dispensaries and chilled water stations throughout every block.',
    stepNumber: 3
  },
  {
    id: 'arafat',
    name: 'Mount Arafat & Jabal ar-Rahmah',
    arabic: 'جبل الرحمة في عرفات',
    city: 'Makkah',
    category: 'Sacred Mountain',
    lat: 21.3547,
    lng: 39.9840,
    hajjDay: '9th Dhul Hijjah (Yawm Arafah - The Pinnacle of Hajj)',
    significance: 'The core pillar of Hajj ("Al-Hajju Arafah"). Site of Prophet Muhammad\'s ﷺ historic Farewell Sermon (Khutbat al-Wada).',
    ritualGuide: 'Combine and shorten Dhuhr and Asr at Namirah Mosque, spend the afternoon until sunset in continuous fervent Dua, Tahlil, and Istighfar.',
    visitingTips: 'Mist-sprinklers operate across the plains. Stay inside shade or under umbrellas. Clambering up the rocky mountain is optional Sunnah.',
    stepNumber: 4
  },
  {
    id: 'muzdalifah',
    name: 'Muzdalifah (Al-Mash\'ar Al-Haram)',
    arabic: 'مزدلفة (المشعر الحرام)',
    city: 'Makkah',
    category: 'Hajj Plain',
    lat: 21.3881,
    lng: 39.9329,
    hajjDay: 'Night of 9th-10th Dhul Hijjah',
    significance: 'The open valley where pilgrims spend the night under the stars after departing Arafat at Maghrib time.',
    ritualGuide: 'Pray Maghrib and Isha combined (3 and 2 Rak\'ahs) with one Adhan and two Iqamahs upon arrival. Collect 49-70 pea-sized pebbles for Jamarat.',
    visitingTips: 'Sleep on provided mats or sleeping bags. Rest until Fajr prayer, then make Dua at Al-Mash\'ar Al-Haram before departing for Mina before sunrise.',
    stepNumber: 5
  },
  {
    id: 'jamarat',
    name: 'Jamarat Complex (Stoning Pillars)',
    arabic: 'جسر الجمرات (رمي الجمار)',
    city: 'Makkah',
    category: 'Hajj Plain',
    lat: 21.4217,
    lng: 39.8772,
    hajjDay: '10th-13th Dhul Hijjah (Ramy al-Jamarat)',
    significance: 'Where Prophet Ibrahim (AS) stoned the devil who attempted to dissuade him from obeying Allah\'s command.',
    ritualGuide: 'Throw 7 small pebbles at Jamarat al-Aqaba on 10th Dhul Hijjah reciting "Allahu Akbar" with each throw. Throw at all 3 pillars on Tashreeq days.',
    visitingTips: 'Modern multi-level bridge equipped with cooling fans, escalators, and unidirectional crowd flow lanes for maximum safety.',
    stepNumber: 6
  },
  {
    id: 'cave_hira',
    name: 'Jabal An-Noor & Cave of Hira',
    arabic: 'جبل النور وغار حراء',
    city: 'Makkah',
    category: 'Historical Site',
    lat: 21.4583,
    lng: 39.8583,
    significance: 'Where Prophet Muhammad ﷺ spent periods in deep spiritual meditation and received the first revelation of the Quran (Surah Al-Alaq).',
    ritualGuide: 'A place of profound reflection (Ziyarah). No specific prayers prescribed by Sunnah.',
    visitingTips: 'Visit Hira Cultural District at the base. Paved staircase with safety railings leads to the peak (~45-60 min hike). Best at dawn.',
    stepNumber: 7
  },
  {
    id: 'cave_thawr',
    name: 'Jabal Thawr & Cave of Thawr',
    arabic: 'جبل ثور وغار ثور',
    city: 'Makkah',
    category: 'Historical Site',
    lat: 21.3783,
    lng: 39.8517,
    significance: 'Where the Prophet ﷺ and Abu Bakr As-Siddiq (RA) took refuge for 3 nights during the blessed Hijrah migration to Madinah.',
    ritualGuide: 'Ziyarah site referenced in the Holy Quran (Surah At-Tawbah 9:40).',
    visitingTips: 'Steep natural mountain trail south of Makkah (~1.5-2 hour climb). Best undertaken with good footwear in cool morning hours.',
    stepNumber: 8
  },

  // MADINAH SITES
  {
    id: 'nabawi',
    name: 'Al-Masjid An-Nabawi (The Prophet\'s Mosque)',
    arabic: 'المسجد النبوي الشريف',
    city: 'Madinah',
    category: 'Prophet Sanctuary',
    lat: 24.4672,
    lng: 39.6111,
    significance: 'The second holiest sanctuary in Islam. One prayer is equivalent to 1,000 prayers elsewhere. Contains the blessed Rawdah and Prophet\'s Tomb.',
    ritualGuide: 'Pray in the Rawdah Ash-Sharifah ("A garden from the gardens of Paradise") and send Salam upon the Prophet ﷺ, Abu Bakr, and Umar (RA).',
    visitingTips: 'Pre-book your Rawdah visiting slot using the official Nusuk App. Giant automated umbrellas shade the extensive marble courtyards.',
    stepNumber: 9
  },
  {
    id: 'quba',
    name: 'Masjid Quba',
    arabic: 'مسجد قباء',
    city: 'Madinah',
    category: 'Prophet Sanctuary',
    lat: 24.4394,
    lng: 39.6172,
    significance: 'The very first mosque built in Islamic history. Praying 2 Rak\'ahs here is rewarded with the equivalent reward of performing an Umrah.',
    ritualGuide: 'Make Wudu at your residence, visit Masjid Quba, and offer two voluntary Rak\'ahs (Sunnah to visit on Saturday morning).',
    visitingTips: 'Connected to Masjid An-Nabawi by the scenic 3 km pedestrianized Quba Boulevard (walking path, bicycles, and golf carts available).',
    stepNumber: 10
  },
  {
    id: 'uhud',
    name: 'Mount Uhud & Martyrs of Uhud',
    arabic: 'جبل أحد ومقبرة شهداء أحد',
    city: 'Madinah',
    category: 'Historical Site',
    lat: 24.5033,
    lng: 39.6119,
    significance: 'Site of the historic Battle of Uhud (3 AH). Contains the resting place of 70 beloved martyrs including Hamza bin Abdul-Muttalib (RA).',
    ritualGuide: 'Climb Jabal ar-Rumah (Mount of Archers) and send peace upon the martyrs of Uhud from outside the cemetery enclosure.',
    visitingTips: 'Visit the Uhud Battle Visual Exhibition Center located next to the parking plaza for an interactive historical timeline.',
    stepNumber: 11
  },
  {
    id: 'qiblatayn',
    name: 'Masjid Al-Qiblatayn (Mosque of Two Qiblas)',
    arabic: 'مسجد القبلتين',
    city: 'Madinah',
    category: 'Historical Site',
    lat: 24.4842,
    lng: 39.5786,
    significance: 'Where the historic Quranic revelation came commanding the change of Qibla from Al-Aqsa (Jerusalem) to the Kaaba (Makkah) during prayer.',
    ritualGuide: 'Offer two Rak\'ahs of Tahiyyat al-Masjid and observe the preserved dual mihrab architecture markings.',
    visitingTips: 'Quiet residential district with easy parking and wheelchair ramps.',
    stepNumber: 12
  },
  {
    id: 'baqi',
    name: 'Jannat Al-Baqi Cemetery',
    arabic: 'مقبرة بقيع الغرقد',
    city: 'Madinah',
    category: 'Historical Site',
    lat: 24.4681,
    lng: 39.6167,
    significance: 'Resting place of approximately 10,000 noble Companions, wives of the Prophet (Ummahat al-Mu\'minin), and family members (Ahl al-Bayt).',
    ritualGuide: 'Recite the Sunnah Dua upon entering a cemetery: "As-Salamu \'alaykum ahlad-diyar minal-mu\'minina wal-muslimin..."',
    visitingTips: 'Directly adjacent to the eastern piazza of Masjid An-Nabawi. Gates open daily after Fajr and Asr prayers for men.',
    stepNumber: 13
  }
];

// Coordinates for the Hajj Pilgrim Circuit Polyline
const HAJJ_ROUTE_COORDS: [number, number][] = [
  [21.4225, 39.8262], // 1. Masjid Al-Haram (Tawaf Qudum)
  [21.4133, 39.8933], // 2. Mina (8th Dhul Hijjah Tarwiyah)
  [21.3547, 39.9840], // 3. Arafat (9th Dhul Hijjah Day)
  [21.3881, 39.9329], // 4. Muzdalifah (9th Dhul Hijjah Night)
  [21.4217, 39.8772], // 5. Jamarat & Mina (10th Dhul Hijjah Ramy)
  [21.4225, 39.8262], // 6. Masjid Al-Haram (Tawaf Ifadah / Ziyarah)
  [21.4133, 39.8933]  // 7. Mina (11th-13th Tashreeq Days)
];

function MapFlyController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export default function HajjMap({ 
  isPremium, 
  onShowPremium 
}: { 
  isPremium?: boolean;
  onShowPremium?: () => void;
}) {
  const [cityFilter, setCityFilter] = useState<'all' | 'Makkah' | 'Madinah'>('Makkah');
  const [selectedSite, setSelectedSite] = useState<SacredSite>(SACRED_HISTORICAL_SITES[0]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.4225, 39.8262]);
  const [zoomLevel, setZoomLevel] = useState<number>(13);
  const [showHajjRoute, setShowHajjRoute] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<string>('Click to track proximity to holy sites');

  const filteredSites = SACRED_HISTORICAL_SITES.filter(site => {
    const matchesCity = cityFilter === 'all' || site.city === cityFilter;
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          site.arabic.includes(searchQuery) ||
                          site.significance.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          site.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const locatePilgrim = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported by this browser.");
      return;
    }
    setLocationStatus("Triangulating your position...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setZoomLevel(14);
        setLocationStatus(`GPS Locked: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (err) => {
        setLocationStatus("Could not fetch GPS. Showing holy sites overview.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectSite = (site: SacredSite) => {
    setSelectedSite(site);
    setMapCenter([site.lat, site.lng]);
    setZoomLevel(15);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="p-6 md:p-8 rounded-[2.5rem] bg-brand-sidebar/80 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">
              Interactive Leaflet Sacred Navigation
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white italic tracking-tight">
            Holy Sites & Pilgrim Pathways
          </h2>
          <p className="text-xs text-slate-300 max-w-xl font-medium">
            Explore 13+ verified holy landmarks across Makkah & Madinah with GPS waypoints, historical significance, ritual directions, and the Hajj route overlay.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={locatePilgrim}
            className="flex-1 lg:flex-none px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Locate size={16} />
            <span>Locate My Position</span>
          </button>

          <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10">
            {(['all', 'Makkah', 'Madinah'] as const).map((city) => (
              <button
                key={city}
                onClick={() => {
                  setCityFilter(city);
                  if (city === 'Makkah') {
                    setMapCenter([21.4225, 39.8262]);
                    setZoomLevel(13);
                  } else if (city === 'Madinah') {
                    setMapCenter([24.4672, 39.6111]);
                    setZoomLevel(13);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  cityFilter === city
                    ? 'bg-brand-primary text-brand-depth shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {city === 'all' ? 'All Sites' : city}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowHajjRoute(!showHajjRoute)}
            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-2 ${
              showHajjRoute
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <Footprints size={14} />
            <span>{showHajjRoute ? 'Hajj Route ON' : 'Hajj Route OFF'}</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search sacred sites, mountains, valleys, rituals, history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-primary font-medium"
        />
      </div>

      {/* Main Interactive Map & Details Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Leaflet Interactive Map */}
        <div className="lg:col-span-7 h-[440px] md:h-[560px] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative">
          <MapContainer
            center={mapCenter}
            zoom={zoomLevel}
            style={{ height: '100%', width: '100%', background: '#070a13' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapFlyController center={mapCenter} zoom={zoomLevel} />

            {/* Hajj Pilgrim Circuit Polyline Route */}
            {showHajjRoute && (
              <Polyline
                positions={HAJJ_ROUTE_COORDS}
                pathOptions={{
                  color: '#10b981',
                  weight: 4,
                  dashArray: '8, 8',
                  opacity: 0.85
                }}
              />
            )}

            {/* User live position marker */}
            {userLocation && (
              <>
                <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserPinIcon()}>
                  <Popup>
                    <div className="p-2 text-center">
                      <p className="font-bold text-xs text-slate-900">Your Current Position</p>
                      <p className="text-[10px] text-slate-600">Active Pilgrim GPS</p>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={1200}
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1.5 }}
                />
              </>
            )}

            {/* Sacred Sites Markers */}
            {filteredSites.map((site) => {
              const isSelected = selectedSite.id === site.id;
              return (
                <Marker
                  key={site.id}
                  position={[site.lat, site.lng]}
                  icon={createSiteIcon(site, isSelected)}
                  eventHandlers={{
                    click: () => handleSelectSite(site)
                  }}
                >
                  <Popup>
                    <div className="p-3.5 max-w-[260px] space-y-2.5">
                      <div className="border-b border-slate-200 pb-2">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {site.city} • {site.category}
                          </span>
                          {site.stepNumber && (
                            <span className="text-[9px] font-black bg-slate-900 text-amber-400 px-2 py-0.5 rounded-full">
                              Step #{site.stepNumber}
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-slate-950 text-sm leading-snug">{site.name}</h4>
                        <p className="text-xs font-bold text-slate-700 font-arabic mt-0.5">{site.arabic}</p>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed font-medium">
                        {site.significance}
                      </p>

                      <div className="pt-1 space-y-1.5">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-slate-950 hover:bg-slate-800 text-amber-400 font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider shadow-md transition-all text-center"
                        >
                          <Navigation size={13} className="fill-amber-400 shrink-0" />
                          <span>Navigate</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleSelectSite(site)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-1.5 px-3 rounded-xl text-[10px] uppercase tracking-wider transition-colors text-center cursor-pointer"
                        >
                          View Rituals & Audio Guide
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Floating Route Legend */}
          {showHajjRoute && (
            <div className="absolute top-4 right-4 z-[400] bg-slate-950/85 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl pointer-events-none">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                Hajj Circuit Trail Active
              </span>
            </div>
          )}
        </div>

        {/* Right: Selected Holy Site Deep Details Drawer */}
        <div className="lg:col-span-5 space-y-4 max-h-[560px] overflow-y-auto no-scrollbar pr-1">
          {/* Selected Site Showcase Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-brand-primary/20 via-brand-sidebar to-brand-depth border border-brand-primary/40 shadow-xl space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                  selectedSite.city === 'Makkah' 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {selectedSite.city} • {selectedSite.category}
                </span>

                {selectedSite.hajjDay && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-lg border border-purple-500/30">
                    {selectedSite.hajjDay}
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-black text-white leading-tight">{selectedSite.name}</h3>
              <p className="arabic-text text-lg text-brand-primary font-bold">{selectedSite.arabic}</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Historical Significance</p>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">{selectedSite.significance}</p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Ritual & Prayer Guide</p>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">{selectedSite.ritualGuide}</p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-400">Pilgrim Visiting Tips</p>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">{selectedSite.visitingTips}</p>
              </div>
            </div>

            {/* Direct External Maps Navigation Action */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedSite.lat},${selectedSite.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-brand-depth font-black rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
              >
                <Navigation size={14} className="fill-current" />
                Google Maps
              </a>
              <a
                href={`https://maps.apple.com/?daddr=${selectedSite.lat},${selectedSite.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 bg-white/10 hover:bg-white/15 text-white font-black rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest border border-white/10 hover:scale-102 active:scale-98 transition-all cursor-pointer"
              >
                <ExternalLink size={14} />
                Apple Maps
              </a>
            </div>
          </div>

          {/* Quick Site Switcher List */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">
              All Sacred Landmarks ({filteredSites.length})
            </p>
            {filteredSites.map((s) => {
              const isSelected = selectedSite.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectSite(s)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-brand-sidebar border-brand-primary/50 shadow-lg'
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-black text-white">{s.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{s.city} • {s.category}</p>
                  </div>
                  <ChevronRight size={16} className={isSelected ? 'text-brand-primary' : 'text-slate-500'} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
