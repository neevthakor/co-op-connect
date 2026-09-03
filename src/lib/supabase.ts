import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Create a safe dummy channel for the proxy
const dummyChannel = {
  on: () => dummyChannel,
  subscribe: () => dummyChannel,
  unsubscribe: () => dummyChannel,
};

// Create a dummy client
const dummyClient = {
  channel: () => dummyChannel,
  removeChannel: () => {},
  getChannels: () => [],
  removeAllChannels: () => {},
};

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Supabase client will be a dummy.');
}

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : dummyClient as unknown as ReturnType<typeof createClient>;
