// Supabase Configuration
const SUPABASE_URL = 'https://dzphgpikqxfeiautsnbm.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'sb_publishable_twMoDMVTH-QJY_jIiZIpQQ_0IA8M1bk'; // Replace with your Supabase anon key

// Initialize Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication State
let currentUser = null;
let currentUserRole = null;
let authInitialized = false;
let authReadyPromiseResolver;
const authReadyPromise = new Promise(resolve => {
  authReadyPromiseResolver = resolve;
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  setupAuthListener(); // Start listening early
  await checkAuthStatus();
  initMobileMenu();
});

// Setup reactive auth listener
function setupAuthListener() {
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth event:', event);
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (session?.user) {
        currentUser = session.user;
        window.currentUser = session.user;
        await fetchUserRole(session.user.id);
        updateUIForLoggedInUser();
      }
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      window.currentUser = null;
      currentUserRole = null;
      updateUIForLoggedOutUser();
    }
  });
}

// Fetch user role separately
async function fetchUserRole(userId) {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (data) {
      currentUserRole = data.role;
    } else {
      console.error(`User profile missing in public.users for ID: ${userId}`);
    }
  } catch (error) {
    console.warn('Could not fetch user role:', error);
  }
}

// Check authentication status
async function checkAuthStatus() {
  try {
    // Try fast session check first
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session?.user) {
      currentUser = session.user;
      window.currentUser = session.user;
      updateUIForLoggedInUser();
      await fetchUserRole(session.user.id);
      updateUIForLoggedInUser();
    } else {
      // If no session, try definitive check (can restore session if cookies exist)
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        currentUser = user;
        window.currentUser = user;
        updateUIForLoggedInUser();
        await fetchUserRole(user.id);
        updateUIForLoggedInUser();
      } else {
        updateUIForLoggedOutUser();
      }
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    updateUIForLoggedOutUser();
  } finally {
    authInitialized = true;
    if (authReadyPromiseResolver) authReadyPromiseResolver();
  }
}

// ============== MOBILE MENU ==============
function initMobileMenu() {
  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('menuOverlay');
  const hamburger = document.getElementById('hamburgerBtn');

  if (menu && overlay) {
    const isActive = menu.classList.contains('active');
    if (isActive) {
      closeMobileMenu();
    } else {
      menu.classList.add('active');
      overlay.classList.add('active');
      if (hamburger) hamburger.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('menuOverlay');
  const hamburger = document.getElementById('hamburgerBtn');

  if (menu) menu.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  if (hamburger) hamburger.classList.remove('active');
  document.body.style.overflow = '';
}




// Signup function
async function signup(email, password, firstName, lastName, phone, role = 'customer', storeName = '', storeCategory = '') {
  try {
    // Create auth user with metadata (trigger will handle public.users, wallets, and stores)
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          role: role,
          store_name: storeName,
          store_category: storeCategory
        }
      }
    });


    if (authError) throw authError;

    currentUser = authData.user;
    window.currentUser = authData.user; // Sync
    currentUserRole = role;

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: error.message };
  }
}

// Login function
async function login(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    currentUser = data.user;
    window.currentUser = data.user; // Sync

    // Get user role
    const { data: userData } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (userData) {
      currentUserRole = userData.role;
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

// Logout function
async function logout() {
  try {
    await supabaseClient.auth.signOut();
    currentUser = null;
    window.currentUser = null; // Sync
    currentUserRole = null;
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
}


// Get all stores
async function getStores(limit = 20, offset = 0) {
  try {
    const { data, error } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true)
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching stores:', error);
    return { success: false, error: error.message };
  }
}

// Get store by ID
async function getStoreById(storeId) {
  try {
    const { data, error } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching store:', error);
    return { success: false, error: error.message };
  }
}

// Get products by store
async function getProductsByStore(storeId, limit = 50) {
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: error.message };
  }
}

// Search products
async function searchProducts(query) {
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(50);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error searching products:', error);
    return { success: false, error: error.message };
  }
}

// Add to cart
async function addToCart(productId, quantity, selectedVariations = {}) {
  try {
    if (!currentUser) {
      return { success: false, error: 'User not logged in' };
    }

    // Check if item already in cart with SAME variations
    const { data: existingItem } = await supabaseClient
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', currentUser.id)
      .eq('product_id', productId)
      .eq('selected_variations', JSON.stringify(selectedVariations))
      .maybeSingle();

    if (existingItem) {
      // Update quantity
      const { error } = await supabaseClient
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);

      if (error) throw error;
    } else {
      // Insert new item
      const { error } = await supabaseClient
        .from('cart_items')
        .insert([
          {
            user_id: currentUser.id,
            product_id: productId,
            quantity,
            selected_variations: selectedVariations
          },
        ]);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, error: error.message };
  }
}

