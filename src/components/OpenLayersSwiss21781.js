import {DEV} from './config'
import {functionExist, isNullOrUndefined} from './lib/htmlUtils'
import OlMap from 'ol/map'
import OlView from 'ol/view'
import OlAttribution from 'ol/attribution'
import OlCircle from 'ol/style/circle'
import olEventsCondition from 'ol/events/condition'
import OlFeature from 'ol/feature'
import OlFill from 'ol/style/fill'
import OlGeoJSON from 'ol/format/geojson'
import OlFormatWKT from 'ol/format/wkt'
import OlInteractionDraw from 'ol/interaction/draw'
import OlInteractionModify from 'ol/interaction/modify'
import OlInteractionSelect from 'ol/interaction/select'
import OlInteractionTranslate from 'ol/interaction/translate'
import OlLayerVector from 'ol/layer/vector'
import OlLayerTile from 'ol/layer/tile'
import OlMousePosition from 'ol/control/mouseposition'
import OlMultiPolygon from 'ol/geom/multipolygon'
import OlMultiPoint from 'ol/geom/multipoint'
import olControl from 'ol/control'
import olCoordinate from 'ol/coordinate'
import olObservable from 'ol/observable'
import olProj from 'ol/proj'
import OlProjection from 'ol/proj/projection'
import OlSourceVector from 'ol/source/vector'
import OlSourceWMTS from 'ol/source/wmts'
import OlStroke from 'ol/style/stroke'
import OlStyle from 'ol/style/style'
import OlTileGridWMTS from 'ol/tilegrid/wmts'
import proj4 from 'proj4'

proj4.defs('EPSG:21781', '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs')
/*
      // https://golux.lausanne.ch/goeland/objet/pointfixe.php?idobjet=111351
      const coordPfa180Stfrancois = [538224.21, 152378.17] // PFA3 180 - St-Francois
      console.log(`PFA3 180 - St-Francois en 21781 : ${coordPfa180Stfrancois[0]}, ${coordPfa180Stfrancois[1]}`)
      const pfa180In4326 = Conv21781To4326(coordPfa180Stfrancois[0], coordPfa180Stfrancois[1])
      console.log(`PFA3 180 - St-Francois en 4326  : ${pfa180In4326.x}, ${pfa180In4326.y} `)
*/
export function Conv21781To4326 (x, y) {
  const projSource = new proj4.Proj('EPSG:21781')
  const projDest = new proj4.Proj('EPSG:4326')
  return proj4.transform(projSource, projDest, [x, y])
}

export function Conv4326To21781 (x, y) {
  const projSource = new proj4.Proj('EPSG:4326')
  const projDest = new proj4.Proj('EPSG:21781')
  return proj4.transform(projSource, projDest, [x, y])
}

export function Conv3857To21781 (x, y) {
  const projSource = new proj4.Proj('EPSG:3857')
  const projDest = new proj4.Proj('EPSG:21781')
  return proj4.transform(projSource, projDest, [x, y])
}

const baseWmtsUrl = 'https://map.lausanne.ch/tiles' // valid on internet
const RESOLUTIONS = [50, 20, 10, 5, 2.5, 1, 0.5, 0.25, 0.1, 0.05]
const MAX_EXTENT_LIDAR = [532500, 149000, 545625, 161000] // lidar 2012
const swissProjection = new OlProjection({
  code: 'EPSG:21781',
  extent: MAX_EXTENT_LIDAR,
  units: 'm'
})
olProj.addProjection(swissProjection)
// const vdlWmts = initWmtsLayers()

const overlayStyle = (function () {
  /* jshint -W069 */
  const styles = {}
  styles['Polygon'] = [
    new OlStyle({
      fill: new OlFill({
        color: [255, 255, 255, 0.5]
      })
    }),
    new OlStyle({
      stroke: new OlStroke({
        color: [255, 255, 255, 1],
        width: 5
      })
    }),
    new OlStyle({
      stroke: new OlStroke({
        color: [0, 153, 255, 1],
        width: 3
      })
    })]
  styles['MultiPolygon'] = styles['Polygon']

  styles['LineString'] = [
    new OlStyle({
      stroke: new OlStroke({
        color: [255, 255, 255, 1],
        width: 5
      })
    }),
    new OlStyle({
      stroke: new OlStroke({
        color: [0, 153, 255, 1],
        width: 3
      })
    })]
  styles['MultiLineString'] = styles['LineString']

  styles['Point'] = [
    new OlStyle({
      image: new OlCircle({
        radius: 7,
        fill: new OlFill({
          color: [0, 153, 255, 1]
        }),
        stroke: new OlStroke({
          color: [255, 255, 255, 0.75],
          width: 1.5
        })
      }),
      zIndex: 100000
    })]
  styles['MultiPoint'] = styles['Point']

  styles['GeometryCollection'] = styles['Polygon'].concat(styles['Point'])

  return function (feature, resolution) {
    return styles[feature.getGeometry().getType()]
  }
  /* jshint +W069 */
})()

