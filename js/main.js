/**
 * js/main.js
 * Lógica principal, Renders iniciales y Animaciones.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Inicialización de Librerías --- //
    // Inicializar AOS
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 50
    });

    // --- 2. Preloader & GSAP Inicial --- //
    const preloader = document.getElementById('preloader');
    
    if (preloader && typeof gsap !== 'undefined') {
        const tl = gsap.timeline();
        
        tl.to('.preloader-text', { opacity: 1, duration: 1, ease: "power2.inOut" })
          .to('.preloader-text', { opacity: 0, duration: 0.5, delay: 0.5 })
          .to(preloader, { opacity: 0, duration: 0.8, onComplete: () => {
              preloader.style.display = 'none';
              
              // Configurar posiciones iniciales para GSAP en base al CSS
              gsap.set(['.hero-title', '.hero-subtitle', '.hero-actions'], { y: 50, opacity: 0 });
              
              // Animación Pin + Reveal (Apple Style)
              const heroTl = gsap.timeline({
                  scrollTrigger: {
                      trigger: "#hero",
                      start: "top top",
                      end: "+=150%", // Mantener fijo por 1.5x el tamaño de la pantalla
                      pin: true,
                      scrub: 1 // Linkeado directamente a la inercia del scroll
                  }
              });
              
              // Aparecer los textos sincronizados con el scroll
              heroTl.to('.hero-title', { y: 0, opacity: 1, duration: 2, ease: "power2.out" })
                    .to('.hero-subtitle', { y: 0, opacity: 1, duration: 2, ease: "power2.out" }, "-=1")
                    .to('.hero-actions', { y: 0, opacity: 1, duration: 2, ease: "power2.out" }, "-=1")
                    // Pequeña pausa de lectura en el pin antes del siguiente cambio
                    .to({}, { duration: 1 })
                    // Desvanecer contenido justo antes de liberar el pin (scroll down)
                    .to('.hero-content', { y: -50, opacity: 0, duration: 2, ease: "power2.in" });

              // Zoom super sútil al fondo atado al scroll
              gsap.to('.hero-bg', {
                  scale: 1.15,
                  ease: "none",
                  scrollTrigger: {
                      trigger: "#hero",
                      start: "top top",
                      end: "+=150%",
                      scrub: true
                  }
              });
          }});
    }

    // --- 3. Renderizado Dinámico de Productos --- //
    const store = window.beautyyStore;
    const productsGrid = document.getElementById('products-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (productsGrid) {
        const renderProducts = () => {
            const products = store.getState().products;
            
            productsGrid.innerHTML = products.map(product => `
                <div class="product-card" data-aos="fade-up">
                    <div class="product-img-wrapper">
                        <img src="${product.img}" alt="${product.name}" loading="lazy">
                        <button class="btn btn-primary btn-full quick-add-btn add-to-cart-btn" data-id="${product.id}">
                            Agregar al carrito
                        </button>
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-desc">${product.desc}</p>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                    </div>
                </div>
            `).join('');

            // Resetear AOS para que recalcule en contenido dinámico nuevo
            setTimeout(() => AOS.refresh(), 100);
        };

        // Render inicial
        renderProducts();
    }

    // --- 4. Interfaz Navbar (Sticky & Glassmorphism & Search) --- //
    const headerWrapper = document.getElementById('header-wrapper');
    const searchBtn = document.querySelector('.search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearch = document.getElementById('close-search');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            if (headerWrapper) headerWrapper.classList.add('scrolled');
        } else {
            if (headerWrapper) headerWrapper.classList.remove('scrolled');
        }
    });

    if (searchBtn && searchOverlay && closeSearch) {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');

        const renderSearchResults = (query) => {
            if (!searchResults) return;
            if (!query.trim()) {
                searchResults.innerHTML = '';
                return;
            }
            const products = window.beautyyStore ? window.beautyyStore.getState().products : [];
            const matches = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()));
            
            if (matches.length === 0) {
                searchResults.innerHTML = '<p style="color: var(--color-text-light); text-align: center; padding: 20px;">No se encontraron productos.</p>';
                return;
            }

            searchResults.innerHTML = matches.map(p => `
                <div class="search-item">
                    <img src="${p.img}" alt="${p.name}">
                    <div class="search-item-info">
                        <h4 class="search-item-title">${p.name}</h4>
                        <p class="search-item-price">$${p.price.toFixed(2)}</p>
                    </div>
                    <button class="btn btn-primary add-to-cart-btn" data-id="${p.id}">Añadir al Carrito</button>
                </div>
            `).join('');
        };

        searchBtn.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            setTimeout(() => {
                if (searchInput) searchInput.focus();
            }, 100);
        });

        closeSearch.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
            if (searchInput) searchInput.value = '';
            if (searchResults) searchResults.innerHTML = '';
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                renderSearchResults(e.target.value);
            });
        }
    }

    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
             navLinks.classList.toggle('active');
        });
    }

    // Formularios (Ej. Newsletter prevent default temporal)
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = newsletterForm.querySelector('button');
            const input = newsletterForm.querySelector('input');
            btn.textContent = "¡Suscrito!";
            input.value = "";
            btn.style.backgroundColor = "var(--color-success)";
            setTimeout(() => {
                btn.textContent = "Suscribirme";
                btn.style.backgroundColor = "";
            }, 3000);
        });
    }
});
