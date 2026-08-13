/* =====================================================
   FameDrop Digital -- Application Logic (Morocco)
   ===================================================== */

'use strict';

// -- Config --
const WHATSAPP_NUMBER = '212649831937';
const STORE_EMAIL     = 'support@famedrop.online';

// -- Bank Details (Attijariwafa) --
const BANK_INFO = {
  owner : 'M ISMAIL DRIOUCH',
  bank  : 'Attijariwafa Bank',
  rib   : '007 480 0000402300401019 02',
  swift : 'BCMAMAMC',
  ville : 'Meknes (480)'
};

// -- Cart State --
let cart = JSON.parse(localStorage.getItem('fd_cart') || '[]');
let currentProduct = null;

// =====================================================
// UTILITY HELPERS
// =====================================================
function saveCart() {
  localStorage.setItem('fd_cart', JSON.stringify(cart));
}

function generateOrderId() {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return 'FD-' + new Date().getFullYear() + '-' + ts + rand;
}

function formatPrice(n) {
  return Number(n).toLocaleString('fr-MA') + ' DH';
}

function showToast(message, type, duration) {
  type     = type     || 'success';
  duration = duration || 3500;
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className   = 'toast ' + type + ' show';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function() {
    toast.className = 'toast';
  }, duration);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[0-9+\s\-()]{6,20}$/.test(phone);
}

// =====================================================
// MODAL SYSTEM
// =====================================================
const overlay = document.getElementById('modalOverlay');

function openModal(id) {
  closeAllModals();
  const modal = document.getElementById(id);
  if (!modal) return;
  overlay.classList.add('active');
  modal.style.display = 'block';
  requestAnimationFrame(function() { modal.classList.add('active'); });
  document.body.style.overflow = 'hidden';
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(function(m) {
    m.classList.remove('active');
    m.style.display = 'none';
  });
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

overlay.addEventListener('click', closeAllModals);
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeAllModals();
});
document.querySelectorAll('.modal-close').forEach(function(btn) {
  btn.addEventListener('click', closeAllModals);
});

// =====================================================
// CART FUNCTIONS
// =====================================================
function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  const total = cart.reduce(function(s, i) { return s + i.qty; }, 0);
  badge.textContent = total;
  badge.classList.toggle('hidden', total === 0);
}

function renderCartModal() {
  const container = document.getElementById('cartItems');
  const totalEl   = document.getElementById('cartGrandTotal');
  const countEl   = document.getElementById('cartItemCount');

  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty"><i class="ph ph-shopping-cart" style="font-size:2rem;display:block;margin-bottom:8px;"></i>Your cart is empty</div>';
    totalEl.textContent = '0 DH';
    countEl.textContent = '';
    return;
  }

  countEl.textContent = '(' + cart.reduce(function(s, i) { return s + i.qty; }, 0) + ' items)';

  container.innerHTML = cart.map(function(item, idx) {
    return '<div class="cart-item">' +
      '<div class="cart-item-info">' +
        '<strong>' + item.name + '</strong>' +
        '<span>' + item.desc + ' x ' + item.qty + '</span>' +
      '</div>' +
      '<span class="cart-item-price">' + formatPrice(item.price * item.qty) + '</span>' +
      '<button class="cart-item-remove" data-idx="' + idx + '" title="Remove"><i class="ph-bold ph-x"></i></button>' +
    '</div>';
  }).join('');

  const grand = cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
  totalEl.textContent = formatPrice(grand);

  container.querySelectorAll('.cart-item-remove').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const idx = parseInt(this.dataset.idx);
      cart.splice(idx, 1);
      saveCart();
      updateCartBadge();
      renderCartModal();
      showToast('Item removed from cart', 'info');
    });
  });
}

function addToCart(name, price, desc, qty) {
  qty = qty || 1;
  const existing = cart.find(function(i) { return i.name === name; });
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ name: name, price: Number(price), desc: desc, qty: qty });
  }
  saveCart();
  updateCartBadge();
}

document.getElementById('btnCart').addEventListener('click', function() {
  renderCartModal();
  openModal('modalCart');
});

document.getElementById('closeCart').addEventListener('click', closeAllModals);

