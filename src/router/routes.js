//https://themify.me/themify-icons 图标
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/',
        component: () => import('pages/Index.vue'),
        icon: 'ti-home',
        meta: {
          title: '首页'
        },
      },
      {
        path: '/card',
        component: () => import('pages/Card.vue'),
        icon: 'ti-credit-card',
        meta: {
          title: '开卡'
        },
      },
      {
        path: '/wallet',
        component: () => import('pages/Wallet.vue'),
        icon: 'ti-wallet',
        meta: {
          title: '钱包'
        },
      },
      {
        path: '/order',
        component: () => import('pages/Order.vue'),
        icon: 'ti-clipboard',
        meta: {
          title: '订单'
        },
      },
      // {
      //   path: '/center',
      //   component: () => import('pages/Card.vue'),
      //   icon: 'ti-user',
      //   meta: {
      //     title: '个人中心'
      //   },
      // },
    ]
  },
  {
    path: '/login',
    component: () => import('pages/Login.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
