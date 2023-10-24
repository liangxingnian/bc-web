<template>
  <div class="calendar">
    <div class="flex items-center justify-between"
         style="margin-right: 8px; margin-left: 8px; margin-top: 13px; margin-bottom: 13px">
      <div>
        <span style="color: #EF4C4D; font-size: 16px">{{selectData.year}}年</span>
        <span style="margin-left: 8px; margin-right: 8px; font-size: 16px">/</span>
        <span style="color: #EF4C4D; font-size: 16px">{{selectData.month}}月</span>
      </div>
      <div class="flex items-center">
        <img :src="lastMonthDisabled" style="width: 32px" class="cursor-not-allowed"
             v-if="limit90Days && add0(startMonth) == selectData.month"/>
        <img :src="lastMonthUrl" style="width: 32px" class="cursor-pointer"
             @mouseover="lastMonthUrl = lastMonthHover" @mouseleave="lastMonthUrl = lastMonth"
             @click="handlePreMonth" v-else/>
        <div style="width: 12px; height: 12px; border: 1px solid #777986; border-radius: 50%"></div>
        <img :src="nextMonthUrl" style="width: 32px" class="cursor-not-allowed" v-if="monthDisabled"/>
        <img :src="nextMonthUrl" style="width: 32px" class="cursor-pointer"
             @mouseover="nextMonthUrl = nextMonthHover" @mouseleave="nextMonthUrl = nextMonth"
             @click="handleNextMonth" v-else/>
      </div>
    </div>
    <q-separator class="q-mt-sm" style="margin-bottom: 16px"/>
    <div class="week-area">
      <div
        class="week-item"
        v-for="(item, index) in weekArr"
        :key="index">
        <span class="week-font calendar-item">{{ item }}</span>
      </div>
    </div>
    <section
      ref="calendar"
      class="data-container"
      :style="{
        transitionDuration: `${needHeightAnimation ? transitionDuration : 0}s`,
      }"
      @touchstart="touchStart"
      @touchmove.stop.prevent="touchMove"
      @touchend="touchEnd"
    >
      <section
        class="month-area"
        :style="{
          transform: `translateX(${-(translateIndex + 1) * 100}%)`,
          transitionDuration: `${needAnimation ? transitionDuration : 0}s`
        }">
        <div
          class="banner-area"
          :style="{
            transform: `translateY(${offsetY}px)`,
            transitionDuration: `${needHeightAnimation ? transitionDuration : 0}s`
          }">
          <div
            v-for="(monthItem, monthIndex) in allDataArr"
            :key="monthIndex"
            class="data-area"
            :style="{
              transform: `translateX(${(translateIndex + isTouching ? touch.x : 0) * 100}%)`,
              transitionDuration: `${isTouching ? 0 : transitionDuration}s`
            }">
            <div
              v-for="(item, index) in monthItem"
              :key="index"
              :class="[
                'data-item',
                { 'selected': item.isSelected },
                { 'hoverItem': !item.isDisable && item.isHover },
                { 'other-item': item.type !== 'normal' && !isWeekView },
                { 'disable-item': disabledDay(item) }
              ]"
              :style="`height: ${itemHeight}px;`"
              @click="checkoutDate(item)"
              @mouseover="hoverDate(item, true)"
              @mouseleave="hoverDate(item, false)">
              <span class="data-font calendar-item">{{ item.day }}</span>
            </div>
          </div>
        </div>
      </section>
      <section class="q-ml-sm q-mb-md" v-if="!hideHms">
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <div class="flex items-center">
              <div style="padding: 2px 8px; border-radius: 3px; height: 24px"
                   :style="{border: timeObj.hour? '1px solid #EF4C4D' : '1px solid #9496A1'}" class="cursor-pointer"
                   @click="timeObj.hour = true">
                <span style="margin-right: 4px">{{selectHms.hour}}</span>
                <q-icon name="fas fa-angle-down" style="font-size: 8px"/>
                <q-popup-proxy ref="hourPicker" @hide="timeObj.hour = false">
                  <q-banner style="width: 46px; padding: 0; max-height: 310px">
                    <p v-for="h in hmsData.hours" :key="h" :value="h" class="cursor-pointer text-center hour-text q-my-sm"
                       @click="changeTime('hour', h)">
                      {{ h }}</p>
                  </q-banner>
                </q-popup-proxy>
              </div>
              <span class="q-ml-xs q-mr-xs">时</span>
            </div>

            <div class="flex items-center">
              <div style="padding: 2px 8px; border-radius: 3px; height: 24px"
                   :style="{border: timeObj.minute? '1px solid #EF4C4D' : '1px solid #9496A1'}" class="cursor-pointer"
                   @click="timeObj.minute = true">
                <span style="margin-right: 4px">{{selectHms.minute}}</span>
                <q-icon name="fas fa-angle-down" style="font-size: 8px"/>
                <q-popup-proxy ref="minutePicker" @hide="timeObj.minute = false">
                  <q-banner style="width: 46px; padding: 0; max-height: 310px">
                    <p v-for="m in hmsData.minutes" :key="m" :value="m" class="cursor-pointer text-center hour-text q-my-sm"
                       @click="changeTime('minute', m)">
                      {{ m }}</p>
                  </q-banner>
                </q-popup-proxy>
              </div>
              <span class="q-ml-xs q-mr-xs">分</span>
            </div>

            <div class="flex items-center">
              <div style="padding: 2px 8px; border-radius: 3px; height: 24px"
                   :style="{border: timeObj.seconds? '1px solid #EF4C4D' : '1px solid #9496A1'}" class="cursor-pointer"
                   @click="timeObj.seconds = true">
                <span style="margin-right: 4px">{{selectHms.seconds}}</span>
                <q-icon name="fas fa-angle-down" style="font-size: 8px"/>
                <q-popup-proxy ref="secondsPicker" @hide="timeObj.seconds = false">
                  <q-banner style="width: 46px; padding: 0; max-height: 310px">
                    <p v-for="s in hmsData.seconds" :key="s" :value="s" class="cursor-pointer text-center hour-text q-my-sm"
                       @click="changeTime('seconds', s)">
                      {{ s }}</p>
                  </q-banner>
                </q-popup-proxy>
              </div>
              <span class="q-ml-xs">秒</span>
            </div>
          </div>
          <q-btn color="primary" unelevated size="sm" label="今天" @click="checkoutCurrentDate(false)"
                 style="margin-right: 33px"/>
        </div>
      </section>
    </section>
  </div>
