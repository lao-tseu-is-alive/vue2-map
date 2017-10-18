<template>
  <div id="app">
    <div class="gotitle">
      <router-link to="/">home</router-link>
      <router-link to="/test">test</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'app'
  }
</script>

<style lang="scss">
  html, body {
    margin: 0px;
    width: 100%;
    height: 100%;
  }

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
  .gotitle{
    width: 100%;
    height: 2em;
    color: #ffFFFF;
    text-align: center;
    vertical-align: center;
    background-color: #1a1a1a;
  }
</style>
