// Sanctuary Automated Email & Push Lifecycle System
// Provides rich HTML templates, interval scheduling, and automatic push & email dispatch

import { notificationService } from './notificationService.ts';

export interface EmailTemplate {
  id: string;
  name: string;
  category: 'onboarding' | 'education' | 'reminder' | 'encouragement' | 'broadcast';
  subject: string;
  triggerInterval: string;
  targetAudience: string;
  previewText: string;
  pushText?: string;
  htmlContent: (vars: TemplateVariables) => string;
}

export interface TemplateVariables {
  name: string;
  email?: string;
  streak?: number;
  hasanat?: number;
  customMessage?: string;
  previewText?: string;
  actionUrl?: string;
  actionText?: string;
}

export interface EmailLogRecord {
  id: string;
  recipientEmail: string;
  recipientName: string;
  templateId: string;
  templateName: string;
  subject: string;
  sentAt: string;
  status: 'delivered' | 'opened' | 'clicked' | 'bounced';
  intervalTrigger: string;
  pushTriggered?: boolean;
}

export interface AutomatedCampaign {
  id: string;
  title: string;
  interval: string;
  description: string;
  enabled: boolean;
  totalSent: number;
  openRate: number;
  category: 'welcome' | 'guide' | 'reminder' | 'encouragement';
  supportsPush: boolean;
}

