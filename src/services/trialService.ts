import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { gatePassService } from './gatePassService.ts';

export interface TrialStatus {
  isPremium: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  trialStartMs: number;
  trialExpiresAtMs: number;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  tier: string;
}

export interface PromoCodeResult {
  success: boolean;
  message: string;
  tierGranted?: string;
  daysGranted?: number;
}

// Strictly permitted free resources when trial is expired:
// 1. Qibla
// 2. Prayer Times
// 3. Tasbih
// 4. Hijri Calendar
// 5. Daily Athkar / Adhkar
export const EXPLICIT_FREE_RESOURCES = [
  'qibla',
  'prayer_times',
  'prayer-times',
  'prayers',
  'five_prayers',
  'prayers_guide',
  'five_pillars',
  'pillars',
  'arkan',
  'tasbih',
  'calendar',
  'calendar_view',
  'hijri-calendar',
  'adhkar',
  'daily_athkar',
  'athkar'
] as const;

export function isPermittedFreeResource(resourceIdOrPath: string): boolean {
  if (!resourceIdOrPath) return false;
  const clean = resourceIdOrPath.toLowerCase().replace(/^\//, '').replace(/-/g, '_').trim();
  const rawClean = resourceIdOrPath.toLowerCase().replace(/^\//, '').trim();
  return EXPLICIT_FREE_RESOURCES.some(f => {
    const fClean = f.toLowerCase().replace(/-/g, '_');
    return clean === fClean || rawClean === f || clean === f;
  });
}

const TRIAL_DURATION_DAYS = 3;
const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;
const STORAGE_TRIAL_START_KEY = 'sanctuary_trial_start_timestamp';
const STORAGE_PROMO_REDEEMED_KEY = 'sanctuary_promo_redeemed_list';
const STORAGE_PREMIUM_KEY = 'sanctuary_is_premium';
const STORAGE_PREMIUM_TIER_KEY = 'sanctuary_premium_tier';
const STORAGE_PREMIUM_EXPIRES_KEY = 'sanctuary_premium_expires_at';

// Team inserted promo & VIP activation codes
const SYSTEM_PROMO_CODES: Record<string, { tier: string; days: number; desc: string }> = {
  'UMMAH2026': { tier: 'annual', days: 365, desc: '1 Year Free Ummah Global Access' },
  'RAMADAN': { tier: 'lifetime', days: 3650, desc: 'Ramadan Mubarak Lifetime Haven Access' },
  'BARAKAH': { tier: 'lifetime', days: 3650, desc: 'Lifetime Divine Barakah Pass' },
  'VIPPASS': { tier: 'monthly', days: 30, desc: '30 Days Elite Sanctuary Pass' },
  'ISLAMICHERO': { tier: 'lifetime', days: 3650, desc: 'Spiritual Champion Lifetime Access' },
  'SPECIALGUEST': { tier: 'lifetime', days: 3650, desc: 'VIP Honored Guest Pass' },
  'SALAM2026': { tier: 'lifetime', days: 3650, desc: 'Salam Peace Lifetime Access' },
  'DEEN2026': { tier: 'annual', days: 365, desc: '1 Year Deen Spiritual Pass' },
  'ALHAMDULILLAH': { tier: 'lifetime', days: 3650, desc: 'Gratitude Lifetime Access' },
  'HABIBI2026': { tier: 'lifetime', days: 3650, desc: 'Deen Habibi Special Lifetime Pass' },
  'TEST30': { tier: 'monthly', days: 30, desc: '30 Days Developer Test Pass' }
};

class TrialService {
  /**
   * Initializes or returns the trial start timestamp
   */
  public getTrialStartTime(): number {
    try {
      const stored = localStorage.getItem(STORAGE_TRIAL_START_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      const now = Date.now();
      localStorage.setItem(STORAGE_TRIAL_START_KEY, now.toString());
      return now;
    } catch {
      return Date.now();
    }
  }

  /**
   * Computes the current trial and premium status
   */
  public getStatus(currentUser?: any): TrialStatus {
    const trialStartMs = this.getTrialStartTime();
    const trialExpiresAtMs = trialStartMs + TRIAL_DURATION_MS;
    const now = Date.now();

    // Check if user is premium via currentUser prop or local storage
    const isLocalPremium = localStorage.getItem(STORAGE_PREMIUM_KEY) === 'true';
    const localTier = localStorage.getItem(STORAGE_PREMIUM_TIER_KEY) || 'free';
    const localExpires = localStorage.getItem(STORAGE_PREMIUM_EXPIRES_KEY);

    let isPremium = isLocalPremium || (currentUser && currentUser.isPremium === true);
    let tier = (currentUser && currentUser.subscriptionTier) || localTier;

    // Check expiration if premium is date-bound
    if (localExpires) {
      const expDate = new Date(localExpires).getTime();
      if (expDate < now && !tier.includes('lifetime')) {
        isPremium = false;
        tier = 'free';
        localStorage.removeItem(STORAGE_PREMIUM_KEY);
      }
    }

    if (isPremium) {
      return {
        isPremium: true,
        isTrialActive: false,
        isTrialExpired: false,
        trialStartMs,
        trialExpiresAtMs,
        daysRemaining: 999,
        hoursRemaining: 999,
        minutesRemaining: 999,
        tier: tier || 'lifetime'
      };
    }

    const diffMs = trialExpiresAtMs - now;
    const isTrialActive = diffMs > 0;
    const isTrialExpired = diffMs <= 0;

    const daysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const hoursRemaining = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    const minutesRemaining = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));

    return {
      isPremium: false,
      isTrialActive,
      isTrialExpired,
      trialStartMs,
      trialExpiresAtMs,
      daysRemaining,
      hoursRemaining,
      minutesRemaining,
      tier: 'free_trial'
    };
  }

  /**
   * Redeems a promo or activation code
   */
  public async redeemCode(rawCode: string, currentUser?: any): Promise<PromoCodeResult> {
    const code = (rawCode || '').trim().toUpperCase().replace(/\s+/g, '');

    if (!code) {
      return {
        success: false,
        message: 'Please enter a valid activation or promo code.'
      };
    }

    // Check if it's a MH-VIP Gate Pass code
    if (code.startsWith('MH-VIP')) {
      const result = await gatePassService.redeemGatePass(code, currentUser || { uid: 'guest_' + Date.now() });
      if (result.success) {
        this.applyPremium('monthly', 30);
      }
      return {
        success: result.success,
        message: result.message,
        tierGranted: 'monthly',
        daysGranted: 30
      };
    }

    // Check if it matches our system promo codes
    const promo = SYSTEM_PROMO_CODES[code];
    if (!promo) {
      return {
        success: false,
        message: `Invalid code "${code}". Please check your code or contact support.`
      };
    }

    // Check if user already redeemed this promo code
    try {
      const redeemedList = JSON.parse(localStorage.getItem(STORAGE_PROMO_REDEEMED_KEY) || '[]');
      if (redeemedList.includes(code)) {
        return {
          success: false,
          message: `Code "${code}" has already been redeemed on this device.`
        };
      }
      redeemedList.push(code);
      localStorage.setItem(STORAGE_PROMO_REDEEMED_KEY, JSON.stringify(redeemedList));
    } catch {}

    // Apply Premium
    this.applyPremium(promo.tier, promo.days);

    // Sync to Firestore if user is authenticated
    if (currentUser && currentUser.uid && !currentUser.uid.startsWith('local_') && !currentUser.uid.startsWith('guest_')) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          isPremium: true,
          subscriptionTier: promo.tier,
          premiumActivatedAt: serverTimestamp(),
          premiumExpiresAt: new Date(Date.now() + promo.days * 86400000).toISOString(),
          promoCodeUsed: code
        });
      } catch (err) {
        console.warn("Firestore promo sync warning:", err);
      }
    }

    return {
      success: true,
      message: `🎉 Masha'Allah! Code "${code}" successfully verified! ${promo.desc} unlocked.`,
      tierGranted: promo.tier,
      daysGranted: promo.days
    };
  }

  /**
   * Applies premium status locally and dispatches global event
   */
  public applyPremium(tier: string = 'lifetime', days: number = 3650): void {
    const expiresDate = new Date(Date.now() + days * 86400000).toISOString();
    localStorage.setItem(STORAGE_PREMIUM_KEY, 'true');
    localStorage.setItem(STORAGE_PREMIUM_TIER_KEY, tier);
    localStorage.setItem(STORAGE_PREMIUM_EXPIRES_KEY, expiresDate);

    // Dispatch global event for immediate reactivity
    window.dispatchEvent(new CustomEvent('sanctuary_user_updated', {
      detail: {
        isPremium: true,
        subscriptionTier: tier
      }
    }));

    window.dispatchEvent(new CustomEvent('sanctuary_premium_activated', {
      detail: {
        tier,
        days
      }
    }));
  }

  /**
   * Helper to reset trial for testing or demonstration
   */
  public resetTrialForTesting(): void {
    localStorage.removeItem(STORAGE_PREMIUM_KEY);
    localStorage.removeItem(STORAGE_PREMIUM_TIER_KEY);
    localStorage.removeItem(STORAGE_PREMIUM_EXPIRES_KEY);
    localStorage.setItem(STORAGE_TRIAL_START_KEY, Date.now().toString());
    window.dispatchEvent(new CustomEvent('sanctuary_user_updated', {
      detail: { isPremium: false }
    }));
  }

  /**
   * Helper to force expire trial for testing paywall lock screen
   */
  public forceExpireTrialForTesting(): void {
    localStorage.removeItem(STORAGE_PREMIUM_KEY);
    localStorage.removeItem(STORAGE_PREMIUM_TIER_KEY);
    localStorage.removeItem(STORAGE_PREMIUM_EXPIRES_KEY);
    // Set trial start to 4 days ago
    const past = Date.now() - (4 * 24 * 60 * 60 * 1000);
    localStorage.setItem(STORAGE_TRIAL_START_KEY, past.toString());
    window.dispatchEvent(new CustomEvent('sanctuary_user_updated', {
      detail: { isPremium: false }
    }));
  }
}

export const trialService = new TrialService();
