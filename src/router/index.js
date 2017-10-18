import Vue from 'vue'
import Router from 'vue-router'
import Vue2Map from '@/components/vue2MapOlSwiss21781'
import testVue2Map from '@/components/testvue2MapOlSwiss21781'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Map',
      component: Vue2Map
    },
    {
      path: '/test',
      name: 'testMap',
      component: testVue2Map
    }
  ]
})
