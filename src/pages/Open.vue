<template>
  <div>
    <div class="flex">
      <div>
        <q-btn color="light-blue" unelevated @click.stop="drawer=true">
          <q-icon name="ti-credit-card" size="15px" style="margin-top: -2px"/>
          <span class="q-ml-sm">开卡</span>
        </q-btn>
      </div>
      <div class="flex q-ml-lg">
        <div class="q-ml-lg">
          <span>有效卡</span>
          <span class="number">{{ this.userCardsDetail.activateCount }}</span>
        </div>
        <div class="q-ml-lg">
          <span>已销卡</span>
          <span class="number">{{ this.userCardsDetail.maintainCount }}</span>
        </div>
      </div>
    </div>
    <div class="row q-col-gutter-lg q-mt-md">
      <div class="col-3" v-for="card2 in clientBankCardList" :key="card2.id">
        <w-card :data="card2" @click="cardClick"/>
      </div>
      <div class="col-3" v-for="card in bankCardList" :key="card.id">
        <w-card :data="card" @click="cardClickFalse" style="background-color: lavender"/>
      </div>
    </div>

    <!-- 侧面弹窗-->
    <q-drawer
      v-model="drawer"
      :width='1100'
      :breakpoint="500"
      overlay
      side="right"
      bordered
      @hide="select={}"
    >
      <q-scroll-area class="fit">
        <q-form @submit="openCard(select)" ref="openCardRefs">
          <div style="padding: 10px;border-bottom: 1px solid rgba(0,0,0,0.2)" class="text-right">
            <q-icon name="ti-close" @click="drawer=false" class="flush q-mr-lg"></q-icon>
          </div>
          <div class="q-px-md q-py-lg">
            <div style="border-bottom: 1px solid rgba(0,0,0,0.1)" class="q-pb-sm"><span
              class="q-ml-md">请选择卡头</span>
            </div>
          </div>

          <div class="flex q-ma-lg">
            <div v-for="card in clientBankCardList" :key="card.id">
              <div style="border: 1px solid rgba(0,0,0,0.1); border-radius: 5px" class="q-pa-md q-mr-md q-mb-md">
                <q-radio dense v-model="select" :val="card" :label="card.bin + ' ' + card.cr" @input="input(card)"/>
              </div>
            </div>
          </div>

          <div v-show="select.organization">
            <div class="flex no-wrap">
              <div style="width: 40%">
                <div class="q-pl-lg">
                  <div class="item">
                    <div class="title">状态</div>
                    <span
                      style="background-color: #26A69A;color: white;padding: 5px 10px;border-radius: 5px">正常</span>
                  </div>
                  <div class="item q-mt-lg">
                    <div class="title">币种</div>
                    <span>USD</span>
                  </div>
                  <div class="item q-mt-lg">
                    <div class="title">类型</div>
                    <span>{{ select.organization }} 信用卡</span>
                  </div>
                  <div class="item q-mt-lg">
                    <div class="title">地区</div>
                    <span>{{ select.cr }}</span>
                  </div>
                </div>

                <div class=" q-pl-lg q-mt-lg" style="margin-top: 50px">
                  <div class="item">
                    <div class="title">开卡费</div>
                    <!--                    <span>{{ Number(select.actualOpenCardPrice).toFixed(2) }} USD</span>-->
                    <span>{{ Number(expense.openCardFeeAmount).toFixed(2) }} USD</span>
                  </div>
                  <div class="item q-mt-lg">
                    <div class="title">充值手续费</div>
                    <!--                    <span>{{ Number.parseFloat(select.actualRechargeFeeRate) }}%</span>-->
                    <span>{{ Number.parseFloat(expense.rechargeFeeAmountRate) }}%</span>
                  </div>
                  <div class="item q-mt-lg">
                    <div class="title">预计扣款</div>
                    <span>{{
                        Number(openRecharge.amount) + Number(expense.openCardFeeAmount) + (Number(openRecharge.amount) * Number.parseFloat(expense.rechargeFeeAmountRate) / 100)
                      }} USD</span>
                  </div>
                  <div class="item q-mt-lg">
                    <div class="title">钱包余额</div>
                    <span>{{ client.balance }} USD</span>
                  </div>
                </div>
              </div>

              <div style="word-break: break-all;width: 50%">
                <template v-if="select.description === 'photo'">
                  <img src="/success.png" width="120%">
                </template>
                <template v-else>
                  <div v-html="select.description"></div>
                </template>
              </div>

            </div>


            <div class=" q-pl-lg q-mt-lg" style="margin-top: 50px">
              <div class="item">
                <div class="title">计划充值</div>
                <q-input class="Ainput"
                         outlined
                         dense
                         lazy-rules
                         :rules="[
                      (val) => val !== null && val !== ''  || '请输入充值金额',
                      (val) => Number(val) >=  minAmount || '最低开卡额度 : $'+minAmount,
                      (val) => Number(val) <=  maxAmount || '最大开卡额度 : $'+maxAmount,
                      (val) => Number(client.balance) >  Number(val) + (Number(val) * Number.parseFloat(expense.rechargeFeeAmountRate) / 100) || '余额不足'
                    ]"
                         style="display: inline-block"
                         v-model="openRecharge.amount"
                >
                </q-input>
              </div>
              <div class="item q-mt-lg">
                <div class="title">备注</div>
                <q-input class="Ainput"
                         outlined
                         dense
                         style="display: inline-block"
                         v-model="openRecharge.remark"
                >
                </q-input>
              </div>
            </div>
          </div>
          <div class="q-ml-lg q-mt-lg">
            <q-btn label="开卡" color="light-blue" unelevated type="submit"
                   :disabled="!select.organization"></q-btn>
          </div>

        </q-form>

      </q-scroll-area>
    </q-drawer>

    <!-- 充值侧面弹窗-->
    <q-drawer
      v-model="drawer2"
      :width='1100'
      :breakpoint="500"
      overlay
      side="right"
      bordered
      @hide="this.cardId = '';this.cardNum = '';this.select={}"
    >
      <q-scroll-area class="fit">
        <q-form @submit="cardRechargeSubmit()" ref="rechargeCardRefs">
          <div style="padding: 10px;border-bottom: 1px solid rgba(0,0,0,0.2)" class="text-right">
            <q-icon name="ti-close" @click="rechargeClose()" class="flush q-mr-lg"></q-icon>
          </div>
          <div class="q-px-md q-py-lg">
            <div style="border-bottom: 1px solid rgba(0,0,0,0.1)" class="q-pb-sm"><span class="q-ml-md">充值</span>
            </div>
          </div>

          <div>
            <div class="q-pl-lg q-mt-lg q-ml-lg">
              <div class="item">
                <div class="title">卡号</div>
                <span>{{ this.cardNum }}</span>
              </div>

              <div class="item q-mt-lg">
                <div class="title">充值手续费</div>
                <span>{{ expense.rechargeFeeAmountRate }}</span>
              </div>

              <div class="item q-mt-lg">
                <div class="title">预计扣款</div>
                <span>{{
                    Number(cardRecharge.amount) + (Number(cardRecharge.amount) * Number.parseFloat(expense.rechargeFeeAmountRate) / 100)
                  }} USD</span>
              </div>

            </div>

            <div class=" q-pl-lg q-mt-lg q-ml-lg" style="margin-top: 50px">
              <div class="item q-mt-lg">
                <div class="title">钱包余额</div>
                <span>{{ client.balance }} USD</span>
              </div>
            </div>

            <div class=" q-pl-lg q-mt-lg q-ml-lg" style="margin-top: 50px">
              <div class="item">
                <div class="title">计划充值</div>
                <q-input class="Ainput"
                         outlined
                         dense
                         lazy-rules
                         :rules="[
                      (val) => val !== null && val !== ''  || '请输入充值金额',
                      (val) => Number(val) <=  maxAmount || '最大开卡额度 : $'+maxAmount,
                      (val) => Number(client.balance) >  Number(val) + (Number(val) * Number.parseFloat(expense.rechargeFeeAmountRate) / 100) || '余额不足',
                    ]"
                         style="display: inline-block"
                         v-model="cardRecharge.amount"
                >
                </q-input>

              </div>
            </div>
          </div>

          <div class="q-pl-lg q-mt-lg q-ml-lg">
            <!--            <q-btn label="充值" color="light-blue" unelevated @click="cardRechargeSubmit()"></q-btn>-->
            <q-btn label="充值" color="light-blue" unelevated type="submit"></q-btn>
          </div>
        </q-form>
      </q-scroll-area>
    </q-drawer>


  </div>