document.getElementById('btnCheckoutFromCart').addEventListener('click', function() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  const total = cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
  const names = cart.map(function(i) { return i.qty + 'x ' + i.name; }).join(', ');
  currentProduct = { name: names, price: total, desc: 'Cart Order', qty: 1, fromCart: true };
  openCheckout(currentProduct, true);
});

// =====================================================
// CHECKOUT MODAL
// =====================================================
function openCheckout(product, fromCart) {
  fromCart = fromCart || false;
  currentProduct = Object.assign({}, product, { qty: product.qty || 1, fromCart: fromCart });

  document.getElementById('checkoutProductName').textContent = fromCart ? 'Cart Order' : 'Ordering';
  document.getElementById('checkoutTitle').textContent       = fromCart ? 'Checkout - ' + cart.length + ' item(s)' : product.name;
  document.getElementById('summaryProduct').textContent      = product.name;
  document.getElementById('summaryPrice').textContent        = formatPrice(product.price);
  document.getElementById('qtyInput').value                  = currentProduct.qty;
  updateOrderTotal();

  document.getElementById('checkoutForm').reset();
  document.querySelectorAll('#checkoutForm .error').forEach(function(el) { el.classList.remove('error'); });
  document.querySelector('.summary-qty').style.display = fromCart ? 'none' : 'flex';

  openModal('modalCheckout');
  updateBankPanel('attijariwafa');
}

function updateOrderTotal() {
  const qty   = parseInt(document.getElementById('qtyInput').value) || 1;
  const price = currentProduct ? currentProduct.price : 0;
  document.getElementById('summaryTotal').textContent = formatPrice(price * qty);
}

document.getElementById('qtyMinus').addEventListener('click', function() {
  const input = document.getElementById('qtyInput');
  const val   = Math.max(1, parseInt(input.value) - 1);
  input.value = val;
  if (currentProduct) currentProduct.qty = val;
  updateOrderTotal();
});

document.getElementById('qtyPlus').addEventListener('click', function() {
  const input = document.getElementById('qtyInput');
  const val   = Math.min(50, parseInt(input.value) + 1);
  input.value = val;
  if (currentProduct) currentProduct.qty = val;
  updateOrderTotal();
});

document.getElementById('closeCheckout').addEventListener('click', closeAllModals);

// Payment method selector -- show/hide bank panel
document.getElementById('co-payment').addEventListener('change', function() {
  updateBankPanel(this.value);
});

function updateBankPanel(method) {
  const panel        = document.getElementById('bankDetailsPanel');
  const header       = panel.querySelector('.bank-details-header span');
  const body         = panel.querySelector('.bank-details-body');
  const instructions = document.getElementById('bankInstructions');
  const submitBtn    = document.getElementById('submitOrder');

  panel.classList.remove('cashplus-panel');

  if (method === 'attijariwafa' || method === 'cih') {
    panel.style.display = 'block';
    header.textContent  = method === 'cih'
      ? 'Bank Details - CIH / Attijariwafa'
      : 'Bank Details - Attijariwafa Bank';

    instructions.innerHTML =
      '<i class="ph-fill ph-info"></i>' +
      '<div>' +
        '<strong>How to pay (' + (method === 'cih' ? 'CIH Online' : 'Attijari Mobile') + '):</strong>' +
        '<ol>' +
          '<li>Open your <strong>' + (method === 'cih' ? 'CIH Online' : 'Attijari Mobile') + '</strong> app.</li>' +
          '<li>Go to <em>Transfer &rarr; To another account</em>.</li>' +
          '<li>Enter the RIB above and the exact amount.</li>' +
          '<li>Send a <strong>screenshot of the receipt</strong> to our WhatsApp.</li>' +
          '<li>Your license key will be sent to your email within <strong>minutes</strong>.</li>' +
        '</ol>' +
      '</div>';

    submitBtn.innerHTML = '<i class="ph-bold ph-paper-plane-tilt"></i> Send Order via WhatsApp';

  } else if (method === 'cashplus') {
    panel.style.display = 'block';
    panel.classList.add('cashplus-panel');
    header.textContent = 'Payment - Cash Plus / Wafa Cash';

    body.innerHTML =
      '<div class="bank-row">' +
        '<span>Recipient name</span>' +
        '<strong>' + BANK_INFO.owner + '</strong>' +
      '</div>' +
      '<div class="bank-row">' +
        '<span>WhatsApp</span>' +
        '<strong>+' + WHATSAPP_NUMBER + '</strong>' +
      '</div>';

    instructions.innerHTML =
      '<i class="ph-fill ph-map-pin" style="color:#B45309"></i>' +
      '<div>' +
        '<strong>How to pay (Cash Plus / Wafa Cash):</strong>' +
        '<ol>' +
          '<li>Go to any Cash Plus or Wafa Cash agent near you.</li>' +
          '<li>Make a cash deposit in the name of <strong>M ISMAIL DRIOUCH</strong>.</li>' +
          '<li>Send the <strong>transaction code + receipt</strong> to our WhatsApp.</li>' +
          '<li>Your key will be emailed immediately after verification.</li>' +
        '</ol>' +
      '</div>';

    submitBtn.innerHTML = '<i class="ph-bold ph-paper-plane-tilt"></i> Send Order via WhatsApp';

  } else if (method === 'whatsapp') {
    panel.style.display = 'none';
    submitBtn.innerHTML = '<i class="ph-bold ph-whatsapp-logo"></i> Order via WhatsApp';

  } else {
    panel.style.display = 'none';
    submitBtn.innerHTML = '<i class="ph-bold ph-check-circle"></i> Confirm Order';
  }
}

