<template>
  <b-container :style="{ cursor: mouseOn !== '' ? 'pointer' : 'default'}" fluid @mouseleave="mouseOn = ''" class="overflow-vertical p-0 h-100 w-100">
    <b-table-simple small fixed hover class="minH">
      <b-thead>
        <b-tr>
          <b-td class="text-center" colspan="2">
            <div class="d-flex justify-content-around">
              <b-button
                v-b-tooltip.hover
                :title="`${cyclePaused ? 'Unpauses' : 'Pauses'} cycling`"
                @click="emitPause" squared size="sm" :variant="cyclePaused ? 'outline-secondary': 'outline-info'"><font-awesome-icon
                v-if="cyclePaused"
                icon="play-circle"
                ></font-awesome-icon>
                <font-awesome-icon
                v-else
                icon="pause-circle"
                ></font-awesome-icon>
                </b-button>
                <b-button
                squared
                size="sm"
                v-b-tooltip.hover
                :title="`${editMode ? 'Deactivates' : 'Activates'} edit`"
                :variant="editMode ? 'info':'outline-info'"
                @click="toggleEditMode"
                >
                  <font-awesome-icon icon="pen-square"></font-awesome-icon>
                </b-button>
                <b-button
                v-b-tooltip.hover
                title="Show help"
                squared
                size="sm"
                variant="outline-info">
                <font-awesome-icon icon="info-circle" @click="$bvModal.show('help-modal')"></font-awesome-icon>
                </b-button>

              </div>

              <span><b>Run</b></span>

          </b-td>
          <b-th :colspan="5" class="text-center">Step</b-th>
          <b-th v-if="editMode" class="text-center">Status</b-th>

        </b-tr>
      </b-thead>
      <b-tbody>
          <run-status-table-row
            v-for="run in visibleRuns"
            :variant="selectedRun.run_id === run.run ? 'primary' : 'light'"
            :key="run.run"
            :run="run.run"
            :mouseOn="editMode"
            :step="run.step"
            :error="run.containsError"
            :hidden="hidden"
            @update-hidden="updateHidden"
            @select-run="selectRun"
            @mouse-on="event => mouseOn = event"
            @progress-finish="emitFinish"
          ></run-status-table-row>
          <run-status-table-row
          v-for="run in showHiddenRuns"
          :key="run.run"
          name="slide"
          :variant="editMode ? 'light' :  'secondary'"
          :run="run.run"
          :mouseOn="editMode"
          :step="run.step"
          :error="run.containsError"
          :hidden="hidden"
          @update-hidden="updateHidden"
          @select-run="selectRun"
          @mouse-on="event => mouseOn = event"
          @click="selectRun(run)"
          @progress-finish="emitFinish"
          ></run-status-table-row>
        <b-tr>
          <b-td
          v-show="!editMode && !hiddenRuns.length <= 0"
          @click="toggleHidden"
          @mouseover="mouseOn = 'hiddenButton'"
          class="text-center"
          colspan="7">
            <font-awesome-icon :icon="hiddenToggled ? 'angle-up' : 'angle-down'">
            </font-awesome-icon>
          </b-td>
        </b-tr>
      </b-tbody>
    </b-table-simple>

    <b-modal
      id="help-modal"
      ref="modal"
      title="Track and Trace visual information"
      size="lg"
      hide-footer
      >
      <help-modal-content></help-modal-content></b-modal>
  </b-container>
</template>

<script lang="ts">
import Vue from 'vue'
import ProgressBar from '@/components/Track&Trace-Components/ProgressBar.vue'
import RunStatusTableRow from '@/components/Track&Trace-Components/RunStatusTableRow.vue'
import helpModalContent from '@/components/Track&Trace-Components/HelpModalContent.vue'
import { Run, RunStatusData } from '@/types/dataTypes'
import { getFilteredArray } from '@/helpers/utils'

