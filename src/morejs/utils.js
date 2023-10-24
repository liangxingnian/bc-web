import { parseDate } from 'src/morejs/_whc'

export const dataType = (data) => {
  return Object.prototype.toString.call(data).slice(8, -1)
}

export const formatParams = (params) => {
  if (dataType(params) === 'Array') {
    formatArray(params)
  } else if (dataType(params) === 'Object') {
    formatObject(params)
  }
}
function formatArray (array) {
  for (let i = 0; i < array.length; i++) {
    if (dataType(array[i]) === 'Array') {
      formatArray(array[i])
    } else if (dataType(array[i]) === 'Object') {
      formatObject(array[i])
    } else if (dataType(array[i]) === 'String') {
      array[i] = array[i].trim()
      if (!array[i]) array.splice(i, 1)
    }
  }
}
function formatObject (object) {
  for (const key in object) {
    if (object[key] === null || object[key] === undefined || object[key] === '') {
      delete object[key]
    }
    if (dataType(object[key]) === 'Array') {
      formatArray(object[key])
    } else if (dataType(object[key]) === 'Object') {
      formatObject(object[key])
    } else if (dataType(object[key]) === 'String') {
      object[key] = object[key].trim()
      if (!object[key]) delete object[key]
    }
  }
}
export function strToObj (data) {
  let isString = false
  let temp
  try {
    temp = JSON.parse(data)
  } catch (e) {
    isString = true
  }
  if (isString) {
    data = trimStrParams(data)
  } else {
    data = temp
  }
  return data
}
export function trimStrParams (str) {
  str = str.replace(/%20/g, '')
  const arr = str.split('&')
  let temp = ''
  for (const item of arr) {
    const results = item.split('=')
    if (dataType(results[1]) === 'String') {
      results[1] = results[1].trim()
    }
    if (results[1]) {
      if (temp) temp += '&'
      temp += `${results[0]}=${results[1]}`
    }
  }
  return temp
}
export const isMillisecond = (timeStamp) => {
  const timeStr = String(timeStamp)
  return timeStr.length > 10
}
export const getHandledValue = (num) => {
  return num < 10 ? '0' + num : num
}
export const getDateTime = (timeStamp, startType) => {
  let d
  if (!isMillisecond(timeStamp)) {
    d = new Date(timeStamp * 1000)
  } else {
    d = new Date(timeStamp)
  }

  const year = d.getFullYear()
  const month = getHandledValue(d.getMonth() + 1)
  const date = getHandledValue(d.getDate())
  const hours = getHandledValue(d.getHours())
  const minutes = getHandledValue(d.getMinutes())
  const second = getHandledValue(d.getSeconds())
  let resStr = ''
  if (startType === 'year') {
    resStr = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + second
  } else if (startType === 'day') {
    resStr = year + '-' + month + '-' + date
  } else {
    resStr = month + '-' + date + ' ' + hours + ':' + minutes
  }
  return resStr
}
export const getCurrentDateTime = (timeStamp, unit, type = 'year') => {
  unit = unit || '-'
  let yesday = new Date(timeStamp)
  yesday = getDateTime(timeStamp, type)
  return yesday
}

export const getCurrentDate = (timeStamp, unit, isHms, isStart, isEnd) => {
  unit = unit || '-'
  const date = new Date(parseDate(timeStamp))
  let value = ''
  value = date.getFullYear() + unit + add0((date.getMonth() + 1)) + unit + add0(date.getDate())
  if (isHms) {
    value += ' ' + add0(date.getHours()) + ':' + add0(date.getMinutes() + ':' + add0(date.getSeconds()))
  } else if (isStart) {
    value += ' 00:00:00'
  } else if (isEnd) {
    value += ' 23:59:59'
  }
  return value
}

function add0 (num) {
  if (num < 10) {
    return '0' + num
  }
  return num + ''
}

export const formatBool = (bool, text1, text2) => {
  return bool ? `<span style="color:#19be6b">${text1}</span>` : `<span style="color:#ed4014">${text2}</span>`
}

export const parseParams = (params) => {
  let param = ''
  for (const key in params) {
    if (!(params[key] === '' || params[key] === null || params[key] === undefined)) {
      if (!param) {
        param = `${key}=${params[key]}`
      } else {
        param += `&${key}=${params[key]}`
      }
    }
  }
  return param
}