// RIB Copy Button
document.getElementById('copyRib').addEventListener('click', function() {
  var self = this;
  var rib  = document.getElementById('ribCopyText').textContent.replace(/\s/g, '');
  navigator.clipboard.writeText(rib).then(function() {
    self.innerHTML = '<i class="ph-bold ph-check"></i> Copied!';
    self.classList.add('copied');
    setTimeout(function() {
      self.innerHTML = '<i class="ph-bold ph-copy"></i>';
      self.classList.remove('copied');
    }, 2500);
  }).catch(function() {
    showToast('Please select and copy the RIB manually.', 'info');
  });
});

// Checkout Form Submit
document.getElementById('checkoutForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name      = document.getElementById('co-name');
  const email     = document.getElementById('co-email');
  const phone     = document.getElementById('co-phone');
  const payment   = document.getElementById('co-payment');
  const submitBtn = document.getElementById('submitOrder');
  let valid = true;

  [name, email, phone, payment].forEach(function(el) { el.classList.remove('error'); });

  if (!name.value.trim() || name.value.trim().length < 2) { name.classList.add('error');    valid = false; }
  if (!validateEmail(email.value))                         { email.classList.add('error');   valid = false; }
  if (!validatePhone(phone.value))                         { phone.classList.add('error');   valid = false; }
  if (!payment.value)                                      { payment.classList.add('error'); valid = false; }

  if (!valid) {
    showToast('Please fill in all required fields correctly.', 'error');
    return;
  }

  const qty        = parseInt(document.getElementById('qtyInput').value) || 1;
  const totalPrice = currentProduct.fromCart
    ? currentProduct.price
    : currentProduct.price * qty;
  const orderId    = generateOrderId();

  const paymentLabels = {
    attijariwafa : 'Bank Transfer - Attijariwafa',
    cih          : 'CIH Mobile Transfer',
    cashplus     : 'Cash Plus / Wafa Cash',
    whatsapp     : 'WhatsApp'
  };

  submitBtn.disabled    = true;
  submitBtn.textContent = 'Processing...';

  setTimeout(function() {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="ph-bold ph-check-circle"></i> Confirm Order';

    const productList = currentProduct.fromCart
      ? cart.map(function(i) { return '- ' + i.qty + 'x ' + i.name + ' = ' + formatPrice(i.price * i.qty); }).join('\n')
      : '- ' + qty + 'x ' + currentProduct.name + ' = ' + formatPrice(totalPrice);

    let msg =
      'New Order - FameDrop Digital\n\n' +
      'Order Ref: ' + orderId + '\n\n' +
      'Products:\n' + productList + '\n\n' +
      'Total: ' + formatPrice(totalPrice) + '\n\n' +
      'Customer:\n' +
      'Name  : ' + name.value.trim()  + '\n' +
      'Email : ' + email.value.trim() + '\n' +
      'Phone : ' + phone.value.trim() + '\n\n' +
      'Payment: ' + (paymentLabels[payment.value] || payment.value) + '\n\n';

    if (payment.value === 'attijariwafa' || payment.value === 'cih') {
      msg +=
        'Bank Transfer to:\n' +
        BANK_INFO.owner + '\n' +
        BANK_INFO.bank + '\n' +
        'RIB: ' + BANK_INFO.rib + '\n\n' +
        'Please send your transfer receipt here after payment.';
    } else if (payment.value === 'cashplus') {
      msg +=
        'Cash Plus deposit in the name of:\n' +
        BANK_INFO.owner + '\n' +
        'WhatsApp: +' + WHATSAPP_NUMBER + '\n\n' +
        'Please send the transaction code here after payment.';
    } else {
      msg += 'I would like to order this product via WhatsApp.';
    }

    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');

    cart = [];
    saveCart();
    updateCartBadge();
    closeAllModals();
    showSuccessModal(orderId, name.value.trim(), email.value.trim(), payment.value, totalPrice);
  }, 1000);
});

