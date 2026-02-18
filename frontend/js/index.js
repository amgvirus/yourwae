// Load featured stores on home page
async function loadFeaturedStores() {
  const container = document.getElementById('storesContainer');

  try {
    const result = await window.fastGetApp.getStores();
    let stores = result.success ? result.data : [];

    // Filter by selected town if available
    const selectedTown = townManager.getSelectedTown();
    if (selectedTown && selectedTown.id) {
      // Assuming 'id' is verified or we just show all for now if no town mapping exist
    }

    // Limit to 6 stores
    stores = stores.slice(0, 6);

    if (stores.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No stores available yet</p>';
      return;
    }

    container.innerHTML = stores.map(store => `
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
            <span class="delivery-time">~${Math.round(Math.random() * 20 + 15)} mins</span>
          </div>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading stores:', error);
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red;">Error loading stores</p>`;
  }
}

// Handle town selection
async function handleTownChange() {
  const select = document.getElementById('townSelect');
  const townValue = select.value;

  if (townValue) {
    townManager.setSelectedTown(townValue, select.options[select.selectedIndex].text);
    loadFeaturedStores();
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

    // Add town options
    towns.forEach(town => {
      const option = document.createElement('option');
      option.value = town._id;
      option.textContent = town.name;
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

// Handle search
async function handleSearch() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput.value.trim();

  if (!query) {
    alert('Please enter a search term');
    return;
  }

  // Store search query and redirect
  localStorage.setItem('searchQuery', query);
  window.location.href = 'stores.html?search=' + encodeURIComponent(query);
}


// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await initializeTownSelector();
  await loadFeaturedStores();

  // Allow Enter key in search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
  }
});
