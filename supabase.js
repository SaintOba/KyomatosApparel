// ─── KYOMATOS — Supabase Client & Shared Utils ────────────────
const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON = 'YOUR_ANON_KEY';

const db = {
  async from(table) {
    const base = `${SUPABASE_URL}/rest/v1/${table}`;
    const headers = {
      'apikey':        SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Content-Type':  'application/json',
      'Prefer':        'return=representation',
    };
    return {
      async select(query = '*', filters = '') {
        const res = await fetch(`${base}?select=${query}${filters ? '&' + filters : ''}`, { headers });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      },
      async insert(data) {
        const res = await fetch(base, { method:'POST', headers, body:JSON.stringify(data) });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      },
      async update(id, data) {
        const res = await fetch(`${base}?id=eq.${id}`, { method:'PATCH', headers, body:JSON.stringify(data) });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      },
      async delete(id) {
        const res = await fetch(`${base}?id=eq.${id}`, { method:'DELETE', headers });
        if (!res.ok) throw new Error(await res.text());
        return true;
      },
    };
  }
};

function showToast(msg, duration = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function formatPrice(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG');
}

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

document.addEventListener('DOMContentLoaded', () => {
  const nav  = document.querySelector('.navbar');
  const ham  = document.querySelector('.hamburger');
  const menu = document.querySelector('.nav-links');
  window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', window.scrollY > 40));
  ham?.addEventListener('click', () => menu?.classList.toggle('open'));
  updateCartBadge();
});

function updateCartBadge() {
  const cart  = JSON.parse(localStorage.getItem('kyomatos_cart') || '[]');
  const count = cart.reduce((a, i) => a + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(b => {
    b.textContent = count;
    b.style.display = count ? 'flex' : 'none';
  });
}