</template>

<script>
import { parseDate } from 'src/morejs/_whc'
import lastMonth from 'src/assets/calendar/lastMonth.png'
import lastMonthDisabled from 'src/assets/calendar/lastMonthDisabled.png'
import lastMonthHover from 'src/assets/calendar/lastMonthHover.png'

import lastYear from 'src/assets/calendar/lastYear.png'
import lastYearDisabled from 'src/assets/calendar/lastYearDisabled.png'
import lastYearHover from 'src/assets/calendar/lastYearHover.png'

import nextYear from 'src/assets/calendar/nextYear.png'
import nextYearDisabled from 'src/assets/calendar/nextYearDisabled.png'
import nextYearHover from 'src/assets/calendar/nextYearHover.png'

import nextMonth from 'src/assets/calendar/nextMonth.png'
import nextMonthDisabled from 'src/assets/calendar/nextMonthDisabled.png'
import nextMonthHover from 'src/assets/calendar/nextMonthHover.png'

export default {
  name: 'date',
  props: {
    value: {},
    // 时分秒为当前时间
    autoTime: {
      default: false
    },
    // autoTime = true 时区分时分秒的值
    isFrom: {
      type: Boolean
    },
    isTo: {
      type: Boolean
    },
    hideHms: {
      type: Boolean,
      default: false
    },
    limit90Days: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      lastMonth,
      lastMonthDisabled,
      lastMonthHover,
      lastYear,
      lastYearDisabled,
      lastYearHover,
      nextYear,
      nextYearDisabled,
      nextYearHover,
      nextMonth,
      nextMonthDisabled,
      nextMonthHover,
      timeObj: {
        hour: false,
        minute: false,
        seconds: false
      },
      hourObj: {
        hover: false,
        select: false
      },
      yearDisabled: true,
      monthDisabled: true,
      show: false, // 显示年月弹框
      weekArr: ['一', '二', '三', '四', '五', '六', '日'], // 星期数组
      dataArr: [], // 当前可视区域数据
      allDataArr: [], // 轮播数组
      selectData: {}, // 选中日期信息 -> year, month, day
      isSelectedCurrentDate: false, // 是否点选当前月份信息 (配合月视图减少点击切换时的数组更新)
      translateIndex: 0, // 轮播所在位置
      transitionDuration: 0.3, // 动画持续时间
      needAnimation: true, // 左右滑动是否需要动画
      isTouching: false, // 是否为touch状态
      touchStartPositionX: null, // 初始滑动 X的值
      touchStartPositionY: null, // 初始滑动 Y的值
      touch: { // 本次touch事件，横向，纵向滑动的距离
        x: 0,
        y: 0
      },
      isWeekView: false, // 周视图还是月视图
      itemHeight: 38, // 子元素行高
      needHeightAnimation: false, // 高度变化是否需要动画
      offsetY: 0, // 周视图 Y轴偏移量
      lineNum: 0, // 当前视图总行数
      lastWeek: [], // 周视图 前一周数据
      nextWeek: [], // 周视图 后一周数据
      isDelay: true, // 是否延迟 (动画结束在处理数据)
      isClicked: false, // 点选元素 (去除周视图切换月份时的动画延迟),
      bottomHeight: 40,
      startMonth: 0,
      currentMonth: 0,
      months: [],
      monthList: [
        {
          label: '一月',
          value: 1
        },
        {
          label: '二月',
          value: 2
        },
        {
          label: '三月',
          value: 3
        },
        {
          label: '四月',
          value: 4
        },
        {
          label: '五月',
          value: 5
        },
        {
          label: '六月',
          value: 6
        },
        {
          label: '七月',
          value: 7
        },
        {
          label: '八月',
          value: 8
        },
        {
          label: '九月',
          value: 9
        },
        {
          label: '十月',
          value: 10
        },
        {
          label: '十一月',
          value: 11
        },
        {
          label: '十二月',
          value: 12
        }
      ],
      hmsData: {},
      years: [],
      thisYear: '',
      thisMonth: '',
      thisDay: '',
      selectHms: {},
      lastMonthUrl: lastMonth,
      lastYearUrl: lastYear,
      nextMonthUrl: nextMonth,
      nextYearUrl: nextYear
    }
  },
  created () {
    this.checkoutCurrentDate(this.value)
    if (!this.hideHms) {
      this.getCurrentHms(this.value)
      this.getYmsData()
    }
    this.getYears()
    // this.months = this.monthList
    this.getMonths()
  },
  watch: {
    dataArr: {
      handler (val) {
        this.changeAllData(val)
      },
      deep: true
    },
    isWeekView (val) {
      if (!val) {
        this.isSelectedCurrentDate = false
        this.changeAllData(this.dataArr)
      }
    }
  },
  methods: {
    // 更新轮播数组
    changeAllData (val) {
      if (this.isSelectedCurrentDate && !this.isWeekView) return
      const preDate = this.getPreMonth()
      const preDataArr = this.getMonthData(preDate, true)
      const nextDate = this.getNextMonth()
      const nextDataArr = this.getMonthData(nextDate, true)
      if (this.isWeekView) {
        const sliceStart = this.dealWeekViewSliceStart()
        preDataArr.splice(sliceStart, 7, ...this.lastWeek)
        nextDataArr.splice(sliceStart, 7, ...this.nextWeek)
      }
      const delayHandle = (isDelay) => {
        this.allDataArr = [preDataArr, val, nextDataArr]
        this.needAnimation = false
        this.translateIndex = 0
        if (isDelay) this.isDelay = false
      }
      if (this.isDelay) {
        delayHandle(this.isDelay)
        return
      }
      setTimeout(() => {
        delayHandle()
      }, this.isClicked && this.isWeekView ? 0 : this.transitionDuration * 1000)
    },
    // 获取当前日期
    getCurrentDate (value) {
      let date = null
      if (value) {
        date = new Date(parseDate(value))
      } else {
        date = new Date()
      }
      this.selectData = {
        year: date.getFullYear(),
        month: this.add0(date.getMonth() + 1),
        day: this.add0(date.getDate())
      }
      this.nextMonthUrl = this.nextMonthDisabled
      this.nextYearUrl = this.nextYearDisabled
      const d = new Date()
      this.thisYear = d.getFullYear()
      this.thisMonth = d.getMonth() + 1
      this.thisDay = d.getDate()
    },
    getCurrentHms (value) {
      if (!this.autoTime) {
        if (this.isFrom) {
          this.selectHms = {
            hour: '00',
            minute: '00',
            seconds: '00'
          }
        } else if (this.isTo) {
          this.selectHms = {
            hour: '23',
            minute: '59',
            seconds: '59'
          }
        }
        return
      }
      let date = null
      if (value) {
        date = new Date(value)
      } else {
        date = new Date()
      }
      this.selectHms = {
        hour: this.add0(date.getHours()),
        minute: this.add0(date.getMinutes()),
        seconds: this.add0(date.getSeconds())
      }
    },
    getYmsData () {
      this.$set(this.hmsData, 'hours', [])
      this.$set(this.hmsData, 'minutes', [])
      this.$set(this.hmsData, 'seconds', [])
      const h = 23, m = 59, s = 59
      this.generateHms(h, 'hours')
      this.generateHms(m, 'minutes')
      this.generateHms(s, 'seconds')
    },
    generateHms (count, type) {
      for (let i = 0; i <= count; i++) {
        this.hmsData[type].push(this.add0(i))
      }
    },
    add0 (num) {
      if (num < 10) {
        return '0' + num
      }
      return num + ''
    },
    // 获取指定月份数据
    getMonthData (date, unSelected = false) {
      const year = date.year
      const month = Number(date.month)
      const day = Number(date.day)
      const dataArr = []
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        daysInMonth[1] = 29
      }
      const monthStartWeekDay = (new Date(year, month - 1, 1).getDay() - 1) > 0 ? new Date(year, month - 1, 1).getDay() - 1 : new Date(year, month - 1, 1).getDay() + 6
      const monthEndWeekDay = 42 - monthStartWeekDay - daysInMonth[month - 1]
      const preInfo = this.getPreMonth(date)
      const nextInfo = this.getNextMonth()
      for (let i = 0; i < monthStartWeekDay; i++) {
        const preObj = {
          type: 'pre',
          day: daysInMonth[preInfo.month - 1] - (monthStartWeekDay - i - 1),
          month: preInfo.month,
          year: preInfo.year
        }
        dataArr.push(preObj)
      }
      for (let i = 0; i < daysInMonth[month - 1]; i++) {
        const itemObj = {
          type: 'normal',
          day: i + 1,
          month,
          year,
          isSelected: day === i + 1 && !unSelected
        }
        dataArr.push(itemObj)
      }
      for (let i = 0; i < monthEndWeekDay; i++) {
        const nextObj = {
          type: 'next',
          day: i + 1,
          month: nextInfo.month,
          year: nextInfo.year
        }
        dataArr.push(nextObj)
      }
      return dataArr
    },
    // 获取可选年份
    getYears () {
      const currentYear = new Date().getFullYear()
      const lastYear = new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 90).getFullYear()
      let scope = 3
      if (currentYear !== lastYear) {
        scope = 1
      } else {
        scope = 0
      }
      this.years = []
      for (let i = currentYear - scope; i <= currentYear; i++) {
        this.years.push(i)
      }
    },
    // 获取可选月份
    getMonths (year) {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1
      const oldMonth = new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 90).getMonth() + 1
      // const oldDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 90).getDate()
      this.startMonth = oldMonth
      this.currentMonth = currentMonth
      this.months = []
      let monthDiff = 0
      if (currentMonth < oldMonth) {
        if (year && year === currentYear) {
          monthDiff = currentMonth
        } else {
          monthDiff = currentMonth + 12 - oldMonth
        }
      } else {
        monthDiff = currentMonth - oldMonth
      }
      for (let i = 0; i < monthDiff; i++) {
        for (const item of this.monthList) {
          if (year && year === currentYear) {
            if (item.value === currentMonth + i) {
              this.months.push(item)
            }
          } else {
            if (item.value === oldMonth + i) {
              this.months.push(item)
            }
          }
        }
      }
    },
    // 点选切换日期
    checkoutDate (selectData) {
      if (this.disabledDay(selectData)) return
      this.isSelectedCurrentDate = true
      this.isClicked = true
      if (this.isWeekView && selectData.type !== 'normal') {
        this.needAnimation = false
        this.needHeightAnimation = false
      }
      if (selectData.type === 'next') {
        this.translateIndex += 1
        this.dealMonthData('NEXT_MONTH', selectData.day)
        return
      }
      if (selectData.type === 'pre') {
        this.translateIndex -= 1
        this.dealMonthData('PRE_MONTH', selectData.day)
        return
      }
      this.selectData.day = this.add0(selectData.day)
      const oldSelectIndex = this.dataArr.findIndex(item => item.isSelected && item.type === 'normal')
      const newSelectIndex = this.dataArr.findIndex(item => item.day === selectData.day && item.type === 'normal')
      if (this.dataArr[oldSelectIndex]) this.$set(this.dataArr[oldSelectIndex], 'isSelected', false)
      if (this.dataArr[newSelectIndex]) this.$set(this.dataArr[newSelectIndex], 'isSelected', true)
      this.onChange(true)
    },
    hoverDate (item, isHover) {
      this.$set(item, 'isHover', isHover)
    },
    // 获取前(后)一个月的年月日信息
    getPreMonth (date, appointDay) {
      appointDay = appointDay || new Date(this.value).getDate()
      let {
        year,
        month
      } = date || this.selectData
      month = Number(month)
      if (month === 1) {
        year -= 1
        month = 12
      } else {
        month -= 1
      }
      const obj = {
        year,
        month: this.add0(month)
      }
      const d = new Date(this.value)
      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        obj.day = this.add0(appointDay)
      }
      return obj
    },
    getNextMonth (appointDay) {
      appointDay = appointDay || new Date(this.value).getDate()
      let {
        year,
        month
      } = this.selectData
      month = Number(month)
      if (month === 12) {
        year += 1
        month = 1
      } else {
        month += 1
      }
      const obj = {
        year,
        month: this.add0(month)
      }
      const d = new Date(this.value)
      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        obj.day = this.add0(appointDay)
      }
      return obj
    },
    // 切换上(下)一月
    handlePreMonth () {
      this.dealMonthData('PRE_MONTH')
      this.monthDisabled = false
      this.nextMonthUrl = nextMonth
      this.onChange()
    },
    handleNextMonth () {
      this.dealMonthData('NEXT_MONTH')
      this.onChange()
    },
    // 处理月数据
    dealMonthData (type) {
      this.isSelectedCurrentDate = false
      switch (type) {
        case 'PRE_MONTH':
          this.selectData = this.getPreMonth('')
          break
        case 'NEXT_MONTH':
          this.selectData = this.getNextMonth()
          break
        default:
          break
      }
      if (this.selectData.year === this.thisYear && this.selectData.month === this.add0(this.thisMonth)) {
        this.yearDisabled = true
        this.monthDisabled = true
        this.nextMonthUrl = nextMonthDisabled
        this.nextYearUrl = nextYearDisabled
      }
      if (this.selectData.year !== this.thisYear && (this.selectData.month === this.add0(this.thisMonth) || this.selectData.month !== this.add0(this.thisMonth))) {
        this.yearDisabled = false
        this.monthDisabled = false
        this.nextYearUrl = nextYear
        this.nextMonthUrl = nextMonth
      }
      if (this.selectData.year === this.thisYear && this.selectData.month !== this.add0(this.thisMonth)) {
        this.yearDisabled = true
        this.monthDisabled = false
        this.nextYearUrl = nextYearDisabled
        this.nextMonthUrl = nextMonth
      }
      this.dataArr = this.getMonthData(this.selectData)
      this.lineNum = Math.ceil(this.dataArr.length / 7)
    },
    // 获取前(后)一年的年月日信息
    getPreYear (date, appointDay) {
      appointDay = appointDay || new Date(this.value).getDate()
      let {
        year,
        month
      } = date || this.selectData
      month = Number(month)
      year -= 1
      const obj = {
        year,
        month: this.add0(month)
      }
      const d = new Date(this.value)
      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        obj.day = this.add0(appointDay)
      }
      return obj
    },
    getNextYear (appointDay) {
      appointDay = appointDay || new Date(this.value).getDate()
      let {
        year,
        month
      } = this.selectData
      month = Number(month)
      year += 1
      const obj = {
        year,
        month: this.add0(month)
      }
      const d = new Date(this.value)
      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        obj.day = this.add0(appointDay)
      }
      return obj
    },
    // 切换上(下)一年
    handlePreYear () {
      this.dealYearData('PRE_YEAR')
      this.yearDisabled = false
      this.monthDisabled = false
      this.nextMonthUrl = nextMonth
      this.nextYearUrl = nextYear
      this.onChange()
    },
    handleNextYear () {
      this.dealYearData('NEXT_YEAR')
      this.onChange()
    },
    // 处理年数据
    dealYearData (type) {
      this.isSelectedCurrentDate = false
      switch (type) {
        case 'PRE_YEAR':
          this.selectData = this.getPreYear('')
          break
        case 'NEXT_YEAR':
          this.selectData = this.getNextYear()
          break
        default:
          break
      }
      if (this.selectData.month === this.add0(this.thisMonth) && this.selectData.year === this.thisYear) {
        this.yearDisabled = true
        this.monthDisabled = true
        this.nextMonthUrl = nextMonthDisabled
        this.nextYearUrl = nextYearDisabled
      }
      this.dataArr = this.getMonthData(this.selectData)
      this.lineNum = Math.ceil(this.dataArr.length / 7)
    },
    // 今日
    checkoutCurrentDate (value) {
      this.isDelay = true
      this.getCurrentDate(value)
      if (!this.hideHms) {
        this.getCurrentHms(value)
      }
      this.dealMonthData()
      this.onChange(true)
    },
    // touch事件
    touchStart (event) {
      this.isTouching = true
      this.needAnimation = true
      this.isClicked = false
      this.touchStartPositionX = event.touches[0].clientX
      this.touchStartPositionY = event.touches[0].clientY
      this.touch = {
        x: 0
      }
    },
    touchMove (event) {
      const moveX = event.touches[0].clientX - this.touchStartPositionX
      const moveY = event.touches[0].clientY - this.touchStartPositionY

      if (Math.abs(moveX) > Math.abs(moveY)) { // 左右
        this.needHeightAnimation = false
        this.touch = {
          x: moveX / this.$refs.calendar.offsetWidth,
          y: 0
        }
      } else { // 上下
        this.needHeightAnimation = true
        this.touch = {
          x: 0,
          y: moveY / this.$refs.calendar.offsetHeight
        }
      }
    },
    touchEnd () {
      this.isTouching = false
      const {
        x,
        y
      } = this.touch
      // 月视图
      if (Math.abs(x) > Math.abs(y) && Math.abs(x) > 0.3) {
        if (x > 0) { // 左
          this.translateIndex -= 1
          this.isWeekView ? this.handlePreWeek() : this.handlePreMonth()
        } else if (x < 0) { // 右
          this.translateIndex += 1
          this.isWeekView ? this.handleNextWeek() : this.handleNextMonth()
        }
      }
      // 周视图
      if (Math.abs(y) > Math.abs(x) && Math.abs(y * this.$refs.calendar.offsetHeight) > 50) {
        if (y > 0) { // 下
          this.isWeekView = false
          this.offsetY = 0
        } else if (y < 0) { // 上
          this.isWeekView = true
          this.dealWeekViewData()
        }
      }
      this.touch = {
        x: 0,
        y: 0
      }
    },
    // 周视图的位置信息
    getInfoOfWeekView (selectedIndex, length) {
      const indexOfLine = Math.ceil((selectedIndex + 1) / 7)
      const totalLine = Math.ceil(length / 7)
      const sliceStart = (indexOfLine - 1) * 7
      const sliceEnd = sliceStart + 7
      return {
        indexOfLine,
        totalLine,
        sliceStart,
        sliceEnd
      }
    },
    // 生成前(后)一周数据
    dealWeekViewSliceStart () {
      const selectedIndex = this.dataArr.findIndex(item => item.isSelected)
      const {
        indexOfLine,
        totalLine,
        sliceStart,
        sliceEnd
      } = this.getInfoOfWeekView(selectedIndex, this.dataArr.length)
      this.offsetY = -((indexOfLine - 1) * this.itemHeight)
      // 前一周数据
      if (indexOfLine === 1) {
        const preInfo = this.getPreMonth()
        const preDataArr = this.getMonthData(preInfo, true)
        const preDay = this.dataArr[0].day - 1 || preDataArr[preDataArr.length - 1].day
        const preIndex = preDataArr.findIndex(item => item.day === preDay && item.type === 'normal')
        const {
          sliceStart: preSliceStart,
          sliceEnd: preSliceEnd
        } = this.getInfoOfWeekView(preIndex, preDataArr.length)
        this.lastWeek = preDataArr.slice(preSliceStart, preSliceEnd)
      } else {
        this.lastWeek = this.dataArr.slice(sliceStart - 7, sliceEnd - 7)
      }
      // 后一周数据
      if (indexOfLine >= totalLine) {
        const nextInfo = this.getNextMonth()
        const nextDataArr = this.getMonthData(nextInfo, true)
        const nextDay = this.dataArr[this.dataArr.length - 1].type === 'normal' ? 1 : this.dataArr[this.dataArr.length - 1].day + 1
        const nextIndex = nextDataArr.findIndex(item => item.day === nextDay)
        const {
          sliceStart: nextSliceStart,
          sliceEnd: nextSliceEnd
        } = this.getInfoOfWeekView(nextIndex, nextDataArr.length)
        this.nextWeek = nextDataArr.slice(nextSliceStart, nextSliceEnd)
      } else {
        this.nextWeek = this.dataArr.slice(sliceStart + 7, sliceEnd + 7)
      }
      return sliceStart
    },
    // 切换上(下)一周
    handlePreWeek () {
      this.dealWeekData('PRE_WEEK')
    },
    handleNextWeek () {
      this.dealWeekData('NEXT_WEEK')
    },
    // 处理周数据
    dealWeekData (type) {
      const {
        year,
        month,
        day
      } = type === 'PRE_WEEK' ? this.lastWeek.find(item => item.type === 'normal') : this.nextWeek[0]
      this.selectData = {
        year,
        month,
        day
      }
      this.dataArr = this.getMonthData(this.selectData)
      this.lineNum = Math.ceil(this.dataArr.length / 7)
      this.offsetY -= this.itemHeight
      this.dealWeekViewData()
    },
    // 处理上(下)一周数据
    dealWeekViewData () {
      const sliceStart = this.dealWeekViewSliceStart()
      this.allDataArr[0].splice(sliceStart, 7, ...this.lastWeek)
      this.allDataArr[2].splice(sliceStart, 7, ...this.nextWeek)
    },
    change (value, type) {
      this.$set(this.selectData, type, this.add0(value))
      if (type === 'year') {
        this.getMonths(value)
      }
      this.dataArr = this.getMonthData(this.selectData)
      this.onChange()
    },
    onChange (isDate) {
      if (isDate) {
        let date = `${this.selectData.year}-${this.selectData.month}-${this.selectData.day}`
        if (!this.hideHms) {
          date += ` ${this.selectHms.hour}:${this.selectHms.minute}:${this.selectHms.seconds}`
        }
        this.$emit('on-change', date)
      }
    },
    changeTime (key, val) {
      this.selectHms[key] = val
      this.onChange(true)
      this.$refs[key + 'Picker'].hide()
    },
    disabledDay (item) {
      const afterDay = new Date(`${item.year}-${Number(item.month)}-${item.day}`).getTime() > new Date(`${this.thisYear}-${this.thisMonth}-${this.thisDay}`).getTime()
      /* if (this.limit90Days) {
        const before90Day = new Date(`${item.year}-${Number(item.month)}-${item.day}`).getTime() < new Date().getTime() - 24 * 60 * 60 * 1000 * 89
        return afterDay || before90Day
      } */
      if (afterDay) {
        this.$set(item, 'isDisable', true)
      } else {
        this.$set(item, 'isDisable', false)
      }
      return afterDay
    }
  }
}
</script>

