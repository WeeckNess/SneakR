<template>
    <div class="cart">
      <h1>Votre Panier</h1>
      <div v-if="cart.length > 0">
        <div v-for="(product, index) in cart" :key="index" class="cart-item">
          <h3>{{ product.attributes.name }}</h3>
          <img :src="product.attributes.image.original || ''" alt="Sneaker" class="product-image" />
          <p><strong>Prix : </strong>{{ product.attributes.retailPrice }} €</p>
        </div>
      </div>
      <div v-else>
        <p>Votre panier est vide.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const cart = ref([]);
  
  // Charger les produits du panier depuis localStorage
  onMounted(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      cart.value = JSON.parse(storedCart);
    }
  });
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
  
  h3 {
    margin-bottom: 10px;
  }
  
  p {
    margin-bottom: 5px;
  }
  </style>