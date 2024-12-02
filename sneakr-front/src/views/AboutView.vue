<template>
  <div class="app-container">
    <header class="header">
      <h1>Page Admin - Liste des Produits</h1>
    </header>

    <div v-if="selectedProduct" class="product-detail-page">
      <h1>Détails du produit</h1>
      <div class="product-detail">
        <h2>{{ selectedProduct.attributes?.Name || "Nom indisponible" }}</h2>
        <p>{{ extractDescriptionText(selectedProduct.attributes?.Description) }}</p>
        <p class="price">{{ selectedProduct.attributes?.Prix || "Prix indisponible" }} €</p>
        <button @click="selectedProduct = null" class="back-button">Retour à la liste</button>
      </div>
    </div>

    <div v-else class="product-list-page">
      <h1>Liste des produits</h1>
      <div v-if="errorMessage" class="error">
        Une erreur est survenue : {{ errorMessage }}
      </div>
      <div v-else-if="loading" class="loading">
        <p>Chargement des produits...</p>
      </div>
      <div class="products" v-else>
        <div
          v-for="product in products"
          :key="product.id"
          class="product-card"
          @click="handleProductClick(product)"
        >
          <div class="product-image">
            <!-- Vérifie si l'image existe, sinon affiche un placeholder -->
            <img
              :src="product.attributes?.imageUrl || 'https://via.placeholder.com/150'"
              :alt="product.attributes?.Name || 'Produit inconnu'"
            />
          </div>
          <div class="product-info">
            <h2>{{ product.attributes?.Name || "Nom indisponible" }}</h2>
            <p>{{ truncateDescription(product.attributes?.Description) }}</p>
            <p class="price">{{ product.attributes?.Prix || "Prix indisponible" }} €</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const products = ref([]);
const loading = ref(true);
const errorMessage = ref(null);
const selectedProduct = ref(null);

const fetchProducts = async () => {
  try {
    console.log("Récupération des produits...");
    const response = await fetch("http://localhost:1337/api/products");
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log("Données des produits récupérées :", data);
    
    if (data && data.data) {
      products.value = data.data;
      console.log("Produits ajoutés à l'état : ", products.value);
    } else {
      throw new Error("Aucune donnée trouvée");
    }
  } catch (error) {
    errorMessage.value = `Erreur lors de la récupération des produits : ${error.message}`;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProducts();
});

const extractDescriptionText = (description) => {
  // Gestion de la Description qui peut être un tableau
  if (Array.isArray(description)) {
    return description[0] || "Aucune description disponible";
  }
  return description || "Aucune description disponible";
};

const truncateDescription = (description, length = 100) => {
  // Troncature de la description si elle est trop longue
  return description && description.length > length
    ? `${description.substring(0, length)}...`
    : description;
};

const handleProductClick = (product) => {
  selectedProduct.value = product;
};
</script>

<style scoped>
/* Structure principale */
.app-container {
  font-family: 'Roboto', sans-serif;
  color: #333;
  margin: 0 auto;
  max-width: 1200px;
  padding: 20px;
}
.header {
  text-align: center;
  background: #007bff;
  color: #fff;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
}
h1 {
  margin: 0;
  font-size: 24px;
  text-transform: uppercase;
}

/* Liste des produits */
.product-list-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.products {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-around;
}
.product-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  width: calc(33.333% - 20px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
}
.product-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.product-info {
  padding: 15px;
  text-align: center;
}
.product-info h2 {
  margin: 0 0 10px;
  font-size: 18px;
}
.product-info p {
  margin: 0;
  color: #666;
}
.price {
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #007bff;
}

/* Détails du produit */
.product-detail-page {
  text-align: center;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.product-detail h2 {
  font-size: 22px;
  margin-bottom: 10px;
}
.back-button {
  margin-top: 20px;
  padding: 10px 15px;
  border: none;
  background: #007bff;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
}
.back-button:hover {
  background: #0056b3;
}

/* Gestion des erreurs et du chargement */
.error {
  color: red;
  text-align: center;
  font-weight: bold;
}
.loading {
  text-align: center;
  font-size: 16px;
}
</style>