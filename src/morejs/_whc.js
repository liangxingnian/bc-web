export const _whc = {}

_whc.operator = [
  {
    value: 1,
    text: '移动'
  },
  {
    value: 2,
    text: '联通'
  },
  {
    value: 3,
    text: '电信'
  }
]

_whc.faceValue = [
  {
    value: 10,
    text: '10'
  },
  {
    value: 20,
    text: '20'
  },
  {
    value: 30,
    text: '30'
  },
  {
    value: 50,
    text: '50'
  },
  {
    value: 100,
    text: '100'
  },
  {
    value: 200,
    text: '200'
  },
  {
    value: 300,
    text: '300'
  },
  {
    value: 500,
    text: '500'
  },
  {
    value: -10,
    text: '任意'
  }
]

_whc.supplyType = [
  {
    value: 1,
    text: '供货产生货款'
  },
  {
    value: -1,
    text: '货款退款'
  },
  {
    value: -2,
    text: '技术服务费'
  },
  {
    value: -10,
    text: '货款提现'
  },
  {
    value: -20,
    text: '货款用于支付押金'
  }
]

_whc.capitalType = [
  {
    value: -1,
    text: '消费支付'
  },
  {
    value: 1,
    text: '消费退款'
  },
  {
    value: 4,
    text: '加款'
  },
  {
    value: -2,
    text: '退款（针对加款）'
  },
  {
    value: 10,
    text: '消费修正'
  },
  {
    value: -20,
    text: '加款修正'
  }
]

_whc.despoitType = [
  {
    value: 1,
    text: '支付宝缴纳'
  },
  {
    value: 2,
    text: '银行卡缴纳'
  },
  {
    value: 1003,
    text: '供货商余额用于押金'
  },
  {
    value: 1002,
    text: '管理员人工缴纳押金'
  }
]

_whc.Price = {
  UNKNOWN: -0x80000000,
  TEXT_UNKNOWN: '(Unknown)',

  parse: function (text) {
    if (text === '' || text == null) {
      return
    }
    if (_whc.Price.TEXT_UNKNOWN === text) {
      return _whc.Price.UNKNOWN
    }
    const isNegative = text.charAt(0) === '-'
    if (isNegative) {
      text = text.substr(1)
    }

    const values = text.split('.', -2)
    let price
    if (values.length === 1) {
      price = 10000 * values[0]

      return isNegative ? -price : price
    }
    if (values.length !== 2) {
      return _whc.Price.UNKNOWN
    }

    price = 10000 * values[0]
    const decimalLength = values[1].length
    let decimalPart = parseInt(values[1])
    for (let i = 0; i < 4 - decimalLength; i++) {
      decimalPart *= 10
    }
    while (decimalPart >= 100000) {
      decimalPart /= 10
    }

    if (decimalPart > 10000) {
      decimalPart += 5
      decimalPart /= 10
    }

    price += decimalPart

    return isNegative ? -price : price
  },

  toPriceString: function (price) {
    if (price === _whc.Price.UNKNOWN) {
      return '(Unknown)'
    }
    if (typeof (price) === 'number') {
      price = parseInt(price)

      const negative = price < 0
      if (negative) {
        price = -price
      }
      const part1 = Math.floor(price / 100).toString()
      let part2 = (price % 100).toString()

      while (part2.length < 2) {
        part2 = '0' + part2
      }
      return (negative ? '-' : '') + part1 + '.' + part2
    } else {
      return price
    }
  },

  toRateString: function (price) {
    if (typeof (price) === 'number') {
      price = parseInt(price)

      const part1 = Math.floor(price / 10000).toString()
      let part2 = Math.floor(price % 10000 / 100).toString()
      if (part2.length < 2) {
        part2 = '0' + part2
      }
      return part1 + '.' + part2
    }
  },

  calRate: function (selling, faceValue) {
    if (faceValue === -10) faceValue = 100
    return (selling / faceValue / 100).toFixed(2)
  },

  parseRate: function (text) {
    if (text === '' || text == null) {
      return
    }

    const values = text.split('.', -2)
    if (values.length === 1) {
      return 10000 * values[0]
    }
    if (values.length !== 2) {
      return
    }

    let rate = 10000 * values[0]
    const decimalLength = values[1].length
    let decimalPart = values[1]
    for (let i = 0; i < 4 - decimalLength; i++) {
      decimalPart *= 10
    }

    while (decimalPart >= 100000) {
      decimalPart /= 10
    }

    if (decimalPart > 10000) {
      decimalPart += 5
      decimalPart /= 10
    }

    rate += decimalPart

    return rate
  },

  computeRate: function (faceValue, price) {
    if (_whc.Price.UNKNOWN === price) {
      return ' - '
    }

    if (_whc.FaceValue.ANY === faceValue) {
      faceValue = 100
    }

    return Math.floor(price * 100 / faceValue)
  },

  computePrice: function (faceValue, rate) {
    if (_whc.FaceValue.ANY === faceValue) {
      faceValue = 100
    }

    return Math.floor(faceValue * 10000 * rate / 10000 / 100)
  }
}

