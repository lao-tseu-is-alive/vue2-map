<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

  @import "../styles/ol.css";

  $toolbar_height: 1.8em;
  $button_size: 1.5em;

  .main {
    width: 100%;
    height: 97%;
    margin: 0px;
    padding: 0px;
    overflow: hidden;
  }

  .map-toolbar{
    height: $toolbar_height;
    background-color: rgba(0,60,136,0.5);
    .map-control {
      font-size: $toolbar_height - 0.7;
      height: $toolbar_height - 0.3;
      background-color: white;
      border-radius: 4px;
    }
    .ol-layer-selector {
      right: 0.2em;
      // position: absolute;
    }
  }
  .map-content{
    height: 95%;
    background-color: white;
    .ol-mouse-position {
      // par default en haut a droite
      // ici on deplace en bas a gauche
      top: unset;
      right: unset;
      bottom: 5px;
      left: 5px;
    }
  }

    .ol-zoom {
    //top: $toolbar_height+1.5;
    .ol-zoom-in {
      width: $button_size;
      height: $button_size;
    }
    .ol-zoom-out {
      width: $button_size;
      height: $button_size;
    }
  }
  .gostatus{
    background-color: #1a1a1a;
    color: yellowgreen;
    padding: 2px;

  }

</style>

<template>
  <div class="main">
    <slot></slot>

    <div ref="mytoolbar" class="map-toolbar">
      <button id="cmdClear" class="map-control" @click="clearNewFeatures">Clear</button>
      <select id="modeSelector" class="ol-mode-selector map-control"
              v-on:change="changeMode" v-model="uiMode"
              title="Cliquez pour sélectionner le mode de travail">
        <option value="NAVIGATE">Navigation</option>
        <option value="CREATE">Création</option>
        <option value="EDIT">Edition</option>
        <option value="TRANSLATE">Déplacer</option>
      </select>
      <select id="layerSelector" class="ol-layer-selector map-control"
              v-on:change="changeLayer" v-model="activeLayer"
      title="Cliquez pour sélectionner le fond de plan">
        <option value="fonds_geo_osm_bdcad_couleur">Plan ville couleur</option>
        <option value="fonds_geo_osm_bdcad_gris">Plan cadastral (gris)</option>
        <option value="orthophotos_ortho_lidar_2016">Orthophotos 2016</option>
        <option value="orthophotos_ortho_lidar_2012">Orthophotos 2012</option>
      </select>
      <span class="gostatus">{{getNumPolygons}} Polygones</span>
    </div>
    <div ref="mymap" class="map-content"></div>
  </div>
</template>

