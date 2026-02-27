let currentStoreId = null;
let currentStore = null;
let allProducts = [];
let filteredProducts = [];
let selectedProduct = null;

// Get store ID from URL
function getStoreIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Load store details
async function loadStore() {
  currentStoreId = getStoreIdFromURL();

  if (!currentStoreId) {
    window.location.href = 'stores.html';
    return;
  }

  const result = await window.fastGetApp.getStoreById(currentStoreId);

  if (result.success) {
    const store = result.data;
    currentStore = store;
    displayStoreDetails(store);
    loadProducts();
  } else {
    document.getElementById('storeName').textContent = 'Store Not Found';
    console.error('Error loading store:', result.error);
  }
}


// Display store details
function displayStoreDetails(store) {
  document.getElementById('storeName').textContent = store.store_name;
  document.getElementById('storeCategory').textContent = store.category;

  const img = document.getElementById('storeImage');
  if (store.store_image) {
    img.src = store.store_image;
    img.style.display = 'block';
    if (document.getElementById('storeInitials')) document.getElementById('storeInitials').style.display = 'none';
  } else {
    img.style.display = 'none';
    let initialsDiv = document.getElementById('storeInitials');
    if (!initialsDiv) {
      initialsDiv = document.createElement('div');
      initialsDiv.id = 'storeInitials';
      initialsDiv.className = 'store-initials-logo';
      img.parentNode.insertBefore(initialsDiv, img);
    }
    initialsDiv.style.display = 'flex';
    initialsDiv.textContent = window.fastGetApp.getStoreInitials(store.store_name);
  }

  document.getElementById('storeRating').innerHTML = `${'⭐'.repeat(Math.floor(store.rating || 0))} (${store.rating || 0})`;
  document.getElementById('storeReviews').textContent = `${store.total_reviews} reviews`;
  document.getElementById('storeAddress').textContent = store.address?.street || 'Address unavailable';

  // Dynamic delivery fee GH₵
  const selectedTown = window.fastGetApp.townManager.getSelectedTown();
  const fee = window.fastGetApp.calculateDeliveryFee(selectedTown?.id);
  document.getElementById('deliveryFee').textContent = `₵${fee.toFixed(2)}`;

  document.getElementById('minOrder').textContent = `₵${store.minimum_order_value}`;
  document.getElementById('deliveryRadius').textContent = `${store.delivery_radius} km`;
}


// Load products
async function loadProducts() {
  const result = await window.fastGetApp.getProductsByStore(currentStoreId);

  if (result.success) {
    allProducts = result.data;
    filteredProducts = [...allProducts];
    displayProducts();
  } else {
    document.getElementById('productsContainer').innerHTML =
      `<p style="grid-column: 1/-1; text-align: center; color: red;">Error loading products: ${result.error}</p>`;
  }
}

// Display products
function displayProducts() {
  const container = document.getElementById('productsContainer');

  if (filteredProducts.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No products found</p>';
    return;
  }

  container.innerHTML = filteredProducts.map(product => `
    <div class="product-card" onclick="openProductModal('${product.id}')">
      <div style="position: relative;">
        <img src="${(product.images && product.images[0]) || 'https://via.placeholder.com/150'}" alt="${product.name}">
        ${product.discount ? `<span class="discount-badge">-${product.discount}%</span>` : ''}
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="product-price">
          <span class="price">₵${product.price ? product.price.toFixed(2) : '0.00'}</span>
          ${product.original_price ? `<span class="original">₵${product.original_price.toFixed(2)}</span>` : ''}
        </div>
        <div class="product-rating">
          <span>${'⭐'.repeat(Math.floor(product.rating || 0))}</span>
          <span class="review-count">(${product.total_reviews || 0})</span>
        </div>
        <p class="stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}" style="font-size: 11px; margin-top: 4px; color: ${product.stock > 0 ? '#28a745' : '#dc3545'};">
          ${product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
        </p>
        <button class="btn btn-primary btn-sm add-to-cart-btn" onclick="directAddToCart('${product.id}', event)" ${product.stock <= 0 ? 'disabled' : ''}>
          Add to Cart
        </button>
      </div>
    </div>
  `).join('');


}

let selectedVariations = {};

// Open product modal
function openProductModal(productId) {
  selectedProduct = allProducts.find(p => p.id === productId);

  if (!selectedProduct) return;

  document.getElementById('modalImage').src = selectedProduct.images?.[0] || 'https://via.placeholder.com/300';
  document.getElementById('modalProductName').textContent = selectedProduct.name;
  document.getElementById('modalProductDescription').textContent = selectedProduct.description;
  document.getElementById('modalPrice').textContent = `₵${selectedProduct.price.toFixed(2)}`;
  document.getElementById('modalOriginalPrice').textContent = selectedProduct.original_price ?
    `₵${selectedProduct.original_price.toFixed(2)}` : '';
  document.getElementById('modalDiscount').textContent = selectedProduct.discount ?
    `${selectedProduct.discount}% off` : '';
  document.getElementById('modalStock').textContent = selectedProduct.stock > 0 ?
    `${selectedProduct.stock} in stock` : 'Out of stock';
  document.getElementById('modalQuantity').value = 1;
  document.getElementById('modalQuantity').max = selectedProduct.stock;

  // Render variations
  renderModalVariations();

  document.getElementById('productModal').style.display = 'block';
}