// Update cart item quantity
async function updateCartItemQuantity(cartItemId, newQuantity) {
  try {
    if (newQuantity < 1) return removeFromCart(cartItemId);

    const { error } = await supabaseClient
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', cartItemId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return { success: false, error: error.message };
  }
}


// Get cart items
async function getCartItems() {
  try {
    if (!currentUser) {
      return { success: false, error: 'User not logged in' };
    }

    const { data, error } = await supabaseClient
      .from('cart_items')
      .select(`
        *,
        products:product_id (*)
      `)
      .eq('user_id', currentUser.id);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { success: false, error: error.message };
  }
}

// Remove from cart
async function removeFromCart(cartItemId) {
  try {
    const { error } = await supabaseClient
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { success: false, error: error.message };
  }
}

// Clear cart
async function clearCart() {
  try {
    if (!currentUser) {
      return { success: false, error: 'User not logged in' };
    }

    const { error } = await supabaseClient
      .from('cart_items')
      .delete()
      .eq('user_id', currentUser.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, error: error.message };
  }
}

// Delivery Fee Mapping
const DELIVERY_FEE_MAPPING = {
  'hohoe': 7.00,
  'dzodze': 7.00,
  'anloga': 7.00,
  'akpafu': 20.00,
  'sanko': 15.00,
  'likpe': 20.00,
  'lolobi': 20.00,
  'fodome': 20.00,
  'wli': 22.00,
  've': 25.00,
  'alavanyo': 20.00
};

// Calculate delivery fee
function calculateDeliveryFee(townName) {
  if (!townName) return 7.00;
  const townKey = townName.toLowerCase().trim();
  return DELIVERY_FEE_MAPPING[townKey] || 7.00; // Default to 7.00 if unknown
}



// Create order
async function createOrder(storeId, deliveryAddress, paymentMethod, specialInstructions = '') {
  try {
    if (!currentUser) {
      return { success: false, error: 'User not logged in' };
    }

    // Get cart items
    const { data: cartItems, error: cartError } = await supabaseClient
      .from('cart_items')
      .select(`
        *,
        products:product_id (*)
      `)
      .eq('user_id', currentUser.id)
      .eq('products.store_id', storeId);

    if (cartError) throw cartError;
    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // Get store details
    const { data: store, error: storeError } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (storeError) throw storeError;

    // Calculate totals
    let subtotal = 0;
    const items = cartItems.map(item => {
      const itemTotal = item.products.price * item.quantity;
      subtotal += itemTotal;
      return {
        product_id: item.product_id,
        product_name: item.products.name,
        quantity: item.quantity,
        price: item.products.price,
        selected_variations: item.selected_variations,
        discount: item.products.discount || 0,
      };
    });

    const deliveryFee = calculateDeliveryFee(deliveryAddress.city);

    const totalAmount = subtotal + deliveryFee;

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert([
        {
          order_number: `FG-${Date.now()}`,
          customer_id: currentUser.id,
          store_id: storeId,
          items,
          subtotal,
          tax: 0, // Tax removed
          delivery_fee: deliveryFee,
          total_amount: totalAmount,
          delivery_address: deliveryAddress,
          payment_method: paymentMethod,
          special_instructions: specialInstructions,
          status: 'pending',
        },
      ])
      .select('*')
      .single();


    if (orderError) throw orderError;

    // Clear cart
    await clearCart();

    return { success: true, order };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message };
  }
}

