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