export default Vue.extend({
  name: 'run-status-table',
  components: {
    RunStatusTableRow,
    helpModalContent

  },
  data () {
    return {
      checkbox: false,
      mouse: '',
      hiddenToggled: false,
      show: 7,
      hidden: [] as string[],
      visibleRuns: [] as RunStatusData[],
      hiddenRuns: [] as RunStatusData[],
      hiddenRunsByLength: [] as RunStatusData[],
      editMode: false
    }
  },
  props: {
    totalRuns: {
      type: Array,
      required: true
    },

    selectedRun: {
      type: Object,
      required: false,
      default: () => { return {} as Run }
    },

    cyclePaused: {
      type: Boolean,
      required: true
    },

    statusVariant: {
      type: String,
      required: false,
      default: 'primary'
    }
  },
  methods: {
    toggleHidden () {
      this.hiddenToggled = !this.hiddenToggled
    },

    toggleEditMode () {
      this.editMode = !this.editMode
    },

    /**
     * emit selected run
     * @param {String} run - Run to select
     *
     * @emits 'select-run'
     * @returns {void}
     */
    selectRun (run: string): void {
      this.$emit('select-run', run)
    },

    /**
     * emit pause to stop cycling runs
     *
     * @emits 'toggle-cycle'
     * @returns {void}
     */
    emitPause (): void {
      this.$emit('toggle-cycle')
    },

    /**
    *  emit finish to save run as finished
    * @param {String} run - run id string
    *
    * @emits 'run-finished'
    * @returns {void}
    */
    emitFinish (run: string): void {
      this.$emit('run-finished', run)
    },

    /**
     * Updates hidden parameter
     * @param {String[]} hidden - hidden values array
     *
     * @returns {void}
     */
    updateHidden (hidden: string[]): void {
      this.hidden = hidden
    }
  },
  computed: {
    mouseOn: {
      get: function (): string {
        return this.mouse
      },
      set: function (run: string): void {
        this.mouse = run
      }
    },

    localHidden: {
      get: function (): string[] {
        return this.hidden
      },
      set: function (updatedHidden: string[]) {
        const totalRuns = this.totalRuns as RunStatusData[]
        this.hidden = [...updatedHidden, ...Array.from(totalRuns.filter((runStatusData) => {return runStatusData.step === 4 && !updatedHidden.includes(runStatusData.run) }), x => x.run)]
      }

    },

    /**
     * When hidden is toggled true return hidden array for display
     *
     * @returns {RunStatusData[]}
     */
    showHiddenRuns (): RunStatusData[] {
      if (this.hiddenToggled || this.editMode) {
        return this.hiddenRuns
      }
      return []
    },

    hiddenObjects (): RunStatusData[] {
      const totalRuns = this.totalRuns as RunStatusData[]
      return totalRuns.filter((run) => { return this.hidden.includes(run.run) })
    }
  },
  watch: {
    /**
     * When selected run changes check if it is hidden
     * if it is hidden cycle to the next run
     *
     * @emits 'cycle-next'
     * @returns {void}
     */
    selectedRun: function () {
      if (Array.from(this.hiddenRuns, x => x.run).includes(this.selectedRun.run_id)) {
        this.$emit('cycle-next')
      }
    },

    /**
     * when hidden v-model changes makes sure the visible runs does not extend the maximum show value
     *
     * @returns {void}
     */
    hidden: {
      immediate: true,
      handler () {
        const totalRuns = this.totalRuns as RunStatusData[]
        let notHidden: RunStatusData[] = getFilteredArray(totalRuns, this.hiddenObjects)
          this.visibleRuns = notHidden
        this.hiddenRuns = getFilteredArray(this.totalRuns, this.visibleRuns)
      }
    },

    totalRuns: function () {
      if (this.hidden.length === 0) {
        this.hidden = []
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.slide-enter, .slide-leave-to{
  transform: scaleY(0);
}

.h-5r {
  max-height: 45vh
}

.minH {
  min-height: 100%
}

.overflow-vertical {
  overflow-y: scroll
}
</style>