// Get user orders
async function getUserOrders() {
  try {
    if (!currentUser) {
      return { success: false, error: 'User not logged in' };
    }

    const { data, error } = await supabaseClient
      .from('orders')
      .select(`
        *,
        stores:store_id (store_name),
        deliveries (*)
      `)
      .eq('customer_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, error: error.message };
  }
}

// Process payment (Stripe integration)
async function processPayment(orderId, amount, paymentMethodId) {
  try {
    // This would call a backend function to process Stripe payment
    // For now, returning a mock response
    const { data, error } = await supabaseClient
      .from('payments')
      .insert([
        {
          order_id: orderId,
          customer_id: currentUser.id,
          amount,
          currency: 'GHS',
          payment_method: 'card',
          transaction_id: `TXN-${Date.now()}`,
          status: 'completed',
          metadata: {
            stripe_payment_method_id: paymentMethodId,
          },
        },
      ])
      .select('*')
      .single();

    if (error) throw error;

    // Update order payment status
    await supabaseClient
      .from('orders')
      .update({ payment_status: 'completed' })
      .eq('id', orderId);

    return { success: true, payment: data };
  } catch (error) {
    console.error('Error processing payment:', error);
    return { success: false, error: error.message };
  }
}

// Get delivery tracking
async function getDeliveryTracking(orderId) {
  try {
    const { data, error } = await supabaseClient
      .from('deliveries')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching delivery:', error);
    return { success: false, error: error.message };
  }
}

// Calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userMenu = document.getElementById('userMenu');

  if (loginBtn) loginBtn.style.display = 'none';
  if (logoutBtn) logoutBtn.style.display = 'block';
  if (userMenu) userMenu.style.display = 'flex';

  // Role-based button update in navbar
  const myOrdersBtn = userMenu?.querySelector('button:first-child');
  if (myOrdersBtn) {
    if (currentUserRole === 'store') {
      myOrdersBtn.textContent = 'Store Dashboard';
      myOrdersBtn.onclick = () => window.location.href = 'seller-dashboard.html';
    } else {
      myOrdersBtn.textContent = 'My Orders';
      myOrdersBtn.onclick = () => window.location.href = 'orders.html';
    }
  }

  // Mobile menu updates
  const mobileLoginLink = document.getElementById('mobileLoginLink');
  const mobileLogoutItem = document.getElementById('mobileLogoutItem');
  const mobileUserName = document.getElementById('mobileUserName');
  const mobileUserEmail = document.getElementById('mobileUserEmail');
  const bottomNavAccount = document.getElementById('bottomNavAccount');

  if (mobileLoginLink) mobileLoginLink.parentElement.style.display = 'none';
  if (mobileLogoutItem) mobileLogoutItem.style.display = 'block';

  // Update mobile menu "My Orders" link based on role
  const mobileOrdersLink = document.querySelector('.mobile-menu-links a[href="orders.html"]');
  if (mobileOrdersLink) {
    if (currentUserRole === 'store') {
      mobileOrdersLink.innerHTML = '<span class="menu-icon">🏪</span> Store Dashboard';
      mobileOrdersLink.href = 'seller-dashboard.html';
    } else {
      mobileOrdersLink.innerHTML = '<span class="menu-icon">📦</span> My Orders';
      mobileOrdersLink.href = 'orders.html';
    }
  }

  if (mobileUserName && currentUser) {
    mobileUserName.textContent = currentUser.email ? currentUser.email.split('@')[0] : 'User';
  }
  if (mobileUserEmail && currentUser) {
    mobileUserEmail.textContent = currentUser.email || '';
  }

  if (bottomNavAccount) {
    if (currentUserRole === 'store') {
      bottomNavAccount.href = 'seller-dashboard.html';
      bottomNavAccount.querySelector('span:last-child').textContent = 'Dashboard';
    } else {
      bottomNavAccount.href = 'orders.html';
      bottomNavAccount.querySelector('span:last-child').textContent = 'Orders';
    }
  }
}


// Update UI for logged out user
function updateUIForLoggedOutUser() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userMenu = document.getElementById('userMenu');

  if (loginBtn) loginBtn.style.display = 'block';
  if (logoutBtn) logoutBtn.style.display = 'none';
  if (userMenu) userMenu.style.display = 'none';

  // Mobile menu updates
  const mobileLoginLink = document.getElementById('mobileLoginLink');
  const mobileLogoutItem = document.getElementById('mobileLogoutItem');
  const mobileUserName = document.getElementById('mobileUserName');
  const mobileUserEmail = document.getElementById('mobileUserEmail');
  const bottomNavAccount = document.getElementById('bottomNavAccount');

  if (mobileLoginLink) mobileLoginLink.parentElement.style.display = 'block';
  if (mobileLogoutItem) mobileLogoutItem.style.display = 'none';
  if (mobileUserName) mobileUserName.textContent = 'Welcome';
  if (mobileUserEmail) mobileUserEmail.textContent = 'Sign in to your account';
  if (bottomNavAccount) {
    bottomNavAccount.href = 'login.html';
    bottomNavAccount.querySelector('span:last-child').textContent = 'Account';
  }
}

// Export functions
window.fastGetApp = {
  signup,
  login,
  logout,
  getStores,
  getStoreById,
  getProductsByStore,
  searchProducts,
  addToCart,
  getCartItems,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  createOrder,

  getUserOrders,
  processPayment,
  getDeliveryTracking,
  calculateDistance,
  checkAuthStatus,
  authReadyPromise,
  get currentUser() { return currentUser; },
  get currentUserRole() { return currentUserRole; },
  getStoreInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
};


