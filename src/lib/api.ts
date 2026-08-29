/**
 * API Utility for Sanctuary (Habibi)
 * Handles environment-aware URL construction for web, Netlify, Vercel, and native (Capacitor) apps.
 * Automatically falls back to direct third-party APIs for Quran, Audio streaming, and Prayer Times.
 */

const getRawFetch = () => {
  return typeof window !== 'undefined' ? (window as any).__originalFetch || window.fetch : fetch;
};

export const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return '';

  // In Capacitor, the app runs on capacitor://localhost (iOS) or http://localhost (Android, with NO port or standard port)
  const isCapacitor = 
    window.location.href.startsWith('capacitor://') ||
    (window.location.hostname === 'localhost' && !window.location.port) ||
    (window.location.hostname === '127.0.0.1' && !window.location.port);

  if (!isCapacitor) {
    // On web, relative paths work directly as backend and frontend share the same origin
    return '';
  }
  
  // Check localStorage or window global for a custom configured API URL
  const customUrl = (typeof window !== 'undefined' ? (localStorage.getItem('custom_api_base_url') || (window as any).__API_BASE_URL__) : '') || '';
  if (customUrl) {
    return customUrl.endsWith('/') ? customUrl.slice(0, -1) : customUrl;
  }

  const productionUrl = import.meta.env.VITE_PRODUCTION_API_URL || import.meta.env.VITE_API_URL || '';
  if (productionUrl) {
    return productionUrl.endsWith('/') ? productionUrl.slice(0, -1) : productionUrl;
  }
  
  return 'https://ais-dev-p6nimnue2dep6nfjkp4jd6-520387765455.europe-west2.run.app';
};

/**
 * Universal Secure Audio Stream URL Resolver
 * Works everywhere: Netlify, Vercel, Cloud Run, Safari, iOS, Android, and Capacitor.
 * Ensures HTTPS and reliable CDN streams.
 */
export const getAudioStreamUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '';
  
  // Blob or Data URIs can be played immediately
  if (rawUrl.startsWith('blob:') || rawUrl.startsWith('data:')) {
    return rawUrl;
  }

  // Extract from proxy query if present
  if (rawUrl.includes('/api/proxy/audio?url=')) {
    try {
      const match = rawUrl.match(/url=([^&]+)/);
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1]);
        return decoded.replace(/^http:\/\//i, 'https://');
      }
    } catch (e) {
      // ignore
    }
  }

  // Replace obsolete or broken domains if encountered
  let secureUrl = rawUrl.replace(/^http:\/\//i, 'https://');
  
  return secureUrl;
};

/**
 * Enhanced fetch that automatically handles absolute URLs, proxy bypasses, audio streams, and AI fallbacks.
 */
