<template>
  <div>
    <div class="flex">
      <div>
        <q-btn color="light-blue" unelevated>
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
        <w-card :data="card"/>
      </div>
    </div>

    <div class="text-bold q-mt-lg" style="color: cornflowerblue;font-size: 30px">My Cards</div>

    <div class="q-pa-sm bg-white q-mt-lg">
      <div class="row items-center q-mb-sm">
        <q-input :class="$config.size" outlined dense label="ID" clearable
                 v-model="queryObj.taskId " style="min-width: 10em"
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

      </w-table>
      <w-empty :has="list.length" tip="没有找到相关的数据"/>
      <w-page v-if="list.length" ref="page" :current="queryObj.pageNumber" :total="total" @on-change="pageNumberChange"
              @on-page-size-change="pageSizeChange"/>
    </div>

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
      getCurrentDate,
      whc: _whc,
      total: 0,
      client: {},
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
          slot: 'option',
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
    this.getAllBankCards()
  },
  methods: {
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
    getUserCardsDetail() {
      this.$axios.$get('/api_client/card_detail', this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.userCardsDetail = res.content
        }
      })
    },
    getUserCardsBalance(data) {
      this.$axios.$get(`/api_client/card_balance?bankNum=${data.number}`, this.queryObj).then(res => {
        if (res && res.code === 0) {
          data.balance = Number(res.content).toFixed(2) + ' USD';
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
  font-size 30px
  margin-left 10px
}

.flush {
  cursor: pointer;
}

.flush:hover {
  color: $blue-3;
}
</style>
