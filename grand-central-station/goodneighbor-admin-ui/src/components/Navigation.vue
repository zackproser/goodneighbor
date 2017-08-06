<template>
  <div>
    <ul class="nav">
      <li class="nav-item">
        <router-link to="/" class="nav-link"><icon name="train"></icon> Grand Central Station</router-link>
      </li>
      <li class="nav-item">
          <router-link to="/" class="nav-link"><icon name="database"></icon> Hivemind</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/avatars" class="nav-link"><icon name="twitter"></icon> Avatars</router-link>
      </li>
      <li class="nav-item">
        <a href="#"><icon name="plus"></icon><icon name="twitter"></icon> Create New Avatar</a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Navigation',

  data () {
    return {
    }
  },

  mounted () {

  },

  methods: {
  }

}
</script>

<style scoped="true">

</style>
