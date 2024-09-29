<template>
  <div class="bg-grey-1">
    <div v-if="hasTitleSlot">
      <slot name="title"></slot>
    </div>
    <q-markup-table :separator="separator" flat bordered :wrap-cells="true" square style="border-bottom:0" :class="stickyHeader ? 'my-sticky-header-table' : ''">
      <thead>
      <tr>
        <th class="header-column header-border-bottom" v-for="(field, index) in columns"
            :key="field.title"
            :class="[getClassNames(true, index, field)]"
            :style="{'min-width':(field.minWidth?field.minWidth:0 )+ 'px', 'max-width':(field.maxWidth?field.maxWidth:0 )+ 'px'}">
          <div class="checkbox-center">
            <q-checkbox size="xs" v-if="selection && index===0" v-model="all" @input="changeAll"/>
            <span class="header-title full-width text-center" :style="{textAlign: field.fixed}">{{ field.title }}</span>
            <div v-if="field.sort" class="flex items-center q-ml-xs">
              <div class="flex column">
                <q-icon :color="field.sortFlag === 'up'?'positive':''" name="fas fa-caret-up hover-color"
                        class="cursor-pointer" size="16px" @click="sortList(field,'up')"/>
                <q-icon :color="field.sortFlag === 'down'?'positive':''" name="fas fa-caret-down" class="cursor-pointer"
                        size="16px" @click="sortList(field,'down')"/>
              </div>
            </div>
            <div v-if="field.desc === 'priority'" class="flex items-center q-ml-xs">
              <q-icon name="far fa-question-circle" class="cursor-pointer" size="16px">
                <q-tooltip max-width="200px" anchor="top middle" self="bottom middle">
                  <span>优先级的数值越大，顺序越往前靠</span>
                </q-tooltip>
              </q-icon>
            </div>
          </div>
        </th>
      </tr>
      </thead>
      <tbody>
        <template v-for="(item, index) in list">
          <tr :key="'header_'+item[keyField]+'_'+(indexKey || !item[keyField]?index:'')"
              v-if="hasHeader" @mouseover="hover(index, true)" @mouseleave="leave"
              :style="{'background': (listType === 'purchaser' && item.state === -10) || (listType === 'provider' && item.state === -1)?'rgba(25, 118, 210, 0.02)':(hoverIndex === index ) ? 'rgba(25, 118, 210, 0.04)' :''}">
            <td colspan="100" :style="{height: 'auto','padding': selection?'0 16px':''}"
                style="border-bottom: 1px dashed rgba(0,0,0,0.1);border-right-width: 0" class="__header-border">
              <div class="checkbox-center items-center">
                <q-checkbox size="xs" v-model="selectList" :val="item" @input="changeCheck" v-if="selection"/>
                <div style="width: 100%">
                  <slot name="header" :data="item"></slot>
                </div>
              </div>
            </td>
          </tr>
          <tr :key="item[keyField]+'_'+(indexKey || !item[keyField]?index:'')" @mouseover="hover(index, false)"
              @mouseleave="leave" :class="item[keyField]+'_'+(indexKey || !item[keyField]?index:'')"
              :style="{'background': item.special ? 'rgba(255,192,203,1)' :''}">
            <template v-for="(field,columnsIndex) in columns">
              <td :key="field.key" style="border-bottom: 1px solid #e0e0e0"
                  :class="[field.more?'has-more':'', getClassNames(false, columnsIndex,field)]">
                <div class="checkbox-center">
                  <q-checkbox size="xs" v-if="selection && columnsIndex===0 && !hasHeader" v-model="selectList" :val="item"
                              @input="changeCheck"/>
                  <div class="full-width text-left" v-if="field.slot" :style="{textAlign: field.fixed}">
                    <slot :name="field.slot" :data="item" :index="index"></slot>
                  </div>
                  <template v-else> {{ item[field.key] }}</template>
                </div>
              </td>
            </template>
          </tr>
          <tr :key="'footer_'+item[keyField]+'_'+(indexKey || !item[keyField]?index:'')"
              v-if="hasHeader && index !== list.length - 1">
            <td colspan="100" style="height: 20px" class="q-td--no">
            </td>
          </tr>
        </template>
      </tbody>
    </q-markup-table>
    <div class="bg-white q-pa-md text-grey-6" style="font-size:12px;border: 1px solid #e0e0e0;border-top:none" v-if="list.length<0">
      <slot name="none"></slot>
    </div>
    <div class="flex justify-center" v-if="hasFooterSlot">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
