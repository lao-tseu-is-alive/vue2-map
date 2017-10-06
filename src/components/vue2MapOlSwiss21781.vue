<template>
  <div class="vue2-map">
    <slot></slot>
  </div>
</template>

<script>
  import Map from 'ol/map'
  import View from 'ol/view'
  import OlCoordinate from 'ol/coordinate'
  import OlControl from 'ol/control'
  import MousePosition from 'ol/control/mouseposition'
  import Proj from 'ol/proj'
  import {
    Conv21781To4326,
    swissProjection,
    MAX_EXTENT_LIDAR,
    vdlWmts
  } from './OpenLayersSwiss21781'

  const lon = 537892.8
  const lat = 152095.7
  const positionLausanne = [lon, lat]

  export default {
    name: 'vue2MapOlSwiss21781',
    data () {
      return {
        msg: 'Basic OpenLayers Map',
        ol_map: null,
        ol_view: null,
        ol_mousePosition: null
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
      Proj.addProjection(swissProjection)
      // https://golux.lausanne.ch/goeland/objet/pointfixe.php?idobjet=111351
      const coordPfa180Stfrancois = [538224.21, 152378.17] // PFA3 180 - St-Francois
      console.log(`## vue2MapOlLonLat mounted with baselayer :${this.baseLayer}`)
      console.log(`PFA3 180 - St-Francois en 21781 : ${coordPfa180Stfrancois[0]}, ${coordPfa180Stfrancois[1]}`)
      const pfa180In4326 = Conv21781To4326(coordPfa180Stfrancois[0], coordPfa180Stfrancois[1])
      console.log(`PFA3 180 - St-Francois en 4326  : ${pfa180In4326.x}, ${pfa180In4326.y} `)
      this.ol_mousePosition = new MousePosition({
        coordinateFormat: OlCoordinate.createStringXY(2),
        projection: 'EPSG:2181',
        // comment the following two lines to have the mouse position
        // be placed within the map.
        // className: 'custom-mouse-position',
        // target: document.getElementById('mouse-position'),
        undefinedHTML: '&nbsp;'
      })
      this.ol_view = new View({
        projection: swissProjection,
        center: this.center,
        minZoom: 1,
        maxZoom: 10,
        extent: MAX_EXTENT_LIDAR,
        zoom: this.zoom
      })
      this.ol_map = new Map({
        target: this.$el,
        loadTilesWhileAnimating: true,
        // projection: swissProjection,
        controls: OlControl.defaults({
          attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
          })
        }).extend([this.ol_mousePosition]),
        layers: vdlWmts,
        view: this.ol_view
      })
      this.ol_map.on(
        'click',
        (evt) => {
          console.log(`## GoMap click at : ${evt.coordinate[0]}, ${evt.coordinate[0]}`)
          const feature = this.ol_map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)
          if (feature) {
            this.$emit('selfeature', feature)
          } else {
            this.$emit('gomapclick', Proj.toLonLat(evt.coordinate))
          }
        })
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

  @import "../styles/ol.css";

  .vue2-map {
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
  }
  .ol-mouse-position {
    background-color: white;
  }
</style>
