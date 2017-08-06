<template>
  <div><!--root-->
    <navigation></navigation>
    <div class="text-center main-intro">

    <h1><icon name="database" scale="2"></icon> Hivemind Interface</h1>

    <!--Accordion Interface-->
    <div id="accordion">
      <div class="card" v-for="section in sectionsToRender">
        <div class="card-header">
          <h4 class="section-name">{{ section.name }}</h4>
        </div>
        <div class="card-block">
          <input
            class="form-control"
            v-model="newItemValue"
            v-on:keyup.enter="handleAdd(section.name)"
            placeholder="Add new"
          >
          <br>
          <div class="col">
            <b-button
              is="list-item"
              v-for="(item, index) in section.data"
              v-bind:key="item.index"
              v-bind:item.type="section"
              v-bind:item="item"
              v-on:remove="handleRemove(item, section.name)">
            </b-button>
          </div>
        </div>
      </div>
    </div>
  </div><!--/main-intro-->
</div><!--/root-->
</template>

<script>

import Navigation from './Navigation'
import REST from '@/services/RESTService'

export default {
  name: 'Hivemind',
  mounted () {
    this.getHivemind()
  },
  data () {
    return {
      sectionsToRender: null,
      newItemValue: ''
    }
  },
  methods: {
    getHivemind () {
      REST.api('GET', '/hivemind', {}, (err, resp) => {
        if (err) {
          console.error(err)
        }
        if (resp.statusCode === 200) {
          this.sectionsToRender = resp.body
        }
      })
      this.newItemValue = ''
    },
    handleAdd (section) {
      REST.api('POST', '/hivemind/item', { type: section, data: this.newItemValue }, (err, resp) => {
        if (err) {
          console.error(err)
        }
        this.getHivemind()
      })
    },
    handleRemove (value, section) {
      REST.api('DELETE', '/hivemind/item', { type: section, data: value }, (err, resp) => {
        if (err) {
          console.error(err)
        }
        this.getHivemind()
      })
    }
  },
  components: {
    Navigation
  }
}
</script>
<style scoped>
  .section-name {
    color: #000;
  }
  .main-intro {
    margin-top: 5%;
  }
  .btn.btn-primary {
    margin: 5px;
  }
</style>
