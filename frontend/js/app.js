// ============================================================
// Supabase Configuration
// ⚠️  IMPORTANT: Replace SUPABASE_ANON_KEY with your real key.
// Get it from: Supabase Dashboard → Project Settings → API
//              → Project API keys → "anon public"
// The key MUST start with "eyJ..." (it is a JWT).
// ============================================================
const SUPABASE_URL = 'https://dzphgpikqxfeiautsnbm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_twMoDMVTH-QJY_jIiZIpQQ_0IA8M1bk'; // ← REPLACE THIS

// Validate key format before initialising
if (!SUPABASE_ANON_KEY.startsWith('eyJ')) {
  console.error(
    '%c⛔ YOURWAE CONFIG BROKEN — Invalid Supabase anon key! %c\n\n' +
    'The key currently set in app.js is:\n  "' + SUPABASE_ANON_KEY + '"\n\n' +
    'This is NOT a valid Supabase JWT key. It looks like a Stripe key.\n' +
    'A valid Supabase key starts with "eyJ...".\n\n' +
    'Fix: Go to Supabase Dashboard → Project Settings → API\n' +
    '     Copy the "anon public" key and paste it into app.js line 9.',
    'background:#c0392b;color:#fff;font-size:14px;padding:4px 8px;border-radius:4px;',
    'color:inherit;'
  );
  // Optional: alert the user once per session if the key is broken
  if (!sessionStorage.getItem('notified_broken_key')) {
    setTimeout(() => {
      alert('⚠️ Critical Configuration Error: The Supabase API key in app.js is invalid. Stores and data will not load correctly.');
      sessionStorage.setItem('notified_broken_key', '1');
    }, 1000);
  }
}

// Initialize Supabase
const { createClient } = supabase;
let supabaseClient;
try {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (initErr) {
  console.error('Supabase createClient failed:', initErr.message);
  // Create a stub client so downstream code doesn't throw ReferenceErrors
  supabaseClient = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: new Error('Supabase not initialised — check anon key') }),
      getUser: async () => ({ data: { user: null }, error: new Error('Supabase not initialised — check anon key') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not initialised — check anon key in app.js') }),
      signUp: async () => ({ data: null, error: new Error('Supabase not initialised — check anon key in app.js') }),
      signOut: async () => ({}),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    },
    from: () => ({
      select: function () { return this; },
      eq: function () { return this; },
      single: async () => ({ data: null, error: new Error('Supabase not initialised') }),
      insert: async () => ({ data: null, error: new Error('Supabase not initialised') }),
      update: async () => ({ data: null, error: new Error('Supabase not initialised') }),
      delete: async () => ({ data: null, error: new Error('Supabase not initialised') }),
      maybeSingle: async () => ({ data: null, error: null }),
      range: function () { return this; },
      or: function () { return this; },
      limit: function () { return this; },
      order: function () { return this; },
    }),
  };
}

// Normalization helper (can stay)
function normalizeData(item) {
  if (!item) return null;
  // Map camelCase (REST API) to snake_case (App logic/Supabase)
  return {
    ...item,
    store_name: item.storeName || item.store_name,
    store_description: item.storeDescription || item.store_description,
    store_image: item.storeImage || item.store_image,
    operating_hours: item.operatingHours || item.operating_hours,
    base_delivery_fee: item.baseDeliveryFee || item.base_delivery_fee,
    delivery_fee_per_km: item.deliveryFeePerKm || item.delivery_fee_per_km,
    minimum_order_value: item.minimumOrderValue || item.minimum_order_value,
    total_reviews: item.totalReviews || item.total_reviews,
    is_verified: item.isVerified !== undefined ? item.isVerified : item.is_verified,
    is_active: item.isActive !== undefined ? item.isActive : item.is_active,
  };
}

// Authentication & App State
let currentUser = null;
let currentUserRole = null;
let authInitialized = false;
let authReadyPromiseResolver;
const authReadyPromise = new Promise(resolve => {
  authReadyPromiseResolver = resolve;
});


// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  setupAuthListener();
  // Resolve authReadyPromise within 6s even if checkAuthStatus hangs (e.g. Supabase unreachable)
  const timeoutMs = 6000;
  const timeoutPromise = new Promise(resolve => setTimeout(() => {
    console.warn('Auth check timed out, resolving anyway');
    if (authReadyPromiseResolver) authReadyPromiseResolver();
    resolve();
  }, timeoutMs));
  await Promise.race([checkAuthStatus(), timeoutPromise]);
  initMobileMenu();
});

