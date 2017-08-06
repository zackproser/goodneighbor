<template>
  <div>
    <navigation></navigation>
    <div class="text-center main-intro jumbotron">

    <h1><icon name="twitter" scale="2"></icon> Avatars</h1>

    <!--Accordion Interface-->
    <div id="accordion">
      <div class="card" v-for="avatar in avatars">
        <div class="card-block">
          <div
            is="avatar"
            v-bind:key="avatar.index"
            v-bind:name="avatar.name"
            v-bind:running="avatar.running"
            v-bind:living="avatar.living"
            v-on:toggle="toggleRunningStatus(avatar)"
            v-on:edit="editAvatar(avatar)"
          >
        </div>
      </div>
    </div>
  </div><!--/main-intro-->
</div>
</div>
</template>

<script>

import Navigation from './Navigation'
import REST from '@/services/RESTService'

export default {
  name: 'Avatars',
  mounted () {
    this.getAvatars()
  },
  data () {
    return {
      avatars: [],
      newAvatarValue: '',
      localRunning: null
    }
  },
  methods: {
    getAvatars () {
      REST.api('GET', '/avatars', {}, (err, resp) => {
        if (err) {
          console.error(err)
        }
        if (resp.statusCode === 200) {
          this.avatars = resp.body
        }
      })
      this.newAvatarValue = ''
    },
    toggleRunningStatus (modified) {
      let modify = this.avatars.filter((avatar) => { return avatar.name === modified.name }).pop()
      REST.api('POST', '/avatars/control', { avatar: modify.name, command: !modify.running }, (err, resp) => {
        if (err) {
          console.error(err)
        }
        this.getAvatars()
      })
    },
    editAvatar (avatar) {
      this.$router.push({ name: 'Avatar', params: { name: avatar.name } })
    }
  },
  components: {
    Navigation
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .main-intro {
    margin-top: 5%
  }
  a.avatar-link {
    color: blue;
  }
</style>
