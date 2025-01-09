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
            <b style="cursor: pointer" @click="cashOutClick">提现</b>
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

    <w-modal ref="cashOutModal" title="账户余额提现" @on-ok="cashOut" min-width="550px">
      <q-form class="q-gutter-sm" ref="cashOutRefs">
        <q-input v-model="client.balance"
                 dense outlined square disable
        >
          <template v-slot:before>
            <div class="labelStyle">可提现余额：</div>
          </template>
        </q-input>
        <q-input label="3%"
                 dense outlined square disable
        >
          <template v-slot:before>
            <div class="labelStyle">提现手续费：</div>
          </template>
        </q-input>
        <q-input :label="Number(Number(cashOutForm.amount)*0.97).toFixed(2)"
                 dense outlined square disable
        >
          <template v-slot:before>
            <div class="labelStyle">到账金额$：</div>
          </template>
        </q-input>
        <q-input v-model="cashOutForm.amount"
                 dense outlined clearable square
                 lazy-rules
                 :rules="[
                  val => val && val.length > 0 || '请输入提现金额',
                  (val) => 30 <=  Number(val) || '最低提现金额 30 USDT',
                  val=>(/^\d+(\.\d{1,4})?$/.test(val) || '输入的数字最多4位小数'),
                  (val) => Number(client.balance) >=  Number(val)  || '余额不足'
                ]"
        >
          <template v-slot:before>
            <div class="labelStyle">提现金额$：</div>
          </template>
        </q-input>
        <q-input v-model="cashOutForm.address"
                 dense outlined clearable square
                 lazy-rules
                 :rules="[
                  val => val && val.length > 0 && val.length ===34 || '请输入有效的USDT-TRC20提现地址',
                ]"
        >
          <template v-slot:before>
            <div class="labelStyle">USDT-TRC20 址：</div>
          </template>
        </q-input>
        <div class="q-ml-lg" style="color: rgba(0, 0, 0, 0.54)">请核对提现账户信息确保无误，提现请求<span
          style="color: red">48小时</span>内处理完成，客服不处理紧急提现请求。
        </div>
      </q-form>
    </w-modal>

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
      cashOutForm: {
        amount: null,
      },
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
      this.$axios.$get('/article', {skipDefault: true,isZh:true}).then(res => {
        this.article = res.content
      })
    },
    getClientCurrent() {
      this.$axios.$get('/api_client/current', {skipDefault: true}).then(res => {
        this.client = res.content
      })
    },
    more() {

    },
    cashOutClick() {
      this.getClientCurrent()
      this.$refs.cashOutModal.show()
    },
    cashOut() {
      this.$refs.cashOutRefs.validate().then(success => {
        if (success) {
          const rechargeForm = {
            amount: this.cashOutForm.amount,
            address: this.cashOutForm.address,
          }
          this.$axios.$postForm('/api_client/cash_out', rechargeForm).then((resp) => {
            if (resp && resp.code === 0) {
              this.$refs.cashOutModal.hide()
              this.cashOutForm.amount = null
              this.cashOutForm.address = null
            }
          })
        }
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
//margin-top: 30px; background-color:$orange-1; padding: 10px;
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

.labelStyle {
  font-size: 14px;
  width: 120px;
  text-align: right;
}
</style>
