<template>
  <q-dialog v-model="showModal" persistent @hide="hideModal">
    <q-card :style="{width, minWidth , maxWidth}">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6" v-html="title"></div>
        <q-space/>
        <q-btn icon="close" flat round dense v-close-popup/>
      </q-card-section>

      <q-card-section>
        <slot></slot>
      </q-card-section>

      <q-card-actions align="right" v-if="showButton">
        <q-btn flat :label="cancelLabel" color="primary" v-close-popup/>
        <q-btn unelevated :label="okLabel" color="primary" @click="ok"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'Modal',

  props: {
    /**
     * 标题
     */
    title: {
      type: String
    },
    /**
     * 是否显示按钮
     */
    showButton: {
      type: Boolean,
      default: true
    },
    /**
     * 最小宽度
     */
    minWidth: {
      type: String,
      default: '350px'
    },
    /**
     * 最大宽度
     */
    maxWidth: {
      type: String,
      default: '100vw'
    },
    width: {
      type: String
    },
    /**
     * 是否包括编辑器
     */
    includeEditor: {
      type: Boolean,
      default: false
    },
    /**
     * 确定按钮文字
     */
    okLabel: {
      type: String,
      default: '确定'
    },
    /**
     * 取消按钮文字
     */
    cancelLabel: {
      type: String,
      default: '取消'
    }
  },

  data () {
    return {
      showModal: false
    }
  },

  methods: {
    // 显示
    show () {
      this.showModal = true
    },

    // 隐藏
    hide () {
      this.showModal = false
    },

    // 隐藏之后触发
    hideModal () {
      this.$emit('on-hide')
    },

    // 点击确定之后触发
    ok () {
      this.$emit('on-ok')
    }
  }
}
</script>

<style scoped>

</style>
