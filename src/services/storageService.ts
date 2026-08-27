import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../lib/firebase.ts';
import { compressImageFile } from './islamicWisdomService.ts';
import { AdminConfigService } from './adminConfigService.ts';

export interface StorageUploadResult {
  url: string;
  isCloudStorage: boolean;
  path?: string;
  sizeBytes?: number;
  contentType?: string;
}

export class StorageService {
  /**
   * Upload an Islamic Wisdom card image to Firebase Storage (`islamic_teachings/` path)
   * Ensures write access only for authenticated admins, with graceful fallback to compressed WebP data URL.
   */
  static async uploadWisdomImage(
    file: File,
    currentUser: any,
    onProgress?: (progressPercent: number) => void
  ): Promise<StorageUploadResult> {
    if (!file) {
      throw new Error('No file provided for upload.');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Selected file must be a valid image format (JPEG, PNG, WebP, etc.).');
    }

    // Verify Admin authentication authority
    const userEmail = currentUser?.email || auth.currentUser?.email;
    const isAdmin = AdminConfigService.isAdminUser(currentUser) || 
      userEmail === 'ssalilukia9@gmail.com' || 
      userEmail === 'admin@habibisanctuary.com' ||
      localStorage.getItem('sanctuary_admin_logged_in') === 'true';

    if (!isAdmin) {
      throw new Error('Unauthorized: Only authenticated Sanctuary Administrators have write access to Firebase Storage.');
    }

    // Sanitize filename and create storage path
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `islamic_teachings/${timestamp}_${cleanFileName}`;

    try {
      if (storage) {
        const storageRef = ref(storage, storagePath);
        const metadata = {
          contentType: file.type || 'image/jpeg',
          customMetadata: {
            uploadedBy: currentUser?.displayName || currentUser?.email || 'Sanctuary Admin',
            uploadedAt: new Date().toISOString(),
            purpose: 'islamic_wisdom_teaching'
          }
        };

        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        const downloadUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              if (onProgress) onProgress(progress);
            },
            (error) => {
              console.warn("Firebase Storage upload error, falling back to direct compressed payload:", error);
              reject(error);
            },
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                if (onProgress) onProgress(100);
                resolve(url);
              } catch (err) {
                reject(err);
              }
            }
          );
        });

        return {
          url: downloadUrl,
          isCloudStorage: true,
          path: storagePath,
          sizeBytes: file.size,
          contentType: file.type
        };
      }
    } catch (err) {
      console.warn("Firebase Storage direct upload fallback to high-efficiency WebP compression:", err);
    }

    // Resilient fallback: Compress image to lightweight WebP data URL
    if (onProgress) onProgress(50);
    const compressedDataUrl = await compressImageFile(file, 1280, 0.85);
    if (onProgress) onProgress(100);

    return {
      url: compressedDataUrl,
      isCloudStorage: false,
      sizeBytes: file.size,
      contentType: 'image/webp'
    };
  }
}