</template>


<script>
import WCard from "components/WCard";
import WDatePickerSecond from "components/WDatePickerSecond.vue";
import {getCurrentDate} from "src/morejs/utils";
import {_whc} from "src/morejs/_whc";

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    WDatePickerSecond,
    WCard
  },
  name: 'PageIndex',
  data() {
    return {
      drawer: false,
      drawer2: false,
      drawer3: false,
      drawer4: false,
      val: false,
      minAmount: 10,
      maxAmount: 100000,
      select: {},
      getCurrentDate,
      whc: _whc,
      total: 0,
      cardNum: '',
      cardBalance: '',
      cardDetail: {},
      cardId: '',
      client: {},
      expense: {},
      openRecharge: {
        amount: 10,
        remark: ''
      },
      description: {
        '440872|451946|485997|556371': `推荐在Facebook、Google、Telegram、TikTok、Amazon、PayPal、Apple、TWITTER、Linked、Shopify、Walmart、YouTube、Alibaba、eBay、TAOBAO、Alipay、RISER、viber、Infobip、AliExpress等场景上付款。
                <br>
                <br> 警告：该卡BIN禁止在Steam、WALMART、Uber、Foodpanda这4个场景上交易使用，如违反发卡行严令禁止的交易场景将强制注销该卡。`

      },
      cardRecharge: {
        amount: 10,
        remark: ''
      },
      proxyList: [],
      bankCardList: [],
      clientBankCardList: [],
      allCrList: [],
      userCardsDetail: [],
      addNewObj: {},
      queryObj: {
        pageNumber: 1,
        pageSize: 10
      },
      stateList: [
        {
          value: 1,
          label: '有效卡',
          color: '#b14fa2'
        },
        {
          value: 0,
          label: '已销卡',
          color: 'red'
        }
      ],
    }
  },
  mounted() {
    if (this.$route.query && this.$route.query.id) {
      this.queryObj.taskId = this.$route.query.id
    }
    this.getUserCardsDetail()
    // this.getCurrent()
    try {
      this.client = JSON.parse(localStorage.getItem("client_current"))
    } catch (aa) {

    }
    this.getAllBankCards()
    this.getClientAllBankCards()
  },
  methods: {
    input(card) {
      if (card.adapterSign === 'dnk') {
        this.openRecharge.amount = 30
      } else if (card.adapterSign === 'vm-card2' || card.adapterSign === 'vm-card') {
        if (card.bin === '534786') {
          this.openRecharge.amount = 42
        } else {
          this.openRecharge.amount = 20
        }

      } else {
        this.openRecharge.amount = 10
      }
      this.minAmount = this.openRecharge.amount
      if (card.adapterSign === 'vm-card2') {
        this.maxAmount = 350
      } else {
        this.maxAmount = 100000
      }
      this.getExpense(card.id)
    },
    getList() {
      this.$axios.$get('/api_client/user_bank_card', this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.total = res.total
          this.list = res.rows
          this.list.forEach(item => {
            this.$set(item, 'balance', '')
            if (item.state === 1 && (item.adapterSign === 'vm-card2' || item.adapterSign === 'vm-card')) {
              this.getUserCardsBalance(item, true);
            }
          })
        }
      })
    },
    getExpense(bankId) {
      this.$axios.$get(`/api_client/expense?bankId=${bankId}`, this.queryObj).then(res => {
        if (res && res.code === 0) {
          console.log("进来了1！！" + this.expense)
          this.expense = res.content
          console.log("进来了2！！" + this.expense)
        }
      })
    },
    cardClick(data) {
      if (data.adapterSign === 'dnk') {
        this.openRecharge.amount = 30
      } else if (data.adapterSign === 'vm-card2' || data.adapterSign === 'vm-card') {
        if (data.bin === '534786') {
          this.openRecharge.amount = 42
        } else {
          this.openRecharge.amount = 20
        }

      } else {
        this.openRecharge.amount = 10
      }
      this.minAmount = this.openRecharge.amount
      if (data.adapterSign === 'vm-card2') {
        this.maxAmount = 350
      } else {
        this.maxAmount = 100000
      }
      this.drawer = true
      this.select = data
      this.expense = this.getExpense(data.id)
    },
    cardClickFalse() {
      this.$notify.error("您未开通开卡权限，请联系在线客服激活账户。")
    },
    getUserCardsDetail() {
      this.$axios.$get('/api_client/card_detail', this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.userCardsDetail = res.content
        }
      })
    },
    getClientCurrent() {
      this.$axios.$get('/api_client/current', {skipDefault: true}).then(res => {
        this.client = res.content
        localStorage.setItem("client_current", JSON.stringify(this.client))
      })
    },
    getUserCardsBalance(data, show) {
      this.$axios.$get(`/api_client/card_balance?bankNum=${data.number}`, this.queryObj).then(res => {
        if (res && res.code === 0) {
          if (res.content === '请重新获取余额') {
            this.$notify.error("查询频繁")
            return;
          }
          if (show) {
            data.balance = Number(res.content).toFixed(2) + ' USD';
          } else {
            this.cardBalance = Number(res.content).toFixed(2) + ' USD';
          }
        } else {
          this.$notify.error("查询频繁")
        }
      })
    },
    openCard(select) {
      this.$refs.openCardRefs.validate().then(success => {
        if (success) {
          const openForm = {
            bankCardId: select.id,
            amount: this.openRecharge.amount,
            remark: this.openRecharge.remark
          }
          this.$axios.$postForm('/api_client/open_card', openForm).then((resp) => {
            if (resp && resp.code === 0) {
              this.drawer = false
              this.getClientCurrent()
            }
          })
        }
      })
    },
    cardRechargeSubmit() {
      this.$refs.rechargeCardRefs.validate().then(success => {
        if (success) {
          const rechargeForm = {
            bankCardId: this.cardId,
            amount: this.cardRecharge.amount
          }
          this.$axios.$postForm('/api_client/recharge', rechargeForm).then((resp) => {
            if (resp && resp.code === 0) {
              this.drawer2 = false
              this.getClientCurrent()
            }
          })
        }
      })
    },
    cardCancelSubmit() {
      const cancelForm = {
        userBankCardId: this.cardId
      }
      this.$axios.$postForm('/api_client/cancel_card', cancelForm).then((resp) => {
        if (resp && resp.code === 0) {
          this.drawer3 = false
          this.val = false
          this.getList()
          this.getClientCurrent()
        } else {
          this.$notify.error("查询频繁，请稍后再重新发起销卡")
        }
      })
    },
    getAllBankCards() {
      this.$axios.$get('/api_client/all_bank_card', this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.bankCardList = res.content;
        }
      })
    },
    getClientAllBankCards() {
      this.$axios.$get('/api_client/client_all_bank_card', this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.clientBankCardList = res.content;
        }
      })
    },
    detailClick(data) {
      this.cardBalance = '-'
      this.getUserCardsBalance(data, false)
      this.drawer4 = true
      this.cardDetail = data
    },
    detailClick2(data) {
      this.$router.push('/card_detail/' + data.id)
    },
    rechargeClick(data) {
      if (data.adapterSign === 'dnk') {
        this.cardRecharge.amount = 30
      } else {
        if (data.bin === '534786') {
          this.cardRecharge.amount = 21
        } else {
          this.cardRecharge.amount = 10
        }

      }
      this.minAmount = this.openRecharge.amount
      if (data.adapterSign === 'vm-card2') {
        this.maxAmount = 350
      } else {
        this.maxAmount = 100000
      }
      this.drawer2 = true
      this.cardNum = data.number
      this.cardId = data.id
      this.getExpense(data.bankCardId)
    },
    cancelClick(data) {
      this.drawer3 = true
      this.cardId = data.id
    },
    rechargeClose() {
      this.drawer2 = false
    },
    cancelClose() {
      this.drawer3 = false
      this.val = false
    },
    filterProxyListFn(val, update) {
      update(() => {
        this.proxyList = this.allProxyList.filter(v => v.sign.indexOf(val) > -1)
      })
    },
    changeDate(date) {
      this.queryObj.fromDate = date.from
      this.queryObj.toDate = date.to
    },
    query() {
      this.queryObj.pageNumber = 1
      this.getList()
    },
    reset() {
      this.queryObj = {
        pageNumber: 1,
        pageSize: 10,
        clientId: '',
        registerId: ''
      }
      this.getList()
    },
    matchState(state) {
      for (let item of this.stateList) {
        if (item.value == state) {
          return `<span style="color: ${item.color}">${item.label}</span>`
        }
      }
      return `<span>-</span>`
    },
    filterFn(val, update) {
      update(() => {
        this.crList = this.allCrList.filter(v => v.programmedName.indexOf(val) > -1)
      })
    },
    options(date) {
      return date <= this.getCurrentDate(new Date().getTime(), '/')
    },
    pageNumberChange(current) {
      this.queryObj.pageNumber = current
      this.getList()
    },
    pageSizeChange(current) {
      this.queryObj.pageNumber = 1
      this.queryObj.pageSize = current
      this.getList()
    }
  }
}
</script>
<style lang="stylus" scoped>
.number {
  color: $light-blue;
  font-size: 30px;
  margin-left: 10px
}

.flush {
  cursor: pointer;
}

.flush:hover {
  color: $blue-3;
}

.box:hover {
  box-shadow: 0px 6px 10px #e0e0e0;
}

.item {
  font-size: 15px;

}

.title {
  display: inline-block;
  width: 130px;
  font-size: 15px;
  color: #777986;
}

.cancel {
  color: $light-blue;

}

.noCancel {
  color: #9496A1;
}

.Ainput {
  width: calc(100% - 200px);
}
</style>
