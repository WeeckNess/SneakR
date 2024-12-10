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
      path: '/Cart',
      name: 'cart',
      component: () => import('../views/CartView.vue'),
    },
    {
      path: '/Search',
      name: 'search',
      component: () => import('../views/SearchView.vue'),
    },
  ],
})

export default router