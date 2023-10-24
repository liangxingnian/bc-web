<template>
  <q-page>
    <div class="flex content-center">
      <div class="adv">
        <q-icon name="ti-github" size="40px" color="white" style="margin-top: 20px"/>
      </div>
      <div style="font-size: 30px" class="flex content-center q-ml-md"><b>{{user.name}}</b></div>
    </div>
    <div class="tip">
      <div class="title">
        <q-icon name="ti-heart"/>
        <b class="q-ml-sm">温馨提示</b>
      </div>
      <span>sdfsfsfsfsfsfsdfsdfsfsdf</span>
    </div>
    <div class="q-mt-lg">
      <div class="row q-col-gutter-lg q-mt-md">
        <div class="col-6">
          <q-btn color="light-blue" label="快速开卡" unelevated padding="20px 100px"/>
        </div>
        <div class="col-6">
          <q-btn color="light-blue" label="快速充值" unelevated padding="20px 100px"/>
        </div>
        <div class="col-6">
          <q-btn color="light-blue" label="交易明细" unelevated padding="20px 100px"/>
        </div>
        <div class="col-6">
          <q-btn color="light-blue" label="订单记录" unelevated padding="20px 100px"/>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "Index",
  data() {
    return {
      user: {}
    }
  },
  mounted() {
    try {
      this.user = JSON.parse(localStorage.getItem("current"))
    }catch (aa){

    }
  },
}
</script>

<style lang="stylus" scoped>
.adv {
  width:80px
  height 80px
  border-radius 100%
  background-color $light-blue
  display flex
  justify-content center
  align-content center
}

.title {
  color $orange
}

.tip {
  margin-top 30px
  background-color $orange-1
  padding 10px
  border-radius 5px
}
</style>
