let currentPage = 1;
const itemsPerPage = 12;
let allStores = [];
let filteredStores = [];
let selectedTown = null;

// Load stores
async function loadStores() {
  try {
    const result = await window.fastGetApp.getStores(50);
    let stores = result.success ? result.data : [];

    allStores = stores;
    filteredStores = [...allStores];
    displayStores();
  } catch (error) {
    console.error('Error loading stores:', error);
    document.getElementById('storesContainer').innerHTML =
      `<p style="grid-column: 1/-1; text-align: center; color: red;">Error loading stores</p>`;
  }
}

// Display stores with pagination
function displayStores() {
  const container = document.getElementById('storesContainer');
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedStores = filteredStores.slice(start, end);

  if (paginatedStores.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No stores found</p>';
    updatePaginationUI();
    return;
  }

  container.innerHTML = paginatedStores.map(store => `
    <div class="store-card" onclick="window.location.href='store-detail.html?id=${store.id}'">
      <img src="${store.store_image || 'https://via.placeholder.com/200'}" alt="${store.store_name}">
      <div class="store-info">
        <h3>${store.store_name}</h3>
        <p class="category">${store.category}</p>
        <div class="rating">
          <span class="stars">${'⭐'.repeat(Math.floor(store.rating || 0))}</span>
          <span class="reviews">${store.total_reviews || 0} reviews</span>
        </div>
        <div class="delivery-info">
          <span class="delivery-fee">₵${store.base_delivery_fee || 5} delivery</span>
          <span class="delivery-time">~15-30 mins</span>
        </div>
      </div>
    </div>
  `).join('');


  updatePaginationUI();
}

// Update pagination UI
function updatePaginationUI() {
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  prevBtn.style.display = currentPage > 1 ? 'block' : 'none';
  nextBtn.style.display = currentPage < totalPages ? 'block' : 'none';
}

// Handle pagination
function nextPage() {
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayStores();
    window.scrollTo(0, 0);
  }
}

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    displayStores();
    window.scrollTo(0, 0);
  }
}

// Filter stores
function filterStores() {
  const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
  const category = document.getElementById('categoryFilter').value;

  filteredStores = allStores.filter(store => {
    const matchesSearch = store.storeName.toLowerCase().includes(searchTerm) ||
      store.storeDescription?.toLowerCase().includes(searchTerm);
    const matchesCategory = !category || store.category === category;

    return matchesSearch && matchesCategory;
  });

  currentPage = 1;
  displayStores();
}

// Handle town change
function handleTownChange() {
  const select = document.getElementById('townSelect');
  const townValue = select.value;

  if (townValue) {
    townManager.setSelectedTown(townValue, select.options[select.selectedIndex].text);
    currentPage = 1;
    loadStores();
  }
}

// Initialize town selector
async function initializeTownSelector() {
  const select = document.getElementById('townSelect');
  if (!select) return;

  try {
    const towns = await townAPI.getAllTowns();

    // Clear existing options except the first one
    select.innerHTML = '<option value="">Select Town</option>';

    // Add town options (using town names directly for now)
    const townNames = ['Hohoe', 'Dzodze', 'Anloga'];
    townNames.forEach(name => {
      const option = document.createElement('option');
      option.value = name.toLowerCase();
      option.textContent = name;
      select.appendChild(option);
    });

    // Restore previously selected town
    const selectedTown = townManager.getSelectedTown();
    if (selectedTown) {
      select.value = selectedTown.id;
    }
  } catch (error) {
    console.error('Error loading towns:', error);
  }
}

// Handle logout
async function handleLogout() {
  // Clear local auth data
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  window.location.href = 'stores.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await initializeTownSelector();
  await loadStores();

  document.getElementById('searchInput').addEventListener('input', filterStores);
  document.getElementById('categoryFilter').addEventListener('change', filterStores);
});
