<template>
  <div class="vue2-map">
    <slot></slot>
  </div>
</template>

<script>
  import 'ol/ol.css'
  import Map from 'ol/map'
  import View from 'ol/view'
  import LayerTile from 'ol/layer/tile'
  import SourceXYZ from 'ol/source/xyz'
  import Proj from 'ol/proj'

  const positionLausanne = [6.63188, 46.52205]

  const LAYERS_ENUM = [
    {
      name: 'openstreetmap',
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
    {
      name: 'opentopomap',
      url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
    }
  ] // end of LAYERS_ENUM

  export default {
    name: 'vue2MapOlLonLat',
    data () {
      return {
        msg: 'Basic OpenLayers Map',
        map: null,
        view: null
      }
    },
    props: {
      zoom: {
        type: Number,
        default: 13
      },
      center: {
        type: Array,
        default: () => (positionLausanne)
      },
      baseLayer: {
        type: String,
        default: 'opentopomap'
      }
    },
    mounted () {
      this.view = new View({
        center: Proj.fromLonLat(this.center),
        zoom: this.zoom
      })
      this.map = new Map({
        target: this.$el,
        loadTilesWhileAnimating: true,
        // TODO: if baselayer not found in LAYERS_ENUM suppose it's an url
        layers: [
          new LayerTile({source: new SourceXYZ({url: (LAYERS_ENUM.find(x => x.name === this.baseLayer).url)})})
        ],
        view: this.view
      })
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .vue2-map {
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
  }
</style>
