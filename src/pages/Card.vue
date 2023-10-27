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
      <div class="col-3" v-for="card in bankCardList" :key="card.id">
        <w-card :data="card" @click="cardClick"/>
      </div>
    </div>

    <div class="text-bold q-mt-lg" style="color: cornflowerblue;font-size: 30px">My Cards</div>

    <div class="q-pa-sm bg-white q-mt-lg">
      <div class="row items-center q-mb-sm">
        <q-input :class="queryObj.size" outlined dense label="卡号" clearable
                 v-model="queryObj.number " style="min-width: 10em"
                 class="q-mr-sm q-mb-xs"/>
        <q-select outlined dense label="类型" clearable
                  v-model="queryObj.type" style="min-width: 10em"
                  :options="stateList" class="q-mr-sm q-mb-xs"
                  option-value="value" emit-value
                  option-label="label" map-options/>
        <!--        <w-date-picker-second class="q-mr-md q-mb-xs" @on-change="changeDate" ref="datePicker" :hide-hms="true"/>-->
        <div class="q-mb-xs q-mr-sm">
          <q-btn unelevated class="q-mr-sm" @click="query" label="查询" padding="6px 26px"
                 style="background-color: #6BAAFC; color: #FFFFFF"/>
        </div>
      </div>
      <w-table key-field="id" :list="list" :columns="columns" :has-header="false">
        <template slot="number" slot-scope="row">
          {{ row.data.number ? row.data.number : '-' }}
        </template>
        <template slot="organization" slot-scope="row">
          {{ row.data.organization ? row.data.organization : '-' }}
        </template>
        <div class="flex content-center justify-center" slot="balance" slot-scope="row">
          {{ row.data.balance }}
          <q-icon name="ti-reload" class="flush" size="12px" style="color: #777986"
                  @click="getUserCardsBalance(row.data)"/>

        </div>
        <template slot="state" slot-scope="row">
          <span v-html="matchState(row.data.state)"></span>
        </template>
        <template slot="expiryDate" slot-scope="row">
          {{ row.data.expiryDate ? row.data.expiryDate : '-' }}
        </template>
        <template slot="cvv" slot-scope="row">
          {{ row.data.cvv ? row.data.cvv : '-' }}
        </template>
        <template slot="remark" slot-scope="row">
          {{ row.data.remark ? row.data.remark : '-' }}
        </template>
        <template slot="createTime" slot-scope="row">
          {{ row.data.createTime ? whc.Date.formatDateTime(new Date(row.data.createTime)) : '-' }}
        </template>

        <template slot="action" slot-scope="row">
          <q-btn flat @click.stop="rechargeClick(row.data)" v-show="row.data.state === 1">充值</q-btn>
          <q-btn flat @click="cancelClick(row.data)" v-show="row.data.state === 1">销卡</q-btn>
        </template>

      </w-table>
      <w-empty :has="list.length" tip="没有找到相关的数据"/>
      <w-page v-if="list.length" ref="page" :current="queryObj.pageNumber" :total="total" @on-change="pageNumberChange"
              @on-page-size-change="pageSizeChange"/>
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
        <div style="padding: 10px;border-bottom: 1px solid rgba(0,0,0,0.2)" class="text-right">
          <q-icon name="ti-close" @click="drawer=false" class="flush q-mr-lg"></q-icon>
        </div>
        <div class="q-px-md q-py-lg">
          <div style="border-bottom: 1px solid rgba(0,0,0,0.1)" class="q-pb-sm"><span class="q-ml-md">请选择卡头</span>
          </div>
        </div>

        <div class="flex q-ma-lg">
          <div v-for="card in bankCardList" :key="card.id">
            <div style="border: 1px solid rgba(0,0,0,0.1); border-radius: 5px" class="q-pa-md q-mr-md q-mb-md">
              <q-radio dense v-model="select" :val="card" :label="card.bin + ' ' + card.cr" @input="input"/>
            </div>
          </div>
        </div>

        <div v-show="select.organization">
          <div class="q-pl-lg">
            <div class="item">
              <div class="title">状态</div>
              <span style="background-color: #26A69A;color: white;padding: 5px 10px;border-radius: 5px">正常</span>
            </div>
            <div class="item q-mt-lg">
              <div class="title">币种</div>
              <span>USD</span>
            </div>
            <div class="item q-mt-lg">
              <div class="title">类型</div>
              <span>{{ select.organization }}</span>
            </div>
            <div class="item q-mt-lg">
              <div class="title">地区</div>
              <span>{{ select.cr }}</span>
            </div>
          </div>

          <div class=" q-pl-lg q-mt-lg" style="margin-top: 50px">
            <div class="item">
              <div class="title">开卡费</div>
              <span>{{ expense.openCardFeeAmount }} USD</span>
            </div>
            <div class="item q-mt-lg">
              <div class="title">充值手续费</div>
              <span>{{ expense.rechargeFeeAmountRate }}</span>
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

          <div class=" q-pl-lg q-mt-lg" style="margin-top: 50px">
            <div class="item">
              <div class="title">计划充值</div>
              <q-input class="Ainput"
                       outlined
                       dense
                       lazy-rules
                       :rules="[
                      (val) => val !== null && val !== ''  || '请输入充值金额',
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
          <q-btn label="开卡" color="light-blue" unelevated @click="openCard(select)"
                 :disabled="!select.organization"></q-btn>
        </div>
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
          <q-btn label="充值" color="light-blue" unelevated @click="cardRechargeSubmit()"></q-btn>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- 销卡侧面弹窗-->
    <q-drawer
      v-model="drawer3"
      :width='1100'
      :breakpoint="500"
      overlay
      side="right"
      bordered
      @hide="this.cardId = '';this.cardNum = '';this.select={}"
    >
      <q-scroll-area class="fit">
        <div style="padding: 10px;border-bottom: 1px solid rgba(0,0,0,0.2)" class="text-right">
          <q-icon name="ti-close" @click="cancelClose()" class="flush q-mr-lg"></q-icon>
        </div>
        <div class="q-px-md q-py-lg">
          <div style="border-bottom: 1px solid rgba(0,0,0,0.1)" class="q-pb-sm"><span class="q-ml-md">销卡</span>
          </div>
        </div>

        <div>
          <div class="q-pl-lg">
            <div class="item">
              <div style="font-size: 18px; line-height: 30px;">
                1、销卡不可撤销
                <br>
                2、发起销卡后无法再进行交易，
                <br>
                3、发起销卡后无法再收到退款
              </div>
            </div>
          </div>
          <div class="q-pl-md q-mt-lg">
            <div class="item">
              <q-checkbox size="30px" :color="val?'light-blue':''" :class="[val?'cancel':'noCancel']" v-model="val"
                          label="我已知晓、如已确认以上信息，请点击左侧小方框"/>
            </div>
          </div>

        </div>

        <div class="q-pl-lg q-mt-lg">
          <q-btn label="销卡" color="light-blue" unelevated @click="cardCancelSubmit()" :disabled="!this.val"></q-btn>
        </div>
      </q-scroll-area>
    </q-drawer>

  </div>
