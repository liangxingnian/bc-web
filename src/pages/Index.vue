<template>
  <div>
    <div class="flex content-center bg-white" style="border-radius: 5px;padding: 30px 0">
      <div class="tip">
        <div class="title">
          <q-icon name="ti-heart"/>
          <b class="q-ml-sm">温馨提示</b>
        </div>
        <div v-if="article.length" :class="isMore?'':'ellipsis'" v-html="article[0].content"></div>
        <div v-else>暂无公告</div>
        <div class="text-left">
          <q-btn v-if="!isMore" flat color="primary" @click="isMore=true" size="md" label="更多"/>
          <q-btn v-else flat color="primary" @click="isMore=false" size="md" label="隐藏"/>
        </div>
      </div>


    </div>

    <div class="q-mt-md bg-white" style="border-radius: 5px">
      <div style="font-size: 22px;padding: 25px 0" class="flex content-center q-ml-md">
        <div class="q-mt-md">
          欢迎回来
          <div style="font-size: 22px">用户ID :<b>{{ client.id }}</b></div>
        </div>
      </div>

      <div class=" bg-white" style="border-top: 1px solid rgba(0,0,0,0.1);padding: 30px 0">
        <div class="q-pt-md">
          <b style="font-size: 20px;" class="q-ml-md">常用功能</b>
        </div>
        <div style="max-width: 70%;margin: 0 auto">
          <div class="flex justify-between">
            <router-link to="/wallet">
            <div class="flex column items-center">
              <div class="flex items-center">
                <img :src="balance" width="40">
                <b class="q-ml-sm" style="font-size: 20px">账户入金</b>
              </div>
            </div>
            </router-link>
<!--            <div class="grade4"></div>-->
            <router-link to="/card">
              <div class="flex column items-center">
                <div class="flex items-center">
                  <img :src="open" width="35">
                  <b class="q-ml-sm" style="font-size: 20px">快速开卡</b>
                </div>
              </div>
            </router-link>
            <router-link to="/card">
            <div class="flex column items-center">
              <div class="flex items-center">
                <img :src="cardlist" width="35">
                <b class="q-ml-sm" style="font-size: 20px">卡列表</b>
              </div>
            </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="q-py-md q-mt-md bg-white" style="border-radius: 5px;padding: 40px 0">
      <b style="font-size: 20px" class="q-ml-md">财务统计</b>
      <div style="max-width: 70%;margin: 0 auto">
        <div class="flex justify-between">
          <div class="flex column items-center">
            <b>余额</b>
            <div class="flex items-center">
              <img :src="balance" width="40">
              <b class="q-ml-sm" style="font-size: 20px">$ {{ client.balance }}</b>
            </div>
          </div>
          <div class="flex column items-center">
            <b>总入金</b>
            <div class="flex items-center">
              <img :src="income" width="40">
              <b class="q-ml-sm" style="font-size: 20px">$ {{ client.fundAmount }}</b>
            </div>
          </div>
          <div class="flex column items-center">
            <b>入金处理中</b>
            <div class="flex items-center">
              <img :src="incomehandle" width="35">
              <b class="q-ml-sm" style="font-size: 20px">$ {{ client.fundHandleAmount }}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="q-mt-md bg-white" style="" v-show="false">
      <div>
        <div style="border-bottom: 1px solid rgba(0,0,0,0.1);border-radius: 5px;padding: 30px 15px" class="q-pa-md">
          <b style="font-size: 20px">用户等级</b>
        </div>
        <div class="flex justify-between" style="padding: 40px 80px">
          <div class="grade flex column items-center">
            <div class="grade2">VIP商户</div>
          </div>
          <div class="grade4"></div>
          <div class="grade flex column items-center">
            <div class="grade2">{{ client.rechargeFeeAmountRate }}</div>
            <div class="grade3">服务费率</div>
          </div>
          <div class="grade4"></div>
          <div class="grade flex column items-center">
            <div class="grade2">无限</div>
            <div class="grade3">剩余开卡额度</div>
          </div>
          <div class="grade4"></div>
          <div class="grade flex column items-center">
            <div class="grade2">${{ Number(client.openCardFeeAmount).toFixed(2) }}</div>
            <div class="grade3">开卡费用</div>
          </div>
        </div>

      </div>
    </div>
<!--    <div class="bg-white" style="height: 30vh"></div>-->
  </div>
</template>

<script>
import balance from "src/assets/balance.png";
import cardlist from "src/assets/cardlist.png";
import income from "src/assets/income.png";
import incomehandle from "src/assets/incomehandle.png";
import open from "src/assets/open.png";
import record from "src/assets/record.png";

export default {
  name: "Index",
  data() {
    return {
      balance,
      cardlist,
      income,
      incomehandle,
      open,
      record,
      user: {},
      client: {},
      article: [],
      expense: {},
      isMore: false
    }
  },
  mounted() {
    try {
      this.user = JSON.parse(localStorage.getItem("current"))
    } catch (aa) {

    }
    try {
      this.expense = JSON.parse(localStorage.getItem("expense"))
    } catch (aa) {

    }
    this.getArticle()
    this.getClientCurrent()
  },
  methods: {
    getArticle() {
      this.$axios.$get('/article', {skipDefault: true}).then(res => {
        this.article = res.content
      })
    },
    getClientCurrent() {
      this.$axios.$get('/api_client/current', {skipDefault: true}).then(res => {
        this.client = res.content
      })
    },
    more() {

    }
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
//margin-top: 30px; background-color:$orange-1;
  padding: 10px;
  border-radius: 5px;
}

.grade {
  padding: 10px;
}

.grade2 {
  font-weight: 700;
}

.grade3 {
  color: #777986;
}

.grade4 {
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}

.ellipsis {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  white-space: normal;
}

a {
  text-decoration: none;
  color: #1D1D1D;
}
</style>
