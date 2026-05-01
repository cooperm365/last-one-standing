// ============================================
// config.js — Bar Rank Multi-Bar Config
// ============================================

const SUPABASE_URL = 'https://kurrfboewnwrulxnppwj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cnJmYm9ld253cnVseG5wcHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMDk4NzIsImV4cCI6MjA5Mjg4NTg3Mn0._BEYoSEfAoyhK6lNpKHrKI0YF0zdeBRgnxEzoPnSmVo';

// Master admin password — only you have this
const MASTER_PASSWORD = 'barrank-master-2024';

// Points rules
const MAX_SCANS_PER_VISIT = 3;
const VISIT_WINDOW_HOURS = 8;

// ============================================
// Supabase client
// ============================================
function getSupabase() {
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ============================================
// Get bar slug from URL
// URL format: /cjs-tavern/checkin.html or /checkin.html?bar=cjs-tavern
// ============================================
function getBarSlug() {
  // Check query param first: ?bar=cjs-tavern
  const params = new URLSearchParams(location.search);
  if (params.get('bar')) return params.get('bar');
  // Check path: /cjs-tavern/checkin.html
  const parts = location.pathname.split('/').filter(Boolean);
  if (parts.length > 1) return parts[0];
  return null;
}

// Load bar config and cache it
let _barCache = null;
async function getBar(sb, slug) {
  if (_barCache && _barCache.slug === slug) return _barCache;
  const { data } = await sb.from('bars').select('*').eq('slug', slug).eq('active', true).single();
  if (data) _barCache = data;
  return data;
}

// Apply bar branding — call after getBar() on any player-facing page
function applyBarBranding(bar) {
  if (!bar) return;
  // Apply accent color
  const color = bar.accent_color ? '#' + bar.accent_color.replace('#','') : '#F0A500';
  document.documentElement.style.setProperty('--gold', color);
  document.documentElement.style.setProperty('--accent', color);
  // Darken the color for hover states
  document.documentElement.style.setProperty('--gold-dim', color + '44');

  // Apply logo if set
  if (bar.logo_url) {
    document.querySelectorAll('.logo-mark, .logo-box, #logo-img').forEach(el => {
      if (el.tagName === 'IMG') {
        el.src = bar.logo_url;
      } else {
        el.innerHTML = `<img src="${bar.logo_url}" style="width:100%;height:100%;object-fit:contain;border-radius:6px"/>`;
      }
    });
  }
}
