import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [ 
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/Profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/Wishlist',
      name: 'wishlist',
      component: () => import('../views/WishlistView.vue'),
    },
    {
      path: '/Search',
      name: 'search',
      component: () => import('../views/SearchView.vue'),
    },
    {
      path:'/Dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
    },
  ],
})

export default router