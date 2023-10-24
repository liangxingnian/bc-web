<template>
  <router-link :to="path" class="item" :class="current?'select':''">
    <div class="flex content-center">
      <q-icon v-if="icon" :name="icon" class="q-mr-sm" style="margin-top: 2px"/>
      <span>{{ title }}</span>
      <slot></slot>
    </div>
  </router-link>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    path: {
      type: String,
      default: ''
    },

    icon: {
      type: String,
      default: ''
    },

    child: {
      type: Boolean,
      default: true
    },

    current: {
      type: Boolean,
      default: false
    }
  },

  methods: {}
}
</script>

<style scoped lang="stylus">
.item {
  color #1D1D1D
  padding 15px 20px
  text-decoration: none
  display block
}

.select {
  background-color $light-blue
  color white
}

.item:hover {
  background-color $blue-3
}

</style>
