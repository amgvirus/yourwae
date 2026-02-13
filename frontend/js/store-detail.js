let currentStoreId = null;
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
    displayStoreDetails(store);
    loadProducts();
  } else {
    document.body.innerHTML = `<p style="text-align: center; padding: 50px;">Error loading store: ${result.error}</p>`;
  }
}

// Display store details
function displayStoreDetails(store) {
  document.getElementById('storeName').textContent = store.store_name;
  document.getElementById('storeCategory').textContent = store.category;
  document.getElementById('storeImage').src = store.store_image || 'https://via.placeholder.com/200';
  document.getElementById('storeRating').innerHTML = `${'⭐'.repeat(Math.floor(store.rating || 0))} (${store.rating || 0})`;
  document.getElementById('storeReviews').textContent = `${store.total_reviews} reviews`;
  document.getElementById('storeAddress').textContent = store.address?.street || 'Address unavailable';
  document.getElementById('deliveryFee').textContent = `GH₵${store.base_delivery_fee}`;
  document.getElementById('minOrder').textContent = `GH₵${store.minimum_order_value}`;
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
      <img src="${product.images?.[0] || 'https://via.placeholder.com/150'}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-desc">${product.description.substring(0, 50)}...</p>
        <div class="product-rating">
          <span>${'⭐'.repeat(Math.floor(product.rating || 0))}</span>
          <span class="review-count">${product.total_reviews} reviews</span>
        </div>
        <div class="product-price">
          <span class="price">GH₵${product.price}</span>
          ${product.original_price ? `<span class="original">GH₵${product.original_price}</span>` : ''}
          ${product.discount ? `<span class="discount">${product.discount}% off</span>` : ''}
        </div>
        <p class="stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
          ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
      </div>
    </div>
  `).join('');
}

// Open product modal
function openProductModal(productId) {
  selectedProduct = allProducts.find(p => p.id === productId);

  if (!selectedProduct) return;

  document.getElementById('modalImage').src = selectedProduct.images?.[0] || 'https://via.placeholder.com/300';
  document.getElementById('modalProductName').textContent = selectedProduct.name;
  document.getElementById('modalProductDescription').textContent = selectedProduct.description;
  document.getElementById('modalPrice').textContent = `GH₵${selectedProduct.price}`;
  document.getElementById('modalOriginalPrice').textContent = selectedProduct.original_price ?
    `GH₵${selectedProduct.original_price}` : '';
  document.getElementById('modalDiscount').textContent = selectedProduct.discount ?
    `${selectedProduct.discount}% off` : '';
  document.getElementById('modalStock').textContent = selectedProduct.stock > 0 ?
    `${selectedProduct.stock} in stock` : 'Out of stock';
  document.getElementById('modalQuantity').value = 1;
  document.getElementById('modalQuantity').max = selectedProduct.stock;

  document.getElementById('productModal').style.display = 'block';
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

// Add product to cart
async function addProductToCart() {
  if (!window.currentUser) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }

  const quantity = parseInt(document.getElementById('modalQuantity').value);
  const result = await window.fastGetApp.addToCart(selectedProduct.id, quantity);

  if (result.success) {
    alert('Product added to cart!');
    closeProductModal();
  } else {
    alert('Error adding to cart: ' + result.error);
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

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById('productModal');
  if (event.target === modal) {
    closeProductModal();
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadStore();
  document.getElementById('searchProducts').addEventListener('input', filterProducts);
});
