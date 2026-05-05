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

// ── AVATAR SYSTEM ────────────────────────────────────────
const AVATARS = [
  // Starter avatars — 4 male, 4 female, available to everyone
  { id: 'dart-hustler',      name: 'Dart Hustler',      desc: 'Never misses',        img: '/dart-hustler.png',      color: '#F0A500', unlockType: 'starter', gender: 'm' },
  { id: 'pool-shark',        name: 'Pool Shark',        desc: 'Cool under pressure', img: '/pool-shark.png',        color: '#3ECF8E', unlockType: 'starter', gender: 'm' },
  { id: 'trivia-wizard',     name: 'Trivia Wizard',     desc: 'Big brain energy',    img: '/trivia-wizard.png',     color: '#818CF8', unlockType: 'starter', gender: 'm' },
  { id: 'the-regular-male',  name: 'The Regular',       desc: 'Always here',         img: '/the-regular-male.png',  color: '#888780', unlockType: 'starter', gender: 'm' },
  { id: 'dart-princess',     name: 'Dart Princess',     desc: 'Fierce & precise',    img: '/dart-princess.png',     color: '#F56565', unlockType: 'starter', gender: 'f' },
  { id: 'pool-queen',        name: 'Pool Queen',        desc: 'Runs the table',      img: '/pool-queen.png',        color: '#3ECF8E', unlockType: 'starter', gender: 'f' },
  { id: 'the-hustler',       name: 'The Hustler',       desc: 'Always has a plan',   img: '/the-hustler.png',       color: '#F0A500', unlockType: 'starter', gender: 'f' },
  { id: 'the-regular-female',name: 'The Regular',       desc: 'Here every week',     img: '/the-regular-female.png',color: '#888780', unlockType: 'starter', gender: 'f' },
  // Unlockable avatars
  { id: 'gambling-pirate',   name: 'Gambling Pirate',   desc: 'High risk high reward',img: '/gambling-pirate.png',  color: '#F97316', unlockType: 'challenges', unlockCount: 5,    unlockDesc: 'Win 5 challenges' },
  { id: 'high-roller',       name: 'High Roller',       desc: 'All in every night',  img: '/high-roller.png',       color: '#D4AF37', unlockType: 'hunt',       unlockCount: 3,    unlockDesc: 'Win 3 scavenger hunts' },
  { id: 'the-detective',     name: 'The Detective',     desc: 'Finds every angle',   img: '/the-detective.png',     color: '#60A5FA', unlockType: 'lifetime',   unlockCount: 600,  unlockDesc: '600 lifetime points' },
  { id: 'the-legend',        name: 'The Legend',        desc: 'Bar royalty',         img: '/the-legend.png',        color: '#FFD700', unlockType: 'lifetime',   unlockCount: 1000, unlockDesc: '1,000 lifetime points' },
];

function getAvatarById(id) { return AVATARS.find(a => a.id === id) || AVATARS[0]; }

