import Map from 'ol/map'
import View from 'ol/view'
import OlCoordinate from 'ol/coordinate'
import OlControl from 'ol/control'
import MousePosition from 'ol/control/mouseposition'

import LayerTile from 'ol/layer/tile'
import SourceWMTS from 'ol/source/wmts'
import TileGridWMTS from 'ol/tilegrid/wmts'
import Projection from 'ol/proj/projection'
import Proj from 'ol/proj'
import Attribution from 'ol/attribution'
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
export const MAX_EXTENT_LIDAR = [532500, 149000, 545625, 161000] // lidar 2012
export const swissProjection = new Projection({
  code: 'EPSG:21781',
  extent: MAX_EXTENT_LIDAR,
  units: 'm'
})
Proj.addProjection(swissProjection)
export const vdlWmts = initWmtsLayers()

/**
 * Allow to retrieve a valid OpenLayers WMTS source object
 * @param {string} layer  the name of the WMTS layer
 * @param {object} options
 * @return {ol.source.WMTS} a valid OpenLayers WMTS source
 */
export function wmtsLausanneSource (layer, options) {
  let resolutions = RESOLUTIONS
  if (Array.isArray(options.resolutions)) {
    resolutions = options.resolutions
  }
  const tileGrid = new TileGridWMTS({
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
  return new SourceWMTS(/** @type {olx.source.WMTSOptions} */{
    // crossOrigin: 'anonymous',
    attributions: [new Attribution({
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
  arrayWmts.push(new LayerTile({
    title: 'Plan ville couleur',
    type: 'base',
    visible: true,
    source: wmtsLausanneSource('fonds_geo_osm_bdcad_couleur', {
      timestamps: [2015],
      format: 'png'
    })
  }))
  arrayWmts.push(new LayerTile({
    title: 'Plan cadastral (gris)',
    type: 'base',
    visible: false,
    source: wmtsLausanneSource('fonds_geo_osm_bdcad_gris', {
      timestamps: [2015],
      format: 'png'
    })
  }))
  arrayWmts.push(new LayerTile({
    title: 'Orthophoto 2012',
    type: 'base',
    visible: false,
    source: wmtsLausanneSource('orthophotos_ortho_lidar_2012', {
      timestamps: [2012],
      format: 'png'
    })
  }))
  arrayWmts.push(new LayerTile({
    title: 'Orthophoto 2016',
    type: 'base',
    visible: false,
    source: wmtsLausanneSource('orthophotos_ortho_lidar_2016', {
      timestamps: [2016],
      format: 'png'
    })
  }))
  arrayWmts.push(new LayerTile({
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

export function getOlView (centerView = [537892.8, 152095.7], zoomView = 12) {
  return new View({
    projection: swissProjection,
    center: centerView,
    minZoom: 1,
    maxZoom: 10,
    extent: MAX_EXTENT_LIDAR,
    zoom: zoomView
  })
}

export function getOlMap (divMap, olView) {
  let olMousePosition = new MousePosition({
    coordinateFormat: OlCoordinate.createStringXY(1),
    projection: 'EPSG:2181',
    className: 'map-mouse-position',
    target: document.getElementById('mousepos'),
    undefinedHTML: '&nbsp;'
  })
  return new Map({
    target: divMap,
    loadTilesWhileAnimating: true,
    // projection: swissProjection,
    controls: OlControl.defaults({
      attributionOptions: ({
        collapsible: false
      })
    }).extend([olMousePosition]),
    layers: vdlWmts,
    view: olView
  })
}
