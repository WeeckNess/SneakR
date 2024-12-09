<template>
  <div class="cart">
    <h1>Votre Panier</h1>
    <div v-if="cart.length > 0">
      <div v-for="(product, index) in cart" :key="index" class="cart-item">
        <h3>{{ product.attributes?.name || "Nom indisponible" }}</h3>
        <img :src="product.attributes?.image?.original || 'placeholder.jpg'" alt="Sneaker" class="product-image" />
        <p><strong>Prix : </strong>{{ product.attributes?.retailPrice || "N/A" }} €</p>
        <button @click="removeFromCart(index)">Retirer</button>
      </div>
      <button @click="clearCart">Vider le panier</button>
    </div>
    <div v-else>
      <p>Votre panier est vide.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Référence au panier
const cart = ref([]);

// Charger les produits du panier depuis localStorage
onMounted(() => {
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    try {
      cart.value = JSON.parse(storedCart);
    } catch (err) {
      console.error("Erreur lors de l'analyse du panier :", err);
      cart.value = [];
    }
  }
});

// Supprimer un produit du panier
const removeFromCart = (index) => {
  cart.value.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart.value));
};

// Vider le panier
const clearCart = () => {
  cart.value = [];
  localStorage.removeItem('cart');
};
</script>

<style scoped>
.cart {
  padding: 20px;
}

.cart-item {
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}

.product-image {
  width: 100px;
  height: auto;
}

button {
  margin-top: 10px;
  padding: 10px;
  background-color: #353535;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

button:hover {
  background-color: #555;
}
</style>