</template>


<script>
import WCard from "components/WCard";
import WTable from "components/WTable.vue";
import WPage from "components/WPage.vue";
import WEmpty from "components/WEmpty.vue";
import WDatePickerSecond from "components/WDatePickerSecond.vue";
import {getCurrentDate} from "src/morejs/utils";
import {_whc} from "src/morejs/_whc";
import crypt from "src/morejs/crypt";
import {KJUR} from "jsrsasign";

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    WDatePickerSecond,
    WEmpty,
    WPage,
    WTable,
    WCard
  },
  name: 'PageIndex',
  data() {
    return {
      drawer: false,
      drawer2: false,
      drawer3: false,
      val: false,
      select: {},
      getCurrentDate,
      whc: _whc,
      total: 0,
      cardNum: '',
      cardId: '',
      client: {},
      expense: {},
      openRecharge: {
        amount: 10,
        remark: ''
      },
      cardRecharge: {
        amount: 10,
        remark: ''
      },
      proxyList: [],
      bankCardList: [],
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
          label: '激活',
          color: '#b14fa2'
        },
        {
          value: 0,
          label: '销卡',
          color: 'red'
        }
      ],
      list: [],
      columns: [
        {
          title: '卡号',
          slot: 'number',
          minWidth: 100
        },
        {
          title: '卡组织',
          slot: 'organization',
          minWidth: 100
        },
        {
          title: '余额',
          slot: 'balance',
          minWidth: 100
        },
        {
          title: '状态',
          slot: 'state',
          minWidth: 100
        },
        {
          title: '过期时间',
          slot: 'expiryDate',
          minWidth: 100
        },
        {
          title: '安全码',
          slot: 'cvv',
          minWidth: 100
        },
        {
          title: '备注',
          slot: 'remark',
          minWidth: 100
        },
        {
          title: '开卡时间',
          slot: 'createTime',
          minWidth: 100
        },
        {
          title: '操作',
          slot: 'action',
          minWidth: 100
        }
      ]
    }
  },
  mounted() {
    if (this.$route.query && this.$route.query.id) {
      this.queryObj.taskId = this.$route.query.id
    }
    this.getList()
    this.getUserCardsDetail()
    // this.getCurrent()
    try {
      this.client = JSON.parse(localStorage.getItem("client_current"))
    } catch (aa) {

    }

    try {
      this.expense = JSON.parse(localStorage.getItem("expense"))
    } catch (aa) {

    }
    this.getAllBankCards()
  },
  methods: {
    input(val) {
    },
    getList() {
      this.$axios.$get('/api_client/user_bank_card', this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.total = res.total
          this.list = res.rows
          this.list.forEach(item => {
            this.$set(item, 'balance', '')
          })
        }
      })
    },
    cardClick(data) {
      console.log(data)
      this.drawer = true
      this.select = data
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
    getUserCardsBalance(data) {
      this.$axios.$get(`/api_client/card_balance?bankNum=${data.number}`, this.queryObj).then(res => {
        if (res && res.code === 0) {
          data.balance = Number(res.content).toFixed(2) + ' USD';
        }
      })
    },
    openCard(select) {
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
    },
    cardRechargeSubmit() {
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
    rechargeClick(data) {
      this.drawer2 = true
      this.cardNum = data.number
      this.cardId = data.id
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
