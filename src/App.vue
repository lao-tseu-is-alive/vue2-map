<template>
  <div id="app">
    <div class="gotitle">
      <router-link to="/">
        <el-button type="info" size="mini" round icon="el-icon-picture">Home</el-button>
      </router-link>
      <router-link to="/test">
        <el-button type="info" size="mini" round icon="el-icon-home">Testing</el-button>
      </router-link>
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
    // height: 2em;
    color: #ffFFFF;
    text-align: center;
    vertical-align: center;
    background-color: #1a1a1a;
  }
</style>
