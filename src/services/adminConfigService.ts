import { db } from '../lib/firebase.ts';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';

export interface AdminConfig {
  id?: string;
  allowedAdminEmails: string[];
  allowedAdminUids: string[];
  adminPasscode: string;
  superAdminEmails: string[];
  maintenanceMode: boolean;
  allowGuestRegistrations: boolean;
  requireSubscriptionForUmmah: boolean;
  systemBroadcastNotice?: string;
  securityRoles: Record<string, 'superadmin' | 'admin' | 'moderator'>;
  updatedAt?: any;
  lastUpdatedBy?: string;
}

// Default baseline configuration stored in Firestore 'admin_config/security_settings'
export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  allowedAdminEmails: [
    'ssalilukia9@gmail.com',
    'admin@sanctuary.app',
    'hamloria@sanctuary.app',
    'salil@sanctuary.app'
  ],
  allowedAdminUids: [
    'hamloria',
    '0207',
    '0214',
    'ssalilukia9',
    'salil_admin'
  ],
  adminPasscode: '2214',
  superAdminEmails: [
    'ssalilukia9@gmail.com',
    'hamloria@sanctuary.app'
  ],
  maintenanceMode: false,
  allowGuestRegistrations: true,
  requireSubscriptionForUmmah: false,
  systemBroadcastNotice: 'Welcome to Sanctuary Sacred Platform.',
  securityRoles: {
    'ssalilukia9@gmail.com': 'superadmin',
    'hamloria@sanctuary.app': 'superadmin',
    'hamloria': 'superadmin',
    '0207': 'superadmin',
    '0214': 'superadmin'
  }
};

class AdminConfigServiceClass {
  private currentConfig: AdminConfig = { ...DEFAULT_ADMIN_CONFIG };
  private listeners: ((config: AdminConfig) => void)[] = [];
  private isInitialized = false;
  private unsubscribeFirestore: (() => void) | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Load from local storage cache first for instant responsiveness
    try {
      const cached = localStorage.getItem('sanctuary_admin_config_cache');
      if (cached) {
        this.currentConfig = { ...DEFAULT_ADMIN_CONFIG, ...JSON.parse(cached) };
      }
    } catch (e) {
      console.warn("Failed to parse cached admin config", e);
    }

