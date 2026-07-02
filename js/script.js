document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

const productPrices = {
    'Reta 10mg': 65,
    'Reta 20mg': 85,
    'Reta 30mg': 110,
    'Tirzepatide 30mg': 90,
    'Klow 80mg': 75,
    'Motsc 5mg': 25,
    'Motsc 10mg': 50,
    'GHK-CU 100mg': 50,
    'Wolverine Stack 10mg': 65,
    'Tesa 10mg': 60,
    'Bac 3ml': 5,
    'Hospira BAC 30ml': 20,
    'NAD+ 500mg': 50,
    'SLU-PP-332 5mg': 65,
    'Reta starter 10mg Kit': 75
};

const CART_STORAGE_KEY = 'crudelabz_cart';
const orderForm = document.getElementById('order-form');
const addCartButtons = document.querySelectorAll('.add-cart');
const cartItemsEl = document.getElementById('cart-items');
const promoInput = document.getElementById('promo-code');
const promoMessage = document.getElementById('promo-message');
const applyPromoBtn = document.getElementById('apply-promo');
const subtotalEl = document.getElementById('order-subtotal');
const shippingEl = document.getElementById('order-shipping');
const discountEl = document.getElementById('order-discount');
const totalEl = document.getElementById('order-total');
const streetInput = document.getElementById('street-address');
const cityInput = document.getElementById('city');
const stateInput = document.getElementById('state');
const zipInput = document.getElementById('zip-code');
const termsCheckbox = document.getElementById('terms');
const formError = document.getElementById('form-error');
const fallbackSummary = document.getElementById('fallback-summary');
const fallbackSummaryText = document.getElementById('fallback-summary-text');
const copySummaryButton = document.getElementById('copy-summary');
const cartNotification = document.getElementById('cart-notification');

const MIN_ORDER_TOTAL = 10;
let currentPromo = '';
let cart = {};

function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        // ignore storage errors
    }
}

function loadCart() {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
            cart = Object.fromEntries(Object.entries(parsed).map(([key, item]) => [
                key,
                {
                    name: item.name,
                    price: Number(item.price) || 0,
                    quantity: Number(item.quantity) || 0,
                },
            ]).filter(([, item]) => item.quantity > 0));
        }
    } catch (e) {
        cart = {};
    }
}

function formatMoney(value) {
    return `$${value.toFixed(2)}`;
}

function calculateShipping(subtotal) {
    if (subtotal > 100) {
        return 0;
    }
    return 5.99;
}

function applyPromoCode(code, subtotal) {
    const normalized = (code || '').trim().toUpperCase();
    if (!normalized) {
        if (promoMessage) promoMessage.textContent = 'Try code JULY4 for 10% off.';
        return 0;
    }

    if (normalized === 'JULY4') {
        if (promoMessage) promoMessage.textContent = 'Promo applied: 10% off.';
        return subtotal * 0.10;
    }

    if (promoMessage) promoMessage.textContent = 'Promo code not valid. Use JULY4.';
    return 0;
}

function updateTotal() {
    const items = Object.values(cart);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = calculateShipping(subtotal);
    const discount = applyPromoCode(currentPromo, subtotal);
    const total = Math.max(0, subtotal + shipping - discount);

    if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : formatMoney(shipping);
    if (discountEl) discountEl.textContent = `-${formatMoney(discount)}`;
    if (totalEl) totalEl.textContent = formatMoney(total);
}

function renderCart() {
    if (!cartItemsEl) {
        updateTotal();
        saveCart();
        return;
    }

    const items = Object.values(cart);
    if (!items.length) {
        cartItemsEl.innerHTML = '<p class="empty-cart">Your cart is empty. Add items from above.</p>';
        updateTotal();
        saveCart();
        return;
    }

    cartItemsEl.innerHTML = items.map((item) => {
        return `
            <div class="cart-item" data-product="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${formatMoney(item.price)} each</div>
                </div>
                <div class="cart-item-controls">
                    <button type="button" class="cart-qty-btn" data-action="decrease" data-product="${item.name}">-</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button type="button" class="cart-qty-btn" data-action="increase" data-product="${item.name}">+</button>
                    <button type="button" class="btn btn-secondary remove-item" data-product="${item.name}">Remove</button>
                </div>
            </div>
        `;
    }).join('');

    updateTotal();
    saveCart();
}

function showCartNotification(message) {
    if (!cartNotification) return;

    cartNotification.textContent = message;
    cartNotification.classList.add('show');

    clearTimeout(showCartNotification.timeoutId);
    showCartNotification.timeoutId = setTimeout(() => {
        cartNotification.classList.remove('show');
    }, 1800);
}

