// ============================================
// config.js — fill in your Supabase credentials
// Get these from: Supabase Dashboard > Settings > API
// ============================================

const SUPABASE_URL = 'https://kurrfboewnwrulxnppwj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cnJmYm9ld253cnVseG5wcHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMDk4NzIsImV4cCI6MjA5Mjg4NTg3Mn0._BEYoSEfAoyhK6lNpKHrKI0YF0zdeBRgnxEzoPnSmVo';

// Admin password for /admin.html — change this!
const ADMIN_PASSWORD = 'changeme123';

// Points rules
const MAX_SCANS_PER_VISIT = 3;
const VISIT_WINDOW_HOURS = 8; // rolling window in hours

// ============================================
// Supabase client (loaded via CDN in HTML files)
// ============================================
function getSupabase() {
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
