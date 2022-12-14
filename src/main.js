import { createApp } from "vue"
import App from "./App.vue"
import "bootstrap"
import "bootstrap-icons/font/bootstrap-icons.css"
import { createRouter, createWebHashHistory } from "vue-router"

import StaticRoutes from "./components/navigation/StaticRoutes.js";
import Base from "./components/pages/Base.vue";
import { markRaw } from "vue";

import mitt from "mitt";

tex.Setting.get(
  ["darkMode"],
  (settings) => tex.Setting.config().darkMode.handler(settings.darkMode)
);

const routes = StaticRoutes.concat(
  tex.FeatureExtractor.features().map((f) => {
    let featureInfo = tex.FeatureExtractor.info(f);
    return {
      path: "/" + f,
      label: featureInfo.title,
      component: markRaw(Base),
      props: () => {
        return {
          feature: f,
          featureInfo: featureInfo
        };
      },
    };
  })
);

var app = createApp(App)

var router = createRouter({ 
  history: createWebHashHistory(), 
  routes: routes 
});
app.use(router)

app.config.globalProperties.emitter = mitt();

app.mount("#app")