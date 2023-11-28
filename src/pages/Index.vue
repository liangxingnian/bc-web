<template>
  <q-page>
    <div class="flex content-center">
      <div class="adv">
        <q-icon name="ti-github" size="40px" color="white" style="margin-top: 20px"/>
      </div>
      <div style="font-size: 30px" class="content-center q-ml-md"><b>{{ user.name }}</b>
        <div style="font-size: 22px">余额 : {{ client.balance }} USD</div>
      </div>
    </div>
    <div class="tip">
      <div class="title">
        <q-icon name="ti-heart"/>
        <b class="q-ml-sm">温馨提示</b>
      </div>
      <div v-if="article.length" v-html="article[0].content"></div>
      <div v-else>暂无公告</div>
    </div>
    <div class="q-mt-lg">
      <div class="row q-col-gutter-lg q-mt-md">
        <div class="col-4">
          <router-link to="/card">
            <q-btn color="light-blue" label="快速开卡" unelevated padding="20px 100px"/>
          </router-link>
        </div>
        <div class="col-4">
          <router-link to="/wallet">
            <q-btn color="light-blue" label="交易明细" unelevated padding="20px 100px"/>
          </router-link>
        </div>
        <div class="col-4">
          <router-link to="/order">
            <q-btn color="light-blue" label="订单记录" unelevated padding="20px 100px"/>
          </router-link>
        </div>
      </div>
    </div>
    <div style="margin-top: 100px">
      <div style="border: 1px solid rgba(0,0,0,0.1)">
        <div style="border-bottom: 1px solid rgba(0,0,0,0.1)" class="q-pa-md"><b>用户等级</b></div>
       <div class="flex justify-between" style="padding: 20px 80px">
         <div class="grade flex column items-center">
           <div class="grade2">VIP商户</div>
           <div class="grade3">套餐到期时间:2024-12-30</div>
         </div>
         <div class="grade4"></div>
         <div class="grade flex column items-center">
           <div class="grade2">{{client.rechargeFeeAmountRate}}</div>
           <div class="grade3">服务费率</div>
         </div>
         <div class="grade4"></div>
         <div class="grade flex column items-center">
           <div class="grade2">9999999</div>
           <div class="grade3">剩余开卡额度</div>
         </div>
         <div class="grade4"></div>
         <div class="grade flex column items-center">
           <div class="grade2">${{Number(client.openCardFeeAmount).toFixed(2)}}</div>
           <div class="grade3">开卡费用</div>
         </div>
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
      user: {},
      client: {},
      article: [],
      expense:{}
    }
  },
  mounted() {
    try {
      this.user = JSON.parse(localStorage.getItem("current"))
    } catch (aa) {

    }
    try {
      this.client = JSON.parse(localStorage.getItem("client_current"))
    } catch (aa) {

    }
    try {
      this.expense = JSON.parse(localStorage.getItem("expense"))
    } catch (aa) {

    }
    this.getArticle()
  },
  methods: {
    getArticle() {
      this.$axios.$get('/article', {skipDefault: true}).then(res => {
        this.article = res.content
      })
    },
  }
}
</script>

<style lang="stylus" scoped>
.adv {
  width: 80px;
  height: 80px;
  border-radius: 100%;
  background-color:$light-blue;
  display: flex;
  justify-content: center;
  align-content: center;
}

.title {
  color:$orange
}

.tip {
  margin-top: 30px;
  background-color:$orange-1;
  padding: 10px;
  border-radius: 5px;
}

.grade{
  padding: 10px;
}
.grade2{
  font-weight: 700;
}
.grade3{
  color: #777986;
}
.grade4{
  border-left: 1px solid rgba(0,0,0,0.1);
}
</style>
