<template>
  <div>
    <div>
        <q-btn color="grey" style="margin-left: 20px;margin-top: -12px" outline size="sm"><span
          style="font-size: 12px;color: black" @click="$router.go(-1)">返回</span></q-btn>
    </div>

    <div class="q-pa-sm bg-white q-mt-lg">
      <div style="padding: 10px;border-bottom: 1px solid rgba(0,0,0,0.2);font-size: 22px"
           class="justify-between full-width">
        <b class="q-ml-md">消息中心</b>
      </div>

      <div style="margin-top: 40px;padding: 10px">
        <div v-for="inf in informList" :key="inf.id" style="margin-bottom: 20px">
          <div style="font: 500 normal 1.375em Roboto Condensed,sans-serif;color: #2196f3">{{inf.title}}</div>
          <div style="margin-top: 10px;font-size: 16px">{{ inf.content }}</div>
          <div style="margin-top: 7px"><q-icon style="color: #2196f3;font-size: 12px" name="ti-calendar"/><span style="margin-left: 8px">{{ whc.Date.formatDateTime(new Date(inf.createTime)) }}</span></div>
        </div>
      </div>
      <w-page v-if="informList.length" ref="page" :current="queryObj.pageNumber" :total="total" @on-change="pageNumberChange"
              @on-page-size-change="pageSizeChange"/>
    </div>
  </div>

</template>

<script>
import {_whc} from "src/morejs/_whc";
import WPage from "components/WPage.vue";
export default {
  name: "register_List",
  components: {
    WPage
  },
  data() {
    return {
      whc: _whc,
      total: 0,
      client: {},
      cardDetail: {},
      proxyList: [],
      crList: [],
      informList:[],
      noReadCount:0,
      cardBalance: '',
      freeBalance: '',
      addNewObj: {},
      addressObj: {},
      queryObj: {
        pageNumber: 1,
        pageSize: 10
      },
      list: [],
    }
  },
  mounted() {
    this.getList()
      // this.allRead()
  },
  methods: {
    getList() {
      this.$axios.$get('/api_client_inform', this.queryObj).then(res => {
        this.informList = res.rows
        this.total = res.total
      })
    },
    allRead() {
      this.$axios.$get('/api_client_inform/batch_read').then(res => {
        this.informList = res.rows
        this.total = res.total
      })
    },

    showAddNewModal(address) {
      this.$refs.addNewModal.show()
      this.addressObj = {
        city: address.city,
        street: address.street,
        zipCode: address.zipCode,
        state: address.state,
      }
    },

    editAddressSubmit() {
      this.$axios.$postForm(`/api_client/${this.$route.params.id}/address`, this.addressObj).then(res => {
        if (res && res.code === 0) {
          this.$notify.success('成功')
          this.addressObj = {}
          this.$refs.addNewModal.hide()
          this.getUserCardsDetail()
        }
      })

    },

    getUserCardsDetail(string, start) {
      this.$axios.$get(`/api_client/user_bank_card_detail/` + this.$route.params.id, this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.cardDetail = res.content
          if (res.content.adapterSign === "vm-card2") {
            this.getUserCardsBalanceAndFreeAmount(res.content)
          } else {
            this.getUserCardsBalance(res.content)
          }

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
    getUserCardsBalanceAndFreeAmount(data) {
      this.$axios.$get(`/api_client/card_balance_with_free?bankNum=${data.number}`, this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.cardBalance = Number(res.content.balance).toFixed(2) + ' USD';
          this.freeBalance = Number(res.content.freeAmount).toFixed(2) + ' USD';
        }
      })
    },


    filterProxyListFn(val, update) {
      update(() => {
        this.proxyList = this.allProxyList.filter(v => v.sign.indexOf(val) > -1)
      })
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

.msg-card2 {
  padding: 5px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.msg-card2 > div {
  padding: 10px 0 5px 0;
}

</style>
