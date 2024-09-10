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
            <div style="height: 60px" class="flex items-center float-right">
              <q-btn dense round flat icon="ti-email">
                <q-badge v-if="noReadCount" color="red" floating transparent>
                  {{ noReadCount }}
                </q-badge>
                <q-popup-proxy>
                  <q-banner style="width: 300px">
                    <div class="flex justify-between items-center" style="height: 46px">
                      <b>消息</b>
                      <q-btn v-if="informList.length" flat color="secondary" @click="allRead()" label="全部已读"/>
                    </div>
                    <template v-if="informList.length">
                      <div class="msg-card" v-for="msg in informList" :key="msg.id">
                        <div>
                          <b style="font-size: 18px;color:#5c6bc0">{{ msg.title }}</b>
                          <div class="ellipsis" style="font-size: 16px;margin-top: 5px;width: 250px">
                            {{ msg.content }}
                          </div>
                        </div>
                      </div>
                    </template>
                    <div v-else style="color: rgba(0,0,0,0.4);padding: 10px 0 20px 0" class="text-center">
                      暂无消息
                    </div>
                    <div
                      style="color: rgb(62, 191, 221);background-color: rgba(0,0,0,0.05);padding: 7px 10px; border-radius: 3px;cursor: pointer"
                      @click.stop="detailClick2()">
                      <q-icon name="ti-email"></q-icon>
                      <b style="margin-left: 10px">消息中心</b>
                    </div>
                  </q-banner>
                </q-popup-proxy>
              </q-btn>

            </div>
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
            <img :src="vccImg" width="100"/>
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


    <!--    <w-modal ref="modifyLoginPassword" title="修改登录密码" @on-ok="modifyPassword">-->
    <q-dialog v-model="bar2">
      <q-card class="inner" style="width: 100%">
        <q-bar style="height: 70px;background-color: #e0efff">
          <div style="font-size: 20px;font-weight: 600;padding: 0 0 0 12px">修改密码</div>
          <q-space/>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section style="max-height: 50vh" class="scroll">
          <div class="flex justify-center">
            <q-form
              class="q-gutter-sm"
              ref="userEditPasswordForm"
              style="width: 90%;"
            >
              <div style="padding: 30px 0 20px 0"><span style="color: red">* </span><span>原密码</span></div>
              <q-input
                v-model="modify.oldPassword"
                dense outlined clearable square
                type="password"
                lazy-rules
                :rules="[
                          val => val && val.length > 0 || '请输入登录原密码'
                        ]"
                label="请输入登录原密码"
              >
              </q-input>

              <div style="padding: 10px 0 20px 0"><span style="color: red">* </span><span>新密码</span></div>
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
                label="请输入新密码"
              >
              </q-input>

              <div style="padding: 10px 0 20px 0"><span style="color: red">* </span><span>确认新密码</span></div>
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
                label="请再次输入新密码"
              >
              </q-input>
            </q-form>
          </div>
        </q-card-section>

        <!--        <q-separator/>-->

        <q-card-actions align="right">
          <q-btn flat label="确定" color="primary" @click="modifyPassword"/>
          <q-btn flat label="取消" color="primary" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!--      <q-separator/>-->
    <!--      <q-tab-panels v-model="tagsName" animated>-->
    <!--        &lt;!&ndash;账号修改密码&ndash;&gt;-->
    <!--        <q-tab-panel name="name">-->
    <!--          <q-form-->
    <!--            class="q-gutter-sm"-->
    <!--            ref="userEditPasswordForm"-->
    <!--          >-->
    <!--            <q-input-->
    <!--              v-model="modify.oldPassword"-->
    <!--              dense outlined clearable square-->
    <!--              type="password"-->
    <!--              lazy-rules-->
    <!--              :rules="[-->
    <!--                val => val && val.length > 0 || '请输入旧密码'-->
    <!--              ]"-->
    <!--              label="旧密码*"-->
    <!--            >-->
    <!--            </q-input>-->
    <!--            <q-input-->
    <!--              v-model="modify.password"-->
    <!--              dense outlined clearable square-->
    <!--              autocomplete="new-password"-->
    <!--              type="password"-->
    <!--              lazy-rules-->
    <!--              :rules="[-->
    <!--                val => val && val.length > 0 || '请输入新密码',-->
    <!--                val => valida.passwordValidation(val) || '密码由6-48个字符组成'-->
    <!--              ]"-->
    <!--              label="新密码*"-->
    <!--            >-->
    <!--            </q-input>-->
    <!--            <q-input-->
    <!--              v-model="modify.twoPassword"-->
    <!--              dense outlined clearable square-->
    <!--              autocomplete="new-password"-->
    <!--              type="password"-->
    <!--              lazy-rules-->
    <!--              :rules="[-->
    <!--                val => val && val.length > 0 || '请再次输入新密码',-->
    <!--                val => val && (val === modify.password) || '两次密码输入不相同'-->
    <!--              ]"-->
    <!--              label="确认新密码*"-->
    <!--            >-->
    <!--            </q-input>-->
    <!--          </q-form>-->
    <!--        </q-tab-panel>-->
    <!--      </q-tab-panels>-->
    <!--    </w-modal>-->

    <q-dialog v-model="alert" :persistent="true">
      <!--      <q-card>-->
      <!--        <q-card-section>-->
      <!--          <div class="text-h6"><b>通知：</b></div>-->
      <!--        </q-card-section>-->

      <!--        <q-card-section class="q-pt-none" style="font-weight: bold">-->
      <!--          为了给您带来更加出色的服务品质及更好的客户体验，发卡行渠道将进行升级，2024.05.28之前创建的特定卡段将于<span-->
      <!--          style="color: red">2024.06.05 12:00</span>下线停用，受影响的卡在该日期后将无法继续使用。现说明如下：-->
      <!--          <br>-->
      <!--          <br>1. 受影响的卡，系统已在卡列表标记为<span style="color:red;">【红色】</span>。注意：其他未标记为红色的卡不受影响可继续正常使用。-->
      <!--          <br>2. 请记得在此之前，将这些卡片从您的支付平台和自动扣款服务中解绑，以免影响您的日常使用。-->
      <!--          <br>3. 请在2024.06.04前，手动执行“销卡”操作，销卡成功后卡内余额自动退回总账。-->
      <!--          <br>4. 如未手动处理，系统将于<span style="color: red">2024.06.05</span>自动执行卡退款&销卡操作。卡内可用余额将自动清空并退回您的后台总账，无需您操作。-->
      <!--          <br>5.我们将为您返回开卡手续费，充值手续费，让您下次开卡时无需在支付该费用。-->

      <!--          <br>-->
      <!--          <br>我们对上述变更对你造成的影响表示歉意。系统升级后，原有卡段可继续开卡使用，使用更加流畅：a) 卡限额提升 b)-->
      <!--          有效期提升c) 卡操作更便捷。-->
      <!--          <br>-->
      <!--          <br>本次升级，只是让您的卡片信息更安全，使用周期更长，卡片管理操作更便捷！-->
      <!--          <br>-->
      <!--          <br>-->
      <!--          <br><span-->
      <!--          style="color: red">卡费已全部退回，请注意查收，您可以在后台资金管理查看账单核实，如您需要任何帮助，请随时联系我们的在线客服</span>-->
      <!--        </q-card-section>-->

      <!--        <q-card-actions align="right">-->
      <!--          <q-btn flat label="OK" color="primary" v-close-popup/>-->
      <!--        </q-card-actions>-->
      <!--      </q-card>-->


      <q-card>
        <q-card-section>
          <div class="text-h6"><b>系统通知：</b></div>
        </q-card-section>

        <q-card-section class="q-pt-none" style="font-weight: bold">
