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
        <img :src="product.imageOriginale || ''" alt="Sneaker" />
        <div class="sneaker-info">
          <h2>{{ product.name }}</h2>
          <p><strong>Prix : </strong>{{ product.marketValue }} €</p>
          <p><strong>Genre : </strong>{{ product.gender }}</p>
          <p><strong>Date : </strong>{{ new Date(product.releaseDate).toLocaleDateString() }}</p>
        </div>
        <!-- Boutons wishlist et collection -->
        <div class="actions">
          <button @click="addToWishlist(product.id)" class="wishlist-button">
            <img src="@/assets/Wishlist.png" alt="Wishlist" class="wishlist-icon" />
          </button>
          <button @click="addToCollection(product.id)" class="collection-button">
            Ajouter à la collection
          </button>
        </div>
      </div>
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

const loadProducts = async () => {
  try {
    const response = await fetch('http://localhost:3100/sneakers?page=1');
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits.');
    }
    const data = await response.json();
    products.value = data.items;
  } catch (err) {
    notification.value = { message: err.message, type: 'error' };
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

.sneaker-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.sneaker-card {
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 280px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sneaker-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
}

.sneaker-card img {
  width: 100%;
  height: auto;
  border-bottom: 1px solid #eaeaea;
}

.sneaker-info {
  padding: 15px;
  text-align: left;
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

/* Conteneur des actions */
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f9f9f9;
  border-top: 1px solid #eaeaea;
  position: absolute;
  bottom: 0;
  width: 100%;
}

/* Bouton wishlist (carré) */
.wishlist-button {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.wishlist-button:hover {
  background-color: #f5f5f5;
  transform: scale(1.1);
}

.wishlist-icon {
  width: 24px;
  height: 24px;
}

/* Bouton collection (large, avec texte) */
.collection-button {
  background-color: #007bff;
  color: #ffffff;
  border: none;
  padding: 10px 15px;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
  flex-grow: 1;
  text-align: center;
}

.collection-button:hover {
  background-color: #0056b3;
  transform: scale(1.02);
}
</style>