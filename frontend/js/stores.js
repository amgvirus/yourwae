let currentPage = 1;
const itemsPerPage = 12;
let allStores = [];
let filteredStores = [];
let selectedTown = null;

// Load stores
async function loadStores() {
  const storesContainer = document.getElementById('storesContainer');
  try {
    const result = await window.fastGetApp.getStores(50);

    if (result.success) {
      allStores = result.data;
      if (allStores.length === 0) {
        storesContainer.innerHTML = `
          <div class="error-message">
            <p><strong>No stores found.</strong></p>
            <p style="font-size: 14px; color: #666;">The database table might be empty or your filters are too restrictive.</p>
            <button class="btn btn-primary btn-sm" onclick="loadStores()" style="margin-top: 10px;">Refresh</button>
          </div>`;
      } else {
        applyFilters();
      }
    } else {
      const errorMsg = result.error || 'Unknown database error.';
      storesContainer.innerHTML = `
        <div class="error-message">
          <p><strong>Database Connection Issue</strong></p>
          <p style="font-size: 14px; color: #d9534f; background: #f9f2f4; padding: 10px; border-radius: 4px; font-family: monospace; overflow-x: auto;">
            Error: ${errorMsg}
          </p>
          <p style="font-size: 12px; color: #666; margin-top: 10px;">
            Check the browser console (F12) for more details.
          </p>
          <button class="btn btn-primary btn-sm" onclick="loadStores()" style="margin-top: 10px;">Retry</button>
        </div>`;
    }
  } catch (error) {
    console.error('Error loading stores:', error);
    storesContainer.innerHTML =
      `<p style="grid-column: 1/-1; text-align: center; color: red;">Error loading stores</p>`;
  }
}

// Apply current filters to allStores and then display them
function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
  const category = document.getElementById('categoryFilter').value;

  filteredStores = allStores.filter(store => {
    const matchesSearch = store.store_name.toLowerCase().includes(searchTerm) ||
      (store.store_description && store.store_description.toLowerCase().includes(searchTerm));
    const matchesCategory = !category || store.category === category;

    return matchesSearch && matchesCategory;
  });

  currentPage = 1;
  displayStores();
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
      ${store.store_image ?
      `<img src="${store.store_image}" alt="${store.store_name}">` :
      `<div class="store-initials-logo">${window.fastGetApp.getStoreInitials(store.store_name)}</div>`
    }
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
    const matchesSearch = store.store_name.toLowerCase().includes(searchTerm) ||
      (store.store_description && store.store_description.toLowerCase().includes(searchTerm));
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
    window.fastGetApp.townManager.setSelectedTown(townValue, select.options[select.selectedIndex].text);
    currentPage = 1;
    loadStores();
  }
}

// Initialize town selector
async function initializeTownSelector() {
  const select = document.getElementById('townSelect');
  if (!select) return;

  try {
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
  } catch (error) {
    console.error('Error loading towns:', error);
  }
}

// Handle logout
async function handleLogout() {
  const result = await window.fastGetApp.logout();
  if (result.success) {
    window.location.href = 'stores.html';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await initializeTownSelector();
  await loadStores();

  document.getElementById('searchInput').addEventListener('input', filterStores);
  document.getElementById('categoryFilter').addEventListener('change', filterStores);
});