function showSuccessModal(orderId, name, email, payment, total) {
  const instructions = {
    attijariwafa : 'Please complete your bank transfer to RIB: <strong>' + BANK_INFO.rib + '</strong> (' + BANK_INFO.owner + ', ' + BANK_INFO.bank + '). Then send your receipt photo to our WhatsApp. Your key will be emailed to <strong>' + email + '</strong> once confirmed.',
    cih          : 'Please transfer via CIH Mobile to RIB: <strong>' + BANK_INFO.rib + '</strong> (' + BANK_INFO.owner + '). Send the receipt to our WhatsApp and your key will arrive at <strong>' + email + '</strong>.',
    cashplus     : 'Make a Cash Plus deposit in the name of <strong>' + BANK_INFO.owner + '</strong>. Send the transaction code to our WhatsApp and your key will be emailed to <strong>' + email + '</strong> immediately.',
    whatsapp     : 'Our team will contact you on WhatsApp to finalize payment. Your key will be sent to <strong>' + email + '</strong> once confirmed.'
  };

  document.getElementById('successTitle').textContent = 'Order Confirmed!';
  document.getElementById('successMsg').innerHTML     = 'Thank you, <strong>' + name + '</strong>! ' + (instructions[payment] || '');
  document.getElementById('successOrderId').textContent = 'Order Ref: ' + orderId;
  openModal('modalSuccess');
}

document.getElementById('closeSuccess').addEventListener('click', closeAllModals);

// =====================================================
// BUY NOW BUTTONS
// =====================================================
function wireProductCards() {
  document.querySelectorAll('.product-card').forEach(function(card) {
    const name  = card.dataset.name;
    const price = parseInt(card.dataset.price);
    const desc  = card.dataset.desc;

    const buyBtn = card.querySelector('.btn-buy');
    if (buyBtn && name && price) {
      buyBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openCheckout({ name: name, price: price, desc: desc });
      });
    }

    card.addEventListener('click', function(e) {
      if (e.target.closest('button')) return;
      if (!name || !price) return;
      addToCart(name, price, desc, 1);
      showToast('Added to cart: ' + name, 'success');
    });

    const quoteBtn = card.querySelector('.btn-quote');
    if (quoteBtn) {
      quoteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openModal('modalQuote');
        const pInput = document.getElementById('q-products');
        if (pInput) pInput.value = name;
      });
    }
  });
}

// =====================================================
// B2B QUOTE BUTTON (page CTA)
// =====================================================
document.querySelectorAll('a[href="#contact"]').forEach(function(btn) {
  if (btn.textContent.trim().indexOf('Quote') !== -1 || btn.textContent.trim().indexOf('Bulk') !== -1) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      openModal('modalQuote');
    });
  }
});

// =====================================================
// QUOTE FORM
// =====================================================
document.getElementById('closeQuote').addEventListener('click', closeAllModals);

