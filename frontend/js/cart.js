// Load cart items
async function loadCart() {
  if (!window.currentUser) {
    document.getElementById('cartContainer').innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <p>Please <a href="login.html">login</a> to view your cart</p>
      </div>
    `;
    return;
  }

  const result = await window.fastGetApp.getCartItems();

  if (result.success) {
    const cartItems = result.data;
    displayCartItems(cartItems);
    calculateTotals(cartItems);
  } else {
    document.getElementById('cartContainer').innerHTML =
      `<p style="text-align: center; color: red;">Error loading cart: ${result.error}</p>`;
  }
}

// Display cart items
function displayCartItems(cartItems) {
  const container = document.getElementById('cartContainer');

  if (!cartItems || cartItems.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <p>Your cart is empty</p>
        <button class="btn btn-primary" onclick="window.location.href='stores.html'">Browse Stores</button>
      </div>
    `;
    return;
  }

  container.innerHTML = cartItems.map(item => `
    <div class="cart-item">
      <img src="${(item.products.images && item.products.images[0]) || 'https://via.placeholder.com/100'}" alt="${item.products.name}">
      <div class="item-details">
        <h3>${item.products.name}</h3>
        <p class="item-price">₵${item.products.price.toFixed(2)}</p>
      </div>

      <div class="item-quantity">
        <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
        <input type="number" value="${item.quantity}" readonly>
        <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
      </div>
      <div class="item-total">
        <p>GH₵${(item.products.price * item.quantity).toFixed(2)}</p>
      </div>
      <button class="btn-remove" onclick="removeItem('${item.id}')">Remove</button>
    </div>
  `).join('');
}

// Calculate totals
function calculateTotals(cartItems) {
  if (!cartItems || cartItems.length === 0) {
    document.getElementById('subtotal').textContent = 'GH₵0';
    document.getElementById('tax').textContent = 'GH₵0';
    document.getElementById('deliveryFee').textContent = 'GH₵0';
    document.getElementById('total').textContent = 'GH₵0';
    return;
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const deliveryFee = 50; // Default delivery fee

  document.getElementById('subtotal').textContent = `GH₵${subtotal.toFixed(2)}`;
  document.getElementById('tax').textContent = `GH₵${tax.toFixed(2)}`;
  document.getElementById('deliveryFee').textContent = `GH₵${deliveryFee.toFixed(2)}`;
  document.getElementById('total').textContent = `GH₵${(subtotal + tax + deliveryFee).toFixed(2)}`;
}

// Update quantity (placeholder)
async function updateQuantity(itemId, newQuantity) {
  if (newQuantity < 1) {
    removeItem(itemId);
    return;
  }
  alert('Quantity update feature coming soon');
  loadCart();
}

// Remove item from cart
async function removeItem(itemId) {
  const result = await window.fastGetApp.removeFromCart(itemId);

  if (result.success) {
    loadCart();
  } else {
    alert('Error removing item: ' + result.error);
  }
}

// Proceed to checkout
function proceedToCheckout() {
  if (!window.currentUser) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }

  window.location.href = 'checkout.html';
}

// Handle logout
async function handleLogout() {
  const result = await window.fastGetApp.logout();
  if (result.success) {
    window.location.href = 'cart.html';
  }
}

// Load cart on page load
document.addEventListener('DOMContentLoaded', loadCart);
