<template>
  <div>
    <div class="row mb-3">
      <div class="col">
        <b>Website Lists</b>
      </div>
      <div class="col">
        <button
          class="btn btn-outline-primary float-end"
          data-bs-toggle="modal"
          data-bs-target="#website-lists-modal"
          @click="select(null)"
        >
          <i class="bi bi-plus-circle me-2" />
          <small>Create list</small>
        </button>
      </div>
    </div>

    <div
      v-if="lists.all.length > 0"
      class="row"
    >
      <div class="col">
        <div
          v-if="alert.visible"
          class="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <strong>{{ alert.message }}</strong>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
          />
        </div>

        <table class="table table-hover align-middle mt-3">
          <thead>
            <th scope="col">
              Name
            </th>
            <th scope="col">
              URLs
            </th>
            <th scope="col">
              Actions
            </th>
          </thead>
          <tbody>
            <tr 
              v-for="(list, index) in lists.all.slice(view.page * view.window, (view.page + 1) * view.window)"
              :key="index"
            >
              <td style="width: 20%">
                {{ list.name }}
              </td>
              <td style="width: 60%">
                {{ urlInfo[index] }}
              </td>
              <td style="width: 20%">
                <button
                  class="btn btn-outline-secondary me-2"
                  data-bs-toggle="modal"
                  data-bs-target="#website-lists-modal"
                  @click="select(view.page * view.window + index)"
                >
                  <i class="bi bi-pencil" />
                </button>
                <button
                  class="btn btn-outline-danger"
                  data-bs-toggle="modal"
                  data-bs-target="#confirm-modal"
                  @click="select(view.page * view.window + index)"
                >
                  <i class="bi bi-x-circle" />
                </button>
              </td>
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
          No website lists created yet.
        </div>
      </div>
    </div>

    <div
      v-if="lists.all.length > 0"
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

    <website-lists-modal
      :list="lists.selected"
      @save-list="save"
    />

    <confirm-modal
      title="Delete website list"
      text="Are you sure that you want to delete this website list?"
      @ok="rm"
    />

    <div class="row mt-3">
      <div class="col">
        <b>Popular Lists</b>
      </div>
    </div>    

    <div class="row mt-3">
      <div
        v-for="list, index in lists.popular"
        :key="index" 
        class="col d-flex"
      >
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">
              {{ list.name }}
            </h5>
            <p class="card-text">
              Learn more about {{ list.name }} at:
              <a 
                :href="list.homepage" 
                :title="list.homepage" 
                target="_blank"
              >
                {{ list.homepage }}
              </a>
            </p>
            <a 
              :href="list.url" 
              class="btn btn-primary"
            >
              Download list
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WebsiteListsModal from "../modals/WebsiteListsModal.vue";
import ConfirmModal from "../modals/ConfirmModal.vue";
import { toRaw } from "vue";
import websiteLists from "../../assets/data/website-lists.json";

export default {
  components: {
    WebsiteListsModal,
    ConfirmModal,
  },
  data: () => {
    return {
      view: {
        page: 0,
        window: 5,
        preview: 5,
      },
      lists: {
        all: [],
        selected: null,
        popular: websiteLists,
      },
      alert: {
        visible: false,
        message: "",
      },
    };
  },
  computed: {
    first() {
      return this.view.page === 0;
    },
    last() {
      return this.lists.all.length <= (this.view.page + 1) * this.view.window;
    },
    urlInfo() {
      return this.lists.all.map((l) => {
        let urls = l.urls.split(/\r\n|\r|\n/g);
        return urls.length <= this.view.preview
          ? urls.join(", ")
          : urls.slice(0, this.view.preview).join(", ") +
              " and " +
              (urls.length - this.view.preview) +
              " more.";
      });
    },
  },
  mounted() {
    tex.WebsiteList.all((lists) => this.lists.all = lists);
  },
  methods: {
    select: function (index) {
      this.lists.selected = null;
      this.$nextTick(function () {
        this.lists.selected = this.lists.all[index];
      });
    },
    save(list) {
      if (this.lists.selected) {
        let index = this.lists.all.indexOf(this.lists.selected);
        tex.WebsiteList.set(index, toRaw(list), (lists) =>  this.lists.all = lists);
      } else {
        tex.WebsiteList.add(toRaw(list), (lists) =>  this.lists.all = lists);
      }
      this.notify("Website list successfully saved.");
    },
    rm() {
      let index = this.lists.all.indexOf(this.lists.selected);
      tex.WebsiteList.remove(index, (lists) =>  this.lists.all = lists);
      this.notify("Website list successfully deleted.");
      if (!this.first && this.last) {
        this.view.page--;
      }
    },
    notify(msg) {
      this.alert.message = msg;
      this.alert.visible = true;
      setTimeout(() => (this.alert.visible = false), 2500);
    },
  },
};
</script>