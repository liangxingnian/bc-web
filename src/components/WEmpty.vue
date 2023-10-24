<template>
  <div v-if="!has" class="empty">
    <q-img src="~assets/nodata.jpg" v-if="!isGoods && !isChannel" :style="[{width:($q.platform.is.mobile)?'100%':'432px'},{height:($q.platform.is.mobile)?'auto':'273px'}]" />
    <q-img src="~assets/nocate.jpg" v-if="isGoods && !isChannel" :style="[{width:($q.platform.is.mobile)?'100%':'432px'},{height:($q.platform.is.mobile)?'auto':'273px'}]" />
  </div>
</template>

<script>
export default {
  props: {
    has: {},
    tip: {},
    isGoods: {
      default: false
    },
    isChannel: {
      default: false
    }
  }
}
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 273px;
  user-select: none;
}
</style>
