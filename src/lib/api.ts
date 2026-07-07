/**
 * API Utility for Sanctuary
 * Handles environment-aware URL construction for web and native (Capacitor) apps.
 * Automatically falls back to direct third-party APIs for Quran and Prayer Times if hosted on Netlify or mobile (Capacitor).
 */

const getRawFetch = () => {
  return typeof window !== 'undefined' ? (window as any).__originalFetch || window.fetch : fetch;
};

export const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return '';

  // In Capacitor, the app runs on capacitor://localhost (iOS) or http://localhost (Android, with NO port or standard port)
  // In regular browsers, local development always has a port (e.g., 3000, 5173).
  const isCapacitor = 
    window.location.href.startsWith('capacitor://') ||
    (window.location.hostname === 'localhost' && !window.location.port) ||
    (window.location.hostname === '127.0.0.1' && !window.location.port);

  if (!isCapacitor) {
    // On web, relative paths work perfectly as the backend and frontend share the same origin
    return '';
  }
  
  // Check localStorage for a custom configured API URL (useful for troubleshooting/testing)
  const customUrl = localStorage.getItem('custom_api_base_url');
  if (customUrl) {
    return customUrl.endsWith('/') ? customUrl.slice(0, -1) : customUrl;
  }

  // For Native (iOS/Android), we need an absolute production URL to reach the hosted backend
  // The user should set VITE_PRODUCTION_API_URL in their hosted environment (e.g., Netlify/Vercel)
  const productionUrl = import.meta.env.VITE_PRODUCTION_API_URL || '';
  if (productionUrl) {
    return productionUrl.endsWith('/') ? productionUrl.slice(0, -1) : productionUrl;
  }
  
  // Fallback to the active Cloud Run development server for seamless out-of-the-box Capacitor support
  return 'https://ais-dev-p6nimnue2dep6nfjkp4jd6-520387765455.europe-west2.run.app';
};

/**
 * Enhanced fetch that automatically handles absolute URLs, proxy bypasses, and client-side Gemini fallbacks.
 */
export const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const isWeb = typeof window !== 'undefined';
  const originalFetch = getRawFetch();
  
  // 1. Detect if we are on a client-only static hosting like Netlify, Vercel, or a native app (Capacitor/Cordova)
  const isContainerEnvironment = isWeb && (
    window.location.hostname.endsWith('.run.app') || 
    window.location.hostname.includes('run.app') ||
    window.location.hostname.includes('googleusercontent.com') ||
    window.location.hostname.includes('aistudio.google.com') ||
    window.location.hostname === '' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  // If we are NOT in a container environment, we should immediately fallback to direct upstream URLs for proxies
  const shouldBypassProxy = !isContainerEnvironment;

  // 2. Intercept Alquran and Aladhan Proxy Calls
  if (path.startsWith('/api/proxy/alquran/')) {
    const subPath = path.replace(/^\/api\/proxy\/alquran\//, '');
    const upstreamUrl = `https://api.alquran.cloud/v1/${subPath}`;
    
    // We always attempt the local proxy first because CORS/Mixed-Content restricts direct upstream fetches inside the iframe.
    // If it returns 404 or fails, we fall back to direct fetch.
    try {
      const baseUrl = getApiBaseUrl();
      const localUrl = `${baseUrl}${path}`;
      const res = await originalFetch(localUrl, options);
      // If the response is index.html (which usually happens on SPA router redirect for 404s)
      const contentType = res.headers.get('content-type') || '';
      if (res.status === 404 || contentType.includes('text/html')) {
        throw new Error('Local proxy not found, falling back to upstream');
      }
      return res;
    } catch (err) {
      console.warn('Local Alquran proxy failed, falling back to direct fetch:', err);
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
      if (res.status === 404 || contentType.includes('text/html')) {
        throw new Error('Local proxy not found, falling back to upstream');
      }
      return res;
    } catch (err) {
      console.warn('Local Aladhan proxy failed, falling back to direct fetch:', err);
      return originalFetch(upstreamUrl, options);
    }
  }

  // 3. Intercept Gemini Chat Proxy Calls for client-side fallback
  if (path === '/api/ai/chat' || path.startsWith('/api/ai/chat')) {
    const customKey = isWeb ? (localStorage.getItem('custom_gemini_api_key') || '') : '';
    const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const apiKey = customKey.trim() || envKey.trim();

    // If we are NOT in the container environment, OR if we have a custom API key, we should handle Gemini client-side!
    if (shouldBypassProxy || customKey.trim()) {
      if (!apiKey) {
        // Return a custom error Response prompting the user to configure their Gemini API Key in settings
        return new Response(JSON.stringify({
          error: "To chat with Aliyah on this hosted deployment, please go to Settings (bottom-left) and enter your own free Google Gemini API Key."
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        const bodyData = options.body ? JSON.parse(options.body as string) : {};
        const { contents, systemInstruction } = bodyData;

        console.log('Using client-side Gemini API directly to generate content...');
        const rawRes = await originalFetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: systemInstruction ? {
              parts: [{ text: systemInstruction }]
            } : undefined
          })
        });

        if (!rawRes.ok) {
          const errJson = await rawRes.json().catch(() => ({}));
          throw new Error(errJson.error?.message || 'Failed to communicate with Google Gemini API client-side.');
        }

        const rawData = await rawRes.json();
        const assistantText = rawData.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I couldn't process that.";
        
        return new Response(JSON.stringify({ text: assistantText }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        console.error('Client-side Gemini call failed:', err);
        return new Response(JSON.stringify({
          error: err.message || 'Failed to generate response from Gemini API.'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
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
      // If direct assignment fails (e.g. read-only property / getter-only on window), try Object.defineProperty
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
