import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase.ts';

export interface PostReportItem {
  id: string;
  postId: string;
  postAuthor?: string;
  postContent?: string;
  postImage?: string;
  postCategory?: string;
  reportedByUid: string;
  reportedByName: string;
  reportedByEmail?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  actionTaken?: string;
  createdAt: string;
}

export const PREDEFINED_REPORT_REASONS = [
  {
    id: 'inappropriate',
    label: 'Inappropriate or Offensive Content',
    desc: 'Content that is vulgar, disrespectful, or breaches Islamic sanctuary decorum.'
  },
  {
    id: 'spam',
    label: 'Spam or Commercial Promotion',
    desc: 'Unsolicited advertisements, repetitive promotional links, or bot posting.'
  },
  {
    id: 'misinformation',
    label: 'Misinformation or Inauthentic Quotation',
    desc: 'Fabricated Hadith, misattributed Quran verses, or misleading religious statements.'
  },
  {
    id: 'harassment',
    label: 'Harassment, Bullying, or Hate Speech',
    desc: 'Attacking individuals, inciting hostility, or personal targeting.'
  },
  {
    id: 'sectarian',
    label: 'Sectarian Discord or Hostility',
    desc: 'Instigating conflict between communities or sectarian abuse.'
  },
  {
    id: 'copyright',
    label: 'Copyright or Intellectual Property Violation',
    desc: 'Using protected original assets or material without attribution.'
  },
  {
    id: 'other',
    label: 'Other Concern',
    desc: 'Any other matter requiring Admin moderator intervention.'
  }
];

const LOCAL_REPORTS_KEY = 'sanctuary_local_post_reports_v1';

export class ReportService {
  /**
   * Get cached reports
   */
  static getLocalReports(): PostReportItem[] {
    try {
      const saved = localStorage.getItem(LOCAL_REPORTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  }

  /**
   * Save reports to localStorage
   */
  static saveLocalReports(reports: PostReportItem[]): void {
    try {
      localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(reports));
    } catch (e) {}
  }

  /**
   * Submit a post report
   */
  static async submitReport(reportData: {
    postId: string;
    postAuthor?: string;
    postContent?: string;
    postImage?: string;
    postCategory?: string;
    reportedByUid: string;
    reportedByName: string;
    reportedByEmail?: string;
    reason: string;
    details?: string;
  }): Promise<{ success: boolean; id: string; error?: string }> {
    if (!reportData.postId || !reportData.reason) {
      return { success: false, id: '', error: 'Missing report parameters' };
    }

    const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReport: PostReportItem = {
      id: reportId,
      postId: reportData.postId,
      postAuthor: reportData.postAuthor || 'Community Member',
      postContent: reportData.postContent || '',
      postImage: reportData.postImage || '',
      postCategory: reportData.postCategory || 'General',
      reportedByUid: reportData.reportedByUid,
      reportedByName: reportData.reportedByName || 'Seeker',
      reportedByEmail: reportData.reportedByEmail || '',
      reason: reportData.reason,
      details: reportData.details?.trim() || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // 1. Local storage update
    const current = this.getLocalReports();
    const updated = [newReport, ...current.filter(r => r.id !== reportId)];
    this.saveLocalReports(updated);

    // 2. Firestore write
    try {
      const docRef = doc(db, 'post_reports', reportId);
      await setDoc(docRef, {
        ...newReport,
        createdAt: serverTimestamp()
      });
      return { success: true, id: reportId };
    } catch (e: any) {
      console.warn("Firestore report submission fallback to local:", e);
      return { success: true, id: reportId };
    }
  }

  /**
   * Real-time subscription to `post_reports` collection for Admin
   */
  static subscribeToReports(callback: (reports: PostReportItem[]) => void): () => void {
    callback(this.getLocalReports());

    try {
      const q = query(collection(db, 'post_reports'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: PostReportItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              postId: data.postId || '',
              postAuthor: data.postAuthor || 'Community Member',
              postContent: data.postContent || '',
              postImage: data.postImage || '',
              postCategory: data.postCategory || 'General',
              reportedByUid: data.reportedByUid || '',
              reportedByName: data.reportedByName || 'Anonymous',
              reportedByEmail: data.reportedByEmail || '',
              reason: data.reason || 'General Report',
              details: data.details || '',
              status: data.status || 'pending',
              actionTaken: data.actionTaken || '',
              createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString()
            });
          });

          // Sort pending first, then by date desc
          list.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

          this.saveLocalReports(list);
          callback(list);
        } else {
          callback(this.getLocalReports());
        }
      }, (err) => {
        console.warn("Firestore post_reports listener fallback:", err);
        callback(this.getLocalReports());
      });

      return unsubscribe;
    } catch (e) {
      console.warn("Error setting up post_reports listener:", e);
      return () => {};
    }
  }

  /**
   * Update report status (Dismiss / Actioned / Reviewed)
   */
  static async updateReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'dismissed' | 'actioned', actionTaken?: string): Promise<boolean> {
    const current = this.getLocalReports();
    const updated = current.map(r => r.id === reportId ? { ...r, status, actionTaken: actionTaken || r.actionTaken } : r);
    this.saveLocalReports(updated);

    try {
      const docRef = doc(db, 'post_reports', reportId);
      await setDoc(docRef, {
        status,
        actionTaken: actionTaken || '',
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (e) {
      console.warn("Firestore update report status fallback:", e);
      return true;
    }
  }

  /**
   * Delete report document
   */
  static async deleteReport(reportId: string): Promise<boolean> {
    const current = this.getLocalReports();
    const next = current.filter(r => r.id !== reportId);
    this.saveLocalReports(next);

    try {
      const docRef = doc(db, 'post_reports', reportId);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.warn("Firestore delete report fallback:", e);
      return true;
    }
  }
}
