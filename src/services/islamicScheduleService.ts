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

export interface RamadanStatus {
  isRamadanActive: boolean;
  isApproachingRamadan: boolean;
  isEidAlFitr: boolean;
  ramadanDay: number; // 1 to 30
  daysRemainingInRamadan: number;
  daysUntilRamadan: number;
  hoursUntilRamadan: number;
  minutesUntilRamadan: number;
  secondsUntilRamadan: number;
  nextRamadanStartGregorian: Date;
  nextRamadanStartStr: string;
  currentHijriMonthIdx: number;
  currentHijriMonthName: string;
  currentHijriDay: number;
  currentHijriYear: number;
}

export interface FastingProgress {
  phase: 'suhoor' | 'fasting' | 'iftar_golden' | 'night_vigil';
  isFasting: boolean;
  progressPercent: number; // 0 to 100
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
  decimalHoursLeft: number;
  totalFastingDurationMinutes: number;
  elapsedFastingDurationMinutes: number;
  remainingFastingDurationMinutes: number;
  remainingText: string;
  hoursText: string;
  statusBadge: string;
  fajrStr: string;
  maghribStr: string;
  isWithin15MinIftar: boolean;
}

/**
 * Calculates realtime fasting day progress, hours remaining until Iftar / Suhoor,
 * and current spiritual phase based on Fajr and Maghrib prayer timings.
 */
export function calculateFastingProgress(
  prayerTimes?: Record<string, string>,
  customNow?: Date
): FastingProgress {
  const now = customNow || new Date();

  // Helper to parse HH:MM strings to Date object
  const parsePrayerTimeToDate = (timeStr?: string, defHour = 5, defMin = 15): Date => {
    const d = new Date(now);
    if (!timeStr) {
      d.setHours(defHour, defMin, 0, 0);
      return d;
    }
    const clean = timeStr.replace(/[^0-9:]/g, '').trim();
    const parts = clean.split(':').map(Number);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      d.setHours(parts[0], parts[1], 0, 0);
    } else {
      d.setHours(defHour, defMin, 0, 0);
    }
    return d;
  };

  const fajrDate = parsePrayerTimeToDate(prayerTimes?.Fajr || prayerTimes?.fajr, 5, 15);
  const maghribDate = parsePrayerTimeToDate(prayerTimes?.Maghrib || prayerTimes?.maghrib, 18, 30);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const fajrStr = formatTime(fajrDate);
  const maghribStr = formatTime(maghribDate);

  const nowMs = now.getTime();
  const fajrMs = fajrDate.getTime();
  const maghribMs = maghribDate.getTime();

  let phase: FastingProgress['phase'] = 'fasting';
  let isFasting = false;
  let progressPercent = 0;
  let remainingMs = 0;
  let totalFastingDurationMinutes = Math.round((maghribMs - fajrMs) / 60000);
  if (totalFastingDurationMinutes <= 0) totalFastingDurationMinutes = 14 * 60; // fallback ~14 hrs
  let elapsedFastingDurationMinutes = 0;
  let remainingFastingDurationMinutes = 0;
  let isWithin15MinIftar = false;
  let statusBadge = 'Active Sawm';
  let hoursText = '';
  let remainingText = '';

  if (nowMs < fajrMs) {
    // Pre-dawn Suhoor Window
    phase = 'suhoor';
    isFasting = false;
    remainingMs = Math.max(0, fajrMs - nowMs);
    const hrs = Math.floor(remainingMs / 3600000);
    const mins = Math.floor((remainingMs % 3600000) / 60000);
    const secs = Math.floor((remainingMs % 60000) / 1000);
    remainingFastingDurationMinutes = Math.round(remainingMs / 60000);
    remainingText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m ${secs}s`;
    hoursText = `${remainingText} to Fajr (Imsak)`;
    statusBadge = 'Suhoor Open';
    progressPercent = 0;
  } else if (nowMs >= fajrMs && nowMs < maghribMs) {
    // Active Fasting Day
    isFasting = true;
    const totalMs = maghribMs - fajrMs;
    const elapsedMs = nowMs - fajrMs;
    remainingMs = Math.max(0, maghribMs - nowMs);
    
    elapsedFastingDurationMinutes = Math.round(elapsedMs / 60000);
    remainingFastingDurationMinutes = Math.round(remainingMs / 60000);
    progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));

    isWithin15MinIftar = remainingMs <= 15 * 60 * 1000;
    phase = isWithin15MinIftar ? 'iftar_golden' : 'fasting';
    statusBadge = isWithin15MinIftar ? 'Golden Iftar Window' : 'Active Sawm';

    const hrs = Math.floor(remainingMs / 3600000);
    const mins = Math.floor((remainingMs % 3600000) / 60000);
    const secs = Math.floor((remainingMs % 60000) / 1000);
    remainingText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m ${secs}s`;
    hoursText = `${remainingText} left until Iftar`;
  } else {
    // Post-Maghrib Night Vigil / Taraweeh Window
    phase = 'night_vigil';
    isFasting = false;
    progressPercent = 100;
    statusBadge = 'Fast Completed';
    
    // Tomorrow Fajr
    const tomorrowFajr = new Date(fajrDate);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    remainingMs = Math.max(0, tomorrowFajr.getTime() - nowMs);
    
    const hrs = Math.floor(remainingMs / 3600000);
    const mins = Math.floor((remainingMs % 3600000) / 60000);
    remainingFastingDurationMinutes = Math.round(remainingMs / 60000);
    remainingText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    hoursText = `${remainingText} to Suhoor`;
  }

  const hoursLeft = Math.floor(remainingMs / 3600000);
  const minutesLeft = Math.floor((remainingMs % 3600000) / 60000);
  const secondsLeft = Math.floor((remainingMs % 60000) / 1000);
  const decimalHoursLeft = Number((remainingMs / 3600000).toFixed(1));

  return {
    phase,
    isFasting,
    progressPercent,
    hoursLeft,
    minutesLeft,
    secondsLeft,
    decimalHoursLeft,
    totalFastingDurationMinutes,
    elapsedFastingDurationMinutes,
    remainingFastingDurationMinutes,
    remainingText,
    hoursText,
    statusBadge,
    fajrStr,
    maghribStr,
    isWithin15MinIftar
  };
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

