<template>
  <div class="search-container">
    <h1>Search Sneakers</h1>
    <div class="search-bar">
      <div class="select-wrapper">
        <label for="brand">Brand</label>
        <select id="brand" v-model="filters.brand">
          <option value="">All</option>
          <option value="Nike">Nike</option>
          <option value="Adidas">Adidas</option>
          <option value="Puma">Puma</option>
        </select>
      </div>
      <div class="select-wrapper">
        <label for="gender">Gender</label>
        <select id="gender" v-model="filters.gender">
          <option value="">All</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
        </select>
      </div>
      <div class="select-wrapper">
        <label for="character">Character</label>
        <input id="character" type="text" v-model="filters.character" placeholder="Character" />
      </div>
      <div class="price-range">
        <div>
          <label for="minMarketValue">Min Price</label>
          <input id="minMarketValue" type="number" v-model="filters.minMarketValue" placeholder="Min Price" />
        </div>
        <div>
          <label for="maxMarketValue">Max Price</label>
          <input id="maxMarketValue" type="number" v-model="filters.maxMarketValue" placeholder="Max Price" />
        </div>
      </div>
      <button @click="applyFilters">Search</button>
    </div>
    <div class="sneakers-list">
      <div v-if="loading">Loading...</div>
      <div v-else>
        <div v-for="sneaker in sneakers" :key="sneaker.id" class="sneaker-item">
          <img :src="sneaker.imageOriginale || 'placeholder.jpg'" alt="Sneaker" class="sneaker-image" />
          <div class="sneaker-info">
            <h3>{{ sneaker.name || "Nom indisponible" }}</h3>
            <p><strong>Prix : </strong>{{ sneaker.marketValue || "N/A" }} €</p>
          </div>
        </div>
        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';

export default {
  name: "Search",
  setup() {
    const sneakers = ref([]);
    const loading = ref(true);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const filters = ref({
      brand: '',
      gender: '',
      character: '',
      minMarketValue: '',
      maxMarketValue: ''
    });

    const fetchSneakers = async () => {
      loading.value = true;
      try {
        const params = new URLSearchParams({
          page: currentPage.value,
          limit: 10,
          ...Object.fromEntries(Object.entries(filters.value).filter(([_, v]) => v !== ''))
        }).toString();
        const response = await fetch(`http://localhost:3100/sneakers?${params}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des sneakers.');
        }
        const data = await response.json();
        sneakers.value = data.items;
        totalPages.value = data.totalPages;
      } catch (error) {
        console.error("Erreur lors de la récupération des sneakers:", error);
        alert("Erreur de chargement.");
      } finally {
        loading.value = false;
      }
    };

    const applyFilters = () => {
      currentPage.value = 1; // Reset to page 1 on applying filters
      fetchSneakers();
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        fetchSneakers();
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        fetchSneakers();
      }
    };

    onMounted(() => {
      fetchSneakers();
    });

    watch(filters, () => {
      applyFilters();
    }, { deep: true });

    return {
      sneakers,
      loading,
      currentPage,
      totalPages,
      filters,
      applyFilters,
      prevPage,
      nextPage
    };
  }
};
</script>

<style scoped>
/* Styles remain the same as before */
</style>