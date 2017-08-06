<template>
  <div>
    <navigation></navigation>
    <div class="text-center main-into jumbotron">

    <h1><icon name="cubes" scale="4"></icon> Avatar: {{this.$route.params.name}} </h1>

    <!--Accordion Interface-->
    <div id="accordion">
      <div class="card" v-for="(section, sectionKey) in this.config">
        <div class="card-header">
          {{sectionKey}}
        </div>
        <div class="card-block">
          <div v-for="(data, fieldname) in section">
            <div class="form-group">
              <label>{{ fieldname }}</label>
              <input class="form-control" data-type="string" :data-section="sectionKey" :data-fieldname="fieldname"  v-on:change="updateConfig" v-if="typeof data === 'string'" :value="data">
              <div class="col" v-if="typeof data === 'object' && sectionKey !== 'timers'">
                <label>Add new</label>
                <input class="form-control" :data-section="sectionKey" :data-fieldname="fieldname" v-on:keyup.enter="addListItem" />
                <b-button
                  is="list-item"
                  v-for="(item, index) in data"
                  v-bind:key="item.index"
                  v-bind:item.type="section"
                  v-bind:item="item"
                  v-on:remove="handleRemove(sectionKey, fieldname, item)">
                </b-button>
              </div>
              <div v-if="sectionKey == 'timers'">
                <div class="form-inline timer">
                  <label>Min</label>
                  <input class="form-control" data-type="min" :data-section="sectionKey" :data-fieldname="fieldname" v-on:change="updateTimer" :value="data.min">
                  <label>Max</label>
                  <input class="form-control" data-type="max" :data-section="sectionKey" :data-fieldname="fieldname" v-on:change="updateTimer" :value="data.max">
                </div>
              </div>
            </div>
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
  name: 'Avatar',
  mounted () {
    this.getAvatar()
  },
  data () {
    return {
      avatar: null,
      config: null
    }
  },
  methods: {
    getAvatar () {
      REST.api('GET', `/avatars/config/${this.$route.params.name}`, {}, (err, resp) => {
        if (err) {
          console.error(err)
        }
        if (resp.statusCode === 200 && typeof resp.body[0].config !== 'undefined') {
          this.config = resp.body[0].config
        }
      })
    },
    getItemData (e) {
      return { section: e.srcElement.dataset.section, fieldname: e.srcElement.dataset.fieldname, value: e.srcElement.value }
    },
    updateConfig (e) {
      let type = e.srcElement.dataset.type
      let base = '/avatars/config/'
      let uri = null
      switch (type) {
        case 'string':
          uri = `${base}${this.$route.params.name}/string`
          break
        default:
          break
      }
      console.dir(uri)
      REST.api('PUT', uri, this.getItemData(e), (err, resp) => {
        if (err) {
          console.error(`Error updating field: ${err}`)
        }
        console.dir(resp)
        this.getAvatar()
      })
    },
    updateTimer (e) {
      let uri = `/avatars/config/${this.$route.params.name}/timer`
      console.dir({ section: e.srcElement.dataset.section, timername: e.srcElement.dataset.fieldname, timertype: e.srcElement.dataset.type, value: e.srcElement.value })
      REST.api('PUT', uri, { timername: e.srcElement.dataset.fieldname, timertype: e.srcElement.dataset.type, value: e.srcElement.value }, (err, resp) => {
        if (err) {
          console.error(`Error updating timer: ${err}`)
        }
        console.dir(resp)
      })
    },
    handleAdd (section) {
      REST.api('POST', '/hivemind/item', { type: section, data: this.newItemValue }, (err, resp) => {
        if (err) {
          console.error(err)
        }
        this.getAvatar()
      })
    },
    handleRemove (sectionKey, fieldname, value) {
      REST.api('DELETE', `/avatars/config/${this.$route.params.name}/list/item`, { section: sectionKey, fieldname: fieldname, value }, (err, resp) => {
        if (err) {
          console.error(err)
        }
        this.getAvatar()
      })
    },
    addListItem (e) {
      REST.api('POST', `/avatars/config/${this.$route.params.name}/list/item`, this.getItemData(e), (err, resp) => {
        if (err) {
          console.error(err)
        }
        this.clearInputs()
        this.getAvatar()
      })
    },
    clearInputs () {
      let inputs = document.getElementsByTagName('input')
      for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = ''
      }
    }
  },
  components: {
    Navigation
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .main-into {
    margin-top: 5%;
  }
  .label, .form-control {
    margin-top: 2px;
  }
  button {
    margin: 5px;
  }
  .form-inline.timer > .form-control {
    margin-left: 5%;
    margin-right: 5%;
  }
</style>
