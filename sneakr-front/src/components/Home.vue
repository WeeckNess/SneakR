<template>
    <div>
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
  const products = ref([]); // Produits pour la page actuelle
  const loading = ref(true);
  const error = ref('');
  const currentPage = ref(1);
  const totalPages = ref(0);
  const pageSize = 15; // Taille des lots
  
  
  // Charger les sneakers pour une page donnée
  const loadProducts = async (page = 1) => {
    loading.value = true;
    error.value = '';
  
    try {
      // Requête avec pagination
      const response = await fetch(`http://54.37.12.181:1337/api/sneakers?pagination%5Bpage%5D=${page}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des données.');
  
      const data = await response.json();
      products.value = data.data; // Produits de la page actuelle
      totalPages.value = data.meta.pagination.pageCount; // Pages totales
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
    
  // Charger la première page au montage
  onMounted(() => {
    loadProducts(currentPage.value);
  });
  </script>
  
  <style scoped>
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