/**
 * 保留小数, 不做四舍五入
 * @param num
 * @param decimal 小数位数
 * @returns {string}
 */
export function formatDecimal (num, decimal) {
  num = num.toString()
  const index = num.indexOf('.')
  if (index !== -1) {
    num = num.substring(0, decimal + index + 1)
  } else {
    num = num.substring(0)
  }
  return Number(num).toFixed(decimal)
}

/**
 * @param state 任务状态
 * @param type  发货类型
 * @param constant 常量定义
 * @param topState 顶层任务状态
 */
export function formatMissionState (state, type, constant, topState) {
  let text = '未知'
  let color = 'gray'
  if (topState === 9 && state === -1) return '<span style="color:#00CED1">待分流</span>'
  for (const key in constant) {
    if (constant[key + ''].value === state) {
      if (constant[key + ''].more) {
        text = constant[key + ''].desc[type]
      } else {
        text = constant[key + ''].desc
      }
      color = constant[key + ''].color
      break
    }
  }
  return `<span style="color:${color}">${text}</span>`
}

/**
 * @param {String|Number} value 要验证的字符串或数值
 * @param {*} validList 用来验证的列表
 */
export function oneOf (value, validList) {
  for (let i = 0; i < validList.length; i++) {
    if (value === validList[i]) {
      return true
    }
  }
  return false
}

export function toChinesNum (n) {
  const fraction = ['角', '分']
  const digit = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const unit = [['元', '万', '亿'], ['', '十', '百', '千']]
  const head = n < 0 ? '负' : ''
  n = Math.abs(n)
  let s = ''
  for (let i = 0; i < fraction.length; i++) {
    s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '')
  }
  s = s || '整'
  n = Math.floor(n)
  for (let i = 0; i < unit[0].length && n > 0; i++) {
    let p = ''
    for (let j = 0; j < unit[1].length && n > 0; j++) {
      p = digit[n % 10] + unit[1][j] + p
      n = Math.floor(n / 10)
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s
  }
  return head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整')
}

export const testMixFormat = (value) => {
  if (value === '' || value === null || !value) {
    return true
  } else {
    const str = /^[A-Za-z0-9]+$/
    return str.test(value)
  }
}

export const testNumberFormat = (value) => {
  if (value === '' || value === null || !value) {
    return true
  } else {
    const str = /^[0-9]\d*$/
    return str.test(value)
  }
}

export const testFloatNumberFormat = (value, bit = 2) => {
  if (value === '' || value === null || !value) {
    return true
  } else {
    const str = `^[0-9]+(.[0-9]{1,${bit}})?$`
    return new RegExp(str).test(value)
  }
}

export const timeFormat = (value) => {
  if (value === '' || value === null || !value) {
    return true
  } else {
    // eslint-disable-next-line no-useless-escape
    const str = /^(([0-9]+[\.]?[0-9]{ 1,1 })|[1-9])$/ // /^[1-9]+(.[0-9]{1,1})?$/
    return str.test(value)
  }
}

export function modifyData (oldData, newData) {
  if (!oldData) {
    return newData
  }
  for (const oKey in oldData) {
    for (const nKey in newData) {
      if (oKey === nKey) {
        if (typeof newData[oKey] !== 'object') {
          if (oldData[oKey] !== newData[nKey]) {
            newData.modifyState = 1
          } else {
            newData.modifyState = oldData.modifyState
          }
        }
        if (typeof newData[oKey] === 'object') {
          modifyData(oldData[oKey], newData[nKey])
        }
      }
    }
  }
  return newData
}

export function opposite (str) {
  return (Number(str) * -1).toFixed(2)
}
export function fixedNumber (str) {
  return Number(str).toFixed(2)
}

export function phoneValidation (phone) {
  return /^(^1[3-9]\d{9}$)|(^09\d{8}$)$/.test(phone)
}

export function qqValidation (qq) {
  return /^[1-9][0-9]{4,12}$/.test(qq)
}

/* 信用代码 */
export function creditCodeValidation (val) {
  return /[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/.test(val)
}
/* 联行号 */
export function bankNumberValidation (val) {
  return /^([1-9])(\d{11})$/.test(val)
}
/* 银行账号 */
export function bankAccountValidation (val) {
  return /^([0-9]\d)/.test(val)
}
