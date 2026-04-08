/**
 * js/checkout.js
 * Validaciones y simulación de Stripe para la página de Checkout.
 */

document.addEventListener('DOMContentLoaded', () => {
    const store = window.beautyyStore;
    
    // Elementos del Resumen de Orden
    const checkoutItemsList = document.getElementById('checkout-items-list');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutTotal = document.getElementById('checkout-total');
    
    // Validar si el carrito está vacío al llegar
    if (store.getState().cart.length === 0) {
        alert("Tu carrito está vacío, te redirigiremos a la página principal.");
        window.location.href = "index.html";
        return;
    }

    // Renderizar resumen
    function renderCheckoutSummary() {
        const cart = store.getState().cart;
        
        checkoutItemsList.innerHTML = cart.map(item => `
            <div style="display: flex; gap: 10px; margin-bottom: 15px; align-items:center;">
                <img src="${item.img}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" alt="${item.name}">
                <div style="flex: 1;">
                    <strong style="display:block; font-size: 0.9rem;">${item.name}</strong>
                    <span style="color: #666; font-size: 0.8rem;">Qty: ${item.qty}</span>
                </div>
                <div style="font-weight: 500;">
                    $${(item.price * item.qty).toFixed(2)}
                </div>
            </div>
        `).join('');

        const total = store.getCartTotal();
        const totalStr = `$${total.toFixed(2)}`;
        
        checkoutSubtotal.textContent = totalStr;
        checkoutTotal.textContent = totalStr;
    }

    renderCheckoutSummary();

    // Toggle Payment Methods (Ocultar detalles de tarjeta si es transferencia)
    const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
    const cardDetails = document.getElementById('card-details');

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'card') {
                cardDetails.classList.remove('hidden');
                // Hacer inputs requeridos de nuevo
                cardDetails.querySelectorAll('input').forEach(i => i.setAttribute('required', 'true'));
            } else {
                cardDetails.classList.add('hidden');
                // Quitar required
                cardDetails.querySelectorAll('input').forEach(i => i.removeAttribute('required'));
            }
        });
    });

    // Formulario de Pago
    const checkoutForm = document.getElementById('checkout-form');
    const submitBtn = document.getElementById('submit-order-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    const feedback = document.getElementById('checkout-feedback');

    // Utilidades de Validación con Regex simples
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validateCard = (number) => number.replace(/\s/g, '').length === 16;
    const validateDate = (date) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(date);
    const validateCVC = (cvc) => /^\d{3,4}$/.test(cvc);

    // Auto-formato sencillo para tarjeta (solo espacios, no exhaustivo)
    const cardNumberInput = document.getElementById('card-number');
    cardNumberInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        val = val.replace(/(.{4})/g, '$1 ').trim();
        e.target.value = val;
    });

    const expiryInput = document.getElementById('card-expiry');
    expiryInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) {
            val = val.substring(0,2) + '/' + val.substring(2,4);
        }
        e.target.value = val;
    });

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Reset estados visuales
        checkoutForm.querySelectorAll('input').forEach(i => i.classList.remove('error'));
        feedback.className = 'checkout-feedback hidden';
        
        let isValid = true;

        // 1. Validar campos requeridos estándar
        const requiredInputs = checkoutForm.querySelectorAll('input[required]');
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            }
        });

        // 2. Validar Email Específico
        const emailInput = document.getElementById('email');
        if (emailInput.value && !validateEmail(emailInput.value)) {
            emailInput.classList.add('error');
            isValid = false;
        }

        // 3. Validar Tarjeta si el método es tarjeta
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        if (paymentMethod === 'card') {
            if (!validateCard(cardNumberInput.value)) { cardNumberInput.classList.add('error'); isValid = false; }
            if (!validateDate(expiryInput.value)) { expiryInput.classList.add('error'); isValid = false; }
            if (!validateCVC(document.getElementById('card-cvc').value)) { document.getElementById('card-cvc').classList.add('error'); isValid = false; }
        }

        if (!isValid) return; // Detener flujo si hay errores

        // Simular Proceso de Pago
        btnText.textContent = 'Procesando Pago...';
        spinner.classList.remove('hidden');
        submitBtn.style.pointerEvents = 'none';

        // Simulación Supabase / Stripe Delay
        setTimeout(() => {
            // Éxito simulado
            spinner.classList.add('hidden');
            btnText.textContent = 'Pago Exitoso ✨';
            submitBtn.style.backgroundColor = 'var(--color-success)';
            
            feedback.textContent = '¡Pago procesado con éxito! Recibirás un correo de confirmación enseguida.';
            feedback.classList.remove('hidden');
            feedback.classList.add('success');

            // Limpiar carrito global
            store.clearCart();

            // Redirigir después de 3 segundos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);

        }, 2000); // 2 segundos delay
    });
});
