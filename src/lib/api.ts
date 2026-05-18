/**
 * API Utility for Sanctuary
 * Handles environment-aware URL construction for web and native (Capacitor) apps.
 */

export const getApiBaseUrl = () => {
  // Check if we're running as a native app (Capacitor)
  // Native apps typically run on capacitor://localhost or http://localhost
  const isWeb = typeof window !== 'undefined' && 
    !window.location.href.startsWith('capacitor://') && 
    !window.location.href.startsWith('http://localhost') &&
    !window.location.href.startsWith('https://localhost');

  if (isWeb) {
    // On web, relative paths work perfectly as the backend and frontend share the same origin
    return '';
  }
  
  // For Native (iOS/Android), we need an absolute production URL to reach the hosted backend
  // The user should set VITE_PRODUCTION_API_URL in their hosted environment (e.g., Netlify/Vercel)
  const productionUrl = import.meta.env.VITE_PRODUCTION_API_URL || '';
  
  // Ensure we don't have a trailing slash for consistency
  return productionUrl.endsWith('/') ? productionUrl.slice(0, -1) : productionUrl;
};

/**
 * Enhanced fetch that automatically handles absolute URLs for native apps
 */
export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
  
  return fetch(url, options);
};
