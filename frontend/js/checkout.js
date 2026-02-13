let cartItems = [];
let currentStore = null;

// Load checkout data
async function loadCheckoutData() {
  if (!window.currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const result = await window.fastGetApp.getCartItems();

  if (!result.success || !result.data || result.data.length === 0) {
    document.getElementById('summaryContent').innerHTML = '<p>Your cart is empty</p>';
    return;
  }

  cartItems = result.data;
  currentStore = cartItems[0].products.store_id; // Assuming single store per order

  displayOrderSummary(cartItems);
  setupPaymentMethodListeners();
}

// Display order summary
function displayOrderSummary(items) {
  const subtotal = items.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const deliveryFee = 50; // Default

  const summaryContent = document.getElementById('summaryContent');
  summaryContent.innerHTML = items.map(item => `
    <div class="summary-item-row">
      <div class="item-details">
        <p class="item-name">${item.products.name} x ${item.quantity}</p>
        <p class="item-store">Store ID: ${item.products.store_id}</p>
      </div>
      <span class="item-total">₹${(item.products.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  document.getElementById('summarySubtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('summaryTax').textContent = `₹${tax.toFixed(2)}`;
  document.getElementById('summaryDeliveryFee').textContent = `₹${deliveryFee.toFixed(2)}`;
  document.getElementById('summaryTotal').textContent = `₹${(subtotal + tax + deliveryFee).toFixed(2)}`;

  localStorage.setItem('checkoutTotals', JSON.stringify({
    subtotal,
    tax,
    deliveryFee,
    total: subtotal + tax + deliveryFee
  }));
}

// Setup payment method listeners
function setupPaymentMethodListeners() {
  document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const cardPayment = document.getElementById('cardPayment');
      if (e.target.value === 'card') {
        cardPayment.style.display = 'block';
      } else {
        cardPayment.style.display = 'none';
      }
    });
  });
}

// Place order
async function placeOrder() {
  if (!window.currentUser) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }

  // Validate address
  const street = document.getElementById('street').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const zip = document.getElementById('zip').value.trim();

  if (!street || !city || !state || !zip) {
    alert('Please fill in all address fields');
    return;
  }

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  const specialInstructions = document.getElementById('specialInstructions').value;

  const deliveryAddress = {
    street,
    city,
    state,
    zip_code: zip,
    country: 'India',
    latitude: 0, // Would set real coordinates from Google Maps API
    longitude: 0,
  };

  // Validate payment method
  if (paymentMethod === 'card') {
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiryDate = document.getElementById('expiryDate').value.trim();
    const cvv = document.getElementById('cvv').value.trim();

    if (!cardNumber || !expiryDate || !cvv) {
      alert('Please fill in all card details');
      return;
    }
  }

  // Create order
  const orderResult = await window.fastGetApp.createOrder(
    currentStore,
    deliveryAddress,
    paymentMethod,
    specialInstructions
  );

  if (orderResult.success) {
    // Process payment
    const totals = JSON.parse(localStorage.getItem('checkoutTotals'));
    const paymentResult = await window.fastGetApp.processPayment(
      orderResult.order.id,
      totals.total,
      'method_id'
    );

    if (paymentResult.success) {
      alert('Order placed successfully!');
      localStorage.removeItem('checkoutTotals');
      window.location.href = 'orders.html';
    } else {
      alert('Payment failed: ' + paymentResult.error);
    }
  } else {
    alert('Error placing order: ' + orderResult.error);
  }
}

// Handle logout
async function handleLogout() {
  const result = await window.fastGetApp.logout();
  if (result.success) {
    window.location.href = 'index.html';
  }
}

// Load on page load
document.addEventListener('DOMContentLoaded', loadCheckoutData);