// Rich HTML Template Generator with Responsive Islamic Theme
const baseEmailWrapper = (title: string, preheader: string, contentHtml: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #05070d; color: #e2e8f0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 24px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #0b0f19 100%); padding: 36px 30px; text-align: center; border-bottom: 1px solid #d9770633; }
    .gold-tag { display: inline-block; padding: 4px 12px; background: rgba(217, 119, 6, 0.15); border: 1px solid rgba(217, 119, 6, 0.4); border-radius: 9999px; color: #fbbf24; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
    .logo-title { font-size: 26px; font-weight: 900; color: #ffffff; margin: 0; letter-spacing: -0.5px; }
    .logo-gold { color: #f59e0b; }
    .arabic-salat { font-family: 'Amiri', serif; font-size: 20px; color: #fcd34d; margin-top: 8px; margin-bottom: 0; }
    .content { padding: 36px 30px; }
    .card { background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 20px; margin: 20px 0; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000000 !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3); text-align: center; }
    .footer { padding: 24px 30px; text-align: center; border-top: 1px solid #1e293b; background-color: #080c14; font-size: 11px; color: #64748b; }
    .footer a { color: #94a3b8; text-decoration: underline; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 10px; background-color: #05070d;">
    <tr>
      <td align="center">
        <div class="container">
          <!-- Header -->
          <div class="header">
            <span class="gold-tag">Bismillah Ar-Rahman Ar-Rahim</span>
            <h1 class="logo-title">SANCTUARY <span class="logo-gold">APP</span></h1>
            <p class="arabic-salat">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          </div>

          <!-- Body Content -->
          <div class="content">
            ${contentHtml}
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #94a3b8;">Sanctuary & Habibi AI — Your Global Spiritual Companion</p>
            <p style="margin: 0 0 12px 0;">You received this email because you are a registered seeker on Sanctuary App.</p>
            <p style="margin: 0;">
              <a href="https://sanctuary.app/preferences">Email Preferences</a> &bull; 
              <a href="https://sanctuary.app/unsubscribe">Unsubscribe</a> &bull; 
              <a href="https://sanctuary.app/privacy">Privacy Policy</a>
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  // 1. WELCOME NEW USER (Interval: Instant / Day 0)
  {
    id: 'welcome_new_user',
    name: '🌟 Welcome to Sanctuary (Day 0)',
    category: 'onboarding',
    subject: 'Welcome to Sanctuary — Your Spiritual Journey Begins 🌿',
    triggerInterval: 'Immediately upon account creation',
    targetAudience: 'New Pilgrims',
    previewText: 'Salam and welcome! Discover the Holy Quran, Habibi AI, live Qibla, and Hajj guides.',
    pushText: '🌟 Welcome to Sanctuary! Your spiritual companion Habibi AI, Quran, and Prayer times are ready for you.',
    htmlContent: (vars) => baseEmailWrapper(
      'Welcome to Sanctuary',
      'Assalamu Alaikum and welcome to your new spiritual sanctuary.',
      `
      <h2 style="color:#ffffff; font-size:22px; font-weight:800; margin-top:0;">Assalamu Alaikum, ${vars.name || 'Dear Seeker'}! 🌸</h2>
      <p style="color:#cbd5e1; font-size:14px; line-height:1.6;">
        We are honored to welcome you to <strong>Sanctuary</strong>. Your sanctuary is designed to bring serenity, authentic Islamic guidance, and daily consistency to your worship.
      </p>

      <div class="card">
        <h3 style="color:#fbbf24; font-size:15px; margin-top:0; font-weight:700;">✨ Essential Features Ready For You:</h3>
        <ul style="color:#cbd5e1; font-size:13px; line-height:1.8; padding-left:20px; margin-bottom:0;">
          <li><strong>Habibi AI Companion:</strong> Ask questions on Salah, Fiqh, Quran reflections, and authentic Duas.</li>
          <li><strong>Holy Quran & Recitations:</strong> 114 Surahs with audio recitations by world-renowned Qaris.</li>
          <li><strong>Accurate Prayer Times & Live Adhan:</strong> Precise calculation by latitude and GPS.</li>
          <li><strong>Interactive Sacred Map:</strong> Explore historical sites in Makkah & Madinah with step-by-step rituals.</li>
          <li><strong>Hasanat Counter:</strong> Earn rewards and track your daily consistency streak.</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${vars.actionUrl || 'https://sanctuary.app'}" class="btn">
          ${vars.actionText || 'Open Sanctuary & Start Exploring'}
        </a>
      </div>
      `
    )
  },

  // 2. HOW TO USE & HABIBI MASTERCLASS (Interval: 24 Hours / Day 1)
  {
    id: 'how_to_use_guide',
    name: '📖 How to Use & Habibi AI Tips (Day 1)',
    category: 'education',
    subject: '3 Ways to Elevate Your Daily Worship with Habibi AI 💡',
    triggerInterval: '24 hours after signup',
    targetAudience: 'New Pilgrims',
    previewText: 'Learn how to get the most authentic Fiqh guidance, Quran audio, and streak rewards.',
    pushText: '📖 Quick Tip: Ask Habibi AI about traveling prayer rules (Qasr) or daily Duas today!',
    htmlContent: (vars) => baseEmailWrapper(
      'Sanctuary Guide',
      'Discover power features and tips for asking Habibi AI.',
      `
      <h2 style="color:#ffffff; font-size:22px; font-weight:800; margin-top:0;">Master Your Sanctuary Experience, ${vars.name || 'Friend'}! 📖</h2>
      <p style="color:#cbd5e1; font-size:14px; line-height:1.6;">
        Here are 3 quick power-tips to help you make Sanctuary your daily hub of serenity:
      </p>

      <div class="card" style="border-left: 4px solid #f59e0b;">
        <h4 style="color:#ffffff; font-size:14px; margin:0 0 6px 0;">1. Speak Naturally with Habibi AI 🤖</h4>
        <p style="color:#94a3b8; font-size:12px; margin:0; line-height:1.5;">
          Ask questions like <em>"How do I pray Qasr when traveling?"</em> or <em>"Explain the context of Surah Ad-Duha"</em>. Habibi responds with referenced authentic rulings and Quranic verses.
        </p>
      </div>

      <div class="card" style="border-left: 4px solid #10b981;">
        <h4 style="color:#ffffff; font-size:14px; margin:0 0 6px 0;">2. Daily Dhikr & Tasbih Counter 📿</h4>
        <p style="color:#94a3b8; font-size:12px; margin:0; line-height:1.5;">
          Tap into the digital Tasbih after each prayer to complete 33x SubhanAllah, 33x Alhamdulillah, and 34x Allahu Akbar and watch your Hasanat balance flourish.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${vars.actionUrl || 'https://sanctuary.app'}" class="btn">
          Ask Habibi a Question Today
        </a>
      </div>
      `
    )
  },

  // 3. 3-DAY STREAK REMINDER (Interval: 3 Days Inactive)
  {
    id: 'streak_reminder',
    name: '🔥 Streak Reminder & Momentum (Day 3 Inactive)',
    category: 'reminder',
    subject: 'Your Spiritual Streak is Waiting! 🕊️ (+50 Hasanat Gift Inside)',
    triggerInterval: '3 days of inactivity',
    targetAudience: 'Inactive Users (>72 Hours)',
    previewText: 'Keep your spiritual momentum alive with a brief Quran reflection and bonus Hasanat.',
    pushText: '🔥 Your streak is waiting! Claim +50 bonus Hasanat and recite a verse on Sanctuary.',
    htmlContent: (vars) => baseEmailWrapper(
      'Spiritual Reminder',
      'Take 2 minutes to reconnect with your daily worship.',
      `
      <h2 style="color:#ffffff; font-size:22px; font-weight:800; margin-top:0;">Take a Peaceful Breath, ${vars.name || 'Dear Seeker'} 🌿</h2>
      <p style="color:#cbd5e1; font-size:14px; line-height:1.6;">
        Even on our busiest days, a single verse of the Holy Quran or a sincere Dua can illuminate our heart and bring profound Barakah into our time.
      </p>

      <div class="card" style="text-align: center; background: linear-gradient(135deg, #1e1b4b 0%, #172554 100%);">
        <span style="font-size:28px;">🔥</span>
        <h3 style="color:#fcd34d; font-size:18px; margin:8px 0 4px 0; font-weight:800;">
          Current Streak: ${vars.streak || 1} Day${(vars.streak || 1) > 1 ? 's' : ''}
        </h3>
        <p style="color:#93c5fd; font-size:12px; margin:0 0 12px 0;">
          Log in today to maintain your consistency and claim <strong>+50 Bonus Hasanat</strong>!
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${vars.actionUrl || 'https://sanctuary.app'}" class="btn">
          Claim My Bonus & Recite Today
        </a>
      </div>
      `
    )
  },

  // 4. 7-DAY INACTIVITY REMINDER & SPIRITUAL REVIVAL (EMAIL + PUSH NOTIFICATION)
  {
    id: 'inactivity_7d_revival',
    name: '🕊️ 7-Day Inactivity Revival & Re-engagement (Email + Push)',
    category: 'reminder',
    subject: '🕊️ We Miss You in Sanctuary — Rekindle Your Spiritual Haven (+100 Bonus Hasanat)',
    triggerInterval: '7 days of no app activity',
    targetAudience: 'Inactive Pilgrims (>= 7 Days)',
    previewText: 'A peaceful reminder from your sanctuary: claim +100 bonus Hasanat and listen to today’s calming verse.',
    pushText: '🕊️ We miss you in Sanctuary! Your 7-day revival gift (+100 Hasanat) and peaceful Quran reflections are ready.',
    htmlContent: (vars) => baseEmailWrapper(
      'Spiritual Haven Reminder',
      'Rekindle your peace and claim your 7-day spiritual bonus.',
      `
      <h2 style="color:#ffffff; font-size:22px; font-weight:800; margin-top:0;">Assalamu Alaikum, ${vars.name || 'Beloved Seeker'} 🕊️</h2>
      <p style="color:#cbd5e1; font-size:14px; line-height:1.6;">
        It has been <strong>7 days</strong> since your last visit to Sanctuary. Life gets busy, but your spiritual oasis is always here to provide comfort, serenity, and clarity.
      </p>

      <div class="card" style="background: radial-gradient(circle, #1e1b4b 0%, #080c14 100%); border: 1px solid #d9770688; text-align: center; padding: 24px;">
        <span style="font-size:32px;">🎁</span>
        <h3 style="color:#fbbf24; font-size:18px; margin:8px 0 4px 0; font-weight:800;">
          +100 Revival Hasanat Gift Unlocked
        </h3>
        <p style="color:#94a3b8; font-size:12px; margin:0 0 16px 0;">
          Claim your gift by opening Sanctuary today.
        </p>

        <div style="background: rgba(255,255,255,0.05); padding: 14px; border-radius: 12px; text-align: left; margin-bottom: 12px;">
          <p style="color:#fcd34d; font-size:12px; font-weight:700; margin:0 0 4px 0;">✨ Today's Calming Ayah:</p>
          <p style="color:#e2e8f0; font-size:13px; font-style:italic; margin:0; line-height:1.5;">
            "And He found you lost and guided you." (Surah Ad-Duha 93:7)
          </p>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${vars.actionUrl || 'https://sanctuary.app'}" class="btn">
          Claim +100 Hasanat & Open Sanctuary
        </a>
      </div>
      `
    )
  },

  // 5. WEEKLY JUMU'AH MUBARAK (Interval: Every Friday)
  {
    id: 'weekly_jummuah',
    name: '🕌 Jumu\'ah Mubarak Reminder (Every Friday)',
    category: 'reminder',
    subject: 'Jumu\'ah Mubarak — Surah Al-Kahf & Friday Blessings 🕌',
    triggerInterval: 'Every Friday at 08:00 AM local time',
    targetAudience: 'All Registered Seekers',
    previewText: 'Blessed Friday! Read Surah Al-Kahf, send Salawat upon the Prophet ﷺ, and make fervent Dua.',
    pushText: '🕌 Jumu\'ah Mubarak! Recite Surah Al-Kahf and send Salawat upon the Prophet ﷺ today.',
    htmlContent: (vars) => baseEmailWrapper(
      'Jumu\'ah Mubarak',
      'Blessed Friday reminders from Sanctuary.',
      `
      <h2 style="color:#ffffff; font-size:22px; font-weight:800; margin-top:0;">Jumu'ah Mubarak, ${vars.name || 'Seeker'}! 🌟</h2>
      <p style="color:#cbd5e1; font-size:14px; line-height:1.6;">
        Today is the best day upon which the sun has risen — the blessed day of Jumu'ah. May Allah shower peace and light upon you and your family.
      </p>

      <div class="card">
        <h4 style="color:#fbbf24; font-size:14px; margin-top:0; font-weight:800;">🌿 Sunnahs of Jumu'ah:</h4>
        <ol style="color:#cbd5e1; font-size:12px; line-height:1.8; padding-left:20px; margin-bottom:0;">
          <li><strong>Recite Surah Al-Kahf:</strong> Provides light for you from this Friday to the next.</li>
          <li><strong>Abundant Salawat:</strong> <em>Allahumma Salli 'ala Muhammad</em>.</li>
          <li><strong>Ghusl & Attar:</strong> Following the Sunnah.</li>
          <li><strong>Dua in the Hour of Acceptance (Sa'at al-Istijabah).</strong></li>
        </ol>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${vars.actionUrl || 'https://sanctuary.app'}" class="btn">
          Listen to Surah Al-Kahf on Sanctuary
        </a>
      </div>
      `
    )
  },

  // 6. MILESTONE ENCOURAGEMENT (Interval: On Goal Reached)
  {
    id: 'milestone_celebration',
    name: '👑 Hasanat Milestone Celebration',
    category: 'encouragement',
    subject: 'Mabrook! You Achieved a New Spiritual Milestone 🏆',
    triggerInterval: 'When reaching 1,000 / 5,000 / 10,000 Hasanat',
    targetAudience: 'Active Seekers',
    previewText: 'Congratulations on your dedication! See your spiritual stats and earned rewards.',
    pushText: '👑 Mabrook! You unlocked a new spiritual milestone on Sanctuary.',
    htmlContent: (vars) => baseEmailWrapper(
      'Milestone Celebration',
      'Congratulations on your spiritual achievements.',
      `
      <h2 style="color:#ffffff; font-size:22px; font-weight:800; margin-top:0;">Mabrook, ${vars.name || 'Champion'}! 🎉</h2>
      <p style="color:#cbd5e1; font-size:14px; line-height:1.6;">
        Your devotion to daily prayer, Quran recitation, and spiritual learning has earned you a remarkable new milestone in Sanctuary!
      </p>

      <div class="card" style="text-align:center; background: radial-gradient(circle, #1e1b4b 0%, #0b0f19 100%); border-color:#f59e0b88;">
        <span style="font-size:36px;">🏆</span>
        <h3 style="color:#f59e0b; font-size:22px; font-weight:900; margin:10px 0 4px 0;">
          ${(vars.hasanat || 1000).toLocaleString()} Hasanat Earned!
        </h3>
        <p style="color:#cbd5e1; font-size:13px; margin:0;">
          You are among the top spiritual achievers in our global community.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${vars.actionUrl || 'https://sanctuary.app'}" class="btn">
          View Your Spiritual Trophy & Stats
        </a>
      </div>
      `
    )
  },

  // 7. CUSTOM BROADCAST EMAIL (Admin On-Demand)
  {
    id: 'custom_broadcast',
    name: '📢 Custom Administrative Announcement',
    category: 'broadcast',
    subject: 'Special Update from Sanctuary App 🕊️',
    triggerInterval: 'Manual trigger by Administrator',
    targetAudience: 'All Users or Segment',
    previewText: 'Important announcement and new features from Sanctuary.',
    pushText: '📢 Special announcement from Sanctuary Admin.',
    htmlContent: (vars) => baseEmailWrapper(
      'Sanctuary Update',
      vars.previewText || 'A special message from the Sanctuary team.',
      `
      <h2 style="color:#ffffff; font-size:22px; font-weight:800; margin-top:0;">Assalamu Alaikum, ${vars.name || 'Pilgrim'} 🌟</h2>
      
      <div class="card">
        <div style="color:#e2e8f0; font-size:14px; line-height:1.7;">
          ${vars.customMessage ? vars.customMessage.replace(/\n/g, '<br/>') : 'We have exciting new features and spiritual tools released to enrich your daily worship.'}
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${vars.actionUrl || 'https://sanctuary.app'}" class="btn">
          ${vars.actionText || 'Open Sanctuary App'}
        </a>
      </div>
      `
    )
  }
];

export const DEFAULT_CAMPAIGNS: AutomatedCampaign[] = [
  {
    id: 'welcome_seq',
    title: 'New Pilgrim Welcome & Tour (Day 0)',
    interval: 'Instant on Signup',
    description: 'Welcomes new pilgrims, introduces Habibi AI, Quran recitations, and Qibla compass.',
    enabled: true,
    totalSent: 1492,
    openRate: 74.8,
    category: 'welcome',
    supportsPush: true
  },
  {
    id: 'guide_seq',
    title: 'How-to-Use Masterclass & Fiqh Tips (Day 1)',
    interval: '24 Hours After Signup',
    description: 'Teaches pilgrims how to ask Habibi AI complex Fiqh questions, track Dhikr, and find masjids.',
    enabled: true,
    totalSent: 1380,
    openRate: 68.2,
    category: 'guide',
    supportsPush: true
  },
  {
    id: 'streak_seq',
    title: 'Inactivity Recovery & Streak Protection (Day 3)',
    interval: '72 Hours Inactivity',
    description: 'Sends a gentle reminder with +50 Hasanat bonus to revive the user\'s spiritual streak.',
    enabled: true,
    totalSent: 890,
    openRate: 59.4,
    category: 'reminder',
    supportsPush: true
  },
  {
    id: 'inactivity_7d_seq',
    title: '7-Day Inactivity Spiritual Revival (Email + Push)',
    interval: '7 Days Inactivity',
    description: 'Automatic multi-channel revival: Sends high-impact revival email + Push Notification with +100 Hasanat gift.',
    enabled: true,
    totalSent: 412,
    openRate: 64.1,
    category: 'reminder',
    supportsPush: true
  },
  {
    id: 'jummuah_seq',
    title: 'Weekly Jumu\'ah Mubarak & Surah Al-Kahf',
    interval: 'Every Friday 08:00 AM',
    description: 'Weekly Friday reminders for Surah Al-Kahf, Salawat, and late afternoon Dua.',
    enabled: true,
    totalSent: 4620,
    openRate: 81.3,
    category: 'reminder',
    supportsPush: true
  },
  {
    id: 'milestone_seq',
    title: 'Milestone Encouragement (1K, 5K, 10K Hasanat)',
    interval: 'On Hasanat Milestones',
    description: 'Celebrates spiritual dedication and rewards pilgrims with milestone badges.',
    enabled: true,
    totalSent: 940,
    openRate: 77.1,
    category: 'encouragement',
    supportsPush: true
  }
];

export const INITIAL_EMAIL_LOGS: EmailLogRecord[] = [
  { id: 'log_0', recipientEmail: 'seeker.inactive@ummah.net', recipientName: 'Ibrahim Khalil', templateId: 'inactivity_7d_revival', templateName: '7-Day Inactivity Revival', subject: '🕊️ We Miss You in Sanctuary — Rekindle Your Spiritual Haven (+100 Bonus Hasanat)', sentAt: 'Just now', status: 'delivered', intervalTrigger: '7 Days Inactivity', pushTriggered: true },
  { id: 'log_1', recipientEmail: 'seeker.london@deen.app', recipientName: 'Tariq Al-Mansoor', templateId: 'welcome_new_user', templateName: 'Welcome to Sanctuary', subject: 'Welcome to Sanctuary — Your Spiritual Journey Begins 🌿', sentAt: '2 mins ago', status: 'opened', intervalTrigger: 'Instant', pushTriggered: true },
  { id: 'log_2', recipientEmail: 'fatima.z@sanctuary.org', recipientName: 'Fatima Zahra', templateId: 'how_to_use_guide', templateName: 'How to Use & Habibi AI Tips', subject: '3 Ways to Elevate Your Daily Worship with Habibi AI 💡', sentAt: '18 mins ago', status: 'clicked', intervalTrigger: '24h', pushTriggered: true },
  { id: 'log_3', recipientEmail: 'pilgrim.makkah@hajj.sa', recipientName: 'Pilgrim in Makkah', templateId: 'milestone_celebration', templateName: 'Hasanat Milestone', subject: 'Mabrook! You Achieved a New Spiritual Milestone 🏆', sentAt: '1 hour ago', status: 'opened', intervalTrigger: 'Milestone', pushTriggered: true },
  { id: 'log_4', recipientEmail: 'zaid.h@ummah.net', recipientName: 'Zaid Ibn Harith', templateId: 'streak_reminder', templateName: 'Streak Reminder & Momentum', subject: 'Your Spiritual Streak is Waiting! 🕊️ (+50 Hasanat Gift Inside)', sentAt: '3 hours ago', status: 'delivered', intervalTrigger: '72h Inactive', pushTriggered: true }
];

// Helper to trigger automated 7-day and lifecycle checks
export async function triggerAutomaticLifecycleCheck(users: any[]): Promise<{
  checkedCount: number;
  revival7dTriggered: number;
  streak3dTriggered: number;
}> {
  let revival7dTriggered = 0;
  let streak3dTriggered = 0;

  const now = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

  for (const user of users) {
    const lastSeenTime = user.lastSeen?.toMillis ? user.lastSeen.toMillis() : (user.lastSeen || (now - SEVEN_DAYS_MS - 1000));
    const timeDiff = now - lastSeenTime;

    // If inactive for 7 or more days
    if (timeDiff >= SEVEN_DAYS_MS) {
      revival7dTriggered++;

      // Trigger Push Notification directly
      notificationService.notify(
        '🕊️ We Miss You in Sanctuary',
        `Assalamu Alaikum ${user.displayName || 'Friend'}, your 7-day revival gift (+100 Hasanat) and peaceful Quran reflections are ready for you.`,
        'system',
        '/#quran'
      );
    } else if (timeDiff >= THREE_DAYS_MS) {
      streak3dTriggered++;
      notificationService.notify(
        '🔥 Your Spiritual Streak is Waiting!',
        `Keep your momentum alive with a 1-minute Quran reflection and claim +50 bonus Hasanat.`,
        'hadith',
        '/#tasbih'
      );
    }
  }

  return {
    checkedCount: users.length,
    revival7dTriggered,
    streak3dTriggered
  };
}
