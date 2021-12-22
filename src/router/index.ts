import TrainingPage from "../views/TrainingPage.vue";
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
  }
];

const router = createRouter({
  history: process.env.IS_ELECTRON
    ? createWebHashHistory()
    : createWebHistory(),
  routes
});

export default router;