/**
 * Allow to retrieve a valid OpenLayers WMTS source object
 * @param {string} layer  the name of the WMTS layer
 * @param {object} options
 * @return {ol.source.WMTS} a valid OpenLayers WMTS source
 */
function wmtsLausanneSource (layer, options) {
  let resolutions = RESOLUTIONS
  if (Array.isArray(options.resolutions)) {
    resolutions = options.resolutions
  }
  const tileGrid = new OlTileGridWMTS({
    origin: [420000, 350000],
    resolutions: resolutions,
    matrixIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  })
  const extension = options.format || 'png'
  const timestamp = options.timestamps
  let url = baseWmtsUrl + '/1.0.0/{Layer}/default/' + timestamp +
    '/swissgrid_05/{TileMatrix}/{TileRow}/{TileCol}.' + extension
  url = url.replace('http:', location.protocol)
  // noinspection ES6ModulesDependencies
  return new OlSourceWMTS(/** @type {olx.source.WMTSOptions} */{
    // crossOrigin: 'anonymous',
    attributions: [new OlAttribution({
      html: `&copy;<a "href='http://www.lausanne.ch/cadastre>Cadastre'>SGLEA-C Lausanne</a>`
    })],
    url: url,
    tileGrid: tileGrid,
    layer: layer,
    requestEncoding: 'REST'
  })
}

function initWmtsLayers () {
  let arrayWmts = []
  arrayWmts.push(new OlLayerTile({
    title: 'Plan ville couleur',
    type: 'base',
    visible: true,
    source: wmtsLausanneSource('fonds_geo_osm_bdcad_couleur', {
      timestamps: [2015],
      format: 'png'
    })
  }))
  arrayWmts.push(new OlLayerTile({
    title: 'Plan cadastral (gris)',
    type: 'base',
    visible: false,
    source: wmtsLausanneSource('fonds_geo_osm_bdcad_gris', {
      timestamps: [2015],
      format: 'png'
    })
  }))
  arrayWmts.push(new OlLayerTile({
    title: 'Orthophoto 2012',
    type: 'base',
    visible: false,
    source: wmtsLausanneSource('orthophotos_ortho_lidar_2012', {
      timestamps: [2012],
      format: 'png'
    })
  }))
  arrayWmts.push(new OlLayerTile({
    title: 'Orthophoto 2016',
    type: 'base',
    visible: false,
    source: wmtsLausanneSource('orthophotos_ortho_lidar_2016', {
      timestamps: [2016],
      format: 'png'
    })
  }))
  arrayWmts.push(new OlLayerTile({
    title: 'Carte Nationale',
    type: 'base',
    visible: false,
    source: wmtsLausanneSource('fonds_geo_carte_nationale_msgroup', {
      timestamps: [2014],
      format: 'png'
    })
  }))
  return arrayWmts
}

/**
 * creates an OpenLayers View Object
 * @param {array} centerView : an array [x,y] representing initial initial center of the view
 * @param {number} zoomView : an integer from 1 to 12 representing the level of zoom
 * @returns {ol.View} : the OpenLayers Vew object
 */
export function getOlView (centerView = [537892.8, 152095.7], zoomView = 12) {
  return new OlView({
    projection: swissProjection,
    center: centerView,
    minZoom: 1,
    maxZoom: 10,
    extent: MAX_EXTENT_LIDAR,
    zoom: zoomView
  })
}

