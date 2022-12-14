<template>
  <div>
    <div class="row mb-3">
      <div class="col">
        <b>Crawls</b>
      </div>
    </div>

    <div
      v-if="!valid.lists"
      class="row mb-3"
    >
      <div class="col">
        <div
          class="alert alert-warning alert-dismissible fade show"
          role="alert"
        >
          <strong>No website list created yet. Create a website list first!</strong>  
        </div>
      </div>
    </div>

    <div
      v-if="settings.hasOwnProperty('backgroundRecording') && settings.backgroundRecording"
      class="row mb-3"
    >
      <div class="col">
        <div
          class="alert alert-warning alert-dismissible fade show"
          role="alert"
        >
          <strong>Background recording is turned on. This may cause noise!</strong>  
        </div>
      </div>
    </div>    

    <div class="row mb-3">
      <div class="col">
        <div class="card border-primary">
          <div class="card-header bg-primary text-white">
            Run crawl
          </div>
          <div class="card-body">
            <div class="row d-flex align-items-center">
              <div class="col-3">
                <input 
                  v-model="crawl.tag" 
                  type="text"
                  class="form-control"
                  :class="{ 'is-valid': valid.tag, 'is-invalid': !valid.tag }"
                  placeholder="AlexaTop10kUS-run-01"
                  :disabled="!valid.lists"
                >     
              </div>
              <div class="col-3">
                <select 
                  v-model="crawl.list" 
                  class="form-select"
                  :class="{ 'is-valid': valid.list, 'is-invalid': !valid.list }"
                  :disabled="!valid.lists"
                >
                  <option 
                    v-for="list, index in lists" 
                    :key="index" 
                    :value="index"
                  >
                    {{ list.name }}
                  </option>
                </select>              
              </div>
              <div class="col-1">
                <button
                  type="button"
                  class="btn btn-outline-danger"
                  data-bs-toggle="modal"
                  data-bs-target="#confirm-modal"                
                  :disabled="!valid.tag || !valid.list || !valid.lists"
                >
                  <i class="bi bi-play-circle" />
                </button>
              </div>
              <div class="col-5">
                <div 
                  v-if="running" 
                  class="progress"
                >
                  <div
                    class="progress-bar" 
                    role="progressbar" 
                    :style="'width: ' + percent + '%'" 
                    :aria-valuenow="percent" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {{ percent }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>      
      </div>

      <confirm-modal
        title="Start crawl"
        text="Are you sure that you want to start this crawl?"
        @ok="Crawler.start(crawl.tag, lists[crawl.list])"
      />
    </div>

    <div
      v-if="crawls.length > 0"
      class="row"
    >
      <div class="col">
        <table class="table table-hover align-middle mt-3">
          <thead>
            <th
              v-for="h, i in [
                'Tag',
                'Website List',
                'Started',
                'Finished',
                'Closed-in-Catch*',
                'Version'
              ]"
              :key="i"
              scope="col"
            >
              {{ h }}
            </th>
          </thead>
          <tbody>
            <tr 
              v-for="(c, index) in crawls.slice(view.page * view.window, (view.page + 1) * view.window)"
              :key="index"
            >
              <td>{{ c.tag }}</td>
              <td>{{ c.list }}</td>
              <td>{{ new Date(c.startedAt).toLocaleString() }}</td>
              <td>{{ new Date(c.doneAt).toLocaleString() }}</td>
              <td>{{ c.tabsNotResponding }}</td>
              <td>{{ c.version }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-else
      class="row mt-3"
    >
      <div class="col">
        <div class="card card-body">
          No crawls conducted yet.
        </div>
      </div>
    </div>

    <div
      v-if="crawls.length > 0"
      class="d-flex"
    >
      <button
        class="btn me-auto"
        :class="{ 'btn-secondary': first, 'btn-outline-primary': !first }"
        :disabled="first"
        @click="view.page--"
      >
        <i class="bi bi-arrow-left-circle" />
      </button>
      <button
        class="btn "
        :class="{ 'btn-secondary': last, 'btn-outline-primary': !last }"
        :disabled="last"
        @click="view.page++"
      >
        <i class="bi bi-arrow-right-circle" />
      </button>
    </div>

    <div class="row mt-3">
      <div class="col">
        <small>
          * Unresponsive tabs, which did not respond to the close message of the crawler.
          There are many reasons for such behavior.
          Data might or might not have been recorded for this website.
        </small>
      </div>
    </div>    
  </div>
</template>

<script>
import ConfirmModal from "../modals/ConfirmModal.vue";

export default {
  components: {
    ConfirmModal
  },
  data: () => {
    return {
      Crawler: tex.Crawler,
      crawls: [],
      crawl: {
        tag: "",
        list: 0,
      },
      lists: [],
      log: {},
      view: {
        page: 0,
        window: 10,
      },
      settings: {}
    }
  },
  computed: {
    first() {
      return this.view.page === 0;
    },
    last() {
      return Object.values(this.crawls).length <= ((this.view.page + 1) * this.view.window)
    },
    valid() {
      return {
        tag: this.crawl.tag.length > 0,
        list: this.crawl.list < Object.values(this.lists).length,
        lists: Object.values(this.lists).length > 0
      };
    },
    percent() {
      return tex
        .Statistics
        .percent(this.log.tabsCompleted, this.log.tabsToFinish);
    },
    running() {
      return this.log.hasOwnProperty("startedAt")
        && this.log.startedAt > 0
        && this.log.hasOwnProperty("doneAt")
        && this.log.doneAt === 0;
    }
  },
  mounted() {
    tex.Setting.all((settings) => this.settings = settings);
    tex.WebsiteList.all((lists) => this.lists = lists);
    tex.Crawl.all((crawls) => this.crawls = crawls.reverse());

    this.emitter.on("settings", (cfg) => {
      this.settings = cfg.settings;
    });
    
    const self = this;
    window.addEventListener("crawler:log", function(e) {
      self.log = e.detail.log;
      if (e.detail.log.doneAt > 0) {
        self.crawls.unshift(e.detail.log);
        self.log = {};
      }
    });
  }
}
</script>