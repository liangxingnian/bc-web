<template>
  <div style="width: 100%">
    <div v-for="item of chatRecords" :key="item.createTime" class="q-mb-md">
      <q-chat-message :label="whc.Date.formatDateTime(new Date(item.createTime))"/>
      <div class="flex items-end" v-if="wid === item.wid">
        <q-space/>
        <div class="q-mb-xs q-mr-xs">
          <q-spinner-clock
            color="primary"
            size="12px" v-if="item.state === 1"
          >
          </q-spinner-clock>
          <q-icon name="fa-solid fa-check" style="color: #21BA45" v-if="item.state === 2"/>
          <q-icon name="fa-solid fa-check-double" style="color: #21BA45" v-if="item.state === 3"/>
        </div>
        <q-chat-message :name="item.wid" sent text-color="white"
                        bg-color="secondary" style="max-width: 300px">
          {{item.messageBody}}
        </q-chat-message>
      </div>
      <div class="flex items-end" v-else>
        <q-chat-message :name="item.wid" class="q-mr-xs" text-color="white"
                        bg-color="primary" style="max-width: 300px">
          {{item.messageBody}}
        </q-chat-message>
        <div class="q-mb-xs ">
          <q-spinner-clock
            color="primary"
            size="12px" v-if="item.state === 1"
          />
          <q-icon name="fa-solid fa-check" style="color: #21BA45" v-if="item.state === 2"/>
          <q-icon name="fa-solid fa-check-double" style="color: #21BA45" v-if="item.state === 3"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { _whc } from "src/morejs/_whc";

export default {
  name: "WChetBox",
  props: {
    wid: {
      type: String
    },
    chatRecords: []
  },
  data () {
    return {
      whc: _whc
    }
  }
}
</script>

<style scoped>
  >>> .q-message-text:last-child {
    min-height: 24px;
  }
  >>> .q-message-label {
     margin: 0;
    text-align: center;
  }
</style>