    // Subscribe to Firestore 'admin_config/security_settings'
    try {
      const configRef = doc(db, 'admin_config', 'security_settings');
      this.unsubscribeFirestore = onSnapshot(configRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<AdminConfig>;
          this.currentConfig = {
            ...DEFAULT_ADMIN_CONFIG,
            ...data,
            allowedAdminEmails: Array.from(new Set([...(data.allowedAdminEmails || []), ...DEFAULT_ADMIN_CONFIG.allowedAdminEmails])),
            allowedAdminUids: Array.from(new Set([...(data.allowedAdminUids || []), ...DEFAULT_ADMIN_CONFIG.allowedAdminUids]))
          };
          localStorage.setItem('sanctuary_admin_config_cache', JSON.stringify(this.currentConfig));
          this.notifyListeners();
        } else {
          // Bootstrap default document in Firestore if it doesn't exist yet
          this.bootstrapDefaultConfig().catch(e => console.warn("Firestore bootstrap skipped:", e));
        }
      }, (err) => {
        console.warn("Admin config real-time listener fell back to cached baseline:", err);
      });
    } catch (err) {
      console.warn("Firestore admin config initialization warning:", err);
    }
  }

  public async bootstrapDefaultConfig(): Promise<AdminConfig> {
    try {
      const configRef = doc(db, 'admin_config', 'security_settings');
      const snap = await getDoc(configRef);
      if (!snap.exists()) {
        await setDoc(configRef, {
          ...DEFAULT_ADMIN_CONFIG,
          updatedAt: serverTimestamp(),
          lastUpdatedBy: 'System Bootstrap'
        });
        console.log("Bootstrapped secure Firestore admin_config/security_settings document.");
      }
    } catch (err) {
      console.warn("Admin config bootstrap warning:", err);
    }
    return this.currentConfig;
  }

  public getConfig(): AdminConfig {
    return this.currentConfig;
  }

  public subscribe(callback: (config: AdminConfig) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentConfig);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb(this.currentConfig);
      } catch (e) {
        console.error("Admin config listener callback failed", e);
      }
    });
  }

  /**
   * Check if a given user object or credentials represent an authorized administrator
   */
  public isAdminUser(user: any): boolean {
    if (!user) return false;

    // Check if explicitly unlocked in local admin session
    const isLocalAdminSession = localStorage.getItem('sanctuary_admin_logged_in') === 'true';
    const email = (user.email || '').trim().toLowerCase();
    const uid = (user.uid || user.id || '').trim().toLowerCase();
    const role = (user.role || '').trim().toLowerCase();

    if (role === 'admin' || role === 'superadmin') return true;

    // Check against live Firestore admin_config
    const allowedEmails = this.currentConfig.allowedAdminEmails.map(e => e.toLowerCase());
    const allowedUids = this.currentConfig.allowedAdminUids.map(u => u.toLowerCase());

    if (email && allowedEmails.includes(email)) return true;
    if (uid && allowedUids.includes(uid)) return true;

    // Direct superadmin identifiers
    if (uid === 'hamloria' || uid === '0207' || uid === '0214' || uid === 'salil_admin') return true;
    if (email === 'ssalilukia9@gmail.com' || email.includes('admin@sanctuary.app') || email.includes('hamloria@sanctuary.app')) return true;

    return isLocalAdminSession && (allowedEmails.includes(email) || allowedUids.includes(uid) || uid.startsWith('local_'));
  }

  /**
   * Check if a given user is a Super Admin
   */
  public isSuperAdmin(user: any): boolean {
    if (!user) return false;
    const email = (user.email || '').trim().toLowerCase();
    const uid = (user.uid || user.id || '').trim().toLowerCase();

    if (user.role === 'superadmin') return true;
    if (this.currentConfig.superAdminEmails.map(e => e.toLowerCase()).includes(email)) return true;
    if (['hamloria', '0207', '0214', 'ssalilukia9'].includes(uid)) return true;
    if (email === 'ssalilukia9@gmail.com') return true;

    return false;
  }

  /**
   * Verify admin credentials (Identifier + Passcode) dynamically against Firestore admin_config
   */
  public async verifyAdminCredentials(
    identifier: string,
    passcode: string
  ): Promise<{ success: boolean; role?: 'superadmin' | 'admin'; error?: string; userPayload?: any }> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = passcode.trim();

    // Fetch fresh config from Firestore if available
    try {
      const configRef = doc(db, 'admin_config', 'security_settings');
      const snap = await getDoc(configRef);
      if (snap.exists()) {
        this.currentConfig = { ...DEFAULT_ADMIN_CONFIG, ...snap.data() as Partial<AdminConfig> };
      }
    } catch (e) {
      console.warn("Using cached admin config for verification:", e);
    }

    const allowedEmails = this.currentConfig.allowedAdminEmails.map(e => e.toLowerCase());
    const allowedUids = this.currentConfig.allowedAdminUids.map(u => u.toLowerCase());

    const isAuthorizedId = 
      allowedEmails.includes(cleanId) ||
      allowedUids.includes(cleanId) ||
      cleanId.includes('hamloria') ||
      cleanId.includes('0207') ||
      cleanId.includes('0214') ||
      cleanId === 'admin' ||
      cleanId === 'ssalilukia9@gmail.com';

    if (!isAuthorizedId) {
      return {
        success: false,
        error: `Unrecognized Admin Identification (${cleanId}). Check authorized overseer ID or email.`
      };
    }

    // Verify passcode against live Firestore admin_config (supports default 2214 or custom configured passcode)
    const validPasscode = this.currentConfig.adminPasscode || '2214';
    if (cleanPass !== validPasscode && cleanPass !== '2214') {
      return {
        success: false,
        error: 'Invalid Admin Security Key / Passcode.'
      };
    }

    // Determine Role
    const isSuper = 
      cleanId === 'hamloria' || 
      cleanId === '0207' || 
      cleanId === '0214' || 
      cleanId === 'ssalilukia9@gmail.com' ||
      this.currentConfig.superAdminEmails.map(e => e.toLowerCase()).includes(cleanId);

    const userPayload = {
      uid: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
      id: cleanId,
      email: cleanId.includes('@') ? cleanId : `${cleanId}@sanctuary.app`,
      displayName: isSuper ? `${cleanId.toUpperCase()} (Super Admin)` : `${cleanId} (Overseer)`,
      role: isSuper ? 'superadmin' : 'admin',
      isPremium: true,
      isHabibiKing: true,
      hasanat: 99999,
      streak: 30,
      level: 99,
      rank: 'Legacy of Light',
      isAnonymous: false
    };

    localStorage.setItem('sanctuary_admin_logged_in', 'true');
    localStorage.setItem('sanctuary_local_user', JSON.stringify(userPayload));

    return {
      success: true,
      role: isSuper ? 'superadmin' : 'admin',
      userPayload
    };
  }

  /**
   * Save updated admin configuration to Firestore
   */
  public async updateConfig(newSettings: Partial<AdminConfig>, adminUser: any): Promise<boolean> {
    try {
      const configRef = doc(db, 'admin_config', 'security_settings');
      const updated = {
        ...this.currentConfig,
        ...newSettings,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: adminUser?.displayName || adminUser?.email || 'Admin Overseer'
      };

      await setDoc(configRef, updated, { merge: true });
      this.currentConfig = updated;
      localStorage.setItem('sanctuary_admin_config_cache', JSON.stringify(updated));
      this.notifyListeners();
      return true;
    } catch (err) {
      console.error("Failed to update Firestore admin_config:", err);
      // Fallback local update
      this.currentConfig = { ...this.currentConfig, ...newSettings };
      localStorage.setItem('sanctuary_admin_config_cache', JSON.stringify(this.currentConfig));
      this.notifyListeners();
      return false;
    }
  }

  public logoutAdmin() {
    localStorage.removeItem('sanctuary_admin_logged_in');
  }
}

export const AdminConfigService = new AdminConfigServiceClass();
