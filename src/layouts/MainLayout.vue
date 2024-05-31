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
