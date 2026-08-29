import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  getDocs,
  query,
  orderBy,
  limit,
  arrayUnion 
} from 'firebase/firestore';
import { db } from '../lib/firebase.ts';

export interface RedeemedPassRecord {
  code: string;
  redeemedBy: string;
  userEmail?: string;
  userName?: string;
  redeemedAt: any;
  validUntil: string;
  durationDays: number;
}

export interface GatePassResult {
  success: boolean;
  message: string;
  daysGranted?: number;
  validUntil?: string;
}

class GatePassService {
  private static LOCAL_REDEEMED_KEY = 'sanctuary_redeemed_gate_passes';
  private static PREFIX = 'MH-VIP';
  public static MASTER_VIP_CODE = 'MH-VIP-2214';

  /**
   * Checks if a code is the master VIP code for unlimited premium access
   */
  public isMasterCode(rawCode: string): boolean {
    const sanitized = this.sanitizeCode(rawCode);
    return (
      sanitized === 'MH-VIP-2214' ||
      sanitized === 'MH-VIP2214' ||
      sanitized === 'MHVIP2214' ||
      sanitized === 'MH_VIP_2214'
    );
  }

  /**
   * Sanitizes the input code into standard uppercase without spaces.
   */
  public sanitizeCode(rawCode: string): string {
    return (rawCode || '').trim().toUpperCase().replace(/\s+/g, '');
  }

  /**
   * Validates if a code adheres to the MH-VIP pattern.
   * Accepts codes like MH-VIP2026, MH-VIP-7860, MH-VIP-8899, MH-VIP-DEEN, MH-VIP-FREE30, etc.
   */
  public isValidCodeFormat(code: string): boolean {
    const sanitized = this.sanitizeCode(code);
    if (!sanitized.startsWith(GatePassService.PREFIX)) {
      return false;
    }
    // Must have at least 2 alphanumeric characters after MH-VIP or MH-VIP-
    const suffix = sanitized.replace(/^MH-VIP[-_]?/, '');
    return suffix.length >= 2;
  }

  /**
   * Checks locally or in Firestore if a pass has already been used.
   */
  public async isCodeRedeemed(code: string): Promise<boolean> {
    const sanitized = this.sanitizeCode(code);

    // 1. Check local storage blacklist
    try {
      const localRedeemed = JSON.parse(localStorage.getItem(GatePassService.LOCAL_REDEEMED_KEY) || '[]');
      if (Array.isArray(localRedeemed) && localRedeemed.includes(sanitized)) {
        return true;
      }
    } catch {
      // ignore
    }

    // 2. Check Firestore redeemed collection
    try {
      const passRef = doc(db, 'redeemed_gate_passes', sanitized);
      const passSnap = await getDoc(passRef);
      if (passSnap.exists()) {
        return true;
      }
    } catch (err) {
      console.warn("Firestore pass existence check warning:", err);
    }

    return false;
  }

