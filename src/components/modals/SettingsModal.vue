<template>
  <div
    id="settings-modal"
    class="modal"
    tabindex="-1"
  >
    <div class="modal-dialog modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Settings
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col">
              <ul class="list-group mb-3">
                <li
                  v-for="(k, index) in Object.keys(settings)"
                  :key="index"
                  class="list-group-item"
                >
                  <div class="row">
                    <div class="col-8">
                      <div class="fw-bold">
                        {{ settings[k].label }}
                      </div>
                      <small>{{ settings[k].description }}</small>
                    </div>
                    <div class="col-4">
                      <div class="form-check form-switch">
                        <input
                          v-if="settings[k].type === 'checkbox'"
                          class="form-check-input float-end"
                          :name="k"
                          :type="settings[k].type"
                          role="switch"
                          :checked="
                            values[k]
                              ? values[k]
                              : settings[k].default
                          "
                          @change="set"
                        >
                        <input
                          v-else
                          :name="k"
                          type="number"
                          class="form-control"
                          :value="
                            values[k]
                              ? values[k]
                              : settings[k].default
                          "
                          @blur="set"
                        >
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-primary"
            data-bs-dismiss="modal"
          >
            Exit settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toRaw } from "vue";

export default {
  data: () => {
    return {
      values: {},
      settings: tex.Setting.config(),
    };
  },
  mounted() {
    tex.Setting.all((settings) => this.values = settings);
  },
  methods: {
    set(evt) {
      let o = this.values[evt.target.name];
      let n = 
        evt.target.type === "checkbox" ? evt.target.checked : evt.target.value;

      if (o === n) {
        return;
      }
      
      this.values[evt.target.name] = n;

      if (tex.Settings[evt.target.name].handler) {
        tex.Settings[evt.target.name].handler(n);
      }

      tex.Setting
        .save(
          toRaw(this.values),
          (settings) => {
            tex.Runtime
              .sendMessage(settings);

            this.emitter
              .emit("settings", settings);
          }
        );
    },
  },
};
</script>