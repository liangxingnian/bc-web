import modal from 'components/WModal'

const Modal = {
  install: function (Vue) {
    Vue.component('WModal', modal)
  }
}

export default Modal
