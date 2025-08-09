/// <reference types="vite/client" />
/// <reference lib="dom" />

/**
 * Environment utilities for determining production vs development URLs
 */

/**
 * Get the base URL for the application
 * Returns https://www.rooleta.com in production, localhost URL in development
 */
export function getBaseUrl(): string {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.location) {
    // Client-side detection
    const hostname = window.location.hostname;
    
    // Production domains
    if (hostname === 'www.rooleta.com' || hostname === 'rooleta.com' || hostname.includes('vercel.app')) {
      return 'https://www.rooleta.com';
    }
    
    // Development
    return `${window.location.protocol}//${window.location.host}`;
  }
  
  // Server-side or build-time detection
  // During build, we don't have access to runtime env vars, so default to production URL
  // The actual URL will be determined at runtime in the browser
  if (typeof process !== 'undefined' && process.env) {
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.VERCEL_ENV === 'production' ||
                        process.env.VERCEL_URL?.includes('rooleta');
    
    if (isProduction) {
      return 'https://www.rooleta.com';
    }
    
    return 'http://localhost:5173';
  }
  
  // Default to production URL
  return 'https://www.rooleta.com';
}

/**
 * Get the API base URL
 */
export function getApiUrl(): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api`;
}

/**
 * Get the OAuth redirect URI for TiendaNube
 */
export function getOAuthRedirectUri(): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api/integrations/callback`;
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    return hostname === 'www.rooleta.com' || 
           hostname === 'rooleta.com' || 
           hostname.includes('vercel.app');
  }
  
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production' || 
           process.env.VERCEL_ENV === 'production';
  }
  
  return true; // Default to production
}

/**
 * Get environment variable value with fallback
 */
export function getEnvVar(key: string, fallback: string = ''): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }
  
  // For Vite environment variables
  try {
    // @ts-ignore
    if (import.meta?.env) {
      // @ts-ignore
      return import.meta.env[key] || fallback;
    }
  } catch (e) {
    // import.meta not available
  }
  
  return fallback;
}