/**
 * Pacific Gamers - Cart Management Utility
 * Handles localStorage persistence for multi-item shopping.
 */

const Cart = {
    key: 'pacific_cart',

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
        this.showToast(`${product.name} added to cart!`);
    },

    showToast(message) {
        let toast = document.getElementById('cart-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cart-toast';
            toast.style.cssText = 'position:fixed;bottom:100px;right:20px;background:var(--primary);color:#000;padding:15px 25px;border-radius:8px;font-weight:bold;z-index:9999;box-shadow:0 10px 30px rgba(0,255,204,0.3);transform:translateX(100px);opacity:0;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Hide after 3s
        setTimeout(() => {
            toast.style.transform = 'translateX(100px)';
            toast.style.opacity = '0';
        }, 3000);
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
