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
        <img :src="product.imageOriginale || ''" alt="Sneaker" />
        <h2>{{ product.name }}</h2>
        <p><strong>Prix du marché : </strong>{{ product.marketValue }} €</p>
        <p><strong>Genre : </strong>{{ product.gender }}</p>
        <p><strong>Date de création : </strong>{{ new Date(product.releaseDate).toLocaleDateString() }}</p>
        <!-- Bouton Ajouter à la Wishlist -->
        <button @click="addToWishlist(product.id)" class="add-to-cart">
          Ajouter à la WishList
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Précédent</button>
      <span>Page {{ currentPage }} sur {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Suivant</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const products = ref([]);
const loading = ref(true);
const error = ref(null);
const notificationMessage = ref('');
const currentPage = ref(1);
const totalPages = ref(1);

const fetchProducts = async (page) => {
  loading.value = true;
  try {
    const response = await fetch(`http://localhost:3100/sneakers?page=${page}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits.');
    }
    const data = await response.json();
    products.value = data.items;
    totalPages.value = data.totalPages;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const addToWishlist = async (productId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    notificationMessage.value = 'Vous devez être connecté pour ajouter à la wishlist.';
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

    notificationMessage.value = 'Produit ajouté à la wishlist avec succès.';
  } catch (err) {
    notificationMessage.value = err.message;
  } finally {
    setTimeout(() => {
      notificationMessage.value = '';
    }, 3000);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchProducts(currentPage.value);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchProducts(currentPage.value);
  }
};

onMounted(() => {
  fetchProducts(currentPage.value);
});
</script>

<style scoped>
.notification {
  background-color: #4caf50;
  color: white;
  padding: 10px;
  margin-bottom: 20px;
  text-align: center;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #333;
}

.error {
  text-align: center;
  font-size: 18px;
  color: red;
}

.sneaker-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.sneaker-card {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 20px;
  width: 200px;
  text-align: center;
}

.sneaker-card img {
  width: 100%;
  height: auto;
  border-radius: 5px;
}

.add-to-cart {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.add-to-cart:hover {
  background-color: #0056b3;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  margin: 0 10px;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination span {
  font-size: 18px;
}
</style>