_whc.Discount = {
  discountStr: function (price, faceValue) {
    return _whc.Price.computeRate(faceValue, price)
  }
}

_whc.Date = {

  /**
   * 解析一个 如 '2018-01-01' 或者 '2018-01-01 9:30:00' 这样的字符串到一个 {Date} 对象
   */
  parseDate: function (str) {
    if (typeof str === 'string') {
      var results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) *$/)
      if (results && results.length > 3) {
        return new Date(parseInt(results[1]),
          parseInt(results[2]) - 1,
          parseInt(results[3]))
      }
      results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/)
      if (results && results.length > 6) {
        return new Date(parseInt(results[1]),
          parseInt(results[2]) - 1,
          parseInt(results[3]),
          parseInt(results[4]),
          parseInt(results[5]),
          parseInt(results[6]))
      }
      results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2})\.(\d{1,9}) *$/)
      if (results && results.length > 7) {
        return new Date(parseInt(results[1]),
          parseInt(results[2]) - 1,
          parseInt(results[3]),
          parseInt(results[4]),
          parseInt(results[5]),
          parseInt(results[6]),
          parseInt(results[7]))
      }
    }

    return null
  },

  /**
   * 格式化时间.
   *
   * @param date {Date} Date 对象
   * @param fmt {string} 格式
   * @returns {string}
   */
  format: function (date, fmt) {
    if (typeof (date) === 'string' || typeof (date) === 'number') {
      date = new Date(date)
    }
    const o = {
      'M+': date.getMonth() + 1, // 月
      'd+': date.getDate(), // 日
      'h+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      S: date.getMilliseconds()
    }

    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    for (const k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      }
    }

    return fmt
  },

  /**
   * 格式化日期时间
   *
   * @param date {Date}
   * @returns {string}
   */
  formatDateTime: function (date, format) {
    date = parseDate(date)
    if (format === 'day') {
      return _whc.Date.format(date, 'yyyy-MM-dd')
    } else {
      return _whc.Date.format(date, 'yyyy-MM-dd hh:mm:ss')
    }
  },

  /**
   * 格式化日期
   *
   * @param date {Date}
   * @returns {string}
   */
  formatDate: function (date) {
    date = parseDate(date)
    return _whc.Date.format(date, 'yyyy-MM-dd')
  },

  /**
   * 格式化日期
   *
   * @param date {Date}
   * @returns {string}
   */
  formatYearMonth: function (date) {
    date = parseDate(date)
    return _whc.Date.format(date, 'yyyy-MM')
  },

  /**
   * 返回 daysPass 日后的日期的格式化后的字符串
   *
   * @param daysPass {int} 日数偏移量，为负数时表示过去的日期
   * @returns {string}
   */
  daysPassString: function (daysPass) {
    var date = new Date()
    date.setTime(date.getTime() + daysPass * 24 * 60 * 60 * 1000)
    return _whc.Date.formatDate(date)
  },

  /**
   * 返回今天日期的格式化后的字符串
   *
   * @returns {string}
   */
  todayString: function () {
    return _whc.Date.daysPassString(0)
  },

  diffDays: function (toDate, fromDate) {
    toDate = parseDate(toDate)
    fromDate = parseDate(fromDate)
    return Math.abs((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24))
  }
}

_whc.BatchFileState = {
  format: function (state) {
    switch (state) {
      case 0:
        return '初始化'
      case 1:
        return '分析中'
      case 2:
        return '准备中'
      case 3:
        return '<span style="color:green">处理中</span>'
      case 4:
        return '<span style="color: #ABBA0F">下单完成</span>'
      case 10:
        return '<span style="color:#4D4D4D">充值完成</span>'
      default:
        return '<span style="color: red">分析失败</span>'
    }
  }
}

