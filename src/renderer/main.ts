import { createApp } from 'vue'
import App from './App.vue'
import router from "@/router";
import Goban from "./plugins/shudanForVue";

createApp(App)
  .use(router)
  .use(Goban)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
