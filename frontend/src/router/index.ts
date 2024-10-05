import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/model/:name',
      name: 'model',
      component: () => import('../views/ModelView.vue')
    },
    {
      path: '/jakub/:name',
      name: 'jakub',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/HomeViewJakub.vue')
    }
  ]
})

export default router
