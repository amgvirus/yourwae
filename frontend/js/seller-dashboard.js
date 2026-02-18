document.addEventListener('DOMContentLoaded', async () => {
    await window.fastGetApp.authReadyPromise;

    if (!window.fastGetApp.currentUser || window.fastGetApp.currentUserRole !== 'store') {
        window.location.href = 'index.html';
        return;
    }

    loadDashboard();
});

let currentStore = null;

async function loadDashboard() {
    try {
        const user = window.fastGetApp.currentUser;

        // Get store details
        const { data: store, error: storeError } = await supabaseClient
            .from('stores')
            .select('*')
            .eq('owner_id', user.id)
            .single();

        if (storeError || !store) {
            console.error('Store fetch error:', storeError);
            document.getElementById('storeNameHeader').innerHTML =
                '<span style="color: red;">Error: Store not found.</span><br>' +
                'If you just signed up, your account might still be syncing. ' +
                'Please ensure you ran the <strong>latest SUPABASE_SETUP.sql</strong> and <strong>REPAIR_USERS.sql</strong>.';
            return;
        }

        currentStore = store;
        document.getElementById('storeNameHeader').textContent = `Manage: ${store.store_name} (${store.category})`;

        // Load data
        loadProducts();
        loadOrders();
        updateStats();
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

async function loadProducts() {
    const container = document.getElementById('productsContainer');
    const { data: products, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('store_id', currentStore.id)
        .order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = '<p>Error loading products.</p>';
        return;
    }

    document.getElementById('statProducts').textContent = products.length;

    if (products.length === 0) {
        container.innerHTML = '<p>No products yet. Add your first product!</p>';
        return;
    }

    container.innerHTML = products.map(p => `
    <div class="product-item">
      <img src="${p.image_url || 'https://via.placeholder.com/60'}" alt="${p.name}">
      <div class="product-info">
        <h4>${p.name}</h4>
        <p>₵${p.price.toFixed(2)} | Stock: ${p.stock_quantity}</p>
      </div>
      <div class="action-btns">
        <button class="btn btn-secondary btn-sm" onclick="editProduct('${p.id}')">Edit</button>
      </div>
    </div>
  `).join('');
}

async function loadOrders() {
    const container = document.getElementById('ordersContainer');
    const { data: orders, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('store_id', currentStore.id)
        .neq('status', 'delivered')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = '<p>Error loading orders.</p>';
        return;
    }

    document.getElementById('statOrders').textContent = orders.length;

    if (orders.length === 0) {
        container.innerHTML = '<p>No active orders.</p>';
        return;
    }

    container.innerHTML = orders.map(o => `
    <div class="order-item">
      <div class="order-header">
        <strong>#${o.order_number.slice(-6)}</strong>
        <span class="status-badge status-${o.status}">${o.status.toUpperCase()}</span>
      </div>
      <p style="font-size: 14px;">Amount: ₵${o.total_amount.toFixed(2)}</p>
      <div class="action-btns">
        ${o.status === 'pending' ? `<button class="btn btn-sm btn-primary" onclick="updateStatus('${o.id}', 'confirmed')">Confirm</button>` : ''}
        ${o.status === 'confirmed' ? `<button class="btn btn-sm btn-primary" onclick="updateStatus('${o.id}', 'packing')">Mark as Packing</button>` : ''}
        ${o.status === 'packing' ? `<button class="btn btn-sm btn-primary" onclick="updateStatus('${o.id}', 'ready')">Notify for Delivery</button>` : ''}
      </div>
    </div>
  `).join('');
}

async function updateStatus(orderId, nextStatus) {
    try {
        const { error } = await supabaseClient
            .from('orders')
            .update({ status: nextStatus })
            .eq('id', orderId);

        if (error) throw error;
        alert(`Order updated to ${nextStatus}!`);
        loadOrders();
        updateStats();
    } catch (err) {
        alert('Update failed: ' + err.message);
    }
}

async function updateStats() {
    const { data, error } = await supabaseClient
        .from('orders')
        .select('total_amount')
        .eq('store_id', currentStore.id)
        .eq('status', 'delivered');

    if (data) {
        const total = data.reduce((sum, o) => sum + Number(o.total_amount), 0);
        document.getElementById('statSales').textContent = `₵${total.toFixed(2)}`;
    }
}

// Modal Handlers
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');

    form.reset();
    document.getElementById('productId').value = '';

    if (productId) {
        title.textContent = 'Edit Product';
        // Logic to populate for edit would go here
    } else {
        title.textContent = 'Add New Product';
    }

    modal.classList.add('active');
}

function updateImagePreview(url) {
    const preview = document.getElementById('pImagePreview');
    preview.src = url || 'https://via.placeholder.com/150?text=No+Image';
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    updateImagePreview('');
}

async function handleProductSubmit(e) {
    e.preventDefault();

    if (!currentStore) {
        alert('Missing store information. Please complete store registration.');
        return;
    }

    const formData = {
        name: document.getElementById('pName').value,
        description: document.getElementById('pDesc').value,
        price: Number(document.getElementById('pPrice').value),
        stock_quantity: Number(document.getElementById('pStock').value),
        image_url: document.getElementById('pImage').value || 'https://via.placeholder.com/150?text=Product',
        store_id: currentStore.id,
        is_active: true
    };

    try {
        const { error } = await supabaseClient
            .from('products')
            .insert([formData]);

        if (error) throw error;
        alert('Product added successfully!');
        closeProductModal();
        loadProducts();
    } catch (err) {
        alert('Error saving product: ' + err.message);
    }
}
