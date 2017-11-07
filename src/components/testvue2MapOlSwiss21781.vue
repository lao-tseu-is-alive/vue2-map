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
      <vue2-map-ol-swiss21781 id="map1" :geom-wkt="mygeom1"></vue2-map-ol-swiss21781>
      <textarea id="txtgeom1" rows="8" cols="60" v-model="mygeom1"></textarea>
      <textarea id="loggeom1" rows="5" cols="60" ></textarea>
    </div>
    <div class="mymaps">
      <vue2-map-ol-swiss21781 id="map2"
        :geom-wkt="mygeom2">
      </vue2-map-ol-swiss21781>
      <textarea id="txtgeom2" rows="8" cols="60" v-model="mygeom2"></textarea>
      <textarea id="loggeom2" rows="5" cols="60" ></textarea>
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
        msg: 'Testing 2 vue2MapOlSwiss21781 Maps side by side',
        mygeom1: null,
        mygeom2: `MULTIPOLYGON(
        ((537884.03 152099.71,537883.73 152088.79,537891.14 152087.34,537892.39 152098.71,537884.03 152099.71)),
        ((537893.10 152094.40,537892.40 152087.44,537896.56 152087.04,537893.10 152094.40))
        )`
      }
    }
  }
</script>

