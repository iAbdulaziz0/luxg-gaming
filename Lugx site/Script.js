// Game Store JavaScript File

// ========================
// Global Variables
// ========================
let cart = [];
let favorites = [];

// ========================
// Utility Functions
// ========================

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#4CAF50' : '#ee626b'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================
// Navigation & Scroll Effects
// ========================

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header scroll effect
    let lastScroll = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });

    // Initialize all features
    initializeSearch();
    initializeCart();
    initializeDownloadButtons();
    initializeTrendingCards();
    initializeCategoryCards();
    initializeNewsletter();
    initializeAnimations();
    loadCartFromStorage();
});

// ========================
// Search Functionality
// ========================

function initializeSearch() {
    const searchInput = document.querySelector('.search input');
    const searchButton = document.querySelector('.search button');
    
    if (searchInput && searchButton) {
        // Search on button click
        searchButton.addEventListener('click', performSearch);
        
        // Search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Live search suggestions
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length > 2) {
                showSearchSuggestions(query);
            } else {
                hideSearchSuggestions();
            }
        });
    }
}

function performSearch() {
    const searchInput = document.querySelector('.search input');
    const query = searchInput.value.trim().toLowerCase();
    
    if (query) {
        // Simulate search
        showNotification(`Searching for: "${query}"`, 'success');
        
        // Filter games based on search
        filterGames(query);
    }
}