function renderModalVariations() {
  const container = document.getElementById('modalVariations');
  container.innerHTML = '';
  selectedVariations = {};

  if (!selectedProduct.variations || selectedProduct.variations.length === 0) return;

  selectedProduct.variations.forEach(v => {
    const div = document.createElement('div');
    div.className = 'variation-group';
    div.innerHTML = `<h4>Select ${v.name}</h4>`;

    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'variation-options';

    v.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'variation-btn';
      btn.textContent = opt;
      btn.onclick = () => {
        // Deselect others
        optionsDiv.querySelectorAll('.variation-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedVariations[v.name] = opt;
      };
      optionsDiv.appendChild(btn);
    });

    div.appendChild(optionsDiv);
    container.appendChild(div);
  });
}


// Close product modal
function closeProductModal() {
  document.getElementById('productModal').style.display = 'none';
  selectedProduct = null;
}

// Increase quantity
function increaseQuantity() {
  const input = document.getElementById('modalQuantity');
  if (parseInt(input.value) < parseInt(input.max)) {
    input.value = parseInt(input.value) + 1;
  }
}

// Decrease quantity
function decreaseQuantity() {
  const input = document.getElementById('modalQuantity');
  if (parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1;
  }
}

// Add product to cart (from modal)
async function addProductToCart() {
  const user = window.fastGetApp.currentUser;
  if (!user) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }

  if (!ensureAgeAllowedForCurrentStore()) {
    return;
  }

  // Check if all variations are selected
  if (selectedProduct.variations?.length > 0) {
    for (const v of selectedProduct.variations) {
      if (!selectedVariations[v.name]) {
        alert(`Please select a ${v.name}`);
        return;
      }
    }
  }

  const quantity = parseInt(document.getElementById('modalQuantity').value);
  const result = await window.fastGetApp.addToCart(selectedProduct.id, quantity, selectedVariations);

  if (result.success) {
    alert('Product added to cart!');
    closeProductModal();
  } else {
    alert('Error adding to cart: ' + result.error);
  }
}


// Direct Add to Cart (from card)
async function directAddToCart(productId, event) {
  event.stopPropagation(); // Prevent opening modal

  const product = allProducts.find(p => p.id === productId);
  if (product && product.variations?.length > 0) {
    // If has variations, must open modal to choose
    openProductModal(productId);
    return;
  }

  const user = window.fastGetApp.currentUser;

  if (!user) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }

  if (!ensureAgeAllowedForCurrentStore()) {
    return;
  }

  const btn = event.currentTarget;
  const originalText = btn.textContent;

  try {
    btn.disabled = true;
    btn.textContent = 'Adding...';

    const result = await window.fastGetApp.addToCart(productId, 1);
    if (result.success) {
      btn.textContent = 'Added! ✅';
      btn.style.background = '#28a745';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 2000);
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    alert('Error: ' + err.message);
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

function ensureAgeAllowedForCurrentStore() {
  try {
    if (!currentStore) return true;
    if (currentStore.category !== 'pharmacy') return true;

    const user = window.fastGetApp.currentUser;
    if (!user) return false;

    const age = window.fastGetApp.getUserAgeFromMetadata();
    if (age == null) {
      const goProfile = confirm(
        'To buy from a pharmacy store, we need your date of birth.\n\nWould you like to open your profile now to add it?'
      );
      if (goProfile) {
        window.location.href = 'profile.html';
      }
      return false;
    }

    if (age < 18) {
      alert('You must be at least 18 years old to purchase medicines and other pharmacy items on YourWae.');
      return false;
    }

    return true;
  } catch (err) {
    console.warn('ensureAgeAllowedForCurrentStore failed:', err);
    return true;
  }
}


// Filter products
function filterProducts() {
  const searchTerm = document.getElementById('searchProducts').value.trim().toLowerCase();

  filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm)
  );

  displayProducts();
}

// Handle logout
async function handleLogout() {
  const result = await window.fastGetApp.logout();
  if (result.success) {
    window.location.href = 'stores.html';
  }
}

// Handle town selection
function handleTownChange() {
  const select = document.getElementById('townSelect');
  const townValue = select.value;

  if (townValue) {
    window.fastGetApp.townManager.setSelectedTown(townValue, select.options[select.selectedIndex].text);
    // Refresh header to update fee
    loadStore();
  }
}

// Initialize town selector
async function initializeTownSelector() {
  const select = document.getElementById('townSelect');
  if (!select) return;

  // Clear existing options except the first one
  select.innerHTML = '<option value="">Select Town</option>';

  // Add town options
  const townsList = window.fastGetApp.getTowns();
  townsList.forEach(town => {
    const option = document.createElement('option');
    option.value = town.id;
    option.textContent = town.name;
    select.appendChild(option);
  });

  // Restore previously selected town
  const selectedTown = window.fastGetApp.townManager.getSelectedTown();
  if (selectedTown) {
    select.value = selectedTown.id;
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById('productModal');
  if (event.target === modal) {
    closeProductModal();
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await window.fastGetApp.authReadyPromise;
  await initializeTownSelector();
  loadStore();
  document.getElementById('searchProducts').addEventListener('input', filterProducts);
});

