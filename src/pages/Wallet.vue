<template>
  <div>
    <q-card class="my-card bg-white q-pa-sm" style="width: 300px">
      <q-card-section>
        <div class="flex">
          <q-img :src="UsdImg" style="height: 45px;width: 45px"></q-img>
          <div class="q-ml-sm">
            <div style="font-weight: 500;font-size: 18px">{{ client.balance }} USD</div>
            <div style="color: rgba(0,0,0,0.5)">美元</div>
          </div>
        </div>
        <div class="float-right">
          <q-btn color="light-blue" @click="recharge">充值</q-btn>
        </div>
      </q-card-section>

      <q-separator dark/>

      <q-card-actions>
      </q-card-actions>
    </q-card>

    <div class="text-bold q-mt-lg" style="color: cornflowerblue;font-size: 20px">钱包流水</div>

    <div class="q-pa-sm bg-white">
      <div class="row items-center q-mb-sm">
        <q-input :class="$config.size" outlined dense label="流水号" clearable
                 v-model="queryObj.taskId " style="min-width: 10em"
                 class="q-mr-sm q-mb-xs"/>
        <q-select outlined dense label="类型" clearable
                  v-model="queryObj.type" style="min-width: 10em"
                  :options="typeList" class="q-mr-sm q-mb-xs"
                  option-value="value" emit-value
                  option-label="label" map-options/>
        <w-date-picker-second class="q-mr-md q-mb-xs" @on-change="changeDate" ref="datePicker" :hide-hms="true" :scope="180"/>
        <div class="q-mb-xs q-mr-sm">
          <q-btn unelevated class="q-mr-sm" @click="query" label="查询" padding="6px 26px"
                 style="background-color: #6BAAFC; color: #FFFFFF"/>
        </div>
      </div>
      <w-table key-field="id" :list="list" :columns="columns">
        <template slot="header" slot-scope="row">
          <span class="q-mr-md">id：{{ row.data.id ? row.data.id : '-' }}</span>
        </template>
        <template slot="createTime" slot-scope="row">
          {{ row.data.createTime ? whc.Date.formatDateTime(new Date(row.data.createTime)) : '-' }}
        </template>
        <template slot="type" slot-scope="row">
          <span v-html="matchType(row.data.type)"></span>
        </template>
        <template slot="amount" slot-scope="row">
          {{ row.data.amount ? row.data.amount : '-' }} USD
        </template>
        <template slot="applyBalance" slot-scope="row">
          {{ row.data.applyBalance ? row.data.applyBalance : '-' }}
        </template>
        <template slot="remark" slot-scope="row">
          {{ row.data.remark ? row.data.remark : '-' }}
        </template>
      </w-table>
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
import UsdImg from "src/assets/USD.svg";

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
      UsdImg,
      getCurrentDate,
      whc: _whc,
      total: 0,
      client: {},
      proxyList: [],
      crList: [],
      allCrList: [],
      addNewObj: {},
      queryObj: {
        pageNumber: 1,
        pageSize: 10
      },
      typeList: [
        {
          value: -1,
          label: '开卡支付',
          color: 'red'
        },
        {
          value: 1,
          label: '订单退款',
          color: '#3bbf79'
        },
        {
          value: -2,
          label: '充值支付',
          color: 'red'
        },
        {
          value: 2,
          label: '充值退款',
          color: '#1976D2'
        },
        {
          value: 4,
          label: '加款',
          color: '#9fa847'
        },
        {
          value: 5,
          label: '修正',
          color: 'red'
        }
        ,
        {
          value: 88,
          label: '销卡退款',
          color: '#3bbf79'
        }
      ],
      list: [],
      columns: [
        {
          title: '变动时间',
          slot: 'createTime',
          minWidth: 100
        },
        {
          title: '类型',
          slot: 'type',
          minWidth: 100
        },
        {
          title: '变动金额',
          slot: 'amount',
          minWidth: 100
        },
        {
          title: '变动后余额',
          slot: 'applyBalance',
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
    this.getList()
    this.getClientCurrent()
  },
  methods: {
    getList() {
      this.$axios.$get('/api_client/capital/list', this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.total = res.total
          this.list = res.rows
        }
      })
    },
    getClientCurrent() {
      this.$axios.$get('/api_client/current', {skipDefault: true}).then(res => {
        this.client = res.content
        localStorage.setItem("client_current", JSON.stringify(this.client))
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
    recharge() {
      this.$notify.error("请联系在线客服充值！")
    },
    matchType(state) {
      for (let item of this.typeList) {
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
</style>