function filterGames(query) {
    const cards = document.querySelectorAll('.card, .download-card');
    let foundCount = 0;
    
    cards.forEach(card => {
        const gameName = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const category = card.querySelector('p')?.textContent.toLowerCase() || '';
        
        if (gameName.includes(query) || category.includes(query)) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease-out';
            foundCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    if (foundCount === 0) {
        showNotification('No games found matching your search', 'error');
    }
}

function showSearchSuggestions(query) {
    // This would connect to a real database in production
    const suggestions = [
        'Call of Duty', 'FIFA 2024', 'Fortnite', 'Minecraft',
        'Assassins Creed', 'Dragon Power', 'The Nightmare'
    ];
    
    const filtered = suggestions.filter(s => s.toLowerCase().includes(query));
    
    // Create suggestions dropdown (you can enhance this)
    console.log('Suggestions:', filtered);
}

function hideSearchSuggestions() {
    // Hide suggestions dropdown
}

// ========================
// Shopping Cart System
// ========================

function initializeCart() {
    // Add cart icon to header
    const headerLinks = document.querySelector('.header-links');
    if (headerLinks) {
        const cartButton = document.createElement('button');
        cartButton.className = 'btn cart-btn';
        cartButton.innerHTML = '🛒 Cart (<span id="cart-count">0</span>)';
        cartButton.onclick = toggleCart;
        headerLinks.appendChild(cartButton);
    }
    
    // Create cart sidebar
    createCartSidebar();
}

function createCartSidebar() {
    const cartSidebar = document.createElement('div');
    cartSidebar.id = 'cart-sidebar';
    cartSidebar.className = 'cart-sidebar';
    cartSidebar.innerHTML = `
        <div class="cart-header">
            <h2>Your Cart</h2>
            <button onclick="toggleCart()" class="close-cart">✕</button>
        </div>
        <div id="cart-items" class="cart-items"></div>
        <div class="cart-footer">
            <div class="cart-total">
                <span>Total:</span>
                <span id="cart-total-price">$0.00</span>
            </div>
            <button class="btn btn-large" onclick="checkout()">Checkout</button>
        </div>
    `;
    
    document.body.appendChild(cartSidebar);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .cart-sidebar {
            position: fixed;
            right: -400px;
            top: 0;
            width: 400px;
            height: 100vh;
            background: white;
            box-shadow: -2px 0 10px rgba(0,0,0,0.1);
            transition: right 0.3s ease;
            z-index: 9999;
            display: flex;
            flex-direction: column;
        }
        
        .cart-sidebar.open {
            right: 0;
        }
        
        .cart-header {
            padding: 20px;
            background: #0171f9;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .cart-header h2 {
            margin: 0;
        }
        
        .close-cart {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
        }
        
        .cart-items {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        }
        
        .cart-item {
            display: flex;
            gap: 15px;
            padding: 15px;
            border-bottom: 1px solid #eee;
            align-items: center;
        }
        
        .cart-item img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
        }
        
        .cart-item-info {
            flex: 1;
        }
        
        .cart-item-info h4 {
            margin: 0 0 5px 0;
        }
        
        .cart-item-price {
            color: #ee626b;
            font-weight: bold;
        }
        
        .remove-item {
            background: #ee626b;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .cart-footer {
            padding: 20px;
            border-top: 2px solid #eee;
        }
        
        .cart-total {
            display: flex;
            justify-content: space-between;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .cart-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            z-index: 9998;
            display: none;
        }
        
        .cart-overlay.show {
            display: block;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100px); opacity: 0; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    overlay.onclick = toggleCart;
    document.body.appendChild(overlay);
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.querySelector('.cart-overlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}

function addToCart(gameName, price, image) {
    const existingItem = cart.find(item => item.name === gameName);
    
    if (existingItem) {
        showNotification('Game already in cart!', 'error');
        return;
    }
    
    cart.push({
        name: gameName,
        price: price,
        image: image
    });
    
    updateCart();
    saveCartToStorage();
    showNotification(`${gameName} added to cart!`, 'success');
}

function removeFromCart(gameName) {
    cart = cart.filter(item => item.name !== gameName);
    updateCart();
    saveCartToStorage();
    showNotification('Item removed from cart', 'success');
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total-price');
    
    if (!cartItems) return;
    
    // Update count
    cartCount.textContent = cart.length;
    
    // Update items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty</p>';
        cartTotal.textContent = '$0.00';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">$${item.price}</div>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.name}')">✕</button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    showNotification(`Proceeding to checkout. Total: $${total.toFixed(2)}`, 'success');
    
    // In a real app, this would redirect to checkout page
    setTimeout(() => {
        cart = [];
        updateCart();
        saveCartToStorage();
        toggleCart();
    }, 2000);
}

function saveCartToStorage() {
    localStorage.setItem('gameStoreCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('gameStoreCart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCart();
    }
}

// ========================
// Download Buttons
// ========================

function initializeDownloadButtons() {
    const downloadButtons = document.querySelectorAll('.download-card .btn');
    
    downloadButtons.forEach((button, index) => {
        const card = button.closest('.download-card');
        const gameName = card.querySelector('h3')?.textContent || 'Game';
        const gameImage = card.querySelector('img')?.src || '';
        const price = (Math.random() * 50 + 10).toFixed(2); // Random price
        
        button.addEventListener('click', function() {
            // Simulate download progress
            startDownload(this, gameName);
            
            // Add to cart option
            setTimeout(() => {
                if (confirm(`Add ${gameName} to cart for $${price}?`)) {
                    addToCart(gameName, parseFloat(price), gameImage);
                }
            }, 3000);
        });
    });
}

function startDownload(button, gameName) {
    const originalText = button.textContent;
    let progress = 0;
    
    button.disabled = true;
    
    const interval = setInterval(() => {
        progress += 10;
        button.textContent = `Downloading... ${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            button.textContent = '✓ Downloaded';
            button.style.backgroundColor = '#4CAF50';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
                button.style.backgroundColor = '';
            }, 2000);
            
            showNotification(`${gameName} downloaded successfully!`, 'success');
        }
    }, 300);
}

// ========================
// Trending Cards Interaction
// ========================

function initializeTrendingCards() {
    const trendingCards = document.querySelectorAll('.trending-cards .card');
    
    trendingCards.forEach(card => {
        const shoppingIcon = card.querySelector('a img');
        const gameName = card.querySelector('h3')?.textContent || 'Game';
        const gameImage = card.querySelector('.thumb')?.src || '';
        const price = (Math.random() * 40 + 15).toFixed(2);
        
        if (shoppingIcon) {
            shoppingIcon.parentElement.addEventListener('click', function(e) {
                e.preventDefault();
                addToCart(gameName, parseFloat(price), gameImage);
                
                // Add animation to icon
                shoppingIcon.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    shoppingIcon.style.transform = 'scale(1)';
                }, 200);
            });
        }
        
        // Add hover effect with game details
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });
}

// ========================
// Category Cards
// ========================

function initializeCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.querySelector('h3').textContent;
            showNotification(`Exploring ${category} games...`, 'success');
            
            // Simulate filtering
            setTimeout(() => {
                filterGamesByCategory(category);
            }, 500);
        });
    });
}

function filterGamesByCategory(category) {
    const downloadCards = document.querySelectorAll('.download-card');
    
    downloadCards.forEach(card => {
        const gameCategory = card.querySelector('p')?.textContent || '';
        
        if (gameCategory.toLowerCase().includes(category.toLowerCase()) || category === 'All') {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease-out';
        } else {
            card.style.opacity = '0.3';
        }
    });
    
    // Scroll to downloads section
    document.querySelector('.downloads-container')?.scrollIntoView({
        behavior: 'smooth'
    });
}

// ========================
// Newsletter
// ========================

function initializeNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    const emailInput = newsletterForm?.querySelector('input[type="email"]');
    const subscribeButton = newsletterForm?.querySelector('button');
    
    if (subscribeButton) {
        subscribeButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (emailInput && emailInput.value) {
                if (validateEmail(emailInput.value)) {
                    showNotification('Thank you for subscribing!', 'success');
                    emailInput.value = '';
                    
                    // Save to localStorage
                    saveSubscription(emailInput.value);
                } else {
                    showNotification('Please enter a valid email', 'error');
                }
            } else {
                showNotification('Please enter your email', 'error');
            }
        });
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function saveSubscription(email) {
    const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
    subscribers.push({
        email: email,
        date: new Date().toISOString()
    });
    localStorage.setItem('subscribers', JSON.stringify(subscribers));
}

// ========================
// Animations on Scroll
// ========================

function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all major sections
    const sections = document.querySelectorAll('.trending-container, .downloads-container, .categories-container, .featured-section');
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    });
}

// ========================
// View All Buttons
// ========================

document.addEventListener('DOMContentLoaded', function() {
    const viewAllButtons = document.querySelectorAll('.trending-header .btn, .section-header .btn');
    
    viewAllButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.closest('.trending-container, .downloads-container');
            const sectionName = section.querySelector('h1').textContent;
            showNotification(`Loading all ${sectionName.toLowerCase()}...`, 'success');
        });
    });
});

// ========================
// Pre-order Button
// ========================

document.addEventListener('DOMContentLoaded', function() {
    const preorderButton = document.querySelector('.featured-section .btn-large');
    
    if (preorderButton) {
        preorderButton.addEventListener('click', function() {
            const gameName = document.querySelector('.featured-section h2')?.textContent || 'Featured Game';
            showNotification(`Pre-order placed for ${gameName}!`, 'success');
            
            // Add to cart
            addToCart(gameName, 69.99, document.querySelector('.featured-image img')?.src || '');
        });
    }
});

// ========================
// Keyboard Shortcuts
// ========================

document.addEventListener('keydown', function(e) {
    // Press 'C' to toggle cart
    if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault();
        toggleCart();
    }
    
    // Press 'S' to focus search
    if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        document.querySelector('.search input')?.focus();
    }
    
    // Press 'Esc' to close cart
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('cart-sidebar');
        if (sidebar?.classList.contains('open')) {
            toggleCart();
        }
    }
});

// ========================
// Console Easter Egg
// ========================

console.log('%c🎮 Welcome to LUGX Gaming! 🎮', 'color: #0171f9; font-size: 20px; font-weight: bold;');
console.log('%cKeyboard Shortcuts:', 'color: #ee626b; font-size: 14px; font-weight: bold;');
console.log('Ctrl + C: Toggle Cart');
console.log('Ctrl + S: Focus Search');
console.log('Esc: Close Cart');

// Export functions for global access
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.checkout = checkout;