<template>
  <div class="card" @click="cardClick">
    <div>
      <b class="text-blue-3" style="font-size: 30px">BIN</b>
      <span v-if="data.adapterSign !== 'ipe'" style="font-size: 25px">{{ data.bin }}<span style="font-size: 23px">-通道B</span></span>
      <span v-else style="font-size: 25px">{{ data.bin }}</span>
      <span style="font-size: 20px" class="q-ml-sm">USD</span>
    </div>
    <img v-if="data.organization == 'VISA'" width="55" class="picon" :src="Visa">
    <img v-else width="55" class="picon" :src="Mc">
<!--    <div class="text-grey" style="padding: 3px 0 0 0">{{ data.organization }} 信用卡</div>-->
    <div style="padding: 1px 0 0 0;font-size: 15px">开卡费 : {{ data.actualOpenCardPrice }} / 张 &nbsp
      充值手续费：{{ data.actualRechargeFeeRate }}
    </div>
    <div style="padding: 1px 0 0 0;font-size: 15px">发行地区 : &nbsp{{ data.cr }}</div>
  </div>
</template>

<script>

import Visa from 'src/assets/Visa.png'
import Mc from 'src/assets/Mc.png'

export default {
  name: "WCard",
  data() {
    return {
      Visa,
      Mc
    }
  },
  props: {
    data: {
      default: () => ({})
    }
  },
  methods: {
    cardClick() {
      this.$emit('click', this.data)
    },
  }
}
</script>

<style scoped>
.card {
  background-color: #f0f8ff;
  //background-color: #ffffff;
  border-radius: 10px;
  border: 1px solid #e5e8ef;
  padding: 10px 25px 10px 25px;
  position: relative;
}

.card:hover {
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
}

.picon {
  position: absolute;
  top: 20px;
  right: 15px;

}
</style>