// ============== AUTH STATE Management ==============
// (Variables defined at top of file)

// Setup reactive auth listener
function setupAuthListener() {
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user;
    console.log(`[AUTH v1.3] Event: ${event} | User: ${user?.email || 'none'}`);

    if (user) {
      currentUser = user;
      window.currentUser = user;
      if (user.user_metadata?.role) {
        currentUserRole = user.user_metadata.role;
      }

      // Update UI immediately with metadata role
      console.log('[AUTH v1.3] Updating UI (metadata role)');
      refreshAuthUI();

      // Fetch DB role in background
      fetchUserRole(user.id).then(role => {
        if (role) {
          console.log('[AUTH v1.3] Role updated from DB:', role);
          refreshAuthUI();
        }
      });
    } else if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !user)) {
      console.log('[AUTH v1.3] No user found, clearing state');
      currentUser = null;
      window.currentUser = null;
      currentUserRole = null;
      refreshAuthUI();
    }

    // Always resolve promise on first session event
    if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
      authInitialized = true;
      if (authReadyPromiseResolver) authReadyPromiseResolver();
    }
  });
}

// Global UI Sync function
function refreshAuthUI() {
  console.log('[AUTH v1.3] refreshAuthUI | currentUser:', !!currentUser);
  if (currentUser) {
    updateUIForLoggedInUser();
  } else {
    updateUIForLoggedOutUser();
  }

  // Apply "auto-visibility" classes
  const loggedInOnly = document.querySelectorAll('.auth-user-only');
  const loggedOutOnly = document.querySelectorAll('.auth-guest-only');

  loggedInOnly.forEach(el => el.style.display = currentUser ? '' : 'none');
  loggedOutOnly.forEach(el => el.style.display = currentUser ? 'none' : '');
}


// Fetch user role separately (with retry for trigger delay)
async function fetchUserRole(userId, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn(`fetchUserRole attempt ${attempt}/${retries} error:`, error.message);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
      }

      if (data) {
        currentUserRole = data.role;
        return data.role;
      } else {
        console.warn(`User profile not yet in public.users for ID: ${userId} (attempt ${attempt})`);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
      }
    } catch (error) {
      console.warn(`fetchUserRole attempt ${attempt} exception:`, error);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }
  // Fallback: use role from auth metadata if DB fetch keeps failing
  if (currentUser?.user_metadata?.role) {
    console.warn('Using role from user_metadata as fallback:', currentUser.user_metadata.role);
    currentUserRole = currentUser.user_metadata.role;
    return currentUserRole;
  }
  return null;
}

// Check authentication status
async function checkAuthStatus() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const user = session?.user;

    if (user) {
      console.log('[AUTH v1.3] checkAuthStatus found user:', user.email);
      currentUser = user;
      window.currentUser = user;
      if (user.user_metadata?.role) {
        currentUserRole = user.user_metadata.role;
      }
      refreshAuthUI();

      // Secondary background role fetch
      fetchUserRole(user.id).then(() => refreshAuthUI());
    } else {
      // Only clear if we definitely don't have a user from the listener
      if (!currentUser) {
        console.log('[AUTH v1.3] checkAuthStatus: no session');
        refreshAuthUI();
      }
    }
  } catch (error) {
    console.error('[AUTH v1.3] Error checking auth status:', error);
  } finally {
    authInitialized = true;
    if (authReadyPromiseResolver) authReadyPromiseResolver();

    // Watchdog: ensures navbar matches state after 2 seconds (catches slow DOM loads)
    setTimeout(() => {
      console.log('[AUTH v1.3] Watchdog check');
      refreshAuthUI();
    }, 2000);
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

    if (authError) {
      // Check for "User already registered" error
      if (authError.message && authError.message.toLowerCase().includes('already registered')) {
        return { success: false, error: 'This email is already registered. Please log in instead.', alreadyRegistered: true };
      }
      throw authError;
    }

    // Supabase may return user but no session (email confirmation mode)
    // Auto-login the user with their credentials right after signup
    if (authData.user && !authData.session) {
      console.log('Signup: No session returned. Attempting auto-login...');

      // Wait a moment for the user to be fully created
      await new Promise(r => setTimeout(r, 1500));

      // Try to login with the same credentials
      const loginResult = await login(email, password);
      if (loginResult.success) {
        console.log('Auto-login after signup succeeded');
        currentUserRole = role; // Ensure role is set to what they selected
        return { success: true, user: loginResult.user, role: role };
      } else {
        // If auto-login fails, it might need email confirmation
        console.warn('Auto-login failed:', loginResult.error);
        if (loginResult.error && loginResult.error.toLowerCase().includes('email not confirmed')) {
          return { success: true, user: authData.user, needsConfirmation: true };
        }
        // Still consider signup successful, just redirect to login
        return { success: true, user: authData.user, needsConfirmation: true };
      }
    }

    currentUser = authData.user;
    window.currentUser = authData.user;
    currentUserRole = role;

    // Wait for the database trigger to complete, then verify user row exists
    await new Promise(r => setTimeout(r, 2000));
    await fetchUserRole(authData.user.id, 3);

    return { success: true, user: authData.user, role: role };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: error.message };
  }
}

