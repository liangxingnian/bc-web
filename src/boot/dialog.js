import { Dialog } from 'quasar'
import Vue from 'vue'

function dialog ({ title = '系统提示', message, hideCancel, ok, cancel, okLabel = '确定', cancelLabel = '取消' }) {
  const config = {
    title,
    message,
    html: true,
    persistent: true,
    ok: {
      push: true,
      label: okLabel
    }
  }
  if (!hideCancel) {
    Object.assign(config, {
      cancel: {
        push: true,
        color: 'negative',
        label: cancelLabel
      }
    })
  }

  Dialog.create(config)
    .onOk(() => {
      if (ok) ok()
    })
    .onCancel(() => {
      if (cancel) cancel()
    })
}

Vue.prototype.$dialog = dialog
