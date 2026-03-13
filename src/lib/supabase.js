import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bytrcuolcqlirpdvsqzd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dHJjdW9sY3FsaXJwZHZzcXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0Mzc3MjksImV4cCI6MjA4OTAxMzcyOX0.jdIJ_ppbH6HjkpQp1J256U5oCnusSb2P9zbGHqQ70UM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
