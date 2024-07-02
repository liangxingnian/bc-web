<template>
  <div>
    <q-layout view="lHh lpR fFf" class="bg-grey-2">
      <q-header style="background-color: #fff">
        <q-toolbar>
          <q-btn
            flat
            dense
            round
            icon="menu"
            aria-label="Menu"
            color="light-blue"
            @click="leftDrawerOpen = !leftDrawerOpen"
          />

          <q-toolbar-title class="text-black">
          </q-toolbar-title>

          <q-btn-dropdown no-caps unelevated :label="user && user.name" color="light-blue">
            <q-list>
              <q-item clickable v-close-popup @click="showExportModal">
                <q-item-section>
                  <q-item-label>修改密码</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="logout">
                <q-item-section>
                  <q-item-label>退出登录</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        bordered
        :width="290"
        content-class="bg-white"
      >
        <q-scroll-area class="fit">
          <div class="text-center q-mt-md">
            <img :src="vccImg" width="100" />
          </div>
          <q-list class="q-mt-md">
            <w-menu :routes="routes"/>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <div class="q-ma-md">
          <router-view/>
        </div>
        <div class="text-center view-footer q-pb-md">
        </div>
      </q-page-container>

    </q-layout>


    <w-modal ref="modifyLoginPassword" title="修改登录密码" @on-ok="modifyPassword">
      <q-separator/>
      <q-tab-panels v-model="tagsName" animated>
        <!--账号修改密码-->
        <q-tab-panel name="name">
          <q-form
            class="q-gutter-sm"
            ref="userEditPasswordForm"
          >
            <q-input
              v-model="modify.oldPassword"
              dense outlined clearable square
              type="password"
              lazy-rules
              :rules="[
                val => val && val.length > 0 || '请输入旧密码'
              ]"
              label="旧密码*"
            >
            </q-input>
            <q-input
              v-model="modify.password"
              dense outlined clearable square
              autocomplete="new-password"
              type="password"
              lazy-rules
              :rules="[
                val => val && val.length > 0 || '请输入新密码',
                val => valida.passwordValidation(val) || '密码由6-48个字符组成'
              ]"
              label="新密码*"
            >
            </q-input>
            <q-input
              v-model="modify.twoPassword"
              dense outlined clearable square
              autocomplete="new-password"
              type="password"
              lazy-rules
              :rules="[
                val => val && val.length > 0 || '请再次输入新密码',
                val => val && (val === modify.password) || '两次密码输入不相同'
              ]"
              label="确认新密码*"
            >
            </q-input>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </w-modal>

    <q-dialog v-model="alert" :persistent="true">
      <q-card>
        <q-card-section>
          <div class="text-h6"><b>通知：</b></div>
        </q-card-section>

        <q-card-section class="q-pt-none" style="font-weight: bold">
          为了给您带来更加出色的服务品质及更好的客户体验，发卡行渠道将进行升级，2024.05.28之前创建的特定卡段将于<span style="color: red">2024.06.05 12:00</span>下线停用，受影响的卡在该日期后将无法继续使用。现说明如下：
          <br>
          <br>1. 受影响的卡，系统已在卡列表标记为<span style="color:red;">【红色】</span>。注意：其他未标记为红色的卡不受影响可继续正常使用。
          <br>2. 请记得在此之前，将这些卡片从您的支付平台和自动扣款服务中解绑，以免影响您的日常使用。
          <br>3. 请在2024.06.04前，手动执行“销卡”操作，销卡成功后卡内余额自动退回总账。
          <br>4. 如未手动处理，系统将于<span style="color: red">2024.06.05</span>自动执行卡退款&销卡操作。卡内可用余额将自动清空并退回您的后台总账，无需您操作。
          <br>5.我们将为您返回开卡手续费，充值手续费，让您下次开卡时无需在支付该费用。

          <br>
          <br>我们对上述变更对你造成的影响表示歉意。系统升级后，原有卡段可继续开卡使用，使用更加流畅：a) 卡限额提升 b) 有效期提升c) 卡操作更便捷。
          <br>
          <br>本次升级，只是让您的卡片信息更安全，使用周期更长，卡片管理操作更便捷！
          <br>
          <br>
          <br><span style="color: red">卡费已全部退回，请注意查收，您可以在后台资金管理查看账单核实，如您需要任何帮助，请随时联系我们的在线客服</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <a target="_blank" href="https://t.me/LKJ118"><img style="position: fixed;right: 20px;bottom: 20px" src="/tgicon.svg" width="40px"/></a>
  </div>

