/**
 * Dedicated auth-state persistence layer to prevent race conditions during initial boot.
 * It ensures that the Firebase redirect-based authentication sign-in flow is fully
 * processed before enabling the application UI or letting any auth-state observers trigger.
 */
class AuthStatePersistence {
  private isProcessed: boolean = false;
  private resolveProcessed: (() => void) | null = null;
  private processedPromise: Promise<void>;

  constructor() {
    this.processedPromise = new Promise<void>((resolve) => {
      this.resolveProcessed = resolve;
    });

    // Read initial state from sessionStorage to persist across hot reloads or in-tab navigation
    const wasProcessed = sessionStorage.getItem('sanctuary_redirect_processed') === 'true';
    if (wasProcessed) {
      this.isProcessed = true;
      if (this.resolveProcessed) {
        this.resolveProcessed();
      }
    }
  }

  /**
   * Checks if the redirect process is already confirmed as complete
   */
  isRedirectProcessed(): boolean {
    return this.isProcessed;
  }

  /**
   * Returns a promise that resolves once the redirect flow has been fully processed
   */
  async waitForRedirect(): Promise<void> {
    return this.processedPromise;
  }

  /**
   * Marks the redirect flow as fully processed and resolves any waiting observers
   */
  markAsProcessed(): void {
    if (this.isProcessed) return;
    this.isProcessed = true;
    sessionStorage.setItem('sanctuary_redirect_processed', 'true');
    if (this.resolveProcessed) {
      this.resolveProcessed();
    }
  }

  /**
   * Resets the redirect processed state (useful during sign-outs or forced re-authentications)
   */
  clear(): void {
    this.isProcessed = false;
    sessionStorage.removeItem('sanctuary_redirect_processed');
    this.processedPromise = new Promise<void>((resolve) => {
      this.resolveProcessed = resolve;
    });
  }
}

export const authStatePersistence = new AuthStatePersistence();