function addToCart(product) {
    if (!productPrices[product]) return;
    if (!cart[product]) {
        cart[product] = { name: product, price: productPrices[product], quantity: 0 };
    }
    cart[product].quantity += 1;
    renderCart();
    showCartNotification(`${product} added to cart`);
}

function changeCartQuantity(product, delta) {
    if (!cart[product]) return;
    cart[product].quantity = Math.max(0, cart[product].quantity + delta);
    if (cart[product].quantity === 0) {
        delete cart[product];
    }
    renderCart();
}

function removeCartItem(product) {
    if (cart[product]) {
        delete cart[product];
        renderCart();
    }
}

if (addCartButtons.length) {
    addCartButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const product = button.dataset.product;
            addToCart(product);
        });
    });
}

if (cartItemsEl) {
    cartItemsEl.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.matches('.cart-qty-btn') && !target.matches('.remove-item')) return;

        const product = target.dataset.product;
        const action = target.dataset.action;

        if (target.matches('.cart-qty-btn')) {
            if (action === 'increase') {
                changeCartQuantity(product, 1);
            } else if (action === 'decrease') {
                changeCartQuantity(product, -1);
            }
        }

        if (target.matches('.remove-item')) {
            removeCartItem(product);
        }
    });
}

if (promoInput) {
    promoInput.addEventListener('input', () => {
        currentPromo = promoInput.value;
        updateTotal();
    });
}

if (applyPromoBtn) {
    applyPromoBtn.addEventListener('click', () => {
        currentPromo = promoInput.value;
        updateTotal();
        promoInput.focus();
    });
}

if (orderForm) {
    function displayError(message) {
        if (formError) {
            formError.textContent = message;
        }
    }

    function clearError() {
        if (formError) {
            formError.textContent = '';
        }
    }

    orderForm.addEventListener('submit', (event) => {
        event.preventDefault();
        clearError();
        if (fallbackSummary) {
            fallbackSummary.classList.add('hidden');
        }

        if (!Object.keys(cart).length) {
            displayError('Your cart is empty. Add items before submitting.');
            return;
        }

        const totalAmount = parseFloat(totalEl.textContent.replace(/[^0-9.-]+/g, '')) || 0;
        if (totalAmount < MIN_ORDER_TOTAL) {
            displayError(`The order total must be at least $${MIN_ORDER_TOTAL.toFixed(2)}.`);
            return;
        }

        if (!termsCheckbox || !termsCheckbox.checked) {
            displayError('You must agree to the terms and conditions before submitting.');
            return;
        }

        const formData = new FormData(orderForm);
        const name = formData.get('customerName') || '';
        const email = formData.get('customerEmail') || '';
        const street = formData.get('streetAddress') || '';
        const city = formData.get('city') || '';
        const state = formData.get('state') || '';
        const zip = formData.get('zipCode') || '';
        const promoCode = formData.get('promoCode') || '';
        const notes = formData.get('orderNotes') || '';
        const subtotal = subtotalEl.textContent;
        const shipping = shippingEl.textContent;
        const discount = discountEl.textContent;
        const total = totalEl.textContent;

        const cartLines = Object.values(cart).map(item => `${item.name} x${item.quantity} = ${formatMoney(item.price * item.quantity)}`).join('\n');

        const subject = 'Peptide Order Summary';
        const body = [
            `Name: ${name}`,
            `Email: ${email}`,
            `Street: ${street}`,
            `City: ${city}`,
            `State: ${state}`,
            `Zip code: ${zip}`,
            '',
            'Cart items:',
            cartLines,
            '',
            `Promo code: ${promoCode}`,
            `Subtotal: ${subtotal}`,
            `Shipping: ${shipping}`,
            `Discount: ${discount}`,
            `Total: ${total}`,
            `Notes: ${notes}`,
            '',
            'I agree to the terms and conditions.'
        ].join('\n');

        const mailto = `mailto:CrudeLabz@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;

        if (fallbackSummary && fallbackSummaryText) {
            fallbackSummaryText.value = body;
            fallbackSummary.classList.remove('hidden');
        }
    });

    if (copySummaryButton && fallbackSummaryText) {
        copySummaryButton.addEventListener('click', () => {
            navigator.clipboard.writeText(fallbackSummaryText.value)
                .then(() => {
                    copySummaryButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copySummaryButton.textContent = 'Copy summary';
                    }, 1500);
                })
                .catch(() => {
                    alert('Copy failed. Please select the text and copy it manually.');
                });
        });
    }
}

renderCart();
const sendBtn = document.getElementById("sendOrderBtn");
const modal = document.getElementById("warningModal");
const cancelBtn = document.getElementById("cancelWarning");
const continueBtn = document.getElementById("continueWarning");

sendBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

continueBtn.addEventListener("click", () => {
    modal.style.display = "none";

    // Submit the form
    sendBtn.closest("form").submit();
});

