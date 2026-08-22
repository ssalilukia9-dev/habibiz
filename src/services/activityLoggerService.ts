import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase.ts';

export type ActivityType = 
  | 'registration' 
  | 'redemption' 
  | 'hasanat' 
  | 'streak' 
  | 'quran' 
  | 'dhikr' 
  | 'admin' 
  | 'prayer'
  | 'broadcast'
  | 'product';

export interface ActivityLogItem {
  id: string;
  type: ActivityType;
  title: string;
  message: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  amount?: number;
  badge?: string;
  rewardTitle?: string;
  targetId?: string;
  targetName?: string;
  timestamp: string;
  createdAt?: any;
  isSimulated?: boolean;
}

const LOCAL_STORAGE_KEY = 'sanctuary_system_activity_logs';

export class ActivityLoggerService {
  /**
   * Log an activity event to Firestore and local fallback
   */
  static async logActivity(data: {
    type: ActivityType;
    title: string;
    message: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    amount?: number;
    badge?: string;
    rewardTitle?: string;
    targetId?: string;
    targetName?: string;
  }): Promise<void> {
    const timestampStr = new Date().toISOString();
    const currentUser = auth?.currentUser;

    const logEntry: Omit<ActivityLogItem, 'id'> = {
      type: data.type,
      title: data.title,
      message: data.message,
      userId: data.userId || currentUser?.uid || 'guest_user',
      userName: data.userName || currentUser?.displayName || 'Sanctuary Pilgrim',
      userEmail: data.userEmail || currentUser?.email || 'pilgrim@sanctuary.app',
      amount: data.amount,
      badge: data.badge,
      rewardTitle: data.rewardTitle,
      targetId: data.targetId,
      targetName: data.targetName,
      timestamp: timestampStr
    };

    // 1. Broadcast window event for instant local reactivity
    window.dispatchEvent(new CustomEvent('sanctuary_activity_logged', {
      detail: { ...logEntry, id: `local_${Date.now()}` }
    }));

    // 2. Save to localStorage cache (keep last 100)
    try {
      const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const existing: ActivityLogItem[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [{ ...logEntry, id: `cache_${Date.now()}` }, ...existing.slice(0, 99)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Local storage activity cache error:", e);
    }

    // 3. Write to Firestore /activity_logs
    try {
      if (db) {
        const logsCol = collection(db, 'activity_logs');
        await addDoc(logsCol, {
          ...logEntry,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.warn("Firestore activity logging notice (fallback active):", err);
    }
  }

  /**
   * Specific helper: Admin Action Log
   */
  static async logAdminAction(details: {
    title: string;
    message: string;
    badge?: string;
    adminName?: string;
    adminEmail?: string;
    targetId?: string;
    targetName?: string;
  }): Promise<void> {
    const currentUser = auth?.currentUser;
    await this.logActivity({
      type: 'admin',
      title: details.title,
      message: details.message,
      userName: details.adminName || currentUser?.displayName || 'Administrator',
      userEmail: details.adminEmail || currentUser?.email || 'admin@sanctuary.app',
      badge: details.badge || 'ADMIN ACTION',
      targetId: details.targetId,
      targetName: details.targetName
    });
  }

  /**
   * Specific helper: Admin User Deletion
   */
  static async logUserDeletion(user: { uid: string; displayName?: string; email?: string }, adminName?: string): Promise<void> {
    const name = user.displayName || 'User';
    await this.logAdminAction({
      title: 'User Account Deleted 🗑️',
      message: `Admin deleted user profile: "${name}" (UID: ${user.uid}${user.email ? `, Email: ${user.email}` : ''})`,
      badge: 'USER DELETED',
      adminName: adminName || 'Admin',
      targetId: user.uid,
      targetName: name
    });
  }

  /**
   * Specific helper: Admin Product Edit
   */
  static async logProductEdit(product: { id: string; title: string; price?: number; coinPrice?: number; category?: string }, adminName?: string): Promise<void> {
    const priceText = product.price !== undefined ? `$${product.price}` : '';
    const coinsText = product.coinPrice !== undefined ? `${product.coinPrice.toLocaleString()} Coins` : '';
    const costSnippet = [priceText, coinsText].filter(Boolean).join(' / ');

    await this.logAdminAction({
      title: 'Product Edited ✏️',
      message: `Admin updated marketplace item: "${product.title}" (${product.category || 'Product'}${costSnippet ? ` • ${costSnippet}` : ''})`,
      badge: 'PRODUCT EDIT',
      adminName: adminName || 'Admin',
      targetId: product.id,
      targetName: product.title
    });
  }

  /**
   * Specific helper: Admin Product Deletion
   */
  static async logProductDeletion(product: { id: string; title: string; sellerName?: string }, adminName?: string): Promise<void> {
    await this.logAdminAction({
      title: 'Product Deleted 🗑️',
      message: `Admin permanently removed item: "${product.title}" from Suq Al-Mubaraki${product.sellerName ? ` (Seller: ${product.sellerName})` : ''}`,
      badge: 'PRODUCT DELETED',
      adminName: adminName || 'Admin',
      targetId: product.id,
      targetName: product.title
    });
  }

  /**
   * Specific helper: User Registration
   */
  static async logRegistration(user: { uid: string; displayName?: string | null; email?: string | null }): Promise<void> {
    const name = user.displayName || 'Blessed Pilgrim';
    await this.logActivity({
      type: 'registration',
      title: 'New Pilgrim Registered 🌟',
      message: `${name} joined the Sanctuary Ummah community`,
      userId: user.uid,
      userName: name,
      userEmail: user.email || undefined,
      badge: 'NEW PILGRIM'
    });
  }

  /**
   * Specific helper: Hasanat Redemption / Shop Reward Claim
   */
  static async logRedemption(details: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    amount: number;
    rewardTitle: string;
    badge?: string;
  }): Promise<void> {
    const name = details.userName || 'Pilgrim';
    await this.logActivity({
      type: 'redemption',
      title: 'Hasanat Redeemed 💎',
      message: `${name} redeemed ${details.amount.toLocaleString()} Hasanat for "${details.rewardTitle}"`,
      userId: details.userId,
      userName: name,
      userEmail: details.userEmail,
      amount: details.amount,
      rewardTitle: details.rewardTitle,
      badge: details.badge || 'REDEEMED'
    });
  }

  /**
   * Specific helper: Dhikr Completion
   */
  static async logDhikrSession(details: {
    userName?: string;
    category: string;
    count: number;
  }): Promise<void> {
    await this.logActivity({
      type: 'dhikr',
      title: 'Dhikr Devotion Completed 📿',
      message: `${details.userName || 'Pilgrim'} completed ${details.count} recitations in ${details.category}`,
      badge: 'DHIKR'
    });
  }

  /**
   * Subscribe to real-time activity logs via Firestore onSnapshot
   */
  static subscribeToLiveActivity(
    onUpdate: (logs: ActivityLogItem[]) => void
  ): () => void {
    let unsubFirestore: (() => void) | null = null;

    // Load initial cached logs
    let localLogs: ActivityLogItem[] = [];
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) localLogs = JSON.parse(raw);
    } catch {
      // ignore
    }

    if (localLogs.length > 0) {
      onUpdate(localLogs);
    }

    // Connect to live Firestore collection
    try {
      if (db) {
        const q = query(
          collection(db, 'activity_logs'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

        unsubFirestore = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const fetchedLogs: ActivityLogItem[] = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                type: data.type || 'hasanat',
                title: data.title || 'System Event',
                message: data.message || '',
                userId: data.userId,
                userName: data.userName,
                userEmail: data.userEmail,
                amount: data.amount,
                badge: data.badge,
                rewardTitle: data.rewardTitle,
                timestamp: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.timestamp || new Date().toISOString()),
                createdAt: data.createdAt
              };
            });
            onUpdate(fetchedLogs);
          }
        }, (error) => {
          console.warn("Live activity listener warning (fallback in place):", error);
        });
      }
    } catch (e) {
      console.warn("Could not initiate Firestore activity stream:", e);
    }

    // Also listen to local window events
    const handleLocalEvent = (e: any) => {
      const detail: ActivityLogItem = e.detail;
      if (detail) {
        localLogs = [detail, ...localLogs.filter(p => p.id !== detail.id)].slice(0, 50);
        onUpdate(localLogs);
      }
    };

    window.addEventListener('sanctuary_activity_logged', handleLocalEvent);

    return () => {
      if (unsubFirestore) unsubFirestore();
      window.removeEventListener('sanctuary_activity_logged', handleLocalEvent);
    };
  }
}
