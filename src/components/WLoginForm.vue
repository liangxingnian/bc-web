<template>
  <div>
    <div class="login-wrapper">
      <span style="font-size: 24px">
        登录您的账号
      </span>
      <q-form @submit="onSubmit" ref="loginForm" class="q-mt-lg">
        <div class="q-mb-sm"><span style="color: red">*</span> 账号</div>
        <q-input
          outlined
          v-model="form.identifier"
          square
          clearable
          placeholder="请输入账号"
        >
        </q-input>
        <div class="q-mb-sm q-mt-lg"><span style="color: red">*</span> 密码</div>
        <q-input
          outlined
          clearable
          placeholder="请输入密码"
          :type="isPwd ? 'password' : 'text'"
          v-model="form.password"
          square
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
          v-show="form.identifier&&form.password"
         square
          unelevated
          label="登录"
          size="17px"
          class="full-width q-mt-lg"
          type="submit"
          :loading="loginLoading"
          style="background: #28bedc;color: white"
        >
          <template v-slot:loading>
            <q-spinner-ios class="on-left"/>
            登录...
          </template>
        </q-btn>
        <q-btn
          v-show="!(form.identifier&&form.password)"
         square
          unelevated
          label="登录"
          disable
          size="17px"
          class="full-width q-mt-lg"
          type="submit"
          style="background: rgba(0,0,0,0.1);color: rgba(0,0,0,0.7)"
        >
        </q-btn>
      </q-form>
      <div class="q-mt-lg">
        <q-btn no-caps unelevated class="text-center" style="color: darkturquoise;width: 100%"
               @click="showRegistModal()">
          立即注册
        </q-btn>
      </div>
    </div>

    <w-modal ref="modifyLoginPassword" title="注册" @on-ok="onRegister">
      <q-form @submit="onRegister" ref="registForm">
        <div class="q-gutter-y-md">
          <div class="text-left text-body1"></div>
          <div class="row">
            <div class="col-12 q-gutter-y-sm">
              <q-input
                outlined
                clearable
                clear-icon="cancel"
                v-model="dataForm.identifier"
                label="用户名"
                dense
                lazy-rules
                square
                :rules="[
                  (val) => val !== null && val !== ''  || '请输入用户名',
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="fas fa-user-circle"/>
                </template>
              </q-input>
              <q-input
                outlined
                clearable
                clear-icon="cancel"
                type="password"
                v-model="dataForm.password"
                dense
                label="密码"
                lazy-rules
                square
                :rules="[ (val) => val !== null && val !== ''  || '请输入密码' ]"
              >
                <template v-slot:prepend>
                  <q-icon name="fas fa-lock"/>
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
              <q-input
                outlined
                clearable
                clear-icon="cancel"
                type="password"
                v-model="dataForm.twoPassword"
                dense
                label="确认密码"
                lazy-rules
                square
                :rules="[
                  (val) => val !== null && val !== ''  || '请输入确认密码',
                  () => passwordValida || '两次密码不一致'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="fas fa-lock"/>
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
            </div>
          </div>
        </div>
      </q-form>
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
      dataForm: {},
      phoneCaptchaFlag: false,
      form: {
        identifier: '',
        password: '',
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
  computed: {
    passwordValida: function () {
      return this.dataForm.password === this.dataForm.twoPassword
    }
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
    onRegister() {
      this.$refs.registForm.validate().then(success => {
        if (success) {
          this.$axios.$get('/login/public_key').then(res => {
            this.publicKey = res.content
            const key = crypt.generateRandomKey()
            const encryptedKey = crypt.rsaEncrypt(this.publicKey, key)
            const password = this.dataForm.password && KJUR.crypto.Util.md5(this.dataForm.password)
            const params = JSON.parse(JSON.stringify(this.dataForm))
            params.password = password
            delete params.twoPassword
            const encrypted = crypt.aesEncrypt(key, JSON.stringify(params))
            const form = {
              key: encryptedKey,
              params: encrypted,
            }
            this.$axios.$postForm('/register', form).then(function (response) {
              let sessionSecret = response.content.sessionSecret
              sessionSecret = crypt.aesDecrypt(key, sessionSecret)
              localStorage.setItem('sessionSecret', sessionSecret)
            }).then(() => {
              // this.$store.dispatch('user/get', 'user')
              this.$router.push({path: '/'})
            })
          })
        }
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
.labelStyle {
  font-size: 14px;
  width: 60px;
  text-align: left;
}

.login-wrapper {
  background-color: #fff;
  padding: 50px;
  border-radius: 5px;
  max-width: 600px;
  margin: 18px auto;
  //border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
