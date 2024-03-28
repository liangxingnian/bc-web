<template>
  <div>
    <div class="text-center">
      <img :src="sImg" style="height: 60px"/>
    </div>
    <div class="login-wrapper">
      <b style="font-size: 25px">
        登录
      </b>
      <q-form @submit="onSubmit" ref="loginForm" class="q-mt-md">
        <q-input
          outlined
          v-model="form.identifier"
          dense
          label="账户"
          lazy-rules
          :rules="[ (val) => val !== null && val !== ''  || '请输入账户' ]"
        >
        </q-input>
        <q-input
          outlined
          clear-icon="cancel"
          :type="isPwd ? 'password' : 'text'"
          v-model="form.password"
          dense
          debounce="500"
          label="密码"
          lazy-rules
          square
          :rules="[ (val) => val !== null && val !== ''  || '请输入密码' ]"
        >
        </q-input>
        <q-input
          v-if="isNeedVerify"
          v-model="form.captcha"
          dense
          clearable
          debounce="500"
          label="请输入图形验证码"
          lazy-rules
          square
          :rules="[
                      (val) => val && val.length > 0 || '请输入图形验证码'
                      ]"
        >
          <template v-slot:after>
            <img :src="captchaUrl" alt="验证码" @click="getCaptcha">
          </template>
        </q-input>
        <q-btn
          dense
          unelevated
          label="登录"
          :disable="!accept"
          size="17px"
          color="primary q-mt-sm"
          class="full-width"
          type="submit"
          :loading="loginLoading"
        >
          <template v-slot:loading>
            <q-spinner-ios class="on-left"/>
            登录...
          </template>
        </q-btn>
      </q-form>
      <div class="q-mt-lg">
        <q-btn no-caps unelevated class="text-center" style="color: darkturquoise;width: 100%" @click="showRegistModal()">
          立即注册
        </q-btn>
      </div>
    </div>

    <w-modal ref="modifyLoginPassword" title="注册" :show-button="false">
      <div>请联系<a style="color: deepskyblue" target="_blank" href="https://t.me/LKJ118">在线客服</a>开户！</div>
    </w-modal>

  </div>
</template>

<script>
import crypt from 'src/morejs/crypt'
import {KJUR} from 'jsrsasign'
import sImg from 'assets/vcc.png'

export default {
  name: 'Login',
  data() {
    return {
      sImg,
      obj: {},
      phoneCaptchaFlag: false,
      form: {
        identifier:'',
        password:'',
        captcha: '',
      },
      captchaUrl: '',
      isNeedVerify: false,
      validateCodeLoading: false,
      count: 60,
      tab: 'mails',
      isPwd: true,
      loginLoading: false,
      accept: true
    }
  },
  async mounted() {
    //this.getCaptcha()
    //await this.needVerify()
  },
  methods: {
    onSubmit() {
      this.$axios.$get('/login/public_key').then(res => {
        this.publicKey = res.content
        const key = crypt.generateRandomKey()
        const encryptedKey = crypt.rsaEncrypt(this.publicKey, key)
        const password = this.form.password && KJUR.crypto.Util.md5(this.form.password)
        const params = JSON.parse(JSON.stringify(this.form))
        params.password = password
        const encrypted = crypt.aesEncrypt(key, JSON.stringify(params))
        const form = {
          key: encryptedKey,
          params: encrypted,
          name: this.form.name
        }
        this.$axios.$postForm('/login', form).then((resp) => {
          if (resp && resp.code === 10129) {
            this.obj = {}
            this.form = {}
            this.tab = 'alarms'
            return
          }
          let sessionSecret = resp.content.sessionSecret
          sessionSecret = crypt.aesDecrypt(key, sessionSecret)
          localStorage.setItem('sessionSecret', sessionSecret)
          this.$router.push({path: '/'})
        }).catch((err) => {
          if (this.isNeedVerify) {
            this.getCaptcha()
          } else {
            this.needVerify()
          }
        }).finally(() => {
          this.loginLoading = false
        })
      })
    },
    getCaptcha() {
      this.captchaUrl = '/um/captcha?' + Math.random()
    },
    showRegistModal() {
      this.$refs.modifyLoginPassword.show()
    },
    getVerifyCode() {
      this.$axios.$get(`/login/phone_verify?identifier=${this.form.identifier}&captcha=${this.form.phoneCaptcha}`).then(res => {
        if (res && res.code === 0) {
          this.validateCodeLoading = true
          this.phoneCaptchaFlag = false
          this.getCaptcha()
          const interval = setInterval(() => {
            this.count--
            if (this.count <= 0) {
              this.validateCodeLoading = false
              this.count = 60
              clearInterval(interval)
            }
          }, 1000)
        }
      })
    },
    async needVerify() {
      const res = await this.$axios.$get('/need_verify')
      if (res && res.code === 0) {
        this.isNeedVerify = res.content.needVerify
      }
    },
  }
}
</script>

<style scoped>
.login-wrapper {
  background-color: #fff;
  padding: 50px;
  border-radius: 5px;
  max-width: 400px;
  margin: 18px auto;
  border: 1px solid rgba(0,0,0,0.2);
}
</style>
