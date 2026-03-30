import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oboanenomffnzqmzgjyg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ib2FuZW5vbWZmbnpxbXpnanlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDA2ODYsImV4cCI6MjA5MDM3NjY4Nn0.OkF6h8J7fLkw5yW1hCfk2087tF3JYx8hKz962HB8gZM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
