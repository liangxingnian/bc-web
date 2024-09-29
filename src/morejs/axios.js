import axios from 'axios'
import qs from 'qs'
import {dataType, formatParams, strToObj} from 'src/morejs/utils'
import {Loading} from 'quasar'
import notify from 'src/morejs/notify'
import $bus from 'src/boot/bus'

// 响应时间
axios.defaults.timeout = 30 * 1000
// 配置请求头
axios.defaults.headers['Content-Type'] = 'application/json'
axios.defaults.headers['App-UM-Partition'] = 'whc_v7'

const methods = ['post', 'get', 'put', 'delete']
const formMethods = ['post', 'put']
const isParams = ['get', 'delete'] // 参数使用params

// 请求数
let hasRequest = 0

axios.interceptors.request.use(config => {
  let loading = true
  if (config.data && dataType(config.data) === 'String') {
    // 批量添加外部商品编号映射不去除空格
    if (!config.url.includes('/api_client/open_card')) {
      config.data = strToObj(config.data)
    }
  }
  if (config.params && dataType(config.params) === 'String') {
    config.params = strToObj(config.params)
  }
  if (dataType(config.params) === 'Object' || dataType(config.params) === 'Array') {
    formatParams(config.params)
    if (config.params._skipLoading) {
      loading = false
    }
  }
  if (dataType(config.data) === 'Object' || dataType(config.data) === 'Array') {
    formatParams(config.data)
    if (config.data._skipLoading) {
      loading = false
    }
  }
  hasRequest++
  if (loading) {
    Loading.show()
  }

  if (config.url.startsWith('/register') ||
    config.url.startsWith('/login') ||
    config.url.startsWith('/logout') ||
    (config.url.startsWith('/user') && !config.url.startsWith('/user/client')) ||
    config.url.startsWith('/personal') ||
    config.url.startsWith('/oauth_login') ||
    config.url.startsWith('/blacklist') ||
    config.url.startsWith('/common_address') ||
    config.url.startsWith('/login_record') ||
    config.url.startsWith('/operator_message_log') ||
    config.url.startsWith('/need_verify')) {
    config.baseURL = '/um'
  } else if (config.url.startsWith('/bc')) {
    config.headers['App-UM-Partition'] = 'bc'
    config.baseURL = '/'
  } else if (config.url.startsWith('/if')) {
    config.baseURL = '/'
  } else if (config.url.startsWith('/qhc/') || config.url.startsWith('/whc_goods') || config.url.startsWith('/statistics')) {
    config.baseURL = '/'
  } else if (config.url.startsWith('/biz_class') || config.url.includes('/preset_attribute') || config.url.startsWith('/goods') || config.url.startsWith('/sku') || config.url.startsWith('/sku2') || config.url.startsWith('/route2') || (config.url.startsWith('/goods') && config.url.includes('/pending'))) {
    config.baseURL = '/whc_goods'
  } else if (config.url.startsWith('/if/sms_monitor/list')) {

  } else if (config.url === ('/order') || config.url === ('/mission') || config.url.startsWith('/per_minute_data_statistics2') || config.url.startsWith('/provider_capability2') || config.url.startsWith('/purchaser_capability2') || config.url.startsWith('/supply_capability2') ||
    config.url.startsWith('/provider_sales2') || config.url.startsWith('/purchaser_sales2') || config.url.startsWith('/supply_sales2') || config.url.startsWith('/provider_goods_details2') || config.url.startsWith('/purchaser_goods_details2') || config.url.startsWith('/supply_goods_details2') ||
    config.url === '/fund2' || config.url === '/cash_out2' || config.url.startsWith('/provider_details2') || config.url.startsWith('/purchaser_details2') || config.url.startsWith('/supply_details2') || config.url.includes('/fail_reason') || config.url.includes('/sign_list') || config.url.startsWith('/sign')) {
    config.baseURL = '/statistics'
  } else {
    config.baseURL = '/bc'
  }
  return config
})

