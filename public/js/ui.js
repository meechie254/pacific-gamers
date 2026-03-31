/**
 * Pacific Gamers - UI Micro-interactions & Global Search
 */

/* ---- Toast Notification System ---- */
window.showToast = function(message, icon = '🎮') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
};

/* ---- Cart Bounce on Add ---- */
const originalAddItem = window.Cart?.addItem?.bind(window.Cart);
if (window.Cart && originalAddItem) {
    window.Cart.addItem = function(product) {
        originalAddItem(product);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.classList.remove('bounce');
            void el.offsetWidth; // Force reflow
            el.classList.add('bounce');
        });
        showToast(`${product.name} added to cart!`, '🛒');
    };
}

/* ---- Global Search Bar ---- */
document.addEventListener('DOMContentLoaded', () => {
    // Inject the search overlay HTML
    const overlayHTML = `
        <div class="search-overlay" id="searchOverlay">
            <div class="search-box">
                <div class="search-input-wrap">
                    <span class="search-icon">🔍</span>
                    <input type="text" class="search-input" id="searchInput" placeholder="Search games, gear, services...">
                    <span class="search-close" id="closeSearch">✕</span>
                </div>
                <div class="search-results" id="searchResults">
                    <p class="search-hint">Type to search the catalog...</p>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', overlayHTML);

    // Inject search trigger "🔍" button into the navbar
    const navUl = document.querySelector('.navbar ul');
    if (navUl) {
        const searchLi = document.createElement('li');
        searchLi.innerHTML = '<span class="search-trigger" id="openSearch" title="Search (Ctrl+K)">🔍</span>';
        navUl.insertBefore(searchLi, navUl.firstChild);
    }

    // Wire up events
    const overlay = document.getElementById('searchOverlay');
    const input   = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');

    function openSearch() {
        overlay.classList.add('active');
        setTimeout(() => input.focus(), 100);
    }

    function closeSearch() {
        overlay.classList.remove('active');
        input.value = '';
        results.innerHTML = '<p class="search-hint">Type to search the catalog...</p>';
    }

    document.getElementById('openSearch')?.addEventListener('click', openSearch);
    document.getElementById('closeSearch')?.addEventListener('click', closeSearch);

    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) closeSearch();
    });

    // Ctrl+K shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            overlay.classList.contains('active') ? closeSearch() : openSearch();
        }
        if (e.key === 'Escape') closeSearch();
    });

    // Live search against the products API
    let debounceTimer;
    input?.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = input.value.trim();

        if (!query) {
            results.innerHTML = '<p class="search-hint">Type to search the catalog...</p>';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/products?search=${encodeURIComponent(query)}`);
                const items = await res.json();

                if (!items.length) {
                    results.innerHTML = `<p class="search-hint">No results found for "<strong>${query}</strong>"</p>`;
                    return;
                }

                results.innerHTML = items.slice(0, 8).map(item => `
                    <a class="search-result-item" href="shop.html">
                        <img src="${item.image_url || 'img/ac_mirage.png'}" alt="${item.name}" loading="lazy">
                        <div class="search-result-info">
                            <h4>${item.name}</h4>
                            <p>KSh ${parseFloat(item.price).toLocaleString()}</p>
                        </div>
                    </a>
                `).join('');
            } catch (err) {
                results.innerHTML = '<p class="search-hint">Could not connect to the catalog.</p>';
            }
        }, 350);
    });
});
