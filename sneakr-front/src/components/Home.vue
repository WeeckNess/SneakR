<template>
    <!-- Notification -->
    <div v-if="notification.message" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>

    <!-- Barre de recherche -->
    <div class="search-bar">
        <input id="character" type="text" v-model="filters.character" placeholder="Character" />
      <button @click="applyFilters">
        <img src="/Users/thomlegros/Documents/GitHub/SneakR/sneakr-front/src/assets/Search Logo.png" alt="Search" />
      </button>
    </div>
    <div class="filtre">
      <div class="select-wrapper">
        <label for="brand"></label>
        <select id="brand" v-model="filters.brand">
          <option value="">All</option>
          <option value="Nike">Nike</option>
          <option value="Adidas">Adidas</option>
          <option value="Puma">Puma</option>
        </select>
      </div>
      <div class="price-slider">
        <div class="price-slider">
  <div class="slider-container">
    <input
      type="range"
      v-model="filters.minMarketValue"
      :min="priceRange.min"
      :max="priceRange.max"
      step="1"
      @input="updateSlider"
    />
    <input
      type="range"
      v-model="filters.maxMarketValue"
      :min="priceRange.min"
      :max="priceRange.max"
      step="1"
      @input="updateSlider"
    />
    <div class="slider-track"></div>
  </div>
  <div class="slider-values">
    <span class="minPrice">{{ filters.minMarketValue }} €</span>
    <span class="maxPrice">{{ filters.maxMarketValue }} €</span>
  </div>
</div>
</div>
</div>
    <!-- Grille des sneakers -->
    <div v-if="products.length > 0" class="sneaker-grid">
      <div 
        v-for="product in products" 
        :key="product.id" 
        class="sneaker-card"
      >
        <!-- Image du produit -->
        <div class="product-image">
          <img :src="product.imageOriginale || ''" alt="Sneaker" />
        </div>

        <!-- Informations des sneakers -->
        <div class="sneaker-info">
          <h2>{{ product.name }}</h2>
          <p><strong>Prix : </strong>{{ product.marketValue }} €</p>
          <p><strong>Genre : </strong>{{ product.gender }}</p>
          <p><strong>Date : </strong>{{ new Date(product.releaseDate).toLocaleDateString() }}</p>
        </div>

        <!-- Boutons wishlist et collection -->
        <div class="actions">
          <button @click="addToWishlist(product.id)" class="wishlist-button">
            <img src="@/assets/Wishlist.png" alt="Wishlist" />
          </button>
          <button @click="addToCollection(product.id)" class="collection-button">
            Ajouter à la collection
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="products.length > 0">
      <button @click="previousPage" :disabled="currentPage === 1">Précédent</button>
      <span>Page {{ currentPage }}</span>
      <button @click="nextPage">Suivant</button>
    </div>

    <div v-else>
      <p>Aucun produit trouvé.</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const products = ref([]);
const notification = ref({ message: '', type: '' });
const currentPage = ref(1);
const filters = ref({ character: "", brand: "", minMarketValue: "", maxMarketValue: "" });


const priceRange = { min: 0, max: 1000 };

const updateSlider = () => {
  if (parseInt(filters.minMarketValue) > parseInt(filters.maxMarketValue)) {
    const temp = filters.minMarketValue;
    filters.minMarketValue = filters.maxMarketValue;
    filters.maxMarketValue = temp;
  }
};

const loadProducts = async () => {
  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      limit: 15,
      character: filters.value.character || "",
      brand: filters.value.brand || "",
      minMarketValue: filters.value.minMarketValue || "",
      maxMarketValue: filters.value.maxMarketValue || "",
    }).toString();

    const response = await fetch(`http://localhost:3100/sneakers?${params}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits.');
    }
    const data = await response.json();
    products.value = data.items;
  } catch (err) {
    notification.value = { message: err.message, type: 'error' };
  }
};

const applyFilters = () => {
  currentPage.value = 1;
  loadProducts();
};

const nextPage = () => {
  currentPage.value++;
  loadProducts();
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadProducts();
  }
};

const addToWishlist = async (productId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    notification.value = { message: 'Vous devez être connecté pour ajouter à la wishlist.', type: 'error' };
    return;
  }

  try {
    const response = await fetch('http://localhost:3100/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'ajout à la wishlist.');
    }

    notification.value = { message: 'Produit ajouté à la wishlist avec succès.', type: 'success' };
  } catch (err) {
    notification.value = { message: err.message, type: 'error' };
  }
};

const addToCollection = async (productId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    notification.value = { message: 'Vous devez être connecté pour ajouter à la collection.', type: 'error' };
    return;
  }

  try {
    const response = await fetch('http://localhost:3100/collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'ajout à la collection.');
    }

    notification.value = { message: 'Produit ajouté à la collection avec succès.', type: 'success' };
  } catch (err) {
    notification.value = { message: err.message, type: 'error' };
  }
};

onMounted(loadProducts);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');


/* Notification styles */
.notification {
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  text-align: center;
}

.notification.success {
  background-color: #d4edda;
  color: #ffffff;
}

.notification.error {
  background-color: #ffffff;
  color: #000000;
}

/* Barre de recherche */
.search-bar {
  display: flex;
  justify-self: center;
  padding: 8px;
  border-radius: 5px;
  width: 50%;
  /* align-content: center; */
}

.search-bar img {
  width: 40px;
  height: 40px;
}

.search-bar button {
  border: none;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
  background: transparent;
}

.search-bar input {
  width: 90%;
  padding: 8px;
  margin-right: 2%;
  border-radius: 8px;
  background-color: #eeeeee;
  border-color: white;
  border-style: none;
  font-size: 90%;
  color: black;
}

.filtre {
  display: flex;
  margin-bottom: 20px;
  justify-self: center;
  padding: 1%;
  justify-content: space-between;
  width: 50%;
}

.filtre select {
  padding: 8px;
  border-radius: 8px;
  background-color: #eeeeee;
  border-color: white;
  border-style: none;
  font-size: 90%;
  color: black;
  width: 200%;
}

.price-slider {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-left: 10%;
}

.slider-container {
  position: relative;
  height: 5px;
  background-color: #ddd;
  border-radius: 5px;
}

.slider-container input[type="range"] {
  position: absolute;
  width: 100%;
  height: 5px;
  -webkit-appearance: none;
  background: transparent;
  pointer-events: none;
}

.slider-container input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 15px;
  height: 15px;
  background: #eeeeee;
  border-radius: 50%;
  pointer-events: all;
  cursor: pointer;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.slider-container input[type="range"]::-moz-range-thumb {
  width: 15px;
  height: 15px;
  background: #eeeeee;
  border-radius: 50%;
  cursor: pointer;
  z-index: 2;
} 

.slider-container, .slider-track {
  position: flex;
  height: 100%;
  background-color: #394552;
  border-radius: 5px;
  z-index: 1;

}

.slider-container input[type="range"]:nth-of-type(1) + input[type="range"] + .slider-track {
  left: calc((var(--minPosition, 0%) - var(--maxPosition, 100%)));
  right: var(--maxPosition, 100%);
}
  
.slider-values {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #7a4646;
}

/* Grid styles */
.sneaker-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
}

 button:hover {
background-color: #4DBB63;
} 

button:focus {
  outline: none;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.sneaker-card {
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  transition: transform 0.3s ease;
  font-family: Arial, Helvetica, sans-serif;
}

.sneaker-card:hover {
  transform: translateY(-5px);
}

.product-image img {
  width: 100%;
  height: auto;
  display: block;
  border-bottom: 1px solid #eee;
}

.sneaker-info {
  padding: 15px;
}

.sneaker-info h2 {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.sneaker-info p {
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  justify-content: space-between;
  padding: 15px;
}

.wishlist-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  border-radius: 5px;
}

.wishlist-button img {
  width: 30px;
  height: 30px;
}

.wishlist-button:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #f0f0f0;
}

.collection-button {
  background-color: transparent;
  color: rgb(0, 0, 0);
  padding: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
}

.collection-button:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #f0f0f0;
}

/* Pagination styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>