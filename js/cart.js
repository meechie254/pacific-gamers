/**
 * Zenca Gamers - Cart Management Utility
 * Handles localStorage persistence for multi-item shopping.
 */

const Cart = {
    key: 'zenca_cart',

    addItem(product) {
        let cart = this.getItems();
        const existing = cart.find(item => item.id === product.id);
        
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image_url: product.image_url,
                quantity: 1
            });
        }
        
        this.save(cart);
        this.updateBadge();
    },

    removeItem(id) {
        let cart = this.getItems().filter(item => item.id !== id);
        this.save(cart);
        this.updateBadge();
    },

    updateQuantity(id, delta) {
        let cart = this.getItems();
        const item = cart.find(i => i.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                return this.removeItem(id);
            }
        }
        this.save(cart);
        this.updateBadge();
    },

    getItems() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    },

    save(cart) {
        localStorage.setItem(this.key, JSON.stringify(cart));
    },

    clear() {
        localStorage.removeItem(this.key);
        this.updateBadge();
    },

    getTotal() {
        return this.getItems().reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getCount() {
        return this.getItems().reduce((count, item) => count + item.quantity, 0);
    },

    updateBadge() {
        const badges = document.querySelectorAll('.cart-count');
        const count = this.getCount();
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    }
};

// Auto-initialize badge on load
document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());