// 返回状态判断(添加响应拦截器)
axios.interceptors.response.use(
  response => {
    hasRequest--
    setTimeout(() => {
      if (hasRequest <= 0) {
        $bus.$emit('request-end')
        Loading.hide()
      }
    }, 0)
    if (response.config.method !== 'get' && response.data.code === 0) {
      if (response.config.url.includes('/login')) {
        notify.success('登录成功')
      } else if (!((response.config.url.includes('/sku') && !response.config.url.includes('/route_unit')) ||
        (response.config.url.includes('/sku2') && !response.config.url.includes('/route_unit')) ||
        (response.config.url.includes('/route2') && !response.config.url.includes('/route_unit')) ||
        response.config.url.includes('/daily_new/dailyRevenue') ||
        response.config.url.includes('/certifying/query_result') ||
        response.config.url.includes('/daily_new/home') ||
        response.config.url.includes('/daily/history') ||
        response.config.url.includes('/order/pay_query') ||
        response.config.url.includes('/order/cancel_query') ||
        response.config.url.includes('/order/settle_query') ||
        response.config.url.includes('/fundRemit/list') ||
        response.config.url === '/client/adjustment' ||
        response.config.url.includes('/personal/check_permission') ||
        response.config.url.includes('/if/sms_monitor/list'))) {
        notify.success(response.data.msg)
      }
    }
    // TODO 使用结果码常量
    if (!response.data || (!response.data.code && response.data.code !== 0) || response.data.code !== 0 /* OK */) {
      throw new Error('Bad Response.')
    }
    return response
  },
  error => {
    hasRequest--
    if (hasRequest <= 0) {
      $bus.$emit('request-end')
      Loading.hide()
    }
    if (!(error.config.params && error.config.params.skipDefault)) {
      if (!error.response || !error.response.data || !error.response.data.code || !error.response.data.msg) {
        notify.error('连接错误')
      } else if (error.response.data.code === 10129 && error.response.config.url.includes('/login')) {
        notify.error(error.response.data.msg)
        return error.response
      } else if (error.response.data.code === 10111 /* Require Login */) {
        window.location.href = '/login'
        localStorage.setItem('sessionSecret', '')
      } else if ((error.response.request.responseURL.includes('/sku') || error.response.request.responseURL.includes('/sku2')) && !error.response.request.responseURL.includes('/route_unit')) {
        // 返回修改sku报错时的数据
        return error.response.data.code
      } else if (error.response.request.responseURL.includes('/route2')) {
        notify.error(error.response.data.msg)
        return error.response.data.code
      } else if (error.response.data.code === 10005 && error.response.config.url.includes('/add_sign')) {
        notify.error(error.response.data.msg)
        return error.response
      } else {
        notify.error(error.response.data.msg)
      }
    }
    throw error
  }
)

/**
 *  格式为 axios.$get
 */
methods.forEach(method => {
  axios['$' + method] = function (url, data, timeout = 30000) {
    axios.defaults.headers['Content-Type'] = 'application/json'
    let obj = {data}
    if (isParams.includes(method)) {
      obj = {params: data}
    } else if (method === 'put') {
      obj = data
    } else {
      obj = data
    }
    return new Promise((resolve, reject) => {
      axios.defaults.timeout = timeout
      axios[method](url, obj, {timeout})
        .then(res => {
          resolve(res.data)
        })
        .catch(err => {
          reject(err.data)
        })
    })
  }
})

/**
 *  格式为axios.$postForm
 */
formMethods.forEach(method => {
  axios['$' + method + 'Form'] = function (url, params, isArray, timeout = 30000) {
    axios.defaults.timeout = timeout
    axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    let data = null
    if (isArray) {
      data = qs.stringify(params, {arrayFormat: 'brackets'})
    } else {
      data = qs.stringify(params)
    }
    return new Promise((resolve, reject) => {
      axios[method](url, data, {timeout})
        .then(
          res => {
            resolve(res.data)
          },
          err => {
            reject(err)
          }
        )
        .catch(err => {
          reject(err)
        })
    })
  }
})

axios.$deleteData = function (url, data) {
  axios.defaults.headers['Content-Type'] = 'application/json'
  return new Promise((resolve, reject) => {
    axios.delete(url, {data})
      .then(
        res => {
          resolve(res.data)
        },
        err => {
          reject(err.data)
        }
      )
      .catch(err => {
        reject(err.data)
      })
  })
}

export default axios
