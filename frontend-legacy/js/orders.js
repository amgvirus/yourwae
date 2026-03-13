let allOrders = [];
let currentFilter = 'all';

// Load orders
async function loadOrders() {
  await window.fastGetApp.authReadyPromise;

  if (!window.fastGetApp.currentUser) {
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
          <h3>Order #${order.order_number.slice(-6)}</h3>
          <p>${new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <div class="order-status">
          <span class="status-badge status-${order.status}">${order.status.replace('_', ' ').toUpperCase()}</span>
        </div>
      </div>

      <div class="order-details">
        <p><strong>Store:</strong> ${order.stores?.store_name || 'YourWae Store'}</p>
        <p><strong>Total:</strong> ₵${(order.total_amount || 0).toFixed(2)}</p>
      </div>

      <div class="order-footer-actions">
        <button class="btn btn-primary btn-sm" onclick="trackOrder('${order.id}', event)">Track Order</button>
        <button class="btn btn-outline btn-sm">View Details</button>
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
  // ... existing modal logic if still needed, but we'll focus on tracking
}

function trackOrder(orderId, event) {
  if (event) event.stopPropagation();
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;

  const modal = document.getElementById('trackingModal');
  const container = document.getElementById('trackingContent');

  const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
  const currentIdx = statuses.indexOf(order.status);

  container.innerHTML = `
        <div class="tracking-viz">
            <div class="tracking-header">
                <h3>Tracking Order #${order.order_number.slice(-6)}</h3>
                <p>Status: <span class="badge status-${order.status}">${order.status.replace('_', ' ')}</span></p>
            </div>
            
            <div class="tracking-timeline">
                ${statuses.map((s, i) => `
                    <div class="timeline-step ${i <= currentIdx ? 'active' : ''} ${i === currentIdx ? 'current' : ''}">
                        <div class="step-circle">${i < currentIdx ? '✓' : (i === currentIdx ? '●' : '')}</div>
                        <div class="step-label">${s.replace('_', ' ')}</div>
                    </div>
                `).join('<div class="timeline-line"></div>')}
            </div>

            <div class="delivery-estimate admin-card" style="margin-top: 30px;">
                <h4>🚚 Delivery Information</h4>
                <p>Estimated Arrival: <strong>${order.estimated_delivery_time ? new Date(order.estimated_delivery_time).toLocaleTimeString() : 'Calculating...'}</strong></p>
                <p>Delivery to: <strong>${order.delivery_address?.street || 'Default Address'}</strong></p>
            </div>
        </div>
    `;

  modal.style.display = 'block';
}

function closeTrackingModal() {
  document.getElementById('trackingModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById('orderModal');
  const trackingModal = document.getElementById('trackingModal');
  if (event.target === modal) closeOrderModal();
  if (event.target === trackingModal) closeTrackingModal();
};

// Load orders on page load
document.addEventListener('DOMContentLoaded', loadOrders);
