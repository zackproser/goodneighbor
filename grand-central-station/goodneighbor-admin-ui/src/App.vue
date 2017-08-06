<template>
  <div id="app" class="container">
    <router-view></router-view>
  </div>
</template>

<script>

import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'bootstrap-vue/dist/bootstrap-vue.js'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'

// globally (in your main .js file)
Vue.component('icon', Icon)

Vue.use(BootstrapVue)

// globally (in your main .js file)
Vue.component('icon', Icon)

Vue.component('list-item', {
  template: `<b-button size="sm" class="btn-primary" v-on:click="$emit('remove')">x {{ item }}</b-button>`,
  props: ['item']
})

Vue.component('avatar', {
  template: `
    <div class="row">
      <div class="col"><a style="color:blue" class="avatar-link" v-on:click="$emit('edit')">{{ name }}</a></div>
      <div class="col"><input type="checkbox" v-on:change="$emit('toggle')" v-bind.checked="{checked: running}">&nbsp; Activated</div>
      <div class="col">
        <span v-if="living">
          <icon label="status" spin>
            <icon color="green" name="cog" scale="4"></icon>
            <icon color="blue" name="twitter" scale="2"></icon>
          </icon>
          Running
        </span>
        <span v-if="!living">
          <icon label="status">
            <icon color="orange" name="cog" spin scale="4"></icon>
            <icon name="twitter" scale="2"></icon>
          </icon>
          Paused
        </span>
      </div>
    </div>
  `,
  props: [
    'name',
    'living',
    'running'
  ]
})

export default {
  name: 'app',
  data () {
    return {
    }
  }
}
</script>

<style>
body {
  background-color: #000 !important;
}
h1 {
  color: #ADD8E6 !important;
}
</style>
