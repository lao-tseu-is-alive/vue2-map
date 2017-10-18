<style lang="scss">
  .container{
    display: block;
    width: 100%;
    background-color: #1b6d85;
    text-align: center;
  }

  .mymaps{
    margin: 10px;
    padding: 10px;
    float: left;
    width: 45%;
    height: 550px;
    border: 1px solid black;
  }
</style>

<template>
  <div>
  <h1>{{msg}}</h1>
  <div class="container">
    <div class="mymaps">
      <vue2-map-ol-swiss21781></vue2-map-ol-swiss21781>
    </div>
    <div class="mymaps">
      <vue2-map-ol-swiss21781></vue2-map-ol-swiss21781>
    </div>
  </div>
  </div>
</template>

<script>
  import vue2MapOlSwiss21781 from './vue2MapOlSwiss21781'
  export default {
    name: 'testvue2MapOlSwiss21781',
    components: {vue2MapOlSwiss21781},
    data () {
      return {
        msg: 'Testing 2 vue2MapOlSwiss21781 Maps side by side'
      }
    }
  }
</script>

