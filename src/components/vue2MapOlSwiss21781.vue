<template>
  <div class="vue2-map">
    <slot></slot>

    <div id="oltoolbar" class="ol-toolbar">
      <button id="cmdHello" class="map-control">Hello</button>
      <select id="layerSelector" class="ol-layer-selector map-control"
              v-on:change="changeLayer" v-model="activeLayer"
      title="Cliquez pour sélectionner le fond de plan">
        <option value="fonds_geo_osm_bdcad_couleur">Plan ville couleur</option>
        <option value="fonds_geo_osm_bdcad_gris">Plan cadastral (gris)</option>
        <option value="orthophotos_ortho_lidar_2016">Orthophotos 2016</option>
        <option value="orthophotos_ortho_lidar_2012">Orthophotos 2012</option>
      </select>
    </div>
    <div id="mousepos"></div>
  </div>
</template>

<script>
  import {DEV} from './config'
  import {
    getOlView,
    getOlMap
  } from './OpenLayersSwiss21781'

  const positionGareLausanne = [537892.8, 152095.7]

  export default {
    name: 'vue2MapOlSwiss21781',
    data () {
      return {
        msg: 'Basic OpenLayers Map',
        ol_map: null,
        ol_view: null,
        activeLayer: 'fonds_geo_osm_bdcad_couleur'
      }
    },
    props: {
      zoom: {
        type: Number,
        default: 13
      },
      center: {
        type: Array,
        default: () => (positionGareLausanne)
      },
      baseLayer: {
        type: String,
        default: 'opentopomap'
      }
    },
    methods: {
      changeLayer: function (event) {
        let selectedLayer = event.target.value
        let layers = this.ol_map.getLayers()
        layers.forEach((layer) => {
          // console.log(`## in changeLayer layers.forEach: layer = ${layer.get('title')}`, layer)
          let layerName = layer.get('source').layer_
          if (layer.get('type') === 'base') {
            if (layerName === selectedLayer) {
              layer.setVisible(true)
            } else {
              layer.setVisible(false)
            }
          }
        })
      }
    },
    mounted () {
      document.getElementById('cmdHello').innerText = DEV ? 'Hello DEV' : 'Hello'
      this.ol_view = getOlView(this.center, this.zoom)
      this.ol_map = getOlMap(this.$el, this.ol_view)
      this.ol_map.on(
        'click',
        (evt) => {
          console.log(`## GoMap click at : ${evt.coordinate[0]}, ${evt.coordinate[1]}`)
          const feature = this.ol_map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)
          if (feature) {
            this.$emit('selfeature', feature)
          } else {
            this.$emit('gomapclick', evt.coordinate)
          }
        })
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

  @import "../styles/ol.css";

  $toolbar_height: 1.8em;
  $button_size: 1.5em;

  .vue2-map {
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
  }

  .map-mouse-position {
    background-color: white;
    position: fixed;
    bottom: 0em;
    left: 0.1em;
    height: 1.1em;
    width: auto;
    line-height: 1em;
    z-index: 300;
  }

  .ol-zoom {
    top: $toolbar_height+1.5;
    .ol-zoom-in {
      width: $button_size;
      height: $button_size;
    }
    .ol-zoom-out {
      width: $button_size;
      height: $button_size;
    }
  }

  .ol-toolbar {
    background-color: rgba(0,60,136,0.5);
    font-size: 1.2em;
    position: absolute;
    z-index: 250;
    top: 0px;
    left: 0px;
    height: $toolbar_height;
    width: 100%;
    padding-top: 0.2em;
    border-radius: 4px;
    .map-control {
      font-size: $toolbar_height - 0.8;
      height: $toolbar_height - 0.4;
      background-color: white;
      border-radius: 4px;
    }
    button {
      height: $button_size;
    }
    .ol-layer-selector {
      right: 0.2em;
      position: absolute;
    }
  }
</style>
