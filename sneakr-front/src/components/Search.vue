<template>
    <div class="search-container">
      <input type="text" v-model="searchQuery" placeholder="Search..." @input="filterProducts" />
      <div v-if="filteredProducts.length > 0" class="product-grid">
        <div v-for="product in filteredProducts" :key="product.id" class="product-card">
          <img :src="product.image" alt="Product Image" />
        </div>
      </div>
      <div v-else>No products found.</div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const searchQuery = ref('');
  const products = ref([
    // Sample product data
    { id: 1, name: 'Product 1', brand: 'Brand A', price: '20$', image: 'image1.jpg' },
    { id: 2, name: 'Product 2', brand: 'Brand B', price: '30$', image: 'image2.jpg' },
    // Add more products here...
  ]);
  
  const filteredProducts = ref([]);
  
  function filterProducts() {
    filteredProducts.value = products.value.filter(product => {
      return product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    });
  }
  </script>
  
  <style scoped>
  .search-container {
    width: 100%;
    padding: 1rem;
    background-color: white;
    box-shadow: 0px 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 1rem;
  }
  
  .product-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .product-card {
    flex: 1 1 calc(25% - 1rem);
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 1rem;
    background-color: #fff;
    box-shadow: 0px 2px 4px rgba(0,0,0,0.1);
  }
  
  .product-card img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
  </style>