import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dzphgpikqxfeiautsnbm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6cGhncGlrcXhmZWlhdXRzbmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5Mzk0NjMsImV4cCI6MjA4NjUxNTQ2M30.1S9aunKzGj8WvsETTtsCQhZHzNMrKfb5cBQYKsaN3cc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
