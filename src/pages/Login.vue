<template>
  <login-form style="margin: 12rem auto"></login-form>
</template>

<script>
import LoginForm from '../components/WLoginForm'

export default {
  name: 'login',
  components: {
    LoginForm
  },
  mounted () {
    document.body.style.backgroundColor = '#2db7f5'
  }
}
</script>

<style scoped>
</style>
