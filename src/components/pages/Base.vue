<template>
  <div>
    <div class="row mb-3">
      <div class="col">
        <b>Features</b>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <div class="card card-body mb-3">
          <div class="fw-bold">
            {{ featureInfo.title }}
          </div>
          <div>
            {{ featureInfo.subtitle }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="!dataLoaded"
      class="row mb-3"
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

    <div 
      v-if="dataLoaded"
      class="row"
    >
      <div class="col">
        <select
          v-model="values.selected"
          class="form-select" 
          aria-label="Values"
        >
          <option
            v-for="option, index in values.options"
            :key="index"
            :value="index"
            :selected="index === values.selected"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
      <div class="col">
        <button
          class="btn btn-outline-primary float-end"
          type="button"
          @click="tex.Export.download(
            tex.Export.filename(
              [dataTag, feature],
              [
                feature, 
                values.options[values.selected].slug,
                queries.default[queries.selected].label
              ],
              'csv'
            ),
            tex.Table.csv(
              tex.Table.to(
                table, 
                values.options[values.selected].impl
              )
            ),
            'data:application/csv;charset=utf-8'
          )"
        >
          <i class="bi bi-table me-2" />
          <small>Export CSV</small>
        </button>        
      </div>
    </div>

    <div 
      v-if="dataLoaded"
      class="row my-3"
    >
      <div class="col">
        <tab-bar
          :queries="queries.default"
          :selected-index="queries.selected"
          :is-loading="loading.processing"
          @tabs-changed="(i) => {
            if (queries.selected !== i) {
              queries.selected = i;
              loading.processing = true;
            }
          }"
        />
      </div>
    </div>

    <div class="row mb-3">
      <div class="col">
        <div 
          v-if="loading.isLoading" 
          class="progress"
        >
          <div
            class="progress-bar bg-primary"
            :style="'width: ' + progress + '%'"
            role="progressbar"
            :aria-valuenow="loading.loaded"
            aria-valuemin="0"
            :aria-valuemax="loading.total"
          >
            {{ progress }}%
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <data-table 
          :items="tex.Table.to(
            table, 
            values.options[values.selected].impl
          )" 
        />
      </div>
    </div>
  </div>
</template>

<script>
import TabBar from "../TabBar.vue";
import DataTable from "../DataTable.vue";
import { toRaw } from "vue";

const empty = { isLoading: false, processing: false, loaded: 0, total: 0 };

export default {
  components: {
    TabBar,
    DataTable,
  },
  props: {
    dataLoaded: {
      type: Boolean,
      default: () => false,
    },
    feature: {
      type: String,
      default: () => "",
    },
    featureInfo: {
      type: Object,
      default: () => {},
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
      tex,
      queries: {
        default: tex.Queries.groups(),
        selected: 0,
      },
      loading: { ...empty },
      table: [],
      values: {
        selected: 0,
        options: tex.Table.options()
      },
    };
  },
  computed: {
    progress() {
      return tex
        .Statistics
        .percent(this.loading.loaded, this.loading.total);
    },
  },
  watch: {
    dataLoaded() {
      this.reset();
    },
    feature: {
      immediate: true,
      handler: function () {
        this.reset();
      },
    }, 
    queries: {
      deep: true,
      handler: function () {
        this.reset();
      },
    },
  },
  mounted() {
    window.addEventListener("statistics:loading:update", (e) => {
      if (e.detail.loaded === e.detail.total) {
        this.loading = { ...empty };
      } else {
        this.loading.processing = true;
        this.loading.isLoading = true;
        this.loading.loaded = e.detail.loaded;
        this.loading.total = e.detail.total;
      }
    });
  },
  methods: {

    reset() {
      this.data = {};
      this.query();
    },

    query() {

      tex
        .StatisticsController
        .compute(

          {
            condition: () => true,
            boundaries: this.boundaries,
            type: this.feature.split(".").shift(),
            queries: { 
              [this.feature]: [ 
                toRaw(this.queries.default[this.queries.selected]) 
              ] 
            }
          },

          (table) => 
            this.table = table
        );
    },

  },

};
</script>