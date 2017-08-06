import Vue from 'vue'
import Router from 'vue-router'
import Hivemind from '@/components/Hivemind'
import Avatars from '@/components/Avatars'
import Avatar from '@/components/Avatar'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hivemind',
      component: Hivemind
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: Avatars
    },
    {
      name: 'Avatar',
      path: '/avatar/:name',
      component: Avatar
    }
  ]
})
