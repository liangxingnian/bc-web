<template>
  <div style="position: relative">
    <div class="tips" v-show="labelTip">
      <div>{{labelTip}}</div>
      <div class="triangle"></div>
    </div>
    <q-field :square="square" outlined dense stack-label @click.native="$refs.datePiker.show; show = true"
             @blur="show = false; labelTip = ''">
      <template v-slot:control>
        <div class="flex items-center justify-between" style="min-width: 13em; width: 100%">
          <span v-show="date.from && date.to && !singleLimit">
            <div v-show="date.from && date.to" class="q-mr-sm">{{ date.from }} ~ {{ date.to }}</div>
          </span>
          <span v-show="date.from && singleLimit">
            <div v-show="date.from" class="q-mr-sm">{{ date.from }}</div>
          </span>
          <img :src="calendar" style="width: 16px; margin-bottom: 3px" v-show="!show"/>
          <img :src="calendarHover" style="width: 16px; margin-bottom: 3px" v-show="show"/>
        </div>
      </template>
      <q-popup-proxy ref="datePiker">
        <q-banner style="width: 650px; padding: 0" v-if="!singleLimit">
          <div class="row no-wrap">
            <w-date class="q-mt-sm col-6" :value="date.from" @on-change="change(arguments, 'from')"
                    :is-from="true" :hideHms="hideHms" :limit90Days="limit90Days"/>
            <w-date class="q-mt-sm col-6" :value="date.to" @on-change="change(arguments, 'to')"
                    :is-to="true" :hideHms="hideHms" :limit90Days="limit90Days"/>
          </div>
        </q-banner>
        <q-banner style="width: 325px; padding: 0" v-else>
          <div class="row no-wrap">
            <w-date class="q-mt-sm" :value="date.from" @on-change="change(arguments, 'from')"
                    :is-from="true" :hideHms="hideHms" :limit90Days="limit90Days"/>
          </div>
        </q-banner>
      </q-popup-proxy>
    </q-field>
  </div>
</template>

<script>
import WDate from './WDate'
import { getCurrentDate } from 'src/morejs/utils'
import calendar from 'src/assets/calendar/calendar.png'
import calendarHover from 'src/assets/calendar/calendarHover.png'

export default {
  components: {
    WDate
  },
  props: {
    square: {
      default: false
    },
    hideHms: {
      type: Boolean,
      default: false
    },
    disableDays: {
      type: Number,
      default: 0
    },
    scope: {
      type: Number,
      default: 6
    },
    currentDay: {
      type: Number,
      default: 0
    },
    limit90Days: {
      type: Boolean,
      default: false
    },
    needMounted: {
      type: Boolean,
      default: true
    },
    singleLimit: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      calendar,
      calendarHover,
      show: false,
      date: {},
      labelTip: ''
    }
  },
  mounted () {
    if (this.needMounted) {
      this.initDate()
    }
  },
  methods: {
    clear () {
      this.date = {}
      this.$emit('on-change', this.date)
    },
    change (args, field) {
      this.date[field] = args[0]
      const to = new Date(this.date.to).getTime()
      let from = new Date(this.date.from).getTime()
      if (this.scope === 1) {
        from = new Date(this.date.from).getTime() - (this.scope * 24 * 60 * 60 * 1000)
      }
      if (this.disableDays) {
        const scope = (this.disableDays - 1) * 24 * 60 * 60 * 1000
        if (Math.abs(to - from) > scope) {
          this.labelTip = `最大跨度为${this.disableDays}天`
          if (!this.hideHms) {
            this.date.from = getCurrentDate(new Date().getTime() - scope, '-', false, true)
          } else {
            this.date.from = getCurrentDate(new Date().getTime() - scope, '-')
          }
        } else {
          this.labelTip = ''
        }
      }
      if (to - from < 0) {
        const temp = this.date.from
        this.date.from = this.date.to
        this.date.to = temp
      }
      if (this.singleLimit) {
        this.$emit('on-change', this.date.from)
      } else {
        this.$emit('on-change', this.date)
      }
    },
    initDate () {
      let from
      let to
      this.labelTip = ''
      if (!this.hideHms) {
        from = getCurrentDate(new Date().getTime() - (this.scope * 24 * 60 * 60 * 1000), '-', false, true)
        to = getCurrentDate(new Date().getTime(), '-', false, false, true)
      } else {
        from = getCurrentDate(new Date().getTime() - (this.scope * 24 * 60 * 60 * 1000), '-')
        if (this.scope === 1) {
          to = getCurrentDate(new Date().getTime() - (this.scope * 24 * 60 * 60 * 1000), '-')
        } else {
          to = getCurrentDate(new Date().getTime(), '-')
        }
      }
      if (this.currentDay) {
        if (this.hideHms) {
          from = getCurrentDate(new Date().getTime() - (this.currentDay + 6) * 24 * 60 * 60 * 1000, '-', false, false)
          to = getCurrentDate(new Date().getTime() - this.currentDay * 24 * 60 * 60 * 1000, '-', false, false, false)
        } else {
          from = getCurrentDate(new Date().getTime() - (this.currentDay + 6) * 24 * 60 * 60 * 1000, '-', false, true)
          to = getCurrentDate(new Date().getTime() - this.currentDay * 24 * 60 * 60 * 1000, '-', false, false, true)
        }
      }
      this.date = {
        from,
        to
      }
      this.$emit('on-change', this.date)
    }
  }
}
</script>

<style scoped>
  >>> .q-field__control {
    color: #EF4C4D;
    max-width: 100%;
    outline: none;
  }

  .tips {
    position: absolute;
    height: 20px;
    line-height: 20px;
    top: -20px;
    left: 30px;
    z-index: 3;
    background-color: #282A3A;
    color: #FFF;
    padding: 2px 4px;
    border-radius: 3px;
    box-shadow: 0px 3px 14px 1px rgba(0, 0, 0, 0.05);
  }

  .triangle {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    top: 20px;
    left: 52px;
    border-top: 6px solid #282A3A;
    border-bottom: 0px solid transparent;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
  }
</style>
