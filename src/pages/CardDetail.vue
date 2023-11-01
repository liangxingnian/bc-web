<template>
  <div>
    <div>
      <span class="text-bold" style="color: cornflowerblue;font-size: 30px">{{ this.cardDetail.number }}</span>
      <router-link to="/card">
        <q-btn color="grey" style="margin-left: 20px;margin-top: -12px" outline size="sm"><span
          style="font-size: 12px;color: black">返回</span></q-btn>
      </router-link>
    </div>


    <div class="q-pa-sm bg-white q-mt-lg">
      <div style="padding: 10px;border-bottom: 1px solid rgba(0,0,0,0.2);font-size: 22px"
           class="justify-between full-width">
        <span class="q-ml-md">卡片信息</span>
        <span class="q-ml-md"
              style="background-color: #26A69A;color: white;padding: 5px 10px;border-radius: 5px;font-size: 15px">{{this.cardDetail.state ===1?'正常':'销卡'}}</span>
      </div>

      <div class="q-mt-lg">
        <span class="q-pl-lg" style="font-size: 15px;">ID：</span>
        <b>{{ this.cardDetail.id }}</b>
        <div class="q-pl-lg flex">
          <div>
            <div class="item q-mt-lg">
              <div class="title">类型</div>
              <b>{{ this.cardDetail.organization }}</b>
            </div>

            <div class="item q-mt-lg">
              <div class="title">开卡时间</div>
              <b>{{
                  this.cardDetail.createTime ? whc.Date.formatDateTime(new Date(this.cardDetail.createTime)) : '-'
                }}</b>
            </div>

            <div class="item q-mt-lg">
              <div class="title">销卡时间</div>
              <b>{{ this.cardDetail.state === 0 ? this.cardDetail.modifyTime ? whc.Date.formatDateTime(new Date(this.cardDetail.modifyTime)) : '-' : '-' }}</b>
            </div>
            <div class="item q-mt-lg">
              <div class="title">备注</div>
              <b>{{ this.cardDetail.remark ? this.cardDetail.remark : '-' }}</b>
            </div>
          </div>

          <div style="margin-left: 200px">

            <div class="item q-mt-lg">
              <div class="title">余额</div>
              <b>{{ cardBalance }}</b>
            </div>

            <div class="item q-mt-lg">
              <div class="title">过期时间</div>
              <b>{{ this.cardDetail.expiryDate }}</b>
            </div>

            <div class="item q-mt-lg">
              <div class="title">安全码</div>
              <b>{{ this.cardDetail.cvv }}</b>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div class="q-pa-sm bg-white q-mt-lg">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
        @input="cut"
      >
        <q-tab name="trade" label="账单"/>
        <q-tab name="flow" label="充值流水"/>
      </q-tabs>

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="trade">
          <w-table key-field="id" :list="list" :columns="tradeColumns" :has-header="false">
            <template slot="dealTime" slot-scope="row">
              {{ row.data.dealTime ? row.data.dealTime : '-' }}
            </template>
            <template slot="dealMerchant" slot-scope="row">
              {{ row.data.dealMerchant ? row.data.dealMerchant : '-' }}
            </template>
            <template slot="authAmt" slot-scope="row">
              {{ row.data.authAmt ? row.data.authAmt : '-' }}
            </template>
            <template slot="dealAmount" slot-scope="row">
              {{ row.data.dealAmount ? row.data.dealAmount : '-' }}
            </template>
            <template slot="type" slot-scope="row">
              {{ row.data.type ? row.data.type : '-' }}
            </template>
            <template slot="result" slot-scope="row">
              {{ row.data.result ? row.data.result : '-' }}
            </template>
          </w-table>
        </q-tab-panel>

        <q-tab-panel name="flow">
          <w-table key-field="id" :list="list" :columns="flowsColumns" :has-header="false">
            <template slot="rechargeTime" slot-scope="row">
              {{ row.data.rechargeTime ? row.data.rechargeTime : '-' }}
            </template>
            <template slot="rechargeFlow" slot-scope="row">
              {{ row.data.rechargeFlow ? row.data.rechargeFlow : '-' }}
            </template>
            <template slot="type" slot-scope="row">
              {{ row.data.type ? row.data.type : '-' }}
            </template>
            <template slot="amount" slot-scope="row">
              {{ row.data.amount ? row.data.amount : '-' }}
            </template>
            <template slot="remark" slot-scope="row">
              {{ row.data.remark ? row.data.remark : '-' }}
            </template>
          </w-table>
        </q-tab-panel>
      </q-tab-panels>

      <w-empty :has="list.length" tip="没有找到相关的数据"/>
      <w-page v-if="list.length" ref="page" :current="queryObj.pageNumber" :total="total" @on-change="pageNumberChange"
              @on-page-size-change="pageSizeChange"/>
    </div>
  </div>