export const HIJRI_MONTH_NAMES = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
];

/**
 * Calculates upcoming White Days (13th, 14th, 15th of the Hijri month)
 */
export function getUpcomingWhiteDays(): {
  currentMonthDays: WhiteDayInfo[];
  nextMonthDays: WhiteDayInfo[];
  nextUpcomingDay: WhiteDayInfo | null;
  currentHijriDay: number;
  currentHijriMonthName: string;
  isWithin3DaysOrActive: boolean;
} {
  const now = moment();
  const currentHijriDay = now.iDate();
  const currentHijriMonthIdx = now.iMonth(); // 0 to 11
  const currentHijriYear = now.iYear();
  const currentHijriMonthName = HIJRI_MONTH_NAMES[currentHijriMonthIdx] || 'Islamic Month';

  const formatDayInfo = (m: moment.Moment, hDay: number, hMonthIdx: number, hYear: number): WhiteDayInfo => {
    const gregDate = m.toDate();
    const today = moment().startOf('day');
    const targetDay = m.clone().startOf('day');
    const daysRemaining = targetDay.diff(today, 'days');

    return {
      hijriDay: hDay,
      hijriMonthName: HIJRI_MONTH_NAMES[hMonthIdx],
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

  // 3 days before start is the 10th of the Hijri month (13 - 3 = 10).
  // The widget is active during 10, 11, 12, 13, 14, 15, and disappears on day 16.
  const isWithin3DaysOrActive = currentHijriDay >= 10 && currentHijriDay <= 15;

  return {
    currentMonthDays,
    nextMonthDays,
    nextUpcomingDay,
    currentHijriDay,
    currentHijriMonthName,
    isWithin3DaysOrActive
  };
}

/**
 * Computes live Ramadan status, upcoming countdown, and holy month mode
 */
export function getRamadanStatus(customNow?: Date): RamadanStatus {
  const nowMoment = customNow ? moment(customNow) : moment();
  const now = customNow || new Date();

  const currentHijriDay = nowMoment.iDate();
  const currentHijriMonthIdx = nowMoment.iMonth(); // 0-11, 8 is Ramadan, 9 is Shawwal
  const currentHijriYear = nowMoment.iYear();
  const currentHijriMonthName = HIJRI_MONTH_NAMES[currentHijriMonthIdx] || 'Ramadan';

  // Check manual override for testing/previewing
  const manualOverride = typeof window !== 'undefined' ? localStorage.getItem('force-ramadan-mode') : null;
  const isForced = manualOverride === 'true';

  const isRamadanActive = isForced || currentHijriMonthIdx === 8;
  const isEidAlFitr = currentHijriMonthIdx === 9 && currentHijriDay <= 3;
  const ramadanDay = isRamadanActive ? Math.min(30, Math.max(1, currentHijriDay)) : 1;
  const daysRemainingInRamadan = Math.max(0, 30 - ramadanDay);

  // Target start of next Ramadan (1st Ramadan)
  let targetYear = currentHijriYear;
  if (currentHijriMonthIdx > 8) {
    targetYear += 1;
  }
  const ramadanStartMoment = moment().iYear(targetYear).iMonth(8).iDate(1).startOf('day');
  const nextRamadanStartGregorian = ramadanStartMoment.toDate();
  const nextRamadanStartStr = ramadanStartMoment.format('MMMM D, YYYY');

  // Compute countdown in ms
  const diffMs = Math.max(0, nextRamadanStartGregorian.getTime() - now.getTime());
  const daysUntilRamadan = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hoursUntilRamadan = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesUntilRamadan = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const secondsUntilRamadan = Math.floor((diffMs % (1000 * 60)) / 1000);

  const isApproachingRamadan = !isRamadanActive && daysUntilRamadan <= 60;

  return {
    isRamadanActive,
    isApproachingRamadan,
    isEidAlFitr,
    ramadanDay,
    daysRemainingInRamadan,
    daysUntilRamadan,
    hoursUntilRamadan,
    minutesUntilRamadan,
    secondsUntilRamadan,
    nextRamadanStartGregorian,
    nextRamadanStartStr,
    currentHijriMonthIdx,
    currentHijriMonthName,
    currentHijriDay,
    currentHijriYear
  };
}

