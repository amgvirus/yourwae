document.addEventListener('DOMContentLoaded', async () => {
    await window.fastGetApp.authReadyPromise;

    if (!window.fastGetApp.currentUser || window.fastGetApp.currentUserRole !== 'admin') {
        alert('Access denied. Admin only.');
        window.location.href = 'index.html';
        return;
    }

    loadStats();
    loadStores();
    loadUsers();
    loadOrders();
});

async function loadStats() {
    try {
        // Total Revenue
        const { data: orders, error: ordersError } = await window.supabaseClient
            .from('orders')
            .select('total_amount')
            .eq('status', 'delivered');

        if (orders) {
            const total = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
            document.getElementById('statRevenue').textContent = `₵${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        }

        // Active Orders
        const { count: orderCount } = await window.supabaseClient
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'delivered')
            .neq('status', 'cancelled');
        document.getElementById('statOrders').textContent = orderCount || 0;

        // Total Stores
        const { count: storeCount } = await window.supabaseClient
            .from('stores')
            .select('*', { count: 'exact', head: true });
        document.getElementById('statStores').textContent = storeCount || 0;

        // Total Users
        const { count: userCount } = await window.supabaseClient
            .from('users')
            .select('*', { count: 'exact', head: true });
        document.getElementById('statUsers').textContent = userCount || 0;

    } catch (error) {
        console.error('Stats error:', error);
    }
}

async function loadStores() {
    const { data: stores, error } = await window.supabaseClient
        .from('stores')
        .select('*, users!owner_id(email, first_name, last_name)')
        .order('created_at', { ascending: false });

    if (error) return;

    const tbody = document.getElementById('storesTableBody');
    tbody.innerHTML = stores.map(s => `
        <tr>
            <td><strong>${s.store_name}</strong></td>
            <td>${s.users?.first_name || 'Owner'} (${s.users?.email || 'N/A'})</td>
            <td>${s.category}</td>
            <td><span class="badge ${s.is_verified ? 'badge-success' : 'badge-warning'}">${s.is_verified ? 'Verified' : 'Pending'}</span></td>
            <td>
                ${!s.is_verified ? `<button class="btn btn-sm btn-primary" onclick="verifyStore('${s.id}')">Verify</button>` : ''}
                <button class="btn btn-sm btn-outline" onclick="toggleStoreStatus('${s.id}', ${s.is_active})">${s.is_active ? 'Disable' : 'Enable'}</button>
            </td>
        </tr>
    `).join('');
}

async function verifyStore(id) {
    if (!confirm('Approve this store?')) return;
    const { error } = await window.supabaseClient.from('stores').update({ is_verified: true }).eq('id', id);
    if (!error) loadStores();
}

async function toggleStoreStatus(id, currentStatus) {
    const { error } = await window.supabaseClient.from('stores').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) loadStores();
}

async function loadUsers() {
    const { data: users, error } = await window.supabaseClient
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return;

    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.first_name} ${u.last_name}</td>
            <td>${u.email}</td>
            <td><span class="badge ${u.role === 'admin' ? 'badge-danger' : (u.role === 'store' ? 'badge-warning' : 'badge-success')}">${u.role.toUpperCase()}</span></td>
            <td>${new Date(u.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="changeRole('${u.id}', '${u.role}')">Change Role</button>
            </td>
        </tr>
    `).join('');
}

async function changeRole(userId, currentRole) {
    const newRole = prompt(`Current role: ${currentRole}\nEnter new role (customer, store, admin):`, currentRole);
    if (!newRole || newRole === currentRole) return;
    const { error } = await window.supabaseClient.from('users').update({ role: newRole }).eq('id', userId);
    if (!error) loadUsers();
}

async function loadOrders() {
    const { data: orders, error } = await window.supabaseClient
        .from('orders')
        .select('*, users!customer_id(first_name, last_name), stores!store_id(store_name)')
        .limit(20)
        .order('created_at', { ascending: false });

    if (error) return;

    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>#${o.order_number.slice(-6)}</td>
            <td>${o.users?.first_name || 'Customer'}</td>
            <td>${o.stores?.store_name || 'Store'}</td>
            <td>₵${o.total_amount.toFixed(2)}</td>
            <td><span class="badge status-${o.status}">${o.status}</span></td>
        </tr>
    `).join('');
}

function switchTab(tab) {
    ['stores', 'users', 'orders'].forEach(t => {
        document.getElementById(`${t}Section`).style.display = t === tab ? 'block' : 'none';
        const btns = document.querySelectorAll('.tab-btn');
        btns.forEach(b => {
            if (b.textContent.toLowerCase().includes(t)) {
                b.classList.toggle('active', t === tab);
            }
        });
    });
}