document.getElementById('quoteForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const company   = document.getElementById('q-company');
  const name      = document.getElementById('q-name');
  const email     = document.getElementById('q-email');
  const phone     = document.getElementById('q-phone');
  const products  = document.getElementById('q-products');
  const notes     = document.getElementById('q-notes');
  const submitBtn = this.querySelector('button[type="submit"]');
  let valid = true;

  [company, name, email, phone, products].forEach(function(el) { el.classList.remove('error'); });

  if (!company.value.trim())       { company.classList.add('error');  valid = false; }
  if (!name.value.trim())          { name.classList.add('error');     valid = false; }
  if (!validateEmail(email.value)) { email.classList.add('error');    valid = false; }
  if (!validatePhone(phone.value)) { phone.classList.add('error');    valid = false; }
  if (!products.value.trim())      { products.classList.add('error'); valid = false; }

  if (!valid) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  setTimeout(function() {
    const msg =
      'Bulk Quote Request - FameDrop Digital\n\n' +
      'Company : ' + company.value.trim() + '\n' +
      'Contact : ' + name.value.trim()    + '\n' +
      'Email   : ' + email.value.trim()   + '\n' +
      'Phone   : ' + phone.value.trim()   + '\n\n' +
      'Products Needed:\n' + products.value.trim() + '\n\n' +
      (notes.value.trim() ? 'Notes:\n' + notes.value.trim() : '');

    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="ph-bold ph-paper-plane-tilt"></i> Send Quote Request';
    closeAllModals();
    showToast('Quote request sent via WhatsApp!', 'success');
  }, 1000);
});

// =====================================================
// TRACK ORDER MODAL
// =====================================================
document.getElementById('btnTrack').addEventListener('click', function() {
  openModal('modalTrack');
});

document.getElementById('closeTrack').addEventListener('click', closeAllModals);

document.getElementById('trackForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const emailInput = document.getElementById('t-email');
  const orderInput = document.getElementById('t-order');
  emailInput.classList.remove('error');

  if (!validateEmail(emailInput.value)) {
    emailInput.classList.add('error');
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  const orderId = orderInput.value.trim();
  const msg =
    'Order Tracking Request - FameDrop Digital\n\n' +
    'Email: ' + emailInput.value.trim() + '\n' +
    (orderId ? 'Order Ref: ' + orderId + '\n' : '') +
    '\nPlease check the status of my order.';

  window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
  closeAllModals();
  showToast('Redirecting to WhatsApp support...', 'info');
});

// =====================================================
// CATEGORY FILTER TABS
// =====================================================
document.querySelectorAll('.filter-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
    this.classList.add('active');

    const filter = this.dataset.filter;
    document.querySelectorAll('.product-card').forEach(function(card) {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.cat !== filter);
    });

    document.querySelectorAll('.cat-heading').forEach(function(h) {
      if (filter === 'all') { h.style.display = ''; return; }
      const grid    = h.nextElementSibling;
      const visible = grid ? grid.querySelectorAll('.product-card:not(.hidden)').length : 0;
      h.style.display = visible > 0 ? '' : 'none';
    });
  });
});

// =====================================================
// MOBILE MENU
// =====================================================
const mobileBtn = document.getElementById('mobileMenuBtn');
const menuIcon  = document.getElementById('menuIcon');
const navLinks  = document.getElementById('navLinks');

if (mobileBtn) {
  mobileBtn.addEventListener('click', function() {
    const isOpen = navLinks.classList.toggle('open');
    menuIcon.className = isOpen ? 'ph ph-x' : 'ph ph-list';
  });
  navLinks.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
      navLinks.classList.remove('open');
      menuIcon.className = 'ph ph-list';
    });
  });
}

// =====================================================
// SCROLL-IN ANIMATION
// =====================================================
const cardObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.product-card').forEach(function(card, i) {
  card.style.opacity    = '0';
  card.style.transform  = 'translateY(24px)';
  card.style.transition = 'opacity 0.4s ease ' + (i * 0.05) + 's, transform 0.4s ease ' + (i * 0.05) + 's, box-shadow 0.25s ease, border-color 0.25s ease';
  cardObserver.observe(card);
});

// =====================================================
// DRAGGABLE REVIEWS CAROUSEL
// =====================================================
const reviewsWrap = document.querySelector('.reviews-track-wrap');
if (reviewsWrap) {
  let isDragging = false, startX = 0, scrollLeft = 0;
  reviewsWrap.addEventListener('mousedown', function(e) {
    isDragging = true;
    startX     = e.pageX - reviewsWrap.offsetLeft;
    scrollLeft = reviewsWrap.scrollLeft;
  });
  document.addEventListener('mouseup', function() { isDragging = false; });
  reviewsWrap.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - reviewsWrap.offsetLeft;
    reviewsWrap.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
}

// =====================================================
// INITIALISE
// =====================================================
updateCartBadge();
wireProductCards();
updateBankPanel('attijariwafa');