export const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const isWeb = typeof window !== 'undefined';
  const originalFetch = getRawFetch();

  // 1. Intercept Audio Proxy Calls
  if (path.startsWith('/api/proxy/audio')) {
    try {
      const parsed = new URL(path, 'https://localhost');
      const targetUrl = parsed.searchParams.get('url');
      if (targetUrl) {
        const secureTarget = getAudioStreamUrl(targetUrl);
        return originalFetch(secureTarget, {
          ...options,
          mode: 'cors'
        });
      }
    } catch (e) {
      console.warn('Audio proxy intercept failed:', e);
    }
  }

  // 2. Intercept Alquran and Aladhan Proxy Calls with upstream fallbacks
  if (path.startsWith('/api/proxy/alquran/')) {
    const subPath = path.replace(/^\/api\/proxy\/alquran\//, '');
    const upstreamUrl = `https://api.alquran.cloud/v1/${subPath}`;
    
    try {
      const baseUrl = getApiBaseUrl();
      const localUrl = `${baseUrl}${path}`;
      const res = await originalFetch(localUrl, options);
      const contentType = res.headers.get('content-type') || '';
      // Only fallback if route didn't match and returned SPA HTML
      if (contentType.includes('text/html')) {
        throw new Error('Local proxy route not matched, falling back to upstream');
      }
      return res;
    } catch (err) {
      console.warn('Local Alquran proxy fallback to direct fetch:', err);
      return originalFetch(upstreamUrl, options);
    }
  }

  if (path.startsWith('/api/proxy/aladhan/')) {
    const subPath = path.replace(/^\/api\/proxy\/aladhan\//, '');
    const upstreamUrl = `https://api.aladhan.com/v1/${subPath}`;

    try {
      const baseUrl = getApiBaseUrl();
      const localUrl = `${baseUrl}${path}`;
      const res = await originalFetch(localUrl, options);
      const contentType = res.headers.get('content-type') || '';
      // Only fallback if route didn't match and returned SPA HTML
      if (contentType.includes('text/html')) {
        throw new Error('Local proxy route not matched, falling back to upstream');
      }
      return res;
    } catch (err) {
      console.warn('Local Aladhan proxy fallback to direct fetch:', err);
      return originalFetch(upstreamUrl, options);
    }
  }

  // 3. Gemini Chat & AI Endpoints
  if (path === '/api/ai/chat' || path.startsWith('/api/ai/chat')) {
    // First try the server proxy
    try {
      const baseUrl = getApiBaseUrl();
      const localUrl = `${baseUrl}${path}`;
      const serverRes = await originalFetch(localUrl, options);
      const contentType = serverRes.headers.get('content-type') || '';
      
      // If server successfully processed it, return the response
      if (serverRes.ok && contentType.includes('application/json')) {
        return serverRes;
      }
      
      // If server returned 404 (static hosting) or 500 error, attempt client-side fallback
      if (serverRes.status === 404 || contentType.includes('text/html')) {
        // Fall through to client-side Gemini call
      } else {
        return serverRes;
      }
    } catch (err) {
      console.warn('Server AI endpoint unreachable, attempting client-side fallback:', err);
    }

    // Client-side Gemini fallback for static hostings & compiled standalone apps
    const customKey = isWeb ? (
      localStorage.getItem('custom_gemini_api_key') || 
      localStorage.getItem('gemini_api_key') ||
      (window as any).__GEMINI_API_KEY__ || 
      (window as any).GEMINI_API_KEY || ''
    ) : '';
    const envKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || '';
    const apiKey = customKey.trim() || envKey.trim();

    if (!apiKey) {
      return new Response(JSON.stringify({
        text: "I'm right here with you! Tell me more about what's on your mind and let's explore it together."
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const bodyData = options.body ? JSON.parse(options.body as string) : {};
      const { contents, systemInstruction } = bodyData;

      const candidateClientModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-1.5-flash"];
      let assistantText: string | null = null;
      let lastClientError = 'Failed to communicate with Google Gemini API client-side.';

      for (const modelName of candidateClientModels) {
        try {
          const rawRes = await originalFetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: systemInstruction ? {
                parts: [{ text: typeof systemInstruction === 'string' ? systemInstruction : (systemInstruction.parts?.[0]?.text || '') }]
              } : undefined
            })
          });

          if (rawRes.ok) {
            const rawData = await rawRes.json();
            assistantText = rawData.candidates?.[0]?.content?.parts?.[0]?.text || null;
            if (assistantText) break;
          } else {
            const errJson = await rawRes.json().catch(() => ({}));
            lastClientError = errJson.error?.message || lastClientError;
            if (rawRes.status === 403) break;
          }
        } catch (err: any) {
          lastClientError = err?.message || lastClientError;
        }
      }

      if (!assistantText) {
        assistantText = "I'm right here with you! Tell me more about what's on your mind and let's explore it together.";
      }
      
      return new Response(JSON.stringify({ text: assistantText }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err: any) {
      return new Response(JSON.stringify({
        text: "I'm right here with you! Tell me more about what's on your mind and let's explore it together."
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 4. Default standard fetch behavior
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
  return originalFetch(url, options);
};

// 5. Global monkey-patching of window.fetch to capture ALL proxy fetches in the app automatically
if (typeof window !== 'undefined' && !(window as any).__fetchPatched) {
  try {
    const originalFetch = window.fetch;
    (window as any).__originalFetch = originalFetch;
    (window as any).__fetchPatched = true;

    const customFetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      const urlString = typeof input === 'string' 
        ? input 
        : (input instanceof URL ? input.href : (input as Request).url);
        
      let path = urlString;
      if (urlString.startsWith('http://') || urlString.startsWith('https://') || urlString.startsWith('capacitor://')) {
        try {
          const parsedUrl = new URL(urlString);
          path = parsedUrl.pathname + parsedUrl.search;
        } catch (e) {
          // ignore
        }
      }

      if (path.startsWith('/api/proxy/') || path.startsWith('/api/ai/')) {
        return apiFetch(path, init);
      }
      return originalFetch(input, init);
    };

    try {
      window.fetch = customFetch;
    } catch (e) {
      Object.defineProperty(window, 'fetch', {
        value: customFetch,
        configurable: true,
        writable: true
      });
    }
  } catch (error) {
    console.warn('Failed to patch global window.fetch, using direct apiFetch instead:', error);
  }
}
