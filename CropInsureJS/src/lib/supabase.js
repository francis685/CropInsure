import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Your exact URL and Key from your project!
const supabaseUrl = 'https://gvbghmrifckwgqqakmro.supabase.co';
const supabaseAnonKey = 'sb_publishable_lljMaof3dEU9rzocvjOj7w_rV7PCfnS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});