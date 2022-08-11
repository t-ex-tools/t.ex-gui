<template>
  <div>
    <div class="row mb-3">
      <div class="col">
        <b>Export</b>
      </div>
    </div>

    <div 
      v-if="!dataLoaded" 
      class="row"
    >
      <div class="col">
        <div 
          class="alert alert-warning alert-dismissible fade show"
          role="alert"
        >
          <strong>
            No data loaded yet. Use the <b>Load data</b>
            button at the top right to load data.
          </strong>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <div 
          id="types"
          class="accordion"
        >
          <div 
            v-for="(type, index) in types" 
            :key="index" 
            class="accordion-item"
          >
            <h2 
              :id="'heading-' + index"
              class="accordion-header"
            >
              <button
                class="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                :data-bs-target="'#collapse-' + index"
                aria-expanded="true"
                :aria-controls="'collapse-' + index"
              >
                {{ labels.types[type] }}
              </button>
            </h2>
            <div
              :id="'collapse-' + index"
              class="accordion-collapse collapse"
              :aria-labelledby="'heading-' + index"
              data-bs-parent="#types"
            >
              <div class="accordion-body">
                <div
                  v-for="(group, i) in groups(type)"
                  :key="i"
                  class="table-responsive mb-3"
                >
                  <b>{{ group.label }}</b>
                  <table class="table table-hover align-middle mt-1">
                    <thead>
                      <th scope="col">
                        Feature
                      </th>
                      <th scope="col">
                        Description
                      </th>
                      <th
                        v-for="q, j in Queries.groups()"
                        :key="j"
                        scope="col"
                        class="text-center"
                      >
                        {{ q.label }}
                      </th>
                      <th 
                        class="text-end"
                        scope="col"
                      >
                        Data
                      </th>
                    </thead>
                    <tbody>
                      <tr 
                        v-for="(feature, j) in group.featureGroup" 
                        :key="j"
                      >
                        <td style="width: 15%">
                          {{ feature.name }}
                        </td>
                        <td style="width: 30%">
                          {{ feature.subtitle }}
                        </td>
                        <td
                          v-for="q, k in Queries.groups()"
                          :key="k"
                        >
                          <div class="form-check form-switch">
                            <input
                              class="form-check-input mx-auto"
                              :name="k"
                              type="checkbox"
                              role="switch"
                              @change="query(feature.path, q, $event)"
                            >
                          </div>                          
                        </td>
                        <td>
                          <div class="form-check form-switch">
                            <input
                              class="form-check-input float-end"
                              :name="feature.path"
                              type="checkbox"
                              role="switch"
                              @change="select"
                            >
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-for="(type, index) in types"
      :key="index"
      class="row mt-2"
    >
      <div class="col">
        <button
          class="btn btn-outline-primary float-end"
          type="button"
          :disabled="!dataLoaded"
          data-bs-toggle="modal"
          :data-bs-target="'#loading-modal-' + suffix"
          @click="download(false, type)"
        >
          <i class="bi bi-download me-2" />
          <small>Export {{ type.toUpperCase() }}</small>
        </button>
      </div>
    </div>

    <div class="row mt-2">
      <div class="col">
        <button
          class="btn btn-outline-primary float-end"
          type="button"
          :disabled="features.length === 0 || !dataLoaded"
          data-bs-toggle="modal"
          :data-bs-target="'#loading-modal-' + suffix"
          @click="download(true, types[selected])"
        >
          <i class="bi bi-download me-2" />
          <small>Export {{ features.length }} features</small>
        </button>
      </div>
    </div>

    <div class="row mt-2">
      <div class="col">
        <button
          class="btn btn-outline-primary float-end"
          type="button"
          :disabled="Object.keys(queries).length === 0 || !dataLoaded"
          data-bs-toggle="modal"
          :data-bs-target="'#loading-modal-' + suffix"
          @click="statistics"
        >
          <i class="bi bi-download me-2" />
          <small>
            Export statistics
          </small>
        </button>       
      </div>
    </div>

    <loading-modal 
      :suffix="suffix"
      :loaded="view.loaded"
      :total="view.total"
    />
  </div>
</template>

<script>
import LoadingModal from "../modals/LoadingModal.vue";
import { toRaw } from "vue";

export default {
  components: {
    LoadingModal,
  },
  props: {
    dataLoaded: {
      type: Boolean,
      default: () => false
    },    
    dataTag: {
      type: String,
      default: () => "",
    },
    boundaries: {
      type: Object,
      default: () => ({ lower: 0, upper: 0 }),
    },    
  },
  data: () => {
    return {
      suffix: "export",
      FeatureExtractor: tex.FeatureExtractor,
      Queries: tex.Queries,
      labels: {
        types: {
          http: "HTTP/S requests & responses",
          js: "JavaScript API accesses",
        },
      },
      view: {
        loaded: 0,
        total: -1,
      },
      selected: 0,
      features: [],
      queries: {},
      option: 0,
    };
  },
  computed: {
    types() {
      return [
        ...new Set(
          tex.FeatureExtractor.features().map((f) => f.split(".").shift())
        ),
      ];
    },
  },
  mounted() {
    const self = this;
    let c = document.getElementById("types");
    c.addEventListener("show.bs.collapse", function (e) {
      let tmp = e.target.id.split("-").pop();
      if (self.selected !== tmp) {
        self.selected = tmp;
        self.features = [];
        self.queries = {};
        [...document.querySelectorAll(".form-check-input")].forEach(
          (n) => (n.checked = false)
        );
      }
    });

    window.addEventListener("statistics:loading:update", (e) => {
      this.view.loaded = e.detail.loaded;
      this.view.total = e.detail.total;
    });
  },
  methods: {
    nest(base, names) {
      for (var i = 0; i < names.length; i++) {
        base = base[names[i]] = base[names[i]] || {};
      }
    },
    groups(type) {
      return tex.FeatureExtractor.navigation().filter(
        (f) => f.featureGroup[0].path.split(".").shift() === type
      );
    },
    select(e) {
      if (e.target.checked) {
        this.features.push(e.target.name);
      } else {
        this.features.splice(this.features.indexOf(e.target.name), 1);
      }
    },
    query(feature, query, e) {
      if (!this.queries[feature]) {
        this.queries[feature] = [];
      }
      
      if (e.target.checked) {
        this.queries[feature].push(query);
      } else {
        let index = this.queries[feature].findIndex((q) => q.id === query.id);
        this.queries[feature].splice(index, 1);
      }
    },
    statistics() {
      tex.Export.statistics(
        this.boundaries,
        this.types[this.selected],
        toRaw(this.queries),
        this.dataTag
      );
    },
    download(transformed, type) {
      tex.Export.data(
        this.boundaries, 
        type, 
        (transformed) ? this.features : [], 
        this.dataTag, 
        (loaded, total) => {
          this.view.loaded = loaded;
          this.view.total = total;
        }
      )
    },
  },
};
</script>