// Login function
async function login(email, password) {
  try {
    console.log('Attempting login for:', email);
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase Login Error:', JSON.stringify(error));
      throw error;
    }

    console.log('Login success, user id:', data.user?.id);

    currentUser = data.user;
    window.currentUser = data.user;

    // Fetch role (with timeout - don't block login for slow DB)
    const rolePromise = fetchUserRole(data.user.id, 3);
    const roleTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Role fetch timeout')), 5000)
    );
    let fetchedRole = null;
    try {
      fetchedRole = await Promise.race([rolePromise, roleTimeout]);
    } catch (_) {
      console.warn('fetchUserRole timed out or failed, using metadata');
    }

    if (!fetchedRole) {
      // Last resort fallback: use metadata role
      const metaRole = data.user.user_metadata?.role;
      if (metaRole) {
        console.warn('Using metadata role as final fallback:', metaRole);
        currentUserRole = metaRole;
      } else {
        console.warn('No role found anywhere, defaulting to customer');
        currentUserRole = 'customer';
      }
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Login Error:', error.message || error);
    return { success: false, error: error.message };
  }
}

// Logout function
async function logout() {
  try {
    await supabaseClient.auth.signOut();
    currentUser = null;
    window.currentUser = null;
    currentUserRole = null;
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
}

// Global logout handler — called by onclick="handleLogout()" in every page's HTML
async function handleLogout() {
  console.log('[AUTH v1.3] handleLogout triggered');
  try {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Logging out...';
    }

    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;

    currentUser = null;
    window.currentUser = null;
    currentUserRole = null;

    console.log('[AUTH v1.3] Logout success, redirecting...');
    window.location.href = 'login.html';
  } catch (error) {
    console.error('[AUTH v1.3] Logout error:', error);
    alert('Could not sign out: ' + (error.message || 'Server error'));

    // Reset button
    const btn = document.getElementById('logoutBtn');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Logout';
    }
  }
}
window.handleLogout = handleLogout; // Explicit global



// Get all stores
async function getStores(limit = 20, offset = 0) {
  try {
    console.log('Fetching stores from Supabase...');
    console.log('Using URL:', SUPABASE_URL);

    // First try without filters to check basic connectivity
    const { data, error, status, statusText } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase getStores error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        httpStatus: status
      });

      // If RLS or permissions issue, try fetching without verified filter
      if (error.code === '42501' || error.message?.includes('permission')) {
        console.log('Permission error - trying broader query...');
        const { data: fallbackData, error: fallbackError } = await supabaseClient
          .from('stores')
          .select('*')
          .range(offset, offset + limit - 1);

        if (!fallbackError && fallbackData) {
          console.log('Fallback query succeeded:', fallbackData.length, 'stores');
          return { success: true, data: (fallbackData || []).map(normalizeData) };
        }
      }

      // Fallback to REST API
      if (typeof storeAPI !== 'undefined') {
        console.log('Trying REST API fallback for stores...');
        const apiData = await storeAPI.getAllStores();
        return { success: true, data: apiData.map(normalizeData) };
      }
      throw error;
    }

    console.log('Successfully fetched stores:', data?.length || 0);
    return { success: true, data: (data || []).map(normalizeData) };
  } catch (error) {
    console.error('getStores Error:', error.message || error);
    return { success: false, error: error.message || 'Failed to load stores. Check browser console (F12) for details.' };
  }
}

