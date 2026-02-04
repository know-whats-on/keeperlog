import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
export const supabase = createClient(supabaseUrl, publicAnonKey);

export const SERVER_URL = `${supabaseUrl}/functions/v1/make-server-a6431b62`;

export const serverFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${SERVER_URL}${endpoint}`;
  
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('apikey', publicAnonKey);
  
  let customAuthHeader = '';
  if (options.headers) {
    const optHeaders = options.headers as Record<string, string>;
    customAuthHeader = optHeaders['Authorization'] || optHeaders['authorization'] || '';
  }

  // Determine the token to use for apikey and Authorization
  let tokenToUse = publicAnonKey;
  let isUserAuth = false;

  if (customAuthHeader && customAuthHeader.startsWith('Bearer ')) {
    const extractedToken = customAuthHeader.replace('Bearer ', '').trim();
    if (extractedToken && extractedToken !== 'undefined' && extractedToken !== 'null') {
      tokenToUse = extractedToken;
      isUserAuth = true;
    }
  }

  // Set the headers
  headers.set('apikey', publicAnonKey);
  
  if (isUserAuth) {
    headers.set('Authorization', `Bearer ${tokenToUse}`);
  } else {
    // For non-user requests (like check-email or signup), the Supabase Edge Function Gateway 
    // requires an Authorization header. We use the public anon key for this.
    headers.set('Authorization', `Bearer ${publicAnonKey}`);
  }

  // Merge remaining headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      const k = key.toLowerCase();
      if (k !== 'authorization' && k !== 'apikey' && k !== 'content-type') {
        headers.set(key, value as string);
      }
    });
  }

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      // Get the body as text first to handle non-JSON errors
      const bodyText = await response.text();
      let errorMessage = `Server error: ${response.status}`;
      
      try {
        const errorBody = JSON.parse(bodyText);
        if (errorBody.error) {
          errorMessage = errorBody.error;
        } else if (errorBody.message) {
          errorMessage = errorBody.message;
        }
      } catch (e) {
        // Not JSON, use the status text or first 100 chars of body
        if (bodyText && bodyText.length < 200) {
          errorMessage = bodyText;
        }
      }
      
      console.error(`[serverFetch] ${response.status} Error:`, errorMessage);
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error(`[serverFetch] Request failed:`, error.message);
    throw error;
  }
};
