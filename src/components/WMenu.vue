<template>
  <div>
    <template v-for="(route, index) in routes[0].children">
      <w-link :key="index" :path="route.path" :title="route.meta.title" :icon="route.icon" v-if="!route.hide"
              :current="route.path === currentPath">
      </w-link>
    </template>
    <w-link title="api文档" path="https://www.showdoc.com.cn/apiVcc/10676037554652442" :doc="true"></w-link>
  </div>
</template>

<script>
import WLink from 'components/WLink'

export default {
  name: 'WMenu',
  components: {
    WLink
  },
  props: {
    routes: {
      type: Array,
      default: () => ([])
    },
  },

  data() {
    return {
      routeList: [],
      currentPath: '',
    }
  },

  watch: {
    '$route.path': function () {
      this.currentPath = this.$route.path
    },
  },

  mounted() {
    this.currentPath = this.$route.path
  },
  methods: {}
}
</script>

<style scoped lang="stylus">
</style>