// Get store by ID
async function getStoreById(storeId) {
  try {
    console.log('Fetching store details for:', storeId);
    const { data, error } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (error) {
      console.warn('Supabase getStoreById failed:', error);
      // Fallback to REST API
      if (typeof storeAPI !== 'undefined') {
        console.log('Trying REST API fallback for store details...');
        const apiData = await storeAPI.getStoreById(storeId);
        return { success: true, data: normalizeData(apiData) };
      }
      throw error;
    }

    return { success: true, data: normalizeData(data) };
  } catch (error) {
    console.error('Comprehensive getStoreById Error:', error);
    return { success: false, error: error.message };
  }
}

// Get products by store
async function getProductsByStore(storeId, limit = 50) {
  try {
    console.log('Fetching products for store:', storeId);
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .limit(limit);

    if (error) {
      console.error('Supabase getProductsByStore Error:', error);
      throw error;
    }

    console.log('Successfully fetched products:', data?.length || 0);
    return { success: true, data };
  } catch (error) {
    console.error('Comprehensive getProductsByStore Error:', error);
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

// Local Storage for selected town
const townManager = {
  setSelectedTown(townId, townName) {
    localStorage.setItem('selectedTown', JSON.stringify({ id: townId, name: townName }));
  },

  getSelectedTown() {
    const town = localStorage.getItem('selectedTown');
    return town ? JSON.parse(town) : null;
  },

  clearSelectedTown() {
    localStorage.removeItem('selectedTown');
  },
};

// Towns List (Standardized)
const TOWNS = [
  { id: 'hohoe', name: 'Hohoe' },
  { id: 'dzodze', name: 'Dzodze' },
  { id: 'anloga', name: 'Anloga' },
  { id: 'akpafu', name: 'Akpafu' },
  { id: 'sanko', name: 'Sanko' },
  { id: 'likpe', name: 'Likpe' },
  { id: 'lolobi', name: 'Lolobi' },
  { id: 'fodome', name: 'Fodome' },
  { id: 'wli', name: 'Wli' },
  { id: 've', name: 'Ve' },
  { id: 'alavanyo', name: 'Alavanyo' }
];

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

  console.log('[AUTH] updateUIForLoggedInUser() called | loginBtn:', !!loginBtn, '| userMenu:', !!userMenu, '| role:', currentUserRole);

  if (loginBtn) loginBtn.style.display = 'none';
  if (logoutBtn) logoutBtn.style.display = 'block';
  if (userMenu) userMenu.style.display = 'flex';

  // Hide any signup buttons if they exist
  const signupBtns = document.querySelectorAll('.btn-signup, .signup-link');
  signupBtns.forEach(btn => btn.style.display = 'none');

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

  if (mobileLoginLink?.parentElement) mobileLoginLink.parentElement.style.display = 'none';
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
    const label = bottomNavAccount.querySelector('span:last-child');
    if (currentUserRole === 'store') {
      bottomNavAccount.href = 'seller-dashboard.html';
      if (label) label.textContent = 'Dashboard';
    } else {
      bottomNavAccount.href = 'orders.html';
      if (label) label.textContent = 'Orders';
    }
  }

  // Final cleanup: ensure "Login" text is gone from any generic buttons
  document.querySelectorAll('.nav-btn, .nav-link').forEach(el => {
    if (el.textContent.includes('Login') && !currentUser) {
      // stays visible
    } else if (el.textContent.includes('Login') && currentUser) {
      if (el.id !== 'loginBtn') el.style.display = 'none';
    }
  });
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

  if (mobileLoginLink?.parentElement) mobileLoginLink.parentElement.style.display = 'block';
  if (mobileLogoutItem) mobileLogoutItem.style.display = 'none';
  if (mobileUserName) mobileUserName.textContent = 'Welcome';
  if (mobileUserEmail) mobileUserEmail.textContent = 'Sign in to your account';
  if (bottomNavAccount) {
    bottomNavAccount.href = 'login.html';
    const label = bottomNavAccount.querySelector('span:last-child');
    if (label) label.textContent = 'Account';
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
  calculateDeliveryFee,
  checkAuthStatus,
  authReadyPromise,
  townManager,
  getTowns: () => TOWNS,
  get currentUser() { return currentUser; },
  get currentUserRole() { return currentUserRole; },
  getStoreInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
};


