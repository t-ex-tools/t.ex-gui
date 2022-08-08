<template>
  <div>
    <nav-bar 
      :data-tag="boundaries.dataTag"
      :data-length="length"
      :data-loaded="loaded"
      @reset="reset"
    />

    <div class="container-fluid h-100">
      <div class="row h-100">
        <div class="col-3 pt-3">
          <navigation />
        </div>

        <div class="col-9 pt-3 mb-3">
          <router-view
            :data-tag="boundaries.dataTag"
            :boundaries="boundaries"
            :data-length="length"
            :data-loaded="loaded"
          />
        </div>
      </div>
    </div>

    <init-modal 
      @data="setLoaded"
    />

    <settings-modal />
  </div>
</template>

<script>
import InitModal from "./components/modals/InitModal.vue";
import SettingsModal from "./components/modals/SettingsModal.vue";

import NavBar from "./components/navigation/NavBar.vue";
import Navigation from "./components/navigation/Navigation.vue";

export default {
  name: "App",
  components: {
    InitModal,
    SettingsModal,
    Navigation,
    NavBar,
  },
  data: () => {
    return {
      boundaries: {
        dataTag: "",
        lower: 0,
        upper: 0
      },
      length: 0
    };
  },
  computed: {
    loaded() {
      return this.length > 0;
    }
  },
  mounted() {
  },
  methods: {
    setLoaded(data) {
      this.boundaries = data.boundaries;
      this.length = data.length;
    },
    reset() {
      window.location.reload();
    }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
