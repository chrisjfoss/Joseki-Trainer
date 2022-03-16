import TrainingPage from "../views/TrainingPage.vue";
import StatisticsPage from "../views/StatisticsPage.vue";
import DatabasePage from "../views/DatabasePage.vue";
import App from "../views/Home.vue";

import {
  createRouter,
  createWebHashHistory,
  createWebHistory
} from "vue-router";

const routes = [
  {
    path: "/",
    component: App
  },
  {
    path: "/train",
    component: TrainingPage
  },
  {
    path: "/statistics",
    component: StatisticsPage
  },
  {
    path: "/databases",
    component: DatabasePage
  }
];

const router = createRouter({
  history: process.env.IS_ELECTRON
    ? createWebHashHistory()
    : createWebHistory(),
  routes
});

export default router;
