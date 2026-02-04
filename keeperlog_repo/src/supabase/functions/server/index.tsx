import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use('*', cors());

const REQ_PREFIX = "/make-server-a6431b62";

// Helper to get Supabase client with Service Role (System access)
const getSupabase = () => {
  const url = Deno.env.get('SUPABASE_URL') || "";
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || "";
  
  // LOG (for debugging only, key prefix is safe)
  if (key) {
    console.log(`[Server] Supabase Service Key Format: ${key.substring(0, 15)}...`);
  }

  return createClient(url, key);
};

// --- HANDLERS ---

const handleSync = async (c: any) => {
  return c.json({ message: "Cloud Sync is coming soon! Your data is currently saved safely on this device." });
};

const proceedWithUser = async (c: any, user: any, body: any, requestId: string) => {
    const { bundle, profile } = body;
    const userId = user.id;
    const supabase = getSupabase();

    console.log(`[Sync:${requestId}] User verified: ${userId}`);

    // Update profile metadata if provided
    let updatedMetadata = user.user_metadata;
    if (profile && typeof profile === 'object') {
      const { data: updatedUser } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { ...user.user_metadata, ...profile }
      });
      if (updatedUser?.user) updatedMetadata = updatedUser.user.user_metadata;
    }

    // Key for KV store
    const kvKey = `backup_v2:${userId}`;

    // PUSH: If bundle is provided, store it
    if (bundle && typeof bundle === 'object') {
      console.log(`[Sync:${requestId}] Pushing data bundle to KV store...`);
      const enhancedBundle = {
        ...bundle,
        serverSyncedAt: new Date().toISOString()
      };
      await kv.set(kvKey, enhancedBundle);
    }

    // PULL: Always return the latest bundle
    const storedBackup = await kv.get(kvKey);

    return c.json({ 
      success: true, 
      bundle: storedBackup || null,
      profile: updatedMetadata,
      lastSyncedAt: storedBackup?.serverSyncedAt || null
    });
};

const handleSignup = async (c: any) => {
  try {
    const { email, password, name } = await c.req.json();
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      user_metadata: { name: name || 'Student' },
      email_confirm: true
    });
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ user: data.user });
  } catch (err: any) {
    return c.json({ error: 'Internal server error' }, 500);
  }
};

const handleCheckEmail = async (c: any) => {
  try {
    const { email } = await c.req.json();
    const supabase = getSupabase();
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    const exists = users.some(u => u.email?.toLowerCase() === email.trim().toLowerCase());
    return c.json({ exists });
  } catch (error: any) {
    return c.json({ exists: false });
  }
};

app.post(`${REQ_PREFIX}/sync`, handleSync);
app.post(`/sync`, handleSync);
app.post(`${REQ_PREFIX}/signup`, handleSignup);
app.post(`/signup`, handleSignup);
app.post(`${REQ_PREFIX}/check-email`, handleCheckEmail);
app.post(`/check-email`, handleCheckEmail);
app.get(`/health`, (c) => c.json({ status: 'ok' }));

Deno.serve(app.fetch);