</template>

<script>
import routes from 'src/router/routes'
import WMenu from 'src/components/WMenu'
import crypt from 'src/morejs/crypt.js'
import {KJUR} from 'jsrsasign'
import WLink from 'src/components/WLink'
import valida from 'src/morejs/clients'
import vccImg from 'assets/vcc.png'

export default {
  name: 'MainLayout',
  components: {
    WMenu,
    WLink
  },
  data() {
    return {
      vccImg,
      routes,
      valida,
      alert:false,
      user: null,
      client: null,
      expense: null,
      leftDrawerOpen: false,
      form: {},
      tagsName: 'name',
      modify: {
        oldPassword: '',
        password: '',
        twoPassword: ''
      },
      phoneEditPass: {
        key: '',
        password: '',
        twoPassword: '',
        phoneNumber: '',
        phoneVerifyCode: ''
      },
    }
  },
  mounted() {
    this.getCurrent()
    this.getClientCurrent()
    this.getExpense()
  },
  methods: {
    getCurrent() {
      this.$axios.$get('/user/current', {skipDefault: true}).then(res => {
        this.user = res.content
        localStorage.setItem("current", JSON.stringify(this.user))
      })
    },
    getClientCurrent() {
      this.$axios.$get('/api_client/current', {skipDefault: true}).then(res => {
        this.client = res.content
        localStorage.setItem("client_current", JSON.stringify(this.client))
      })
    },
    getExpense() {
      this.$axios.$get('/api_client/expense', {skipDefault: true}).then(res => {
        this.expense = res.content
        localStorage.setItem("expense", JSON.stringify(this.expense))
      })
    },
    logout() {
      this.$axios.$post('/logout', null, {skipDefault: true})
        .catch(err => {
          console.error('退出异常' + err)
        })
        .finally(() => {
          localStorage.setItem('sessionSecret', '')
          this.$router.push({path: '/login'})
        })
    },
    showExportModal() {
      this.modify.password = ''
      this.modify.oldPassword = ''
      this.modify.twoPassword = ''

      this.$refs.modifyLoginPassword.show()
    },
    modifyPassword() {
      this.$refs.userEditPasswordForm.validate().then(success => {
        if (success) {
          this.$axios.$get('/login/public_key').then(res => {
            this.publicKey = res.content
            const key = crypt.generateRandomKey()
            const encryptedKey = crypt.rsaEncrypt(this.publicKey, key)
            const oldPassword = KJUR.crypto.Util.md5(this.modify.oldPassword)
            const newPassword = KJUR.crypto.Util.md5(this.modify.password)

            const obj = JSON.stringify({
              oldPassword: oldPassword,
              newPassword: newPassword
            })

            const encrypted3 = crypt.aesEncrypt(key, obj)

            const data = {
              key: encryptedKey,
              params: encrypted3
            }
            this.$axios.$postForm('/user/edit_password', data).then(res => {
              if (res && res.code === 0) {
                this.modify.password = ''
                this.modify.oldPassword = ''
                this.modify.twoPassword = ''
                this.$refs.modifyLoginPassword.hide()
              }
            })
          })
        }
      })
    },
  }
}
</script>

<style scoped lang="stylus">
.view-footer {
  user-select none
  color $grey-5
}

>>> .q-item__section--avatar {
  min-width: 0
}
</style>
