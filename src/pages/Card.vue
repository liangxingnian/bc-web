<template>
  <q-page>
    <div class="flex">
      <div>
        <q-btn color="light-blue" unelevated>
            <q-icon name="ti-credit-card" size="15px" style="margin-top: -2px"/>
            <span class="q-ml-sm">开卡</span>
        </q-btn>
        <q-btn color="light-blue" unelevated class="q-ml-md">
          <q-icon name="ti-credit-card" size="15px" style="margin-top: -2px"/>
          <span class="q-ml-sm">我的信用卡</span>
        </q-btn>
      </div>
      <div class="flex q-ml-lg">
        <div class="q-ml-lg">
          <span>已销卡</span>
          <span class="number">259</span>
        </div>
        <div class="q-ml-lg">
          <span>有效卡</span>
          <span class="number">128</span>
        </div>
      </div>
    </div>
    <div class="row q-col-gutter-lg q-mt-md">
      <div class="col-3" v-for="n in 5" :key="`lg-${n}`">
        <w-card />
      </div>
    </div>
  </q-page>
</template>


<script>
import WCard from "components/WCard";

export default {
  components: {
    WCard
  },
  name: 'PageIndex'
}
</script>
<style lang="stylus" scoped>
.number{
  color: $light-blue;
  font-size 30px
  margin-left 10px
}
</style>