<!--          现有部分卡怀疑异常需对该部分卡进行升级，系统需批量注销，卡内余额、开卡费、充值手续费系统将自动退回至账户余额，用户可重新开卡使用，对该升级是为了提供更稳定的卡服务，感谢您的理解与支持。-->
          <br>
          <br>1、近期因发卡行系统的不稳定，造成了部分已开卡的突然销卡给您带来了不便，我们深感歉意，但是请放心我们将会保障各位用户权益将卡里余额、开卡费、充值手续费一并退回您账户后台，您可以重新开卡使用，8月1号新开的卡将会更稳定，将不会在出现类似突然销卡的情况。
          <br>
          <br>2、同时我们正在准备材料合同与另一家美国发卡行签合作，到时候会有新的卡上线，支持的场景更多、使用更稳定、卡费会更低，同时将会为使用量大的用户提供专属优惠，请各位用户稍微等待一下，届时我们将会提供更优质的卡服务，感谢大家对VCC的理解与支持。
          <br>
          <br>3、如您有问题或疑问，可联系在线客服咨询。
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup/>
        </q-card-actions>
      </q-card>


<!--      <q-card>-->
<!--        <q-card-section>-->
<!--          <div class="text-h6"><b>维护通知：</b></div>-->
<!--        </q-card-section>-->

