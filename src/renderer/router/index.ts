import TrainingPage from '@/views/TrainingPage.vue';
import StatisticsPage from '@/views/StatisticsPage.vue';
import DatabasePage from '@/views/DatabasePage.vue';
import HomePage from '@/views/HomePage.vue';

import {
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router';

const routes = [
  {
    path: '/',
    component: HomePage
  },
  {
    path: '/train',
    component: TrainingPage
  },
  {
    path: '/statistics',
    component: StatisticsPage
  },
  {
    path: '/databases',
    component: DatabasePage
  }
];

const router = createRouter({
  history:
    navigator.userAgent.toLowerCase().indexOf(' electron/') > -1
      ? createWebHashHistory()
      : createWebHistory(),
  routes
});

export default router;
