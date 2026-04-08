/**
 * js/store.js
 * Store global minimalista implementando el patrón Observer.
 * Emula el comportamiento de Zustand o Context API en Vanilla JS.
 */

class Store {
    constructor() {
        this.state = {
            cart: [], // { id, name, price, qty, img, category }
            products: [
                {
                    id: 1,
                    name: 'Gel de Baño Luciaaaa',
                    category: 'skincare',
                    price: 24.00,
                    img: 'assets/img/gel-de-bano-card.png',
                    desc: 'Gel de baño suave y revitalizante para la limpieza diaria de tu piel.'
                },
                {
                    id: 2,
                    name: 'Exfoliante Luciaaaa',
                    category: 'skincare',
                    price: 28.00,
                    img: 'assets/img/exfoliante-card.png',
                    desc: 'Exfoliante renovador que remueve impurezas y deja una piel radiante e hidratada.'
                }
            ],
            isCartOpen: false
        };
        this.listeners = [];

        // Cargar carrito desde localStorage si existe
        const savedCart = localStorage.getItem('beautyy_cart');
        if (savedCart) {
            this.state.cart = JSON.parse(savedCart);
        }
    }

    getState() {
        return this.state;
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        for (const listener of this.listeners) {
            listener(this.state);
        }
    }

    // Acciones de Carrito
    addToCart(productId) {
        const product = this.state.products.find(p => p.id == productId);
        if (!product) return;

        const existingItem = this.state.cart.find(item => item.id == productId);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            this.state.cart.push({ ...product, qty: 1 });
        }

        // Hemos removido el auto open sidebar para favorecer la notificación Toast
        this.saveCart();
    }

    removeFromCart(productId) {
        this.state.cart = this.state.cart.filter(item => item.id != productId);
        this.saveCart();
    }

    updateQuantity(productId, newQty) {
        if (newQty < 1) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.state.cart.find(item => item.id == productId);
        if (item) {
            item.qty = newQty;
            this.saveCart();
        }
    }

    clearCart() {
        this.state.cart = [];
        this.saveCart();
    }

    toggleCart(forceState = null) {
        if (forceState !== null) {
            this.state.isCartOpen = forceState;
        } else {
            this.state.isCartOpen = !this.state.isCartOpen;
        }
        this.notify();
    }

    saveCart() {
        localStorage.setItem('beautyy_cart', JSON.stringify(this.state.cart));
        this.notify();
    }

    // Acciones de Utilidad
    getCartTotal() {
        return this.state.cart.reduce((total, item) => total + (item.price * item.qty), 0);
    }

    getCartCount() {
        return this.state.cart.reduce((count, item) => count + item.qty, 0);
    }

    clearCart() {
        this.state.cart = [];
        this.saveCart();
    }
}

// Instancia global
window.beautyyStore = new Store();