_whc.Operator = {
  UNKNOWN: -1,
  ALL: 0,
  CHINA_MOBILE: 1,
  CHINA_UNICOM: 2,
  CHINA_TELECOM: 3,

  format: function (operator) {
    switch (operator) {
      case _whc.Operator.UNKNOWN :
        return '(未知)'
      case _whc.Operator.ALL :
        return '三网'
      case _whc.Operator.CHINA_MOBILE :
        return '移动'
      case _whc.Operator.CHINA_UNICOM :
        return '联通'
      case _whc.Operator.CHINA_TELECOM :
        return '电信'
      default :
        return '*'
    }
  }
}

_whc.Order = {
  STATE_INIT: 0,
  STATE_REVOKED: -2,
  STATE_PAID: 1,
  STATE_COMPLETED: 10,
  STATE_DRAWN_BACK: -1,

  formatState: function (state, isSuspected, view) {
    let stateText = ''
    switch (state) {
      case _whc.Order.STATE_INIT :
        if (view) stateText = '<i class="fas fa-circle" style="color: grey" title="该订单未完成"></i>'
        stateText += '<span style=\'\'>初始化</span>'
        break

      case _whc.Order.STATE_REVOKED:
        // 已撤销
        if (view) stateText = '<i class="fas fa-times-circle" style="color: grey" title="该订单已有明确结果"></i> '
        stateText += '<span style=\'color: #FF5900\'>下单失败</span>'
        break

      case _whc.Order.STATE_PAID:
        // 已付款
        if (view) stateText = '<i class="fas fa-sync-alt" style="color: grey" title="该订单未完成"></i> '
        stateText += '<span style=\'color: green\'>充值中</span>'
        break

      case _whc.Order.STATE_COMPLETED:
        // 已完成
        if (view) stateText = '<i class="fas fa-check-circle" style="color: grey" title="该订单已有明确结果"></i> '
        stateText += '<span style=\'color: #4D4D4D\'>缴费成功</span>'
        break

      case _whc.Order.STATE_DRAWN_BACK:
        // 已退款
        if (view) stateText = '<i class="fas fa-times-circle" style="color: grey" title="该订单已有明确结果"></i> '
        stateText += '<span style=\'color: blue\'>充值失败</span>'
        break

      default:
        if (view) stateText = '<i class="fas fa-question-circle" style="color: grey"></i> '
        stateText += '<span style=\'color: #FFA473\'>未知状态</span>'
        break
    }
    if (isSuspected) {
      stateText += '<span style=\'color: #EC0033\'>(可疑)</span>'
    }
    return stateText
  }
}

_whc.Capital = {
  TYPE_RECHARGE: -1,
  TYPE_FEEDRAW_BACK: 1,
  TYPE_INCERESE_PAY: 4,
  TYPE_DRAW_BACK: -2,
  TYPE_FUND: -10,
  TYPE_REFUND: -20,

  formatType: function (type) {
    switch (type) {
      case _whc.Capital.TYPE_RECHARGE:
        return '<span style=\'color: red\'>消费支付</span>'

      case _whc.Capital.TYPE_FEEDRAW_BACK:
        return '<span style=\'color: #cd006b\'>消费退款</span>'

      case _whc.Capital.TYPE_INCERESE_PAY:
        return '<span style=\'color: #66cd15\'>加款</span>'

      case _whc.Capital.TYPE_DRAW_BACK:
        return '<span style=\'color: #cdba00\'>退款（针对加款）</span>'

      case _whc.Capital.TYPE_FUND:
        return '<span style=\'color: #1C86EE\'>消费修正</span>'

      case _whc.Capital.TYPE_REFUND:
        return '<span style=\'color: #008B8B\'>加款修正</span>'
      default:
        return '未知类型'
    }
  }
}

_whc.depositCapital = {
  TYPE_ALIPAY: 1,
  TYPE_CREDITCARD: 2,
  TYPE_ARTIFICIAL: 1002,
  TYPE_BALANCE: 1003,

  formatType: function (type) {
    switch (type) {
      case _whc.depositCapital.TYPE_ALIPAY:
        return '<span style=\'color: red\'>支付宝缴纳</span>'

      case _whc.depositCapital.TYPE_CREDITCARD:
        return '<span style=\'color: #9BCD9B\'>银行卡缴纳</span>'

      case _whc.depositCapital.TYPE_BALANCE:
        return '<span style=\'color: #1C86EE\'>供货商余额用于缴纳押金</span>'

      case _whc.depositCapital.TYPE_ARTIFICIAL:
        return '<span style=\'color: #008B8B\'>管理员人工缴纳押金</span>'
      default:
        return '未知类型'
    }
  }
}

