<template>
  <div class="date_picker" style="min-width: 14em">
    <q-field color="grey-3" outlined :label="label" dense stack-label>
      <template v-slot:append>
        <q-icon name="event" :class="['cursor-pointer', 'date_picker_'+ name]"/>
        <q-popup-proxy transition-show="scale" transition-hide="scale" ref="datePiker" @before-hide="hidePopup">
          <q-date class="date" v-model="datePick" mask="YYYY-MM-DD" :range="range" :options="options"
                  style="width: 320px"
                  @input="changeDate">
            <div v-if="showButton" class="row q-col-gutter-xs">
              <q-btn flat size="xs" class="q-mr-xs col-xs-5 col-sm-5" @click="searchDay('today')" color="primary"
                     label="当天"/>
              <q-btn flat size="xs" class="q-mr-xs col-xs-6 col-sm-6" @click="searchDay('seven')" color="primary"
                     label="最近七天"/>
              <q-btn flat size="xs" class="q-mr-xs col-xs-5 col-sm-5" @click="searchDay('sameMonth')" color="primary"
                     label="当月"/>
              <q-btn flat size="xs" class="q-mr-xs col-xs-5 col-sm-5" @click="searchDay('lastMonth')" color="primary"
                     label="上月"/>
            </div>
          </q-date>
        </q-popup-proxy>
      </template>
      <template v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0" @click="focus">
          <template v-if="range">{{ datePick.from }} <span v-if="datePick.from">~</span> {{ datePick.to }}</template>
          <template v-else>{{ datePick }}</template>
        </div>
      </template>
    </q-field>
  </div>
</template>

<script>
import { getCurrentDate } from 'src/morejs/utils'

/**
 * 未实现单个日期
 */
export default {
  name: 'DatePicker',
  props: {
    label: {
      default: '时间'
    },

    /**
     *  初始值
     *  1.时间字符串
     *  2 range=true时, {from: '', to: ''}
     * */
    date: {},
    /**
     * 显示四个日期条件按钮
     */
    showButton: {
      type: Boolean,
      default: false
    },
    /**
     * 财务报账的范围提醒
     */
    specialLimit: {
      type: Boolean,
      default: false
    },
    /**
     * 多个时用来区分
     */
    name: {
      type: String
    },

    /**
     * 配置
     */
    options: {},

    /**
     * 是否是时间段
     */
    range: {
      type: Boolean,
      default: true
    },

    dateScope: {
      type: Number,
      default: 7
    },
    limit: {
      type: Number,
      default: 30
    },
    noDefault: {
      type: Boolean,
      default: false
    },
    isInit: {
      default: true
    }
  },

  mounted () {
    if (!this.noDefault) {
      this.initDate()
    } else {
      this.datePick = {
        from: '',
        to: ''
      }
    }
  },

  data () {
    return {
      datePick: {}
    }
  },
  methods: {
    focus () {
      const icon = document.getElementsByClassName('date_picker_' + this.name)[0]
      if (icon) icon.click()
    },

    initDate () {
      if (!this.range) return
      if (this.showButton) {
        this.datePick = {
          from: getCurrentDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()),
          to: getCurrentDate(new Date().getTime())
        }
      } else {
        this.datePick = {
          from: getCurrentDate(new Date().getTime() - ((this.dateScope - 1) * 24 * 60 * 60 * 1000)),
          to: getCurrentDate(new Date().getTime())
        }
      }
      this.changeDate()
    },

    hidePopup () {
      if (this.noDefault) {
        this.changeDate()
        return
      }
      if (!this.range) return
      if (!(this.datePick.from && this.datePick.to)) {
        this.initDate()
      }
    },

    changeDate () {
      if (!this.datePick) {
        this.datePick = {}
        return
      }
      if (typeof this.datePick === 'string') {
        const date = this.datePick
        this.datePick = {
          from: date,
          to: date
        }
      }
      if (this.specialLimit) {
        if ((new Date(this.datePick.to).getTime() - new Date(this.datePick.from).getTime() > this.limit * 24 * 60 * 60 * 1000) || (new Date(this.datePick.from).getTime() - new Date(this.datePick.to).getTime() > this.limit * 24 * 60 * 60 * 1000)) {
          this.$notify.warning(`所选时间范围不能超过${this.limit}天`)
          return
        }
      }
      this.$refs.datePiker.hide()
      this.$emit('change-date', this.datePick, this.name)
    },
    searchDay (opt) {
      switch (opt) {
        case 'today':
          this.datePick = {
            from: getCurrentDate(new Date().getTime()),
            to: getCurrentDate(new Date().getTime())
          }
          break
        case 'seven':
          this.datePick = {
            from: getCurrentDate(new Date().getTime() - (6 * 24 * 60 * 60 * 1000)),
            to: getCurrentDate(new Date().getTime())
          }
          break
        case 'sameMonth':
          this.datePick = {
            from: getCurrentDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()),
            to: getCurrentDate(new Date().getTime())
          }
          break
        case 'lastMonth':
          this.getLastMonth()
          break
        default:
          break
      }
      this.changeDate()
      this.$refs.datePiker.hide()
    },
    getLastMonth () {
      const month = new Date().getMonth()
      const year = new Date().getFullYear()
      const days = new Date(year, month, 0).getDate()
      if (month === 0) {
        this.datePick = {
          from: getCurrentDate(new Date(year, month - 1, 1).getTime()),
          to: getCurrentDate(new Date(year, month - 1, days).getTime())
        }
      } else {
        this.datePick = {
          from: getCurrentDate(new Date(year, month - 1, 1).getTime()),
          to: getCurrentDate(new Date(year, month - 1, days).getTime())
        }
      }
      return this.datePick
    }
  }
}
</script>

<style scoped lang="stylus">

  >>> .q-date__header {
    height: auto;
  }
</style>