export function getOlMap (divMap, olView) {
  let olMousePosition = new OlMousePosition({
    coordinateFormat: olCoordinate.createStringXY(1),
    projection: 'EPSG:2181'
    /*
    className: 'map-mouse-position',
    target: document.getElementById('mousepos'),
    undefinedHTML: '&nbsp;'
    */
  })
  return new OlMap({
    target: divMap,
    loadTilesWhileAnimating: true,
    // projection: swissProjection,
    controls: olControl.defaults({
      attributionOptions: ({
        collapsible: false
      })
    }).extend([olMousePosition]),
    layers: initWmtsLayers(),
    view: olView
  })
}

export function addGeoJSONPolygonLayer (olMap, geojsonUrl, loadCompleteCallback) {
  if (DEV) console.log(`# in addGeoJSONPolygonLayer creating Layer : ${geojsonUrl}`)
  const vectorSource = new OlSourceVector({
    url: geojsonUrl,
    format: new OlGeoJSON({
      defaultDataProjection: 'EPSG:21781',
      projection: 'EPSG:21781'
    })
  })
  /*
   https://openlayers.org/en/latest/examples/draw-and-modify-features.html
   https://openlayers.org/en/latest/examples/modify-features.html
   TODO use a property of the geojson query to display color
   or a style function  : http://openlayersbook.github.io/ch06-styling-vector-layers/example-07.html
   */
  const newLayer = new OlLayerVector({
    source: vectorSource,
    style: new OlStyle({
      fill: new OlFill({
        color: 'rgba(255, 0, 0, 0.8)'
      }),
      stroke: new OlStroke({
        color: '#ffcc33',
        width: 3
      }),
      image: new OlCircle({
        radius: 9,
        fill: new OlFill({
          color: '#ffcc33'
        })
      })
    })
  })
  let listenerKey = vectorSource.on('change', function (e) {
    if (vectorSource.getState() === 'ready') {
      // TODO maybe add "loading icon" and here where to hide it
      // retrieve extent of all features to zoom only when loading of the layer via Ajax XHR is complete
      let extent = newLayer.getSource().getExtent()
      // TODO activate insert/edit toolbar buttons only when layer has finished loading
      if (DEV) {
        console.log(`# Finished Loading Layer : ${geojsonUrl}`, e)
      }
      olMap.getView().fit(extent, olMap.getSize())
      // and unregister the "change" listener
      olObservable.unByKey(listenerKey)
      if (functionExist(loadCompleteCallback)) {
        loadCompleteCallback(newLayer)
      }
    }
  })
  return newLayer
}

export function initNewFeaturesLayer (olMap, olFeatures) {
  const newFeaturesLayer = new OlLayerVector({
    source: new OlSourceVector({features: olFeatures}),
    style: new OlStyle({
      fill: new OlFill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new OlStroke({
        color: '#ffcc33',
        width: 2
      }),
      image: new OlCircle({
        radius: 10,
        fill: new OlFill({
          color: '#ff4f22'
        })
      })
    })
  })
  // newFeaturesLayer.setMap(olMap) // use this to have an overlay
  olMap.addLayer(newFeaturesLayer)
  return newFeaturesLayer
}

export function setCreateMode (olMap, olFeatures, arrInteractionsStore, endCreateCallback) {
  let multiPolygon = new OlMultiPolygon([])
  const modify = new OlInteractionModify({
    features: olFeatures,
    // the SHIFT key must be pressed to delete vertices, so
    // that new vertices can be drawn at the same position
    // of existing vertices
    deleteCondition: function (event) {
      return olEventsCondition.shiftKeyOnly(event) &&
        olEventsCondition.singleClick(event)
    }
  })
  olMap.addInteraction(modify)
  arrInteractionsStore.push(modify)
  const draw = new OlInteractionDraw({
    features: olFeatures, // vectorSource.getFeatures(), //TODO find the correct object to pass
    type: 'Polygon' /** @type {ol.geom.GeometryType} */
  })
  draw.on('drawend', function (e) {
    let currentFeature = e.feature // this is the feature fired the event
    let currentPolygon = currentFeature.getGeometry()
    multiPolygon.appendPolygon(currentPolygon)
    // TODO here is where i may check the validity of the new polygon
    const formatWKT = new OlFormatWKT()
    let multiPolygonFeature = new OlFeature({
      geometry: multiPolygon
    })
    if (DEV) {
      let featureWKTGeometry = formatWKT.writeFeature(multiPolygonFeature)
      console.log(`INSIDE setCreateMode event drawend : ${featureWKTGeometry}`)
    }
    if (functionExist(endCreateCallback)) {
      endCreateCallback(multiPolygonFeature)
    }
  })
  olMap.addInteraction(draw)
  arrInteractionsStore.push(draw)
}

