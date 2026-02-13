let allOrders = [];
let currentFilter = 'all';

// Load orders
async function loadOrders() {
  if (!window.currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const result = await window.fastGetApp.getUserOrders();

  if (result.success) {
    allOrders = result.data;
    displayOrders();
  } else {
    document.getElementById('ordersContainer').innerHTML =
      `<p style="text-align: center; color: red;">Error loading orders: ${result.error}</p>`;
  }
}

// Display orders
function displayOrders() {
  const filteredOrders = allOrders.filter(order => {
    if (currentFilter === 'all') return true;
    return order.status === currentFilter;
  });

  const container = document.getElementById('ordersContainer');

  if (filteredOrders.length === 0) {
    container.innerHTML = `<p style="text-align: center;">No orders found</p>`;
    return;
  }

  container.innerHTML = filteredOrders.map(order => `
    <div class="order-card" onclick="openOrderModal('${order.id}')">
      <div class="order-header">
        <div class="order-number">
          <h3>${order.order_number}</h3>
          <p>${new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <div class="order-status">
          <span class="status-badge status-${order.status}">${order.status.replace('_', ' ').toUpperCase()}</span>
        </div>
      </div>

      <div class="order-details">
        <p><strong>Store:</strong> ${order.stores?.store_name || 'Unknown'}</p>
        <p><strong>Items:</strong> ${order.items?.length || 0}</p>
        <p><strong>Total:</strong> GH₵${(order.total_amount || 0).toFixed(2)}</p>
      </div>

      <div class="order-delivery">
        ${order.deliveries ? `
          <p><strong>Delivery Status:</strong> ${order.deliveries[0]?.status.replace('_', ' ').toUpperCase() || 'Pending'}</p>
          <p><strong>Est. Delivery:</strong> ${order.estimated_delivery_time ? new Date(order.estimated_delivery_time).toLocaleString() : 'TBD'}</p>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// Filter orders
function filterOrders(status) {
  currentFilter = status;

  // Update filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  displayOrders();
}

// Open order modal
function openOrderModal(orderId) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;

  const content = document.getElementById('modalOrderContent');
  content.innerHTML = `
    <div class="order-modal-content">
      <div class="order-section">
        <h3>Order Information</h3>
        <p><strong>Order Number:</strong> ${order.order_number}</p>
        <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status.replace('_', ' ').toUpperCase()}</span></p>
        <p><strong>Payment Status:</strong> <span class="status-badge status-${order.payment_status}">${order.payment_status.replace('_', ' ').toUpperCase()}</span></p>
      </div>

      <div class="order-section">
        <h3>Items</h3>
        ${order.items?.map(item => `
          <div class="order-item">
            <p><strong>${item.product_name}</strong> x ${item.quantity}</p>
            <p>GH₵${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        `).join('') || '<p>No items</p>'}
      </div>

      <div class="order-section">
        <h3>Delivery Address</h3>
        <p>${order.delivery_address?.street || 'N/A'}</p>
        <p>${order.delivery_address?.city || 'N/A'}, ${order.delivery_address?.state || 'N/A'} ${order.delivery_address?.zip_code || 'N/A'}</p>
      </div>

      <div class="order-section">
        <h3>Amount Summary</h3>
        <div class="summary-item">
          <span>Subtotal:</span>
          <span>GH₵${(order.subtotal || 0).toFixed(2)}</span>
        </div>
        <div class="summary-item">
          <span>Tax:</span>
          <span>GH₵${(order.tax || 0).toFixed(2)}</span>
        </div>
        <div class="summary-item">
          <span>Delivery Fee:</span>
          <span>GH₵${(order.delivery_fee || 0).toFixed(2)}</span>
        </div>
        <div class="summary-item total">
          <span>Total:</span>
          <span>GH₵${(order.total_amount || 0).toFixed(2)}</span>
        </div>
      </div>

      ${order.deliveries ? `
        <div class="order-section">
          <h3>Delivery Tracking</h3>
          <p><strong>Status:</strong> ${order.deliveries[0]?.status.replace('_', ' ').toUpperCase() || 'Pending'}</p>
          <p><strong>Est. Delivery:</strong> ${order.deliveries[0]?.estimated_delivery_time ? new Date(order.deliveries[0].estimated_delivery_time).toLocaleString() : 'TBD'}</p>
        </div>
      ` : ''}

      ${order.rating ? `
        <div class="order-section">
          <h3>Your Rating</h3>
          <p><strong>Rating:</strong> ${order.rating}/5</p>
          ${order.review ? `<p><strong>Review:</strong> ${order.review}</p>` : ''}
        </div>
      ` : ''}
    </div>
  `;

  document.getElementById('orderModal').style.display = 'block';
}

// Close order modal
function closeOrderModal() {
  document.getElementById('orderModal').style.display = 'none';
}

// Handle logout
async function handleLogout() {
  const result = await window.fastGetApp.logout();
  if (result.success) {
    window.location.href = 'index.html';
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById('orderModal');
  if (event.target === modal) {
    closeOrderModal();
  }
};

// Load orders on page load
document.addEventListener('DOMContentLoaded', loadOrders);
