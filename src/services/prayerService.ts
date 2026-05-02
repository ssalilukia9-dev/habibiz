import { CalculationMethod, Coordinates, PrayerTimes, SunnahTimes } from 'adhan';

export interface PrayerTimeData {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  currentPrayer: string;
  nextPrayer: string;
  nextTime: Date;
}

export const CALCULATION_METHODS = [
  { id: 'MuslimWorldLeague', name: 'Muslim World League' },
  { id: 'Egyptian', name: 'Egyptian Authority' },
  { id: 'Karachi', name: 'University of Islamic Sciences, Karachi' },
  { id: 'Dubai', name: 'Dubai' },
  { id: 'Kuwait', name: 'Kuwait' },
  { id: 'MoonsightingCommittee', name: 'Moonsighting Committee' },
  { id: 'Singapore', name: 'Singapore' },
  { id: 'Turkey', name: 'Turkey' },
  { id: 'Tehran', name: 'Institute of Geophysics, University of Tehran' },
  { id: 'Jafari', name: 'Shia Ithna-Ashari, Leva Institute, Qum' },
  { id: 'NorthAmerica', name: 'ISNA' },
  { id: 'Qatar', name: 'Qatar' },
  { id: 'UmmAlQura', name: 'Umm Al-Qura University, Makkah' },
];

export function getPrayerTimes(
  lat: number, 
  lng: number, 
  methodId: string = 'MuslimWorldLeague',
  offsets: { [key: string]: number } = {},
  date: Date = new Date()
): PrayerTimeData {
  const coordinates = new Coordinates(lat, lng);
  
  // @ts-ignore
  let params = CalculationMethod[methodId] ? CalculationMethod[methodId]() : CalculationMethod.MuslimWorldLeague();
  
  // Apply offsets if provided (adhan library uses a method to set offsets)
  if (offsets.fajr) params.adjustments.fajr = offsets.fajr;
  if (offsets.sunrise) params.adjustments.sunrise = offsets.sunrise;
  if (offsets.dhuhr) params.adjustments.dhuhr = offsets.dhuhr;
  if (offsets.asr) params.adjustments.asr = offsets.asr;
  if (offsets.maghrib) params.adjustments.maghrib = offsets.maghrib;
  if (offsets.isha) params.adjustments.isha = offsets.isha;

  const prayerTimes = new PrayerTimes(coordinates, date, params);
  
  const current = prayerTimes.currentPrayer();
  const next = prayerTimes.nextPrayer();
  
  const names = {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
  };

  const nextTime = prayerTimes.timeForPrayer(next) || prayerTimes.fajr;

  return {
    ...names,
    currentPrayer: current.charAt(0).toUpperCase() + current.slice(1),
    nextPrayer: next.charAt(0).toUpperCase() + next.slice(1),
    nextTime: nextTime
  };
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