<script>
  import {DEV, geoJSONUrl} from './config'
  import OlCollection from 'ol/collection'
  import OlFormatWKT from 'ol/format/wkt'
  import {isNullOrUndefined, dumpObject2String} from './lib/htmlUtils'
  import {
    getOlView,
    getOlMap,
    addGeoJSONPolygonLayer,
    initNewFeaturesLayer,
    setCreateMode,
    setModifyMode,
    setTranslateMode,
    getNumberFeaturesInLayer,
    getWktGeometryFeaturesInLayer,
    dumpFeatureToString,
    addWktPolygonToLayer
  } from './OpenLayersSwiss21781'

  const positionGareLausanne = [537892.8, 152095.7]

  export default {
    name: 'vue2MapOlSwiss21781',
    components: {},
    data () {
      return {
        msg: 'Basic OpenLayers Map',
        uiMode: 'NAVIGATE',
        ol_map: null,
        ol_view: null,
        ol_geoJSONLayer: null,
        maxFeatureIdCounter: 0, // to give an id to polygon features
        ol_newFeatures: null, // ol collection of features used as vector source for CREATE mode
        ol_newFeaturesLayer: null, // Vector Layer for storing new features
        ol_Active_Interactions: [],
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
        default: 'fonds_geo_osm_bdcad_couleur'
      },
      geomWkt: {
        type: String,
        default: null
      }
    },
    watch: {
      geomWkt: function () {
        this._updateGeometry()
      }
    },
    computed: {
      getNumPolygons: function () {
        return getNumberFeaturesInLayer(this.ol_newFeaturesLayer)
      }
    },
    methods: {
      _updateGeometry: function () {
        if (!isNullOrUndefined(this.geomWkt)) {
          const numFeaturesAdded = addWktPolygonToLayer(this.ol_newFeaturesLayer, this.geomWkt, this.maxFeatureIdCounter)
          if (DEV) {
            if (isNullOrUndefined(numFeaturesAdded)) {
              console.log(`# ERROR tying to add this invalid Geom : ${this.geomWkt}`, this.geomWkt)
            } else {
              console.log(`Successfully added this geomWT to layer now layer has ${numFeaturesAdded} features !`)
              this.maxFeatureIdCounter += numFeaturesAdded
            }
          }
        }
      },
      changeLayer: function (event) {
        let selectedLayer = event.target.value
        let layers = this.ol_map.getLayers()
        layers.forEach((layer) => {
          console.log(`## in changeLayer layers.forEach: layer = ${layer.get('title')}`, layer)
          let layerName = layer.get('source').layer_
          if (layer.get('type') === 'base') {
            if (layerName === selectedLayer) {
              layer.setVisible(true)
            } else {
              layer.setVisible(false)
            }
          }
        })
      },
      changeMode: function (event) {
        let selectedMode = event.target.value
        if (DEV) console.log(`## in changeMode selectedMode = ${selectedMode}`)
        this.ol_Active_Interactions.forEach((Interaction) => {
          this.ol_map.removeInteraction(Interaction)
        })
        switch (selectedMode) {
          case 'NAVIGATE':
            break
          case 'CREATE':
            setCreateMode(
              this.ol_map,
              this.ol_newFeatures,
              this.ol_Active_Interactions,
              this.maxFeatureIdCounter,
              (newGeom) => {
                // here is a good place to save geometry
                const formatWKT = new OlFormatWKT()
                let featureWKTGeometry = formatWKT.writeFeature(newGeom)
                if (DEV) {
                  console.log(`## in changeMode callback for setCreateMode`, newGeom)
                  console.log(`** newGeom in wkt format : ${featureWKTGeometry}`)
                }
                this.$emit('gomapnewgeom', featureWKTGeometry)
              })
            break
          case 'EDIT':
            setModifyMode(this.ol_map, this.ol_newFeaturesLayer, this.ol_Active_Interactions,
              (newGeom) => {
                // here is a good place to save geometry
                if (DEV) {
                  console.log(`## in changeMode callback for setModifyMode`, newGeom)
                  // console.log(`** newGeom in wkt format : ${featureWKTGeometry}`)
                }
              })
            break
          case 'TRANSLATE':
            // TODO simplify precision of coords after a translate
            setTranslateMode(this.ol_map, this.ol_newFeaturesLayer, this.ol_Active_Interactions)
            break
          default:
            if (DEV) console.log(`## in changeMode selectedMode = ${selectedMode} NOT IMPLEMENTED`)
        }
      },
      clearNewFeatures: function () {
        if (this.ol_newFeatures !== null) {
          this.ol_newFeatures.clear()
          this.ol_Active_Interactions.forEach((Interaction) => {
            this.ol_map.removeInteraction(Interaction)
          })
          this.uiMode = 'NAVIGATE'
        }
      }
    },
    mounted () {
      this.ol_view = getOlView(this.center, this.zoom)
      if (DEV) {
        // console.log(`geoJSONUrl : ${geoJSONUrl}`)
        // console.log(`geomWkt : ${this.geomWkt}`)
      }
      this.ol_map = getOlMap(this.$refs.mymap, this.ol_view)
      this.ol_geoJSONLayer = addGeoJSONPolygonLayer(this.ol_map, geoJSONUrl)
      // this.ol_map.addLayer(this.ol_geoJSONLayer)
      this.ol_newFeatures = new OlCollection()
      this.ol_newFeaturesLayer = initNewFeaturesLayer(this.ol_map, this.ol_newFeatures)
      this._updateGeometry()
      this.ol_map.on(
        'click',
        (evt) => {
          if (DEV) {
            console.log(`## GoMap click at: ${Number(evt.coordinate[0]).toFixed(2)},${Number(evt.coordinate[1]).toFixed(2)}`)
            console.log(`** BEGIN LAYER CONTENTS **\n${getWktGeometryFeaturesInLayer(this.ol_newFeaturesLayer)}\n** END LAYER CONTENTS **`)
          }
          if (this.uiMode === 'NAVIGATE') {
            this.ol_map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
              console.log(`## GoMap click evt feature detected : \n${dumpFeatureToString(feature)}`, feature)
              if (!isNullOrUndefined(layer)) console.log(`   feature found in layer : `, layer.get('name'))
              console.log(dumpObject2String(feature.getProperties()))
              this.$emit('selfeature', feature)
            })
          } else {
            this.$emit('gomapclick', evt.coordinate)
          }
        })
      window.onresize = () => {
        // console.log(`## GoMap resize`, this.ol_map)
        // this.$refs.mymap.clientHeight = window.innerHeight - 60
        this.ol_map.updateSize()
        document.getElementById()
      }
    }
  }
</script>

