export interface DailyVirtue {
  day: string;
  title: string;
  arabicContent?: string;
  translation: string;
  reference: string;
  tasks?: string[];
  virtueType: 'hadith' | 'quran' | 'wisdom';
}

export const DAILY_VIRTUES: Record<number, DailyVirtue[]> = {
  // Sunday
  0: [
    {
      day: 'Sunday',
      title: 'Family Ties',
      translation: 'The womb (kinship) is suspended from the Throne (of Allah) saying: He who keeps good relations with me, Allah will keep connection with him.',
      reference: 'Sahih Muslim',
      virtueType: 'hadith',
      tasks: ['Visit a relative', 'Call your parents', 'Spend quality time with family']
    }
  ],
  // Monday
  1: [
    {
      day: 'Monday',
      title: 'Sunnah Fasting',
      translation: 'The Prophet (ﷺ) was asked about fasting on Monday, and he said: That is the day on which I was born and the day on which I was sent as a Prophet.',
      reference: 'Sahih Muslim',
      virtueType: 'hadith',
      tasks: ['Consider fasting today', 'Make extra dhikr', 'Send Salawat upon the Prophet']
    }
  ],
  // Tuesday
  2: [
    {
      day: 'Tuesday',
      title: 'Knowledge Seeking',
      translation: 'Whoever follows a path in pursuit of knowledge, Allah will make easy for him a path to Paradise.',
      reference: 'Sahih Muslim',
      virtueType: 'hadith',
      tasks: ['Read an Islamic book', 'Listen to a lecture', 'Reflect on one Quranic verse']
    }
  ],
  // Wednesday
  3: [
    {
      day: 'Wednesday',
      title: 'Good Manners',
      translation: 'Nothing is weightier on the Scale of Deeds than one\'s good manners.',
      reference: 'Sahih Bukhari',
      virtueType: 'hadith',
      tasks: ['Be extra patient with people', 'Control your anger', 'Speak kind words']
    }
  ],
  // Thursday
  4: [
    {
      day: 'Thursday',
      title: 'Deeds Presented',
      translation: 'Deeds are presented on Monday and Thursday, and I love that my deeds be presented while I am fasting.',
      reference: 'Tirmidhi',
      virtueType: 'hadith',
      tasks: ['Review your weekly deeds', 'Ask for forgiveness (Istighfar)', 'Plan for Jummah']
    }
  ],
  // Friday
  5: [
    {
      day: 'Friday',
      title: 'The Best of Days',
      translation: 'The best day on which the sun has risen is Friday. On it Adam was created, on it he was made to enter Paradise, and on it he was expelled from it.',
      reference: 'Sahih Muslim',
      virtueType: 'hadith',
      tasks: [
        'Read Surah Al-Kahf',
        'Take a Ghusl (Friday bath)',
        'Send excessive Salawat',
        'Attend Jummah prayer early',
        'Make dua in the hour of acceptance'
      ]
    }
  ],
  // Saturday
  6: [
    {
      day: 'Saturday',
      title: 'Honesty in Trade',
      translation: 'The honest and trustworthy merchant will be with the Prophets, the truthful, and the martyrs.',
      reference: 'Tirmidhi',
      virtueType: 'hadith',
      tasks: ['Be honest in your dealings', 'Avoid wasteful spending', 'Give small charity (Sadaqah)']
    }
  ]
};

export const getVirtueForToday = () => {
  const day = new Date().getDay();
  const index = new Date().getDate() % (DAILY_VIRTUES[day]?.length || 1);
  return DAILY_VIRTUES[day][index];
};
