import { Notify } from 'quasar'

function createNotify (message, color, icon) {
  return Notify.create({
    message: `<span style="display: inline-block;min-width: 12em;">${message}</span>`,
    color,
    icon,
    position: 'top',
    html: true
  })
}

export default {
  success: (message) => {
    createNotify(message, 'positive', 'fas fa-check-circle')
  },

  warning: (message) => {
    createNotify(message, 'warning', 'fas fa-exclamation-circle')
  },

  error: (message) => {
    createNotify(message, 'negative', 'fas fa-times-circle')
  },

  info: (message) => {
    createNotify(message, 'info', 'fas fa-info-circle')
  }
}
