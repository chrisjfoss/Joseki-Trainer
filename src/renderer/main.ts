import { createApp } from 'vue'
import App from './App.vue'
import router from "@/router";
import Goban from "./plugins/shudanForVue";
import Quasar from "./plugins/quasar";

createApp(App)
  .use(router)
  .use(Goban)
  .use(Quasar)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
