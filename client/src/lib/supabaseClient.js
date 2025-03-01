import { createClient } from '@supabase/supabase-js';

console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.REACT_APP_SUPABASE_ANON_KEY );

if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
);