<template>
  <q-page>
    <div class="bg-white" style="border-radius: 5px;">
      <div style="font-size: 22px;border-bottom: 1px solid rgba(0,0,0,0.1)" class="flex content-center q-pl-lg q-py-lg">
          <b>账户信息</b>
      </div>
      <div class="q-px-lg">
        <div style="border-bottom: 1px solid rgba(0,0,0,0.1);font-size: 16px" class="q-py-lg">
          <div>全名</div>
          <div>{{client.name}}</div>
        </div>
        <div style="border-bottom: 1px solid rgba(0,0,0,0.1);font-size: 16px" class="q-py-lg">
          <div>账户</div>
          <div>{{user.name}}</div>
        </div>
        <div style="border-bottom: 1px solid rgba(0,0,0,0.1);font-size: 16px" class="q-py-lg">
          <div>用户ID（userSerial）</div>
          <div>{{client.id}}</div>
        </div>
        <div class="q-py-lg flex justify-between" style="font-size: 16px">
          <div>
            <div>密码</div>
            <div>********</div>
          </div>
          <div class="float-right">
            <q-btn @click="showExportModal" outline color="primary" label="修改密码" />
          </div>
        </div>
      </div>
    </div>

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
  </q-page>
</template>

<script>
import balance from "src/assets/balance.png";
import cardlist from "src/assets/cardlist.png";
import income from "src/assets/income.png";
import incomehandle from "src/assets/incomehandle.png";
import open from "src/assets/open.png";
import record from "src/assets/record.png";
import crypt from "src/morejs/crypt";
import {KJUR} from "jsrsasign";
import valida from 'src/morejs/clients'

export default {
  name: "personal",
  data() {
    return {
      balance,
      cardlist,
      income,
      incomehandle,
      open,
      record,
      valida,
      user: {},
      client: {},
      article: [],
      expense: {},
      modify: {
        oldPassword: '',
        password: '',
        twoPassword: ''
      },
      tagsName: 'name',
      isMore: false
    }
  },
  mounted() {
    try {
      this.user = JSON.parse(localStorage.getItem("current"))
    } catch (aa) {

    }
    try {
      this.expense = JSON.parse(localStorage.getItem("expense"))
    } catch (aa) {

    }
    this.getArticle()
    this.getClientCurrent()
  },
  methods: {
    getArticle() {
      this.$axios.$get('/article', {skipDefault: true}).then(res => {
        this.article = res.content
      })
    },
    getClientCurrent() {
      this.$axios.$get('/api_client/current', {skipDefault: true}).then(res => {
        this.client = res.content
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

<style lang="stylus" scoped>
.adv {
  width: 80px;
  height: 80px;
  border-radius: 100%;
  background-color:$light-blue;
  display: flex;
  justify-content: center;
  align-content: center;
}

.title {
  color:$orange
}

.tip {
//margin-top: 30px; background-color:$orange-1;
  padding: 10px;
  border-radius: 5px;
}

.grade {
  padding: 10px;
}

.grade2 {
  font-weight: 700;
}

.grade3 {
  color: #777986;
}

.grade4 {
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}

.ellipsis {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  white-space: normal;
}

a {
  text-decoration: none;
  color: #1D1D1D;
}
</style>
