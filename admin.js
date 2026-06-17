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