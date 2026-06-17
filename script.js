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
EOF

cat > /mnt/user-data/outputs/kyomatos/js/cart.js << 'EOF'
// ─── KYOMATOS — Cart Logic ────────────────────────────────────
const CART_KEY = 'kyomatos_cart';

const Cart = {
  get()       { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); },
  save(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); updateCartBadge(); },

  add(product, size = null, qty = 1) {
    const items = this.get();
    const key   = `${product.id}_${size}`;
    const exist = items.find(i => i.key === key);
    if (exist) { exist.qty += qty; }
    else { items.push({ key, id:product.id, name:product.name, price:product.price, image:product.image_url, category:product.category, size, qty }); }
    this.save(items);
    showToast(`${product.name} added to cart`);
  },

  remove(key)       { this.save(this.get().filter(i => i.key !== key)); },
  updateQty(key, q) { const items = this.get(); const item = items.find(i => i.key === key); if (item) { item.qty = Math.max(1, q); } this.save(items); },
  total()           { return this.get().reduce((s, i) => s + (i.price * i.qty), 0); },
  clear()           { localStorage.removeItem(CART_KEY); updateCartBadge(); },

  buildWhatsAppMessage(info) {
    const items = this.get();
    const lines = items.map(i => `• ${i.name}${i.size ? ' (Size: '+i.size+')' : ''} x${i.qty} — ${formatPrice(i.price * i.qty)}`).join('\n');
    return encodeURIComponent(`🛒 *New Order — KYOMATOS APPAREL*\n─────────────────\n*Name:* ${info.name}\n*Phone:* ${info.phone}\n*Address:* ${info.address}\n─────────────────\n*Items:*\n${lines}\n─────────────────\n*Total:* ${formatPrice(this.total())}`);
  }
};
EOF

cat > /mnt/user-data/outputs/kyomatos/js/admin.js << 'EOF'
// ─── KYOMATOS — Admin Logic ───────────────────────────────────
const ADMIN_PASSWORD = 'kyomatos2025'; // TODO: Change before going live
const AUTH_KEY       = 'kyomatos_admin_auth';

function checkAuth()  { return sessionStorage.getItem(AUTH_KEY) === 'true'; }
function login(pw)    { if (pw === ADMIN_PASSWORD) { sessionStorage.setItem(AUTH_KEY, 'true'); return true; } return false; }
function logout()     { sessionStorage.removeItem(AUTH_KEY); window.location.reload(); }

async function loadProducts()      { const t = await db.from('products'); return t.select('*', 'order=created_at.desc'); }
async function createProduct(data) { const t = await db.from('products'); return t.insert(data); }
async function updateProduct(id,d) { const t = await db.from('products'); return t.update(id, d); }
async function deleteProduct(id)   { const t = await db.from('products'); return t.delete(id); }

async function uploadImage(file) {
  const ext = file.name.split('.').pop();
  const fn  = `${Date.now()}.${ext}`;
  const url = `${SUPABASE_URL}/storage/v1/object/product-images/${fn}`;
  const res = await fetch(url, { method:'POST', headers:{ 'apikey':SUPABASE_ANON,'Authorization':`Bearer ${SUPABASE_ANON}`,'Content-Type':file.type }, body:file });
  if (!res.ok) throw new Error('Upload failed');
  return `${SUPABASE_URL}/storage/v1/object/public/product-images/${fn}`;
}