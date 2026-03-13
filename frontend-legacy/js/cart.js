// Load cart items
async function loadCart() {
  await window.fastGetApp.authReadyPromise;
  const user = window.fastGetApp.currentUser;

  if (!user) {
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
        ${item.selected_variations ? `
          <div class="item-variations">
            ${Object.entries(item.selected_variations).map(([k, v]) => `<span>${k}: ${v}</span>`).join(' | ')}
          </div>
        ` : ''}
        <p class="item-price">₵${item.products.price.toFixed(2)}</p>
      </div>

      <div class="item-quantity">
        <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
        <input type="number" value="${item.quantity}" readonly>
        <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
      </div>
      <div class="item-total">
        <p>₵${(item.products.price * item.quantity).toFixed(2)}</p>
      </div>
      <button class="btn-remove" onclick="removeItem('${item.id}')">Remove</button>
    </div>
  `).join('');
}


// Calculate totals
function calculateTotals(cartItems) {
  if (!cartItems || cartItems.length === 0) {
    document.getElementById('subtotal').textContent = '₵0.00';
    document.getElementById('deliveryFee').textContent = '₵0.00';
    document.getElementById('total').textContent = '₵0.00';
    return;
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);

  // Use selected town if available
  const selectedTown = window.fastGetApp.townManager.getSelectedTown();
  const deliveryFee = selectedTown ? window.fastGetApp.calculateDeliveryFee(selectedTown.id) : 7.00;

  document.getElementById('subtotal').textContent = `₵${subtotal.toFixed(2)}`;
  if (document.getElementById('taxRow')) document.getElementById('taxRow').style.display = 'none';
  document.getElementById('deliveryFee').textContent = `₵${deliveryFee.toFixed(2)}`;

  document.getElementById('total').textContent = `₵${(subtotal + deliveryFee).toFixed(2)}`;
}


// Update quantity
async function updateQuantity(itemId, newQuantity) {
  const result = await window.fastGetApp.updateCartItemQuantity(itemId, newQuantity);
  if (result.success) {
    loadCart();
  } else {
    alert('Error updating quantity: ' + result.error);
  }
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
async function proceedToCheckout() {
  await window.fastGetApp.authReadyPromise;
  const user = window.fastGetApp.currentUser;
  if (!user) {
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
