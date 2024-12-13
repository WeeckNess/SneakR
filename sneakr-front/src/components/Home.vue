<template>
  <div>
    <!-- Notification -->
    <div v-if="notification.message" :class="['notification', notification.type]">
      {{ notification.message }}
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const products = ref([]);
const notification = ref({ message: '', type: '' });
const currentPage = ref(1);

const loadProducts = async () => {
  try {
    const response = await fetch(`http://localhost:3100/sneakers?page=${currentPage.value}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits.');
    }
    const data = await response.json();
    products.value = data.items;
  } catch (err) {
    notification.value = { message: err.message, type: 'error' };
  }
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

/* Styles généraux */
body {
  font-family: 'Poppins', sans-serif;
}

/* Notification styles */
.notification {
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  text-align: center;
}

.notification.success {
  background-color: #d4edda;
  color: #155724;
}

.notification.error {
  background-color: #f8d7da;
  color: #721c24;
}

/* Grid styles */
.sneaker-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
}

.sneaker-card {
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.sneaker-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
}

.product-image img {
  width: 100%;
  height: auto;
  display: block;
}

.sneaker-info {
  padding: 15px;
  text-align: left;
  flex-grow: 1;
}

.sneaker-info h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.sneaker-info p {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 5px;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
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
}

.wishlist-button img {
  width: 30px;
  height: 30px;
}

.wishlist-button:hover {
  transform: scale(1.1);
}

.collection-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.collection-button:hover {
  background-color: #0056b3;
  transform: scale(1.02);
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