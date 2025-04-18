<template>
  <div class="wishlist">
    <h1>Votre Wishlist</h1>
    <div v-if="wishlist.length > 0">
      <div v-for="(product, index) in wishlist" :key="index" class="wishlist-item">
        <img :src="product.imageOriginale || 'placeholder.jpg'" alt="Sneaker" class="product-image" />
        <h3>{{ product.name || "Nom indisponible" }}</h3>
        <p><strong>Prix : </strong>{{ product.marketValue || "N/A" }} €</p>
        <button @click="removeFromWishlist(product.id)">Retirer</button>
      </div>
      <button @click="clearWishlist">Vider la WishList</button>
    </div>
    <div v-else>
      <p>Votre WishList est vide.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Référence à la wishlist
const wishlist = ref([]);

// Fonction pour charger la wishlist depuis le serveur
const loadWishlist = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Vous devez être connecté pour voir la wishlist.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3100/wishlist', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la wishlist.');
    }
    wishlist.value = await response.json();
  } catch (err) {
    console.error(err.message);
  }
};

// Fonction pour retirer un produit de la wishlist
const removeFromWishlist = async (wishlistId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Vous devez être connecté pour retirer des produits de la wishlist.');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3100/wishlist/${wishlistId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Erreur lors du retrait du produit de la wishlist.');
    }
    wishlist.value = wishlist.value.filter(product => product.id !== wishlistId);
  } catch (err) {
    console.error(err.message);
  }
};

// Fonction pour vider la wishlist
const clearWishlist = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Vous devez être connecté pour vider la wishlist.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3100/wishlist', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Erreur lors du vidage de la wishlist.');
    }
    wishlist.value = [];
  } catch (err) {
    console.error(err.message);
  }
};

// Charger la wishlist lors du montage du composant
onMounted(loadWishlist);
</script>

<style scoped>
.wishlist {
  width: 80%;
  margin: 0 auto;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  background-color: #f9f9f9;
}

.wishlist h1 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.wishlist-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: 15px;
}

button {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.3s;
}

button:hover {
  transform: scale(1.05);
}
</style>