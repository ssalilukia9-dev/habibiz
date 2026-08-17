import { apiFetch } from './api.ts';

export interface RestUser {
  uid: string;
  email: string;
  displayName: string;
  hasanat: number;
  streak: number;
  createdAt?: string;
  bio?: string;
  bookmarks?: any[];
}

class RestDbClient {
  private static instance: RestDbClient;

  static getInstance() {
    if (!RestDbClient.instance) {
      RestDbClient.instance = new RestDbClient();
    }
    return RestDbClient.instance;
  }

  getToken(): string | null {
    return localStorage.getItem('custom-session-token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): RestUser | null {
    const raw = localStorage.getItem('custom-user-info');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  async register(email: string, pass: string, displayName: string): Promise<RestUser> {
    const res = await apiFetch('/api/db/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, displayName })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register account.');
    }

    localStorage.setItem('custom-session-token', data.token);
    localStorage.setItem('custom-user-info', JSON.stringify(data.user));
    localStorage.setItem('saved-auth-email', data.user.email);
    localStorage.setItem('local-session-active', 'true');

    return data.user;
  }

  async login(email: string, pass: string): Promise<RestUser> {
    const res = await apiFetch('/api/db/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to login.');
    }

    localStorage.setItem('custom-session-token', data.token);
    localStorage.setItem('custom-user-info', JSON.stringify(data.user));
    localStorage.setItem('saved-auth-email', data.user.email);
    localStorage.setItem('local-session-active', 'true');

    return data.user;
  }

  logout() {
    localStorage.removeItem('custom-session-token');
    localStorage.removeItem('custom-user-info');
    localStorage.removeItem('local-session-active');
  }

  async getProfile(): Promise<RestUser> {
    const token = this.getToken();
    if (!token) throw new Error('Not logged in');

    const res = await apiFetch('/api/db/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch custom profile');
    }

    localStorage.setItem('custom-user-info', JSON.stringify(data.user));
    return data.user;
  }

  async sync(hasanat: number, streak: number, bookmarks: any[], bio?: string, displayName?: string): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const res = await apiFetch('/api/db/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hasanat, streak, bookmarks, bio, displayName })
      });

      const data = await res.json();
      return res.ok && data.success;
    } catch (e) {
      console.warn("REST profile synchronization failed. Will retry on next update.", e);
      return false;
    }
  }

  // Social Feed Endpoints
  async addPost(content: string, category: string, image?: string | null, poll?: any): Promise<any> {
    const token = this.getToken();
    if (!token) throw new Error('Not logged in');

    const res = await apiFetch('/api/db/feed/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content, category, image, poll })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to publish post');
    }
    return data;
  }

  async getPosts(): Promise<any[]> {
    const res = await apiFetch('/api/db/feed/posts', {
      method: 'GET'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch posts');
    }
    return data;
  }

  async votePost(postId: string, type: 'support' | 'reconsider'): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    const res = await apiFetch('/api/db/feed/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ postId, type })
    });

    const data = await res.json();
    return res.ok && data.success;
  }

  async commentPost(postId: string, text: string): Promise<any> {
    const token = this.getToken();
    if (!token) throw new Error('Not logged in');

    const res = await apiFetch(`/api/db/feed/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit comment');
    }
    return data.comment;
  }

  async deletePost(postId: string): Promise<boolean> {
    const token = this.getToken();
    const res = await apiFetch(`/api/db/feed/posts/${postId}`, {
      method: 'DELETE',
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });
    const data = await res.json();
    return res.ok && data.success;
  }

  async deleteComment(postId: string, commentId: string): Promise<boolean> {
    const token = this.getToken();
    const res = await apiFetch(`/api/db/feed/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });
    const data = await res.json();
    return res.ok && data.success;
  }

  // Chat Endpoints
  async getRooms(): Promise<any[]> {
    const res = await apiFetch('/api/db/chat/rooms', {
      method: 'GET'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch chat rooms');
    }
    return data;
  }

  async createRoom(title: string): Promise<any> {
    const token = this.getToken();
    if (!token) throw new Error('Not logged in');

    const res = await apiFetch('/api/db/chat/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create room');
    }
    return data;
  }

  async getRoomMessages(roomId: string): Promise<any[]> {
    const res = await apiFetch(`/api/db/chat/rooms/${roomId}/messages`, {
      method: 'GET'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch room messages');
    }
    return data;
  }

  async sendRoomMessage(roomId: string, text: string, type: string = 'text'): Promise<any> {
    const token = this.getToken();
    if (!token) throw new Error('Not logged in');

    const res = await apiFetch(`/api/db/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text, type })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to send message');
    }
    return data;
  }
}

export const restDbClient = RestDbClient.getInstance();
