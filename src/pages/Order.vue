<template>
  <div>
<!--    <q-card class="my-card bg-white q-pa-sm" style="width: 600px">-->
<!--      <q-card-section>-->
<!--        <div class="text-bold" style="color: cornflowerblue;font-size: 30px">USD</div>-->
<!--      </q-card-section>-->

<!--      <q-separator dark/>-->

<!--      <q-card-actions>-->
<!--        <div class="text-right full-width"><span style="font-size: 30px">{{ client.balance }}</span></div>-->
<!--      </q-card-actions>-->
<!--    </q-card>-->
    <div class="text-bold" style="color: cornflowerblue;font-size: 30px">Trade</div>

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
        <q-tab name="open_card" label="开卡订单"/>
        <q-tab name="recharge" label="充值订单"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="open_card">
          <div class="row items-center q-mb-sm">
            <q-input :class="$config.size" outlined dense label="流水号" clearable
                     v-model="queryObj.id " style="min-width: 10em"
                     class="q-mr-sm q-mb-xs"/>
            <q-select outlined dense label="状态" clearable
                      v-model="queryObj.state" style="min-width: 10em"
                      :options="stateList" class="q-mr-sm q-mb-xs"
                      option-value="value" emit-value
                      option-label="label" map-options/>
            <div class="q-mb-xs q-mr-sm">
              <q-btn unelevated class="q-mr-sm" @click="query" label="查询" padding="6px 26px"
                     style="background-color: #6BAAFC; color: #FFFFFF"/>
            </div>
          </div>

          <w-table key-field="id" :list="list" :columns="columns" :has-header="false">
            <template slot="id" slot-scope="row">
              {{ row.data.id ? row.data.id : '-' }}
            </template>
            <template slot="amount" slot-scope="row">
              {{ row.data.amount ? row.data.amount : '-' }}
            </template>
            <template slot="actual" slot-scope="row">
              {{(row.data.actualAmount - row.data.amount).toFixed(4)}}
            </template>
            <template slot="am">
              USD
            </template>
            <template slot="createTime" slot-scope="row">
              {{ row.data.createTime ? whc.Date.formatDateTime(new Date(row.data.createTime)) : '-' }}
            </template>
            <template slot="state" slot-scope="row">
              <span v-html="matchState(row.data.state)"></span>
            </template>
            <template slot="remark" slot-scope="row">
              {{ row.data.remark ? row.data.remark : '-' }}
            </template>
          </w-table>
        </q-tab-panel>

        <q-tab-panel name="recharge">
          <div class="row items-center q-mb-sm">
            <q-input :class="$config.size" outlined dense label="流水号" clearable
                     v-model="queryObj.id " style="min-width: 10em"
                     class="q-mr-sm q-mb-xs"/>
            <q-select outlined dense label="状态" clearable
                      v-model="queryObj.state" style="min-width: 10em"
                      :options="rStateList" class="q-mr-sm q-mb-xs"
                      option-value="value" emit-value
                      option-label="label" map-options/>
            <div class="q-mb-xs q-mr-sm">
              <q-btn unelevated class="q-mr-sm" @click="query" label="查询" padding="6px 26px"
                     style="background-color: #6BAAFC; color: #FFFFFF"/>
            </div>
          </div>

          <w-table key-field="id" :list="list" :columns="columns" :has-header="false">
            <template slot="id" slot-scope="row">
              {{ row.data.id ? row.data.id : '-' }}
            </template>
            <template slot="amount" slot-scope="row">
              {{ row.data.amount ? row.data.amount : '-' }}
            </template>
            <template slot="actual" slot-scope="row">
              {{(row.data.actualAmount - row.data.amount).toFixed(4)}}
            </template>
            <template slot="am">
              USD
            </template>
            <template slot="createTime" slot-scope="row">
              {{ row.data.createTime ? whc.Date.formatDateTime(new Date(row.data.createTime)) : '-' }}
            </template>
            <template slot="state" slot-scope="row">
              <span v-html="rMatchState(row.data.state)"></span>
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
      tab: 'open_card',
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
      columns: [
        {
          title: '流水号',
          slot: 'id',
          minWidth: 100
        },
        {
          title: '金额',
          slot: 'amount',
          minWidth: 100
        },
        {
          title: '手续费',
          slot: 'actual',
          minWidth: 100
        },
        {
          title: '币种',
          slot: 'am',
          minWidth: 100
        },
        {
          title: '创建时间',
          slot: 'createTime',
          minWidth: 100
        },
        {
          title: '状态',
          slot: 'state',
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
  },
  methods: {
    cut(val) {
      this.getList(val)
      this.tab = val
    },
    getList(val) {
      this.$axios.$get(`/api_client/${val}`, this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.total = res.total
          this.list = res.rows
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
</style>
