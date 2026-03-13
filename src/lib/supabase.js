import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bcvwqwofmabtvliphjtw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdndxd29mbWFidHZsaXBoanR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMjM0MDIsImV4cCI6MjA2MTY5OTQwMn0.oj3OFCDGlbfKqMSGKkmtMOTGWVW_5XavNoaJfvzz4OA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
