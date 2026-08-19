import moment from 'moment-hijri';

export interface TahajjudTiming {
  startTime: Date;
  startTimeStr: string;
  midnightTime: Date;
  midnightTimeStr: string;
  durationMinutes: number;
  isLastThirdNow: boolean;
}

export interface WhiteDayInfo {
  hijriDay: number;
  hijriMonthName: string;
  hijriYear: number;
  gregorianDate: Date;
  dateStr: string;
  isToday: boolean;
  isTomorrow: boolean;
  daysRemaining: number;
}

/**
 * Calculates the Last Third of the Night (Tahajjud)
 * Based on Maghrib time and Fajr time of the next morning.
 */
export function calculateTahajjudTimings(maghribTimeStr?: string, fajrTimeStr?: string): TahajjudTiming {
  const now = new Date();
  
  // Default fallbacks if prayer times not yet loaded
  const mStr = maghribTimeStr || '18:30';
  const fStr = fajrTimeStr || '05:15';

  const [mHours, mMins] = mStr.split(':').map(Number);
  const [fHours, fMins] = fStr.split(':').map(Number);

  // Today's Maghrib
  const maghribDate = new Date(now);
  maghribDate.setHours(mHours, mMins, 0, 0);

  // Tomorrow's Fajr
  const fajrDate = new Date(now);
  fajrDate.setHours(fHours, fMins, 0, 0);
  if (fajrDate <= maghribDate) {
    fajrDate.setDate(fajrDate.getDate() + 1);
  }

  // Total night duration in milliseconds
  const nightDurationMs = fajrDate.getTime() - maghribDate.getTime();
  const oneThirdMs = nightDurationMs / 3;

  // Islamic Midnight (Halfway through night)
  const midnightDate = new Date(maghribDate.getTime() + (nightDurationMs / 2));
  
  // Start of Last Third of Night (Tahajjud optimal time)
  const lastThirdStartDate = new Date(fajrDate.getTime() - oneThirdMs);

  const formatHMM = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const isLastThirdNow = now.getTime() >= lastThirdStartDate.getTime() && now.getTime() <= fajrDate.getTime();

  return {
    startTime: lastThirdStartDate,
    startTimeStr: formatHMM(lastThirdStartDate),
    midnightTime: midnightDate,
    midnightTimeStr: formatHMM(midnightDate),
    durationMinutes: Math.round(oneThirdMs / 60000),
    isLastThirdNow
  };
}

/**
 * Calculates upcoming White Days (13th, 14th, 15th of the Hijri month)
 */
export function getUpcomingWhiteDays(): {
  currentMonthDays: WhiteDayInfo[];
  nextMonthDays: WhiteDayInfo[];
  nextUpcomingDay: WhiteDayInfo | null;
  currentHijriDay: number;
  currentHijriMonthName: string;
} {
  const hijriMonths = [
    'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
    'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
  ];

  const now = moment();
  const currentHijriDay = now.iDate();
  const currentHijriMonthIdx = now.iMonth(); // 0 to 11
  const currentHijriYear = now.iYear();
  const currentHijriMonthName = hijriMonths[currentHijriMonthIdx] || 'Islamic Month';

  const formatDayInfo = (m: moment.Moment, hDay: number, hMonthIdx: number, hYear: number): WhiteDayInfo => {
    const gregDate = m.toDate();
    const today = moment().startOf('day');
    const targetDay = m.clone().startOf('day');
    const daysRemaining = targetDay.diff(today, 'days');

    return {
      hijriDay: hDay,
      hijriMonthName: hijriMonths[hMonthIdx],
      hijriYear: hYear,
      gregorianDate: gregDate,
      dateStr: m.format('ddd, MMM D, YYYY'),
      isToday: daysRemaining === 0,
      isTomorrow: daysRemaining === 1,
      daysRemaining
    };
  };

  // Days for current Hijri Month
  const currentMonthDays: WhiteDayInfo[] = [13, 14, 15].map((hDay) => {
    const m = moment().iYear(currentHijriYear).iMonth(currentHijriMonthIdx).iDate(hDay);
    return formatDayInfo(m, hDay, currentHijriMonthIdx, currentHijriYear);
  });

  // Days for next Hijri Month
  const nextMonthMoment = moment().add(1, 'iMonth');
  const nextHijriMonthIdx = nextMonthMoment.iMonth();
  const nextHijriYear = nextMonthMoment.iYear();

  const nextMonthDays: WhiteDayInfo[] = [13, 14, 15].map((hDay) => {
    const m = moment().iYear(nextHijriYear).iMonth(nextHijriMonthIdx).iDate(hDay);
    return formatDayInfo(m, hDay, nextHijriMonthIdx, nextHijriYear);
  });

  // Find the next upcoming White Day (either today or in future)
  const allDays = [...currentMonthDays, ...nextMonthDays];
  const nextUpcomingDay = allDays.find(d => d.daysRemaining >= 0) || currentMonthDays[0];

  return {
    currentMonthDays,
    nextMonthDays,
    nextUpcomingDay,
    currentHijriDay,
    currentHijriMonthName
  };
}
