<template>
  <div class="vue2-map">
    <slot></slot>
  </div>
</template>

<script>
  import Map from 'ol/map'
  import View from 'ol/view'
  import LayerTile from 'ol/layer/tile'
  import SourceXYZ from 'ol/source/xyz'
  import OlCoordinate from 'ol/coordinate'
  import OlControl from 'ol/control'
  import MousePosition from 'ol/control/mouseposition'
  import Proj from 'ol/proj'
  import Projection from 'ol/proj/projection'
  import proj4 from 'proj4'

  proj4.defs('EPSG:21781', '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs')
  const swissProjection = new Projection({
    code: 'EPSG:21781',
    // The extent is used to determine zoom level 0. Recommended values for a
    // projection's validity extent can be found at https://epsg.io/.
    extent: [485869.5728, 76443.1884, 837076.5648, 299941.7864],
    units: 'm'
  })
  function Conv21781To4326 (x, y) {
    const projSource = new proj4.Proj('EPSG:21781')
    const projDest = new proj4.Proj('EPSG:4326')
    return proj4.transform(projSource, projDest, [x, y])
  }
  function Conv4326To21781 (x, y) {
    const projSource = new proj4.Proj('EPSG:4326')
    const projDest = new proj4.Proj('EPSG:21781')
    return proj4.transform(projSource, projDest, [x, y])
  }
  function Conv3857To21781 (x, y) {
    const projSource = new proj4.Proj('EPSG:3857')
    const projDest = new proj4.Proj('EPSG:21781')
    return proj4.transform(projSource, projDest, [x, y])
  }

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
      const coordPfa180Stfrancois = [538224.21, 152378.17] // PFA3 180 - St-Francois
      console.log(`## vue2MapOlLonLat mounted with baselayer :${this.baseLayer}`)
      console.log(`PFA3 180 - St-Francois en 21781 : ${coordPfa180Stfrancois[0]}, ${coordPfa180Stfrancois[1]}`)
      const pfa180In4326 = Conv21781To4326(coordPfa180Stfrancois[0], coordPfa180Stfrancois[1])
      console.log(`PFA3 180 - St-Francois en 4326  : ${pfa180In4326.x}, ${pfa180In4326.y} `)
      this.ol_mousePosition = new MousePosition({
        coordinateFormat: OlCoordinate.createStringXY(4),
        projection: 'EPSG:4326',
        // comment the following two lines to have the mouse position
        // be placed within the map.
        // className: 'custom-mouse-position',
        // target: document.getElementById('mouse-position'),
        undefinedHTML: '&nbsp;'
      })
      this.ol_view = new View({
        center: Proj.fromLonLat(this.center),
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
        layers: [
          new LayerTile({source: new SourceXYZ({url: (LAYERS_ENUM.find(x => x.name === this.baseLayer).url)})})
        ],
        view: this.ol_view
      })
      this.ol_map.on(
        'click',
        (evt) => {
          console.log('## GoMap click', Proj.toLonLat(evt.coordinate), evt.coordinate)
          const P21781From3857 = Conv3857To21781(evt.coordinate[0], evt.coordinate[1])
          console.log(`## goMap  P21781From3857 :  ${P21781From3857.x}, ${P21781From3857.y}`, this.center)
          const tmpWGS84 = Proj.toLonLat(evt.coordinate)
          const P21781 = Conv4326To21781(tmpWGS84[0], tmpWGS84[1])
          console.log(`## goMap Conv4326To21781 :  ${P21781.x}, ${P21781.y}`, this.center)
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
