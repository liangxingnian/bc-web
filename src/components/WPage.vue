<template>
  <div class="flex flex-center">
    <q-select v-if="showSizer" borderless v-model="pageSize" :options="options" dense
              @input="changePageSize">
      <template v-slot:append><span style="font-size: 14px;">条/页</span></template>
      <template v-slot:option="{ itemProps, itemEvents, opt }">
        <q-item
          v-bind="itemProps"
          v-on="itemEvents"
        >
          <q-item-section>
            <q-item-label>{{ opt }} 条/页</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <q-pagination
      v-model="pageNumber"
      :max="max"
      :max-pages="maxPages"
      :direction-links="true"
      @input="changePageNumber"
      input
      color="#000"
    >
    </q-pagination>
    <span class="q-mr-sm text-grey-7" v-if="showTotal">共 {{ total }} 条</span>
  </div>
</template>

<script>
/**
 * on-page-size-change 切换每页显示条数触发
 * on-change 翻页触发
 */

export default {
  name: 'WPage',
  props: {
    /**
     * 是否显示总数
     */
    showTotal: {
      type: Boolean,
      default: true
    },

    /**
     * 总数
     */
    total: {
      type: Number,
      default: 0
    },

    /**
     * 最大显示页码数
     */
    maxPages: {
      type: Number,
      default: 6
    },
    /**
     * 页码
     */
    current: {
      type: Number,
      default: 1
    },

    /**
     * 可选页码数
     */
    options: {
      type: Array,
      default: () => ([10, 30, 50, 100])
    },

    /**
     * 显示分页
     */
    showSizer: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    max: function () {
      return Math.ceil(this.total / this.pageSize)
    }
  },
  watch: {
    current: function (val) {
      this.pageNumber = val
    }
  },

  data () {
    return {
      pageNumber: 1,
      pageSize: this.options[0] || 10
    }
  },
  methods: {
    changePageSize (val) {
      this.$emit('on-page-size-change', val)
    },

    changePageNumber (val) {
      if (val === this.current) return
      // this.current = val
      this.$emit('on-change', val)
    },
    reset () {
      this.pageNumber = 1
      // this.current = 1
    }
  }
}
</script>

<style scoped>
</style>
