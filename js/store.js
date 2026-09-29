/* Persistence: products, cart, orders */
(function (global) {
  const KEYS = {
    products: "ck_products_v4",
    cart: "ck_cart_v1",
    orders: "ck_orders_v1",
    admin: "ck_admin_auth_v1",
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function ensureProducts() {
    let products = read(KEYS.products, null);
    if (!products || !Array.isArray(products) || products.length === 0) {
      products = structuredClone(global.DEFAULT_PRODUCTS);
      write(KEYS.products, products);
    }
    return products;
  }

  const Store = {
    getProducts() {
      return ensureProducts();
    },

    getActiveProducts() {
      return ensureProducts().filter((p) => p.active !== false);
    },

    getProduct(id) {
      return ensureProducts().find((p) => p.id === id) || null;
    },

    saveProducts(products) {
      write(KEYS.products, products);
      global.dispatchEvent(new CustomEvent("ck:products"));
    },

    upsertProduct(product) {
      const products = ensureProducts();
      const idx = products.findIndex((p) => p.id === product.id);
      if (idx >= 0) products[idx] = product;
      else products.unshift(product);
      this.saveProducts(products);
    },

    deleteProduct(id) {
      const products = ensureProducts().filter((p) => p.id !== id);
      this.saveProducts(products);
      const cart = this.getCart().filter((line) => line.id !== id);
      write(KEYS.cart, cart);
      global.dispatchEvent(new CustomEvent("ck:cart"));
    },

    getCart() {
      return read(KEYS.cart, []);
    },

    setCart(cart) {
      write(KEYS.cart, cart);
      global.dispatchEvent(new CustomEvent("ck:cart"));
    },

    addToCart(productId, qty = 1) {
      const product = this.getProduct(productId);
      if (!product) return;
      const cart = this.getCart();
      const line = cart.find((c) => c.id === productId);
      if (line) line.qty += qty;
      else cart.push({ id: productId, qty });
      this.setCart(cart);
    },

    updateCartQty(productId, qty) {
      let cart = this.getCart();
      if (qty <= 0) cart = cart.filter((c) => c.id !== productId);
      else {
        const line = cart.find((c) => c.id === productId);
        if (line) line.qty = qty;
      }
      this.setCart(cart);
    },

    removeFromCart(productId) {
      this.setCart(this.getCart().filter((c) => c.id !== productId));
    },

    cartCount() {
      return this.getCart().reduce((sum, line) => sum + line.qty, 0);
    },

    cartTotal() {
      return this.getCart().reduce((sum, line) => {
        const p = this.getProduct(line.id);
        return sum + (p ? p.price * line.qty : 0);
      }, 0);
    },

    clearCart() {
      this.setCart([]);
    },

    getOrders() {
      return read(KEYS.orders, []);
    },

    addOrder(order) {
      const orders = this.getOrders();
      orders.unshift(order);
      write(KEYS.orders, orders);
      global.dispatchEvent(new CustomEvent("ck:orders"));
      return order;
    },

    updateOrderStatus(id, status) {
      const orders = this.getOrders().map((o) =>
        o.id === id ? { ...o, status } : o
      );
      write(KEYS.orders, orders);
      global.dispatchEvent(new CustomEvent("ck:orders"));
    },

    isAdminAuthed() {
      return read(KEYS.admin, false) === true;
    },

    setAdminAuthed(value) {
      write(KEYS.admin, value);
    },

    formatPrice(n) {
      return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
      }).format(n);
    },

    uid(prefix) {
      return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    },
  };

  global.Store = Store;
})(window);
