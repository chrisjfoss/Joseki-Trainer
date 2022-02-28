import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import VCalendar from "v-calendar";
import Goban from "./plugins/ShudanForVue";

const app = createApp(App);
app.use(VCalendar, {});
app.use(router);
app.use(Goban);

app.mount("#app");
