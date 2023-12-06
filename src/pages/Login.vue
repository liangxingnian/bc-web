<template>
  <div style="width: 100%" class="flex">
    <div style="width: 50%" class="flex justify-center content-center">
      <div style="padding-left: 100px">
        <div class="text-center" style="font-weight: 600;font-size: 30px">VCC全球发卡业务</div>
        <div class="text-center q-my-md" style="font-size: 25px">支持 VISA 和 Mastercard 线上消费全场景</div>
        <div style="font-size: 20px">全球发卡业务是VCC与国际发卡机构合作推出的Visa / Matercard虚拟卡服务，客户可直接通过线上的方式，快速申请Visa / Matercard虚拟卡，并绑定全球多币种账户，覆盖多种消费场景，支持多币种交易，开卡即用，实时到账，极速消费。极大提升您在海外支付时的便利性、可见性与安全性。</div>
      </div>
    </div>
    <div style="width: 50%">
      <login-form style="margin: 12rem auto"></login-form>
    </div>
  </div>
</template>

<script>
import LoginForm from '../components/WLoginForm'

export default {
  name: 'login',
  components: {
    LoginForm
  },
  mounted() {
    // document.body.style.backgroundColor = '#2db7f5'
  }
}
</script>

<style scoped>
</style>
