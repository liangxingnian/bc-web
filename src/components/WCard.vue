<template>
  <div class="card">
    <div>
      <b class="text-blue-3" style="font-size: 30px">BIN</b>
      <span style="font-size: 30px">{{data.bin}}</span>
      <span style="font-size: 20px" class="q-ml-sm">USD</span>
    </div>
    <div class="text-grey">{{data.organization}} 信用卡</div>
    <div>{{data.cr}}</div>
  </div>
</template>

<script>
export default {
  name: "WCard",
  props:{
    data:{
      default: () => ({})
    }
  }
}
</script>

<style scoped>
.card {
  background-color: #ffffff;
  border-radius: 5px;
  padding: 20px;
}
</style>