  /**
   * Redeems a MH-VIP gate pass for 1 Month (30 Days) of Free Elite Premium.
   * Single-use only. Once redeemed, it can NEVER be used again.
   */
  public async redeemGatePass(rawCode: string, currentUser: any): Promise<GatePassResult> {
    const sanitized = this.sanitizeCode(rawCode);

    if (!sanitized) {
      return {
        success: false,
        message: 'Please enter a valid VIP Gate Pass code.'
      };
    }

    if (!this.isValidCodeFormat(sanitized)) {
      return {
        success: false,
        message: `Invalid format. VIP Gate Passes must start with "MH-VIP" (e.g. MH-VIP-2026, MH-VIP-7860).`
      };
    }

    if (!currentUser || !currentUser.uid) {
      return {
        success: false,
        message: 'You must be signed in to redeem a VIP Gate Pass.'
      };
    }

    const isMaster = this.isMasterCode(sanitized);

    // If it's the Master Code MH-VIP-2214, grant permanent UNLIMITED VIP Access (lifetime / no expiry)
    if (isMaster) {
      const durationDays = 36500; // 100 years lifetime
      const now = new Date();
      const expiryDate = new Date('2099-12-31T23:59:59.999Z');

      // 1. Update local storage profile & flags
      try {
        localStorage.setItem('sanctuary_is_premium', 'true');
        localStorage.setItem('sanctuary_premium_tier', 'lifetime');
        localStorage.setItem('sanctuary_premium_expires_at', expiryDate.toISOString());

        const localProfileKey = `sanctuary_profile_${currentUser.uid}`;
        const cached = localStorage.getItem(localProfileKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.isPremium = true;
          parsed.subscriptionTier = 'lifetime';
          parsed.unlimitedVip = true;
          parsed.masterCodeRedeemed = true;
          parsed.premiumActivatedAt = now.toISOString();
          parsed.premiumExpiresAt = expiryDate.toISOString();
          parsed.redeemedPasses = [...(parsed.redeemedPasses || []), 'MH-VIP-2214'];
          localStorage.setItem(localProfileKey, JSON.stringify(parsed));
        }
      } catch (e) {
        console.warn("Local storage master code update warning", e);
      }

      // 2. Sync to Firestore
      const masterProfileFields = {
        isPremium: true,
        subscriptionTier: 'lifetime',
        unlimitedVip: true,
        masterCodeUsed: 'MH-VIP-2214',
        premiumActivatedAt: serverTimestamp(),
        premiumExpiresAt: expiryDate.toISOString(),
        redeemedPasses: arrayUnion('MH-VIP-2214')
      };

      if (!currentUser.uid.startsWith('local_')) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, masterProfileFields);
        } catch (err) {
          console.warn("Failed to update user doc with master code in Firestore:", err);
        }
      }

      // 3. Mark in redeemed passes collection for admin logging
      try {
        const passRef = doc(db, 'redeemed_gate_passes', `MH-VIP-2214_${currentUser.uid}`);
        await setDoc(passRef, {
          code: 'MH-VIP-2214',
          redeemedBy: currentUser.uid,
          userEmail: currentUser.email || 'master_user',
          userName: currentUser.displayName || 'Master VIP Seeker',
          redeemedAt: serverTimestamp(),
          validUntil: expiryDate.toISOString(),
          durationDays: 36500,
          isMasterCode: true
        });
      } catch (err) {
        console.warn("Firestore master pass write log:", err);
      }

      // 4. Dispatch global UI events
      window.dispatchEvent(new CustomEvent('sanctuary_user_updated', {
        detail: {
          uid: currentUser.uid,
          isPremium: true,
          subscriptionTier: 'lifetime',
          unlimitedVip: true,
          premiumActivatedAt: now.toISOString()
        }
      }));

      window.dispatchEvent(new CustomEvent('sanctuary_gatepass_redeemed', {
        detail: {
          code: 'MH-VIP-2214',
          durationDays: 36500,
          isMaster: true
        }
      }));

      window.dispatchEvent(new CustomEvent('sanctuary_premium_activated', {
        detail: {
          tier: 'lifetime',
          days: 36500
        }
      }));

      return {
        success: true,
        daysGranted: 36500,
        validUntil: 'Lifetime Permanent Access',
        message: `👑 ALLAHU AKBAR! Master VIP Code verified! Unlimited Lifetime Sanctuary Elite VIP Premium Access permanently unlocked!`
      };
    }

    // Standard single-use MH-VIP Pass flow: Check if code has already been redeemed anywhere
    const alreadyUsed = await this.isCodeRedeemed(sanitized);
    if (alreadyUsed) {
      return {
        success: false,
        message: `⚠️ This Gate Pass (${sanitized}) has already been redeemed and cannot be used again.`
      };
    }

    const durationDays = 30;
    const now = new Date();
    const expiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // 1. Save to local storage redeemed array
    try {
      const localRedeemed = JSON.parse(localStorage.getItem(GatePassService.LOCAL_REDEEMED_KEY) || '[]');
      if (!localRedeemed.includes(sanitized)) {
        localRedeemed.push(sanitized);
        localStorage.setItem(GatePassService.LOCAL_REDEEMED_KEY, JSON.stringify(localRedeemed));
      }
    } catch (e) {
      console.warn("Local storage update warning", e);
    }

    // 2. Mark redeemed in Firestore collection (atomic single-use lock)
    try {
      const passRef = doc(db, 'redeemed_gate_passes', sanitized);
      await setDoc(passRef, {
        code: sanitized,
        redeemedBy: currentUser.uid,
        userEmail: currentUser.email || 'guest',
        userName: currentUser.displayName || 'Seeker',
        redeemedAt: serverTimestamp(),
        validUntil: expiryDate.toISOString(),
        durationDays
      });
    } catch (err) {
      console.warn("Firestore pass doc write fallback:", err);
    }

    // 3. Upgrade user document to Premium for 1 month
    const updatedProfileFields = {
      isPremium: true,
      subscriptionTier: 'monthly',
      premiumActivatedAt: serverTimestamp(),
      premiumExpiresAt: expiryDate.toISOString(),
      redeemedPasses: arrayUnion(sanitized)
    };

    if (!currentUser.uid.startsWith('local_')) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, updatedProfileFields);
      } catch (err) {
        console.warn("Failed to update user doc in Firestore, updating local cache:", err);
      }
    }

    // 4. Update local session & profile cache
    try {
      const localProfileKey = `sanctuary_profile_${currentUser.uid}`;
      const cached = localStorage.getItem(localProfileKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.isPremium = true;
        parsed.subscriptionTier = 'monthly';
        parsed.premiumActivatedAt = now.toISOString();
        parsed.premiumExpiresAt = expiryDate.toISOString();
        parsed.redeemedPasses = [...(parsed.redeemedPasses || []), sanitized];
        localStorage.setItem(localProfileKey, JSON.stringify(parsed));
      }
    } catch (e) {
      // ignore
    }

    // 5. Fire global UI event to update components immediately
    window.dispatchEvent(new CustomEvent('sanctuary_user_updated', {
      detail: {
        uid: currentUser.uid,
        isPremium: true,
        subscriptionTier: 'monthly',
        premiumActivatedAt: now.toISOString()
      }
    }));

    window.dispatchEvent(new CustomEvent('sanctuary_gatepass_redeemed', {
      detail: {
        code: sanitized,
        durationDays
      }
    }));

    return {
      success: true,
      daysGranted: durationDays,
      validUntil: expiryDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      message: `🎉 Masha'Allah! VIP Gate Pass successfully redeemed! 1 Month (30 Days) of Free Sanctuary Elite Premium has been unlocked.`
    };
  }

  /**
   * Generates a recommended new random MH-VIP gate pass for administrators.
   */
  public generatePassCode(): string {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const char1 = letters.charAt(Math.floor(Math.random() * letters.length));
    const char2 = letters.charAt(Math.floor(Math.random() * letters.length));
    return `MH-VIP-${randomNum}${char1}${char2}`;
  }

  /**
   * Retrieves list of all redeemed passes for admin oversight.
   */
  public async getRedeemedPasses(): Promise<RedeemedPassRecord[]> {
    try {
      const coll = collection(db, 'redeemed_gate_passes');
      const q = query(coll, orderBy('redeemedAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      const list: RedeemedPassRecord[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data() } as RedeemedPassRecord);
      });
      return list;
    } catch (err) {
      console.warn("Could not fetch remote redeemed passes:", err);
      return [];
    }
  }
}

export const gatePassService = new GatePassService();
