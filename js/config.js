const SUPABASE_URL = 'https://kurrfboewnwrulxnppwj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cnJmYm9ld253cnVseG5wcHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMDk4NzIsImV4cCI6MjA5Mjg4NTg3Mn0._BEYoSEfAoyhK6lNpKHrKI0YF0zdeBRgnxEzoPnSmVo';
const MASTER_PASSWORD = 'barrank-master-2024';
const MAX_SCANS_PER_VISIT = 3;
const VISIT_WINDOW_HOURS = 8;

function getSupabase() {
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function getBarSlug() {
  const params = new URLSearchParams(location.search);
  if (params.get('bar')) return params.get('bar');
  const parts = location.pathname.split('/').filter(Boolean);
  if (parts.length > 1) return parts[0];
  return null;
}

let _barCache = null;
async function getBar(sb, slug) {
  if (_barCache && _barCache.slug === slug) return _barCache;
  const { data } = await sb.from('bars').select('*').eq('slug', slug).eq('active', true).single();
  if (data) _barCache = data;
  return data;
}
