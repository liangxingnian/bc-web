/**
 * 用户标识有效性验证. 用户名由5-24个字母, 数字, _或-组成, 不能只包含数字
 *
 * @param identifier [string] 用户标识
 *
 * @returns {boolean} 略
 */
function identifierValidation (identifier) {
  if (identifier.length < 5 || identifier.length > 24) {
    return false
  }

  let notNumeric = false

  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charAt(i)
    const isNumeric = char >= '0' && char <= '9'

    if (!isNumeric) {
      notNumeric = true
    }

    if (char !== '_' && char !== '-' && !isNumeric && (char < 'A' || char > 'z')) {
      return false
    }
  }

  return notNumeric
}

/**
 * 密码有效性验证. 密码由6-48个字符组成
 *
 * @param password [string] 密码
 * @returns {boolean} 略
 */
function passwordValidation (password) {
  return password.length >= 6 && password.length <= 48
}

function phoneValidation (phone) {
  return /^(^1[3-9]\d{9}$)|(^09\d{8}$)$/.test(phone)
}

function qqValidation (qq) {
  return /^[1-9][0-9]{4,12}$/.test(qq)
}

export default {
  identifierValidation,
  passwordValidation,
  phoneValidation,
  qqValidation
}
