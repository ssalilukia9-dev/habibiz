export interface ShareablePayload {
  title: string;
  text: string;
  url?: string;
  arabic?: string;
  author?: string;
  source?: string;
  category?: string;
  imageUrl?: string;
  badge?: string;
}

type ShareListener = (payload: ShareablePayload | null) => void;

class ShareManager {
  private activePayload: ShareablePayload | null = null;
  private listeners: Set<ShareListener> = new Set();

  subscribe(listener: ShareListener): () => void {
    this.listeners.add(listener);
    listener(this.activePayload);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.activePayload));
  }

  open(payload: ShareablePayload) {
    // Ensure URL has a fallback to current web domain
    const cleanPayload: ShareablePayload = {
      ...payload,
      url: payload.url || (typeof window !== 'undefined' ? window.location.href : 'https://habibisanctuary.app')
    };
    this.activePayload = cleanPayload;
    this.notify();
  }

  close() {
    this.activePayload = null;
    this.notify();
  }

  getPayload(): ShareablePayload | null {
    return this.activePayload;
  }

  // Generate platform-specific share URLs
  getWhatsAppUrl(payload: ShareablePayload): string {
    const lines = [
      `*${payload.title}*`,
      payload.arabic ? `\n"${payload.arabic}"\n` : '',
      payload.text,
      payload.source ? `\n— _${payload.source}_` : (payload.author ? `\n— _${payload.author}_` : ''),
      payload.url ? `\n\n🔗 ${payload.url}` : ''
    ].filter(Boolean).join('\n');
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(lines.trim())}`;
  }

  getTelegramUrl(payload: ShareablePayload): string {
    const text = [
      payload.title,
      payload.arabic ? `\n${payload.arabic}\n` : '',
      payload.text,
      payload.source ? `— ${payload.source}` : (payload.author ? `— ${payload.author}` : '')
    ].filter(Boolean).join('\n');
    return `https://t.me/share/url?url=${encodeURIComponent(payload.url || window.location.href)}&text=${encodeURIComponent(text)}`;
  }

  getTwitterUrl(payload: ShareablePayload): string {
    const text = [
      payload.arabic ? `${payload.arabic}\n` : '',
      payload.text.length > 180 ? `${payload.text.slice(0, 175)}...` : payload.text,
      payload.source ? `— ${payload.source}` : ''
    ].filter(Boolean).join(' ');
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(payload.url || window.location.href)}`;
  }

  getFacebookUrl(payload: ShareablePayload): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(payload.url || window.location.href)}&quote=${encodeURIComponent(payload.text)}`;
  }

  getLinkedInUrl(payload: ShareablePayload): string {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(payload.url || window.location.href)}`;
  }

  getEmailUrl(payload: ShareablePayload): string {
    const subject = encodeURIComponent(`Aloha Sanctuary: ${payload.title}`);
    const body = encodeURIComponent(
      `${payload.title}\n\n${payload.arabic ? payload.arabic + '\n\n' : ''}${payload.text}\n\n${payload.source || payload.author || ''}\n\nShared via Aloha Sanctuary:\n${payload.url || window.location.href}`
    );
    return `mailto:?subject=${subject}&body=${body}`;
  }

  async triggerNativeShare(payload: ShareablePayload): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: payload.title,
          text: [
            payload.arabic ? `${payload.arabic}\n` : '',
            payload.text,
            payload.source ? `\n— ${payload.source}` : ''
          ].filter(Boolean).join(' '),
          url: payload.url || window.location.href
        });
        return true;
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.warn('Native share error:', e);
        }
        return false;
      }
    }
    return false;
  }
}

export const shareService = new ShareManager();