_whc.supplyCapital = {
  TYPE_RECHARGE: -1,
  TYPE_DRAW_BACK: 1,
  TYPE_TECH_FEERATE: -2,
  TYPE_FUND: -10,
  TYPE_REFUND: -20,

  formatType: function (type) {
    switch (type) {
      case _whc.supplyCapital.TYPE_RECHARGE:
        return '<span style=\'color: red\'>供货产生货款</span>'

      case _whc.supplyCapital.TYPE_DRAW_BACK:
        return '<span style=\'color: #cd16a2\'>货款退款</span>'

      case _whc.supplyCapital.TYPE_TECH_FEERATE:
        return '<span style=\'color: #ff9900\'>技术服务费</span>'

      case _whc.supplyCapital.TYPE_FUND:
        return '<span style=\'color: #1C86EE\'>货款提现</span>'

      case _whc.supplyCapital.TYPE_REFUND:
        return '<span style=\'color: #248b74\'>货款用于支付押金</span>'
      default:
        return '未知类型'
    }
  }
}

_whc.BankAccount = {
  format: function (fundTargetAccount) {
    return fundTargetAccount.bankName + ' ' + fundTargetAccount.account + ' ' + fundTargetAccount.owner
  }
}

_whc.FundDemand = {
  formatState: function (state) {
    if (state === 0) {
      return '<span style=\'color: green\'>处理中</span>'
    } else if (state === 1) {
      return '<span style=\'color: #4D4D4D\'>成功</span>'
    } else {
      return '<span style=\'color: blue\'>失败</span>'
    }
  }
}

_whc.Sms = {
  formatParseOutType: function (type) {
    if (type === 0) {
      return '<span style=\'color: blue\'>没有解析结果</span>'
    } else if (type === 1) {
      return '<span style=\'color: green\'>加款汇款</span>'
    }
  }
}

_whc.FundRemit = {
  formatState: function (state) {
    if (state) {
      return '<span style=\'color: green\'>已使用</span>'
    } else {
      return '<span style=\'color: #4D4D4D\'>未使用</span>'
    }
  }
}

_whc.FaceValue = {
  ANY: -10,
  NOT: -1,

  format: function (faceValue) {
    if (_whc.FaceValue.ANY === faceValue) {
      return '任意'
    }

    if (_whc.FaceValue.NOT === faceValue) {
      return '不支持'
    }

    if (!faceValue) return '*'

    return faceValue.toString()
  }
}

_whc.CostPrice = {
  DYNAMIC: -0x80000000,

  format: function (price) {
    if (_whc.CostPrice.DYNAMIC === price) {
      return '(不固定)'
    }

    return _whc.Price.toPriceString(price)
  }
}

/**
 * 倒计时
 * @param expired 过期时间戳
 */
_whc.formatCountdown = function (expired) {
  expired = parseInt(expired / 1000)
  const nowDate = parseInt(new Date().getTime() / 1000)
  let diff = expired - nowDate
  if (diff <= 0) {
    return '已超时'
  }
  if (diff / 60 > 1) {
    diff += 60
    const hours = parseInt((diff % (60 * 60 * 24)) / (60 * 60))
    const minutes = parseInt((diff % (60 * 60)) / 60)
    return add0(hours) + '小时  ' + add0(minutes) + '分'
  } else {
    return diff + '秒'
  }
}

function add0 (num) {
  if (Number(num) < 10) {
    return '0' + num
  } else {
    return num
  }
}

export function parseDate (input) {
  if (!Number.isNaN(Number(new Date(input)))) return input
  if (Object.prototype.toString.call(input) === '[object Date]') {
    return input
  }
  const format = 'yyyy-mm-dd HH:MM:ss' // default format
  var parts = input.match(/(\d+)/g),
    i = 0,
    fmt = {}
  format.replace(/(yyyy|dd|mm|HH|MM|ss)/g, function (part) {
    fmt[part] = i++
  })
  const d = new Date(parts[fmt.yyyy], Number(parts[fmt.mm]) - 1, parts[fmt.dd], Number(parts[fmt.HH]) + 8, parts[fmt.MM], parts[fmt.ss])
  return d
}
