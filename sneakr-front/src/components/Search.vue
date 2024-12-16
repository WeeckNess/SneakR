<template>
  <div class="search-container">
    <h1>Search Sneakers</h1>
    <div class="search-bar">
      <div class="filter-wrapper">
        <div class="filter-item">
          <label for="brand">Brand</label>
          <Dropdown
            id="brand"
            v-model="filters.brand"
            :options="brands"
            placeholder="Select a Brand"
            :show-clear="true"
          />
        </div>
        <div class="filter-item">
          <label for="gender">Gender</label>
          <Dropdown
            id="gender"
            v-model="filters.gender"
            :options="genders"
            placeholder="Select Gender"
            :show-clear="true"
          />
        </div>
        <div class="filter-item">
          <label for="character">Character</label>
          <InputText
            id="character"
            v-model="filters.character"
            placeholder="Enter Character"
          />
        </div>
        <div class="price-range">
          <div>
            <label for="minMarketValue">Min Price</label>
            <InputNumber
              id="minMarketValue"
              v-model="filters.minMarketValue"
              mode="currency"
              currency="EUR"
              placeholder="Min Price"
            />
          </div>
          <div>
            <label for="maxMarketValue">Max Price</label>
            <InputNumber
              id="maxMarketValue"
              v-model="filters.maxMarketValue"
              mode="currency"
              currency="EUR"
              placeholder="Max Price"
            />
          </div>
        </div>
        <Button
          label="Search"
          icon="pi pi-search"
          class="p-button-outlined p-button-primary"
          @click="applyFilters"
        />
      </div>
    </div>
    <div class="sneakers-list">
      <div v-if="loading">
        <ProgressSpinner />
      </div>
      <div v-else>
        <div v-for="sneaker in sneakers" :key="sneaker.id" class="sneaker-item">
          <img
            :src="sneaker.imageOriginale || 'placeholder.jpg'"
            alt="Sneaker"
            class="sneaker-image"
          />
          <div class="sneaker-info">
            <h3>{{ sneaker.name || "Nom indisponible" }}</h3>
            <p><strong>Prix : </strong>{{ sneaker.marketValue || "N/A" }} €</p>
          </div>
        </div>
        <div class="pagination">
          <Paginator
            :first="(currentPage - 1) * limit"
            :rows="limit"
            :total-records="totalItems"
            :rows-per-page-options="[10, 20, 50]"
            @page="onPageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import Paginator from "primevue/paginator";

export default {
  name: "Search",
  components: {
    Dropdown,
    InputText,
    InputNumber,
    Button,
    ProgressSpinner,
    Paginator,
  },
  setup() {
    const sneakers = ref([]);
    const loading = ref(false);
    const currentPage = ref(1);
    const totalItems = ref(0);
    const limit = 10;
    const filters = ref({
      brand: "",
      gender: "",
      character: "",
      minMarketValue: "",
      maxMarketValue: "",
    });

    const brands = ref([
      { label: "Nike", value: "Nike" },
      { label: "Adidas", value: "Adidas" },
      { label: "Puma", value: "Puma" },
    ]);

    const genders = ref([
      { label: "Men", value: "Men" },
      { label: "Women", value: "Women" },
    ]);

    const fetchSneakers = async () => {
      loading.value = true;
      try {
        const params = new URLSearchParams({
          page: currentPage.value,
          limit,
          ...Object.fromEntries(
            Object.entries(filters.value).filter(([_, v]) => v !== "")
          ),
        }).toString();
        const response = await fetch(`http://localhost:3100/sneakers?${params}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des sneakers.");
        }
        const data = await response.json();
        sneakers.value = data.items;
        totalItems.value = data.totalItems;
      } catch (error) {
        console.error("Erreur lors de la récupération des sneakers:", error);
        alert("Erreur de chargement.");
      } finally {
        loading.value = false;
      }
    };

    const applyFilters = () => {
      currentPage.value = 1;
      fetchSneakers();
    };

    const onPageChange = (event) => {
      currentPage.value = Math.ceil(event.first / limit) + 1;
      fetchSneakers();
    };

    onMounted(() => {
      fetchSneakers();
    });

    watch(
      filters,
      () => {
        applyFilters();
      },
      { deep: true }
    );

    return {
      sneakers,
      loading,
      currentPage,
      totalItems,
      limit,
      filters,
      brands,
      genders,
      applyFilters,
      onPageChange,
    };
  },
};
</script>

<style scoped>
.search-container {
  width: 90%;
  margin: 0 auto;
  padding: 30px;
  border-radius: 12px;
  background-color: #f3f7f9;
  box-shadow: 0px 6px 18px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.3s ease;
}

h1 {
  color: #1e3a5f;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 25px;
  text-align: center;
}

.filter-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  margin-bottom: 25px;
}

.filter-item {
  flex: 1 1 220px;
  background-color: #ffffff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

filter-item:hover {
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.1);
}

label {
  display: block;
  font-weight: 600;
  color: #2c6b8a;
  margin-bottom: 8px;
}

.price-range {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.sneakers-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.sneaker-item {
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 15px;
  border: 1px solid #d0e0eb;
  border-radius: 12px;
  background-color: #ffffff;
  transition: transform 0.3s, box-shadow 0.3s;
}

.sneaker-item:hover {
  transform: translateY(-5px);
  box-shadow: 0px 8px 25px rgba(0, 0, 0, 0.2);
}

.sneaker-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #a3c2d8;
}

.sneaker-info h3 {
  color: #1e3a5f;
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
}

.sneaker-info p {
  color: #2c6b8a;
  margin: 8px 0 0;
}

.pagination {
  margin-top: 25px;
  display: flex;
  justify-content: center;
}

.p-button-primary {
  background-color: #1e3a5f;
  border: none;
  color: #ffffff;
  transition: background-color 0.3s ease;
}

.p-button-primary:hover {
  background-color: #2c6b8a;
}

.p-button-outlined {
  border: 1px solid #2c6b8a;
  color: #2c6b8a;
  transition: border-color 0.3s ease, color 0.3s ease;
}

.p-button-outlined:hover {
  border-color: #1e3a5f;
  color: #1e3a5f;
}
</style>