<template>
  <div>
    <!-- Notification -->
    <div v-if="notificationMessage" class="notification">
      {{ notificationMessage }}
    </div>

    <!-- Message de chargement -->
    <p v-if="loading" class="loading">Chargement des sneakers...</p>

    <!-- Message d'erreur -->
    <p v-if="error" class="error">{{ error }}</p>

    <!-- Grille des sneakers -->
    <div v-else class="sneaker-grid">
      <div 
        v-for="product in products" 
        :key="product.id" 
        class="sneaker-card"
      >
        <img :src="product.attributes.image.original || ''" alt="Sneaker" />
        <h2>{{ product.attributes.name }}</h2>
        <p><strong>Prix : </strong>{{ product.attributes.retailPrice }} €</p>
        <!-- Bouton Ajouter au panier -->
        <button @click="addToCart(product)" class="add-to-cart">Ajouter au panier</button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1">
        Précédent
      </button>
      <span>Page {{ currentPage }} sur {{ totalPages }}</span>
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage === totalPages">
        Suivant
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Variables réactives
const products = ref([]);
const loading = ref(true);
const error = ref('');
const currentPage = ref(1);
const totalPages = ref(0);
const notificationMessage = ref('');
let notificationTimeout;

// Charger les sneakers
const loadProducts = async (page = 1) => {
  loading.value = true;
  error.value = '';

  try {
    const response = await fetch(`http://54.37.12.181:1337/api/sneakers?pagination%5Bpage%5D=${page}`);
    if (!response.ok) throw new Error('Erreur lors du chargement des données.');

    const data = await response.json();
    products.value = data.data;
    totalPages.value = data.meta.pagination.pageCount;
  } catch (err) {
    error.value = 'Impossible de charger les sneakers.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Fonction pour changer de page
const changePage = async (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    await loadProducts(page);
  }
};

// Ajouter un produit au panier
const addToCart = (product) => {
  const storedCart = localStorage.getItem('cart');
  let cart = storedCart ? JSON.parse(storedCart) : [];

  // Vérifier si le produit existe déjà
  const exists = cart.some((item) => item.id === product.id);
  if (!exists) {
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification(`${product.attributes.name} a été ajouté au panier.`);
  } else {
    showNotification(`${product.attributes.name} est déjà dans le panier.`);
  }
};

// Afficher une notification CSS
const showNotification = (message) => {
  notificationMessage.value = message;
  clearTimeout(notificationTimeout);
  notificationTimeout = setTimeout(() => {
    notificationMessage.value = '';
  }, 3000); // La notification disparaît après 3 secondes
};

// Charger les produits au montage
onMounted(() => {
  loadProducts(currentPage.value);
});
</script>

<style scoped>
/* Notification CSS */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #333;
  color: white;
  padding: 15px 20px;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: fadeInOut 3s forwards;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  10%, 90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

/* Grille des produits */
.sneaker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px;
}

.sneaker-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  background-color: #fff;
  cursor: pointer;
  transition: transform 0.2s;
}

.sneaker-card:hover {
  transform: scale(1.05);
}

.sneaker-card img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

/* Bouton Ajouter au panier */
.add-to-cart {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-to-cart:hover {
  background-color: #555;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  gap: 10px;
}

.pagination button {
  padding: 10px 20px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>