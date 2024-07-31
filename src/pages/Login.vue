<template>
  <div style="width: 100%" class="flex">
    <div style="width: 50%;background-color: rgba(0,0,0,0.02)" class="flex content-center">
      <div style="padding-left: 100px">
        <div class="q-mt-md" style="margin-bottom: 40px">
          <img :src="vccImg" width="100"/>
<!--          <div class="flex q-ml-md">VccPay</div>-->
        </div>
        <div class="text-center" style="font-weight: 600;font-size: 30px">VCC全球发卡业务</div>
        <div class="text-center q-my-md" style="font-size: 25px">支持 VISA 和 Mastercard 线上消费全场景</div>
        <div style="font-size: 20px">全球发卡业务是VCC与国际发卡机构合作推出的Visa /
          Matercard虚拟卡服务，客户可直接通过线上的方式，快速申请Visa /
          Matercard虚拟卡，并绑定全球多币种账户，覆盖多种消费场景，支持多币种交易，开卡即用，实时到账，极速消费。极大提升您在海外支付时的便利性、可见性与安全性。
        </div>
      </div>
      <div style="padding-left: 100px;padding-top: 50px">
        <div class="flex q-mt-lg q-ml-lg">
          <q-img :src="kdPicture" style="height: 45px;width: 45px"></q-img>
          <div class="q-ml-lg">
            <div style="font-weight: 500;font-size: 18px"> 一站式用卡方案</div>
            <div style="color: rgba(0,0,0,0.5)">无论是个人还是企业，我们都提供智能化全球支付方案</div>
          </div>
        </div>
      </div>

      <div style="padding-left: 100px;padding-top: 50px">
        <div class="flex q-mt-lg q-ml-lg">
          <q-img :src="cjPicture" style="height: 45px;width: 45px"></q-img>
          <div class="q-ml-lg">
            <div style="font-weight: 500;font-size: 18px"> 多场景应用</div>
            <div style="color: rgba(0,0,0,0.5)">满足您的商旅、购物、应用、游戏、广告投放等消费需求</div>
          </div>
        </div>
      </div>

      <div style="padding-left: 100px;padding-top: 50px">
        <div class="flex q-mt-lg q-ml-lg">
          <q-img :src="aqPicture" style="height: 45px;width: 45px"></q-img>
          <div class="q-ml-lg">
            <div style="font-weight: 500;font-size: 18px"> 安全是生命线</div>
            <div style="color: rgba(0,0,0,0.5)">采用ssl，保护您的数据安全</div>
          </div>
        </div>
      </div>
    </div>
    <div style="width: 50%">
      <login-form style="margin: 12rem auto"></login-form>
    </div>
  </div>
</template>

<script>
import LoginForm from '../components/WLoginForm'
import kdPicture from "src/assets/1102.svg";
import cjPicture from "src/assets/1105.svg";
import aqPicture from "src/assets/1101.svg";
import vccImg from 'assets/vcc.png'

export default {
  name: 'login',
  components: {
    LoginForm
  },
  data() {
    return {
      vccImg,
      kdPicture,
      cjPicture,
      aqPicture
    }
  },
  mounted() {
    // document.body.style.backgroundColor = '#2db7f5'
  }
}
</script>

<style scoped>
</style>