export function setModifyMode (olMap, olLayer2Edit, arrInteractionsStore, endModifyCallback) {
  // let multiPolygon = new OlMultiPolygon([])
  let modifyStyles = [
    /* We are using two different styles for the polygons:
     *  - The first style is for the polygons themselves.
     *  - The second style is to draw the vertices of the polygons.
     *    In a custom `geometry` function the vertices of a polygon are
     *    returned as `MultiPoint` geometry, which will be used to render
     *    the style.
     */
    new OlStyle({
      stroke: new OlStroke({
        color: 'blue',
        width: 3
      }),
      fill: new OlFill({
        color: 'rgba(0, 0, 255, 0.1)'
      })
    }),
    new OlStyle({
      image: new OlCircle({
        radius: 5,
        fill: new OlFill({
          color: 'orange'
        })
      }),
      geometry: function (feature) {
        // return the coordinates of the first ring of the polygon
        var coordinates = feature.getGeometry().getCoordinates()[0]
        return new OlMultiPoint(coordinates)
      }
    })
  ]
  if (DEV) console.log(overlayStyle)
  let select = new OlInteractionSelect({
    layers: [olLayer2Edit],
    wrapX: false,
    style: modifyStyles // overlayStyle
  })
  let modify = new OlInteractionModify({
    features: select.getFeatures()
  })
  modify.on('modifyend', function (e) {
    console.log(`INSIDE setModifyMode event modifyend : `, e)
    // let currentFeature = e.feature // this is the feature fired the event
    /*
    let currentPolygon = currentFeature.getGeometry()
    multiPolygon.appendPolygon(currentPolygon)
    // TODO here is where i may check the validity of the new polygon
    const formatWKT = new OlFormatWKT()
    let multiPolygonFeature = new OlFeature({
      geometry: multiPolygon
    })
    if (DEV) {
      let featureWKTGeometry = formatWKT.writeFeature(multiPolygonFeature)
      console.log(`INSIDE setModifyMode event modifyend : ${featureWKTGeometry}`)
    }
    if (functionExist(endModifyCallback)) {
      endModifyCallback(multiPolygonFeature)
    }
    */
  })
  olMap.addInteraction(select)
  olMap.addInteraction(modify)
  arrInteractionsStore.push(select)
  arrInteractionsStore.push(modify)
}

export function setTranslateMode (olMap, olLayer2Translate, arrInteractionsStore) {
  let select = new OlInteractionSelect({
    layers: [olLayer2Translate]
  })
  let translate = new OlInteractionTranslate({
    features: select.getFeatures()
  })
  olMap.addInteraction(select)
  olMap.addInteraction(translate)
  arrInteractionsStore.push(select)
  arrInteractionsStore.push(translate)
}

export function findFeaturebyId (olLayer, idFieldName, id) {
  let source = olLayer.getSource()
  let arrFeatures = source.getFeatures()
  for (let i = 0; i < arrFeatures.length; i++) {
    if (arrFeatures[i].getProperties()[idFieldName] === id) {
      return arrFeatures[i]
    }
  }
  return null
}

export function getFeatureExtentbyId (olLayer, idFieldName, id) {
  let feature = this.findFeaturebyId(olLayer, idFieldName, id)
  if (feature != null) {
    return feature.getGeometry().getExtent()
  } else {
    return null
  }
}

export function getNumberFeaturesInLayer (olLayer) {
  if (isNullOrUndefined(olLayer)) {
    return 0
  } else {
    let source = olLayer.getSource()
    let arrFeatures = source.getFeatures()
    return arrFeatures.length
  }
}

export function getWktGeometryFeaturesInLayer (olLayer) {
  if (isNullOrUndefined(olLayer)) {
    return null
  } else {
    let source = olLayer.getSource()
    let arrFeatures = source.getFeatures()
    let strGeom = ''
    for (let i = 0; i < arrFeatures.length; i++) {
      if (DEV) console.log(arrFeatures[i], arrFeatures[i].getGeometry())
      strGeom += ``
    }
    return strGeom
  }
}

