<template>
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
        <div>
          <span style="font-size: 50px;margin-left: 20px;">LKJ</span>
          <span class="q-ml-md text-grey">v1.0.0</span>
        </div>
        <q-list class="q-mt-md">
          <w-menu :routes="routes"/>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <div class="q-px-md q-pt-md q-pb-md">
        <router-view/>
      </div>
      <div class="text-center view-footer q-pb-md">
      </div>
    </q-page-container>

  </q-layout>
</template>

<script>
import routes from 'src/router/routes'
import WMenu from 'src/components/WMenu'
import crypt from 'src/morejs/crypt.js'
import {KJUR} from 'jsrsasign'
import WLink from 'src/components/WLink'
import {phoneValidation} from 'src/morejs/utils'
import {mapState} from 'vuex'

export default {
  name: 'MainLayout',
  components: {
    WMenu,
    WLink
  },
  data() {
    return {
      routes,
      user: null,
      client: null,
      leftDrawerOpen: false
    }
  },
  mounted() {
    this.getCurrent()
    this.getClientCurrent()
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
    logout() {
      this.$axios.$post('/logout', null, {skipDefault: true})
        .catch(err => {
          console.error('退出异常' + err)
        })
        .finally(() => {
          localStorage.setItem('sessionSecret', '')
          this.$router.push({path: '/login'})
        })
    }
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
