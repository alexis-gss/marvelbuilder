import Vue from 'vue'
import App from './App.vue'
import "@/assets/css/reboot.css"
import "@/assets/css/master.css"

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')