</template>

<script>
import WTable from "src/components/WTable"
import WPage from "src/components/WPage"
import WEmpty from "src/components/WEmpty"
import WDatePickerSecond from "src/components/WDatePickerSecond";
import {getCurrentDate} from "src/morejs/utils"
import {_whc} from "src/morejs/_whc";
import router from "src/router";

export default {
  name: "register_List",
  components: {
    WDatePickerSecond,
    WTable,
    WPage,
    WEmpty
  },
  data() {
    return {
      tab: 'trade',
      getCurrentDate,
      whc: _whc,
      total: 0,
      client: {},
      cardDetail: {},
      proxyList: [],
      crList: [],
      cardBalance: '',
      addNewObj: {},
      queryObj: {
        pageNumber: 1,
        pageSize: 10
      },
      stateList: [
        {
          value: 1,
          label: '开卡中',
          color: '#b14fa2'
        },
        {
          value: 10,
          label: '成功',
          color: '#3bbf79'
        },
        {
          value: -10,
          label: '失败',
          color: 'red'
        }
      ],
      rStateList: [
        {
          value: 1,
          label: '充值中',
          color: '#b14fa2'
        },
        {
          value: 10,
          label: '成功',
          color: '#3bbf79'
        },
        {
          value: -10,
          label: '失败',
          color: 'red'
        }
      ],
      list: [],
      tradeColumns: [
        {
          title: '交易时间',
          slot: 'dealTime',
          minWidth: 100
        },
        {
          title: '交易商户',
          slot: 'dealMerchant',
          minWidth: 100
        },
        {
          title: '授权金额',
          slot: 'authAmt',
          minWidth: 100
        },
        {
          title: '交易金额',
          slot: 'dealAmount',
          minWidth: 100
        },
        {
          title: '类型',
          slot: 'type',
          minWidth: 100
        },
        {
          title: '结果',
          slot: 'result',
          minWidth: 100
        }
      ],
      flowsColumns: [
        {
          title: '充值时间',
          slot: 'rechargeTime',
          minWidth: 100
        },
        {
          title: '充值流水',
          slot: 'rechargeFlow',
          minWidth: 100
        },
        {
          title: '类型',
          slot: 'type',
          minWidth: 100
        },
        {
          title: '充值金额',
          slot: 'amount',
          minWidth: 100
        },
        {
          title: '备注',
          slot: 'remark',
          minWidth: 100
        }
      ]
    }
  },
  mounted() {
    if (this.$route.query && this.$route.query.id) {
      this.queryObj.taskId = this.$route.query.id
    }
    this.getList(this.tab)
    try {
      this.client = JSON.parse(localStorage.getItem("client_current"))
    } catch (aa) {

    }

    this.getUserCardsDetail()
  },
  methods: {
    cut(val) {
      this.getList(val)
      this.tab = val
    },
    getList(val) {
      this.$axios.$get(`/api_client/${this.$route.params.id}/${val}`, this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.total = res.total
          this.list = res.rows
        }
      })
    },

    getUserCardsDetail() {
      this.$axios.$get(`/api_client/user_bank_card_detail/` + this.$route.params.id, this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.cardDetail = res.content
          this.getUserCardsBalance(res.content)
        }
      })
    },
    getUserCardsBalance(data) {
      this.$axios.$get(`/api_client/card_balance?bankNum=${data.number}`, this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.cardBalance = Number(res.content).toFixed(2) + ' USD';
        }
      })
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
      this.getList(this.tab)
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
    rMatchState(state) {
      for (let item of this.rStateList) {
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

<style scoped>
.labelStyle {
  font-size: 14px;
  width: 120px;
  text-align: right;
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
</style>
