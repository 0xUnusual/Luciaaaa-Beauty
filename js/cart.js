/**
 * js/cart.js
 * Lógica de UI para el sidebar del carrito usando la tienda global.
 */

document.addEventListener('DOMContentLoaded', () => {
    const store = window.beautyyStore;
    
    // Elementos DOM
    const cartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartCounter = document.getElementById('cart-counter');

    if (!cartSidebar) return; // Si no hay sidebar (ej. otra pag)

    // Setup Listeners de UI
    cartBtn.addEventListener('click', () => store.toggleCart(true));
    closeCartBtn.addEventListener('click', () => store.toggleCart(false));
    cartOverlay.addEventListener('click', () => store.toggleCart(false));

    // Suscribirse a cambios del store
    store.subscribe((state) => {
        // Toggle Sidebar
        if (state.isCartOpen) {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Renderizar Items
        renderCartItems(state.cart);
        
        // Actualizar Totales y Contador
        const total = store.getCartTotal();
        cartTotalPrice.textContent = `$${total.toFixed(2)}`;
        
        const count = store.getCartCount();
        cartCounter.textContent = count;
        
        // Ocultar contador si está vacío
        cartCounter.style.display = count > 0 ? 'flex' : 'none';
        
        // Deshabilitar checkout si vacío
        const checkoutBtn = document.getElementById('proceed-checkout-btn');
        if (checkoutBtn) {
            if (count === 0) {
                checkoutBtn.style.pointerEvents = 'none';
                checkoutBtn.style.opacity = '0.5';
            } else {
                checkoutBtn.style.pointerEvents = 'auto';
                checkoutBtn.style.opacity = '1';
            }
        }
    });

    // Sistema de Notificaciones Premium (Toast)
    const showToast = (product) => {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <img src="${product.img}" alt="${product.name}" class="toast-img">
            <div class="toast-content">
                <strong>Añadido a tu bolsa</strong>
                <span>${product.name} - $${product.price.toFixed(2)}</span>
            </div>
            <button class="toast-view-cart" onclick="window.beautyyStore.toggleCart(true)">Ver</button>
        `;

        toastContainer.appendChild(toast);

        // Disparar animación
        setTimeout(() => toast.classList.add('show'), 10);

        // Remover después de 4s
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };

    // Delegación de eventos para el botón de Agregar Directo
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-btn') || e.target.closest('.add-to-cart-direct')) {
            const btn = e.target.closest('button');
            const productId = btn.dataset.id;
            const product = store.getState().products.find(p => p.id == productId);

            // Microinteracción botón
            const originalText = btn.innerHTML;
            btn.innerHTML = '¡Agregado! ✨';
            btn.style.backgroundColor = 'var(--color-success)';
            btn.style.color = '#fff';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = '';
                btn.style.color = '';
            }, 1500);

            store.addToCart(productId);
            
            if (product) {
                showToast(product);
            }
        }
    });

    function renderCartItems(cart) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío.<br><small>Es el momento perfecto para añadir algunos básicos.</small></div>';
            return;
        }

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="cart-item-controls">
                        <div class="qty-control">
                            <button class="qty-btn" onclick="window.beautyyStore.updateQuantity(${item.id}, ${item.qty - 1})">-</button>
                            <span class="qty-val">${item.qty}</span>
                            <button class="qty-btn" onclick="window.beautyyStore.updateQuantity(${item.id}, ${item.qty + 1})">+</button>
                        </div>
                        <button class="remove-btn" onclick="window.beautyyStore.removeFromCart(${item.id})">Remover</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Inicializar UI por primera vez
    store.notify();
});