/**
 * @on-change 单选
 * @on-change-all 多选
 */
export default {
  props: {
    /**
     * {
          title: '操作', //表头名称
          more: true, //表示该列padding为0,其他样式自定义;border-color:rgba(0,0,0,0.12)
          minWidth: 100 //设置最小宽度
        }
     */
    columns: {
      type: Array,
      require: true
    },
    listType: {
      type: String
    },
    list: {
      type: Array,
      default: () => ([])
    },
    /**
     * 用来指定key的字段
     */
    keyField: {
      require: true
    },
    indexKey: {
      default: false
    },
    /**
     * 是否显示个item的头部
     */
    hasHeader: {
      type: Boolean,
      default: true
    },
    /**
     * 可选值: horizontal,vertical,cell,none
     */
    separator: {
      default: 'vertical'
    },
    /**
     * 是否开启勾选框
     */
    selection: {
      type: Boolean,
      default: false
    },
    hasTitleSlot: {
      default: true
    },
    hasFooterSlot: {
      default: true
    },
    stickyHeader: {
      default: false
    }
  },
  name: 'WTable',
  data () {
    return {
      all: false,
      sortFlag: '',
      selectList: [],
      hoverIndex: -1,
      hoverHeader: false
    }
  },

  watch: {
    list: {
      handler () {
        this.changeCheck()
      }
    }
  },

  methods: {
    changeCheck () {
      this.all = this.selectList.length === this.list.length
      this.$emit('on-change', this.selectList)
    },

    changeAll (val) {
      this.selectList = val ? this.list : []
      this.$emit('on-change-all', this.selectList)
    },
    sortList (item, key) {
      for (const opt of this.columns) {
        if (opt.title !== item.title && opt.sortFlag) {
          this.$delete(opt, 'sortFlag')
        }
      }
      if (item.sortFlag) {
        if (item.sortFlag === key) {
          this.$delete(item, 'sortFlag')
        } else {
          this.$set(item, 'sortFlag', key)
        }
      } else {
        this.$set(item, 'sortFlag', key)
      }
      this.$emit('on-sort', item, key)
    },

    getClassNames (isHeader, index, field) {
      if (!this.hasHeader) return ''
      const classes = ''
      return classes
    },
    hover (index, isHeader) {
      this.hoverIndex = index
      this.hoverHeader = isHeader
      return false
    },
    leave () {
      this.hoverIndex = -1
    },
    clear () {
      this.all=false
      this.selectList = []
    }
  }
}
</script>

<style scoped lang="stylus">
  $border = 1px solid rgba(0, 0, 0, 0.12)

  .header-column {
    border-bottom: none

    .header-title {
      font-size 14px
      color #9496A1
    }
  }

  .header-border-bottom {
    border-bottom 1px solid rgba(0,0,0,0.12)
  }

  >>> p
    margin 0

  .checkbox-center
    display flex
    align-items center

  .has-more
    padding 0

  >>> .__header > * {
    margin-right 20px
  }

  .hover-color:hover
    color $positive

  .spacing
    height 0
    line-height 0
    font-size 0
    pointer-events: none

  .__header-border
    border-left $border
    border-right $border

  .table-top
    border-top $border

  .table-left
    border-left $border

  .table-right
    border-right $border

  .my-sticky-header-table
    /* height or max-height is important */
    max-height: 600px

    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th
      background-color: white

    thead tr th
      position: sticky
      z-index: 1
    thead tr:first-child th
      top: 0

    /* this is when the loading indicator appears */
    &.q-table--loading thead tr:last-child th
      /* height of all previous header rows */
      top: 48px

</style>
