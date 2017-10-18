<template>
  <div class="vue2-map">
    <slot></slot>

    <div id="oltoolbar" class="ol-toolbar">
      <button id="cmdClear" class="map-control" @click="clearNewFeatures">Clear</button>
      <!--
      <radio name="robot" value="navigate" v-model="uiMode" checked>
        NAVIGATION
      </radio>
      <radio name="robot" value="create" v-model="uiMode">
        CREATION
      </radio>
      <radio name="robot" value="edit" v-model="uiMode">
        EDITION
      </radio>
      -->
      <select id="modeSelector" class="ol-mode-selector map-control"
              v-on:change="changeMode" v-model="uiMode"
              title="Cliquez pour sélectionner le mode de travail">
        <option value="NAVIGATE">Navigation</option>
        <option value="CREATE">Création</option>
        <option value="EDIT">Edition</option>
        <option value="TRANSLATE">Déplacer</option>
      </select>
      <span>{{uiMode}}</span>
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
  import {DEV, geoJSONUrl} from './config'
  import OlCollection from 'ol/collection'
  import {isNullOrUndefined, dumpObject2String} from './lib/htmlUtils'
  import {
    getOlView,
    getOlMap,
    addGeoJSONPolygonLayer,
    initNewFeaturesLayer,
    setCreateMode,
    setModifyMode,
    setTranslateMode,
    getNumberFeaturesInLayer
  } from './OpenLayersSwiss21781'
  import {Radio} from 'vue-checkbox-radio'

  const positionGareLausanne = [537892.8, 152095.7]

  export default {
    name: 'vue2MapOlSwiss21781',
    components: {Radio},
    data () {
      return {
        msg: 'Basic OpenLayers Map',
        uiMode: 'NAVIGATE',
        ol_map: null,
        ol_view: null,
        ol_geoJSONLayer: null,
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
        default: 'opentopomap'
      }
    },
    methods: {
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
          case 'CREATE':
            setCreateMode(
              this.ol_map,
              this.ol_newFeatures,
              this.ol_Active_Interactions,
              (newGeom) => {
                if (DEV) {
                  console.log(`## in changeMode callback for setCreateMode`, newGeom)
                  console.log(`** Il y a ${getNumberFeaturesInLayer(this.ol_newFeaturesLayer)} polygones`)
                }
                // here is a good place to save geometry
              })
            break
          case 'EDIT':
            if (DEV) console.log(`## in changeMode selectedMode = ${selectedMode} NOT IMPLEMENTED`)
            setModifyMode(this.ol_map, this.ol_newFeaturesLayer, this.ol_Active_Interactions,
              (newGeom) => {
                if (DEV) {
                  console.log(`## in changeMode callback for setModifyMode`, newGeom)
                  console.log(`** Il y a ${getNumberFeaturesInLayer(this.ol_newFeaturesLayer)} polygones`)
                }
                // here is a good place to save geometry
              })
            break
          case 'TRANSLATE':
            if (DEV) console.log(`## in changeMode selectedMode = ${selectedMode} NOT IMPLEMENTED`)
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
      this.ol_map = getOlMap(this.$el, this.ol_view)
      this.ol_geoJSONLayer = addGeoJSONPolygonLayer(this.ol_map, geoJSONUrl)
      this.ol_map.addLayer(this.ol_geoJSONLayer)
      this.ol_newFeatures = new OlCollection()
      this.ol_newFeaturesLayer = initNewFeaturesLayer(this.ol_map, this.ol_newFeatures)
      this.ol_map.on(
        'click',
        (evt) => {
          console.log(`## GoMap click at : ${evt.coordinate[0]}, ${evt.coordinate[1]}`)
          console.log(`** Il y a ${getNumberFeaturesInLayer(this.ol_newFeaturesLayer)} polygones`)
          if (this.uiMode === 'NAVIGATE') {
            this.ol_map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
              console.log(`## GoMap click evt feature detected : `, feature)
              if (!isNullOrUndefined(layer))console.log(`   feature found in layer : `, layer)
              console.log(dumpObject2String(feature.getProperties()))
              this.$emit('selfeature', feature)
            })
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

  .radio-component  {
    display: inline;
  }

  .checkbox-component > input + label > .input-box,
  .radio-component > input + label > .input-box {
    font-size: 1em;
    text-align: center;
    line-height: 1;
    color: transparent;
  }
  .checkbox-component > input + label > .input-box > .input-box-tick,
  .radio-component > input + label > .input-box > .input-box-circle {
    display: none;
  }
  .checkbox-component > input + label > .input-box:before,
  .radio-component > input + label > .input-box:before {
    content: '✘';
  }
  .checkbox-component > input:checked + label > .input-box:before,
  .radio-component > input:checked + label > .input-box:before {
    color: #000;
  }
</style>