<!--        <q-card-section class="q-pt-none" style="font-weight: bold">-->
<!--          临时维护预计晚点恢复-->
<!--        </q-card-section>-->

<!--        <q-card-actions align="right">-->
<!--          <q-btn flat label="OK" color="primary" v-close-popup/>-->
<!--        </q-card-actions>-->
<!--      </q-card>-->
    </q-dialog>

    <a target="_blank" href="https://t.me/LKJ118"><img style="position: fixed;right: 20px;bottom: 20px"
                                                       src="/tgicon.svg" width="40px"/></a>
<!--    <a target="_blank" href="https://t.me/LKJ11188"><img style="position: fixed;right: 20px;bottom: 20px"-->
<!--                                                       src="/tgicon.svg" width="40px"/></a>-->
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
      bar2: false,
      vccImg,
      routes,
      valida,
      alert: false,
      informList: [],
      noReadCount: 0,
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
    this.getInform()
    setInterval(() => {
      this.getInform()
    }, 10000)

  },
  methods: {
    getCurrent() {
      this.$axios.$get('/user/current', {_skipLoading: true}).then(res => {
        this.user = res.content
        localStorage.setItem("current", JSON.stringify(this.user))
      })
    },
    getInform() {
      this.$axios.$get('/api_client_inform', {
        pageNumber: 1,
        pageSize: 3,
        read: false,
        _skipLoading: true
      }).then(res => {
        this.informList = res.rows
        this.noReadCount = res.total
      })
    },
    allRead() {
      this.$axios.$get('/api_client_inform/batch_read', {_skipLoading: true}).then(res => {
        this.getInform()
      })
    },
    detailClick2() {
      this.$router.push('/inform_detail')
    },
    getClientCurrent() {
      this.$axios.$get('/api_client/current', {_skipLoading: true}).then(res => {
        this.client = res.content
        localStorage.setItem("client_current", JSON.stringify(this.client))
      })
    },
    getExpense() {
      this.$axios.$get('/api_client/expense', {_skipLoading: true}).then(res => {
        this.expense = res.content
        localStorage.setItem("expense", JSON.stringify(this.expense))
      })
    },
    logout() {
      this.$axios.$post('/logout', null, {_skipLoading: true})
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

      // this.$refs.modifyLoginPassword.show()
      this.bar2 = true
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
                // this.$refs.modifyLoginPassword.hide()
                this.bar2 = false
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

.msg-card {
  padding: 5px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.msg-card > div {
  padding: 10px 0 5px 0;
}

.ellipsis {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  white-space: normal;
}
.inner {
  max-width: 800px !important;
}

</style>