<style scoped lang="stylus">
  .calendar {
  }

  .header {
    padding: 0 5px;
    font-size: 18px;
    font-weight: 500;
    color: #2b4450;
    line-height: 44px;
    cursor: pointer;
    display: inline-block;
  }

  .calendar-item {
    display: block;
    width: 30px;
    height: 30px;
    text-align: center;
    line-height: 30px;
  }

  .selected .calendar-item {
    background: #FCE2E3;
    color #EF4C4D;
    border-radius: 50%;
  }

  .hoverItem {
    background rgba(0, 0, 0, 0.06);
    border-radius: 50%;
  }

  .week-area {
    width: 100%;
    display: flex;
    margin-bottom 8px
    padding 0 20px
  }

  .week-item {
    height: 30px;
    flex: 0 0 14.285%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .week-font {
    font-size: 15px;
    color: #2b4450;
    font-weight: 500;
  }

  .data-container {
    overflow: hidden;
    position: relative;
  }

  .banner-area {
    width: 300%;
    display: flex;
  }

  .data-area {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: row wrap;
    padding 0 20px 0 20px
  }

  .data-item {
    display: flex;
    flex: 0 0 14.285%;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-bottom 12px;
    color: rgba(0, 0, 0, 0.9);
    font-size: 14px;
    font-weight: 400;
  }

  .data-font {
    height 40px;
    width 39px
    line-height 40px
  }

  .other-item {
    color: rgba(0, 0, 0, 0.46);
  }

  .disable-item {
    color: rgba(0, 0, 0, 0.26);
    cursor not-allowed
  }

  .month-btn {
    width: 25%;
  }

  .month-btn >>> .q-btn__wrapper {
    padding: 0;
  }

  .hour-text {
    height 20px;
    line-height 20px
  }

  .hour-text:hover {
    background: linear-gradient(89deg, #FFFFFF 0%, #FFE6E7 49%, #FFFFFF 100%);
  }
</style>
