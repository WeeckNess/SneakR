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
        <button @click="addToCart(product)" class="add-to-cart">
          Ajouter à la WishList
        </button>
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

<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
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
        const response = await fetch(`http://localhost:3100/sneakers?page=${page}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Erreur lors du chargement des données.');

        const data = await response.json();
        products.value = data.items; // Ajustez selon la structure des données de votre API
        totalPages.value = data.totalPages; // Assurez-vous que votre API renvoie le nombre total de pages
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

    // Ajouter un produit à la Wishlist
    const addToCart = async (product) => {
      const userId = 1; // Remplacez ceci par l'ID de l'utilisateur connecté

      try {
        const response = await fetch('http://localhost:3100/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId: product.id }),
        });

        if (!response.ok) throw new Error('Erreur lors de l\'ajout à la wishlist.');

        const data = await response.json();
        showNotification(`${product.name} a été ajouté à la Wishlist.`);
      } catch (err) {
        console.error(err);
        showNotification('Impossible d\'ajouter le produit à la Wishlist.');
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

    return {
      products,
      loading,
      error,
      currentPage,
      totalPages,
      notificationMessage,
      loadProducts,
      changePage,
      addToCart
    };
  }
};
</script>

<style scoped>
/* Styles identiques à ceux de la page Home */
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