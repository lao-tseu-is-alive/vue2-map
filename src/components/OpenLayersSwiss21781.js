import LayerTile from 'ol/layer/tile'
import SourceWMTS from 'ol/source/wmts'
import TileGridWMTS from 'ol/tilegrid/wmts'
import Projection from 'ol/proj/projection'
import Attribution from 'ol/attribution'
import proj4 from 'proj4'

proj4.defs('EPSG:21781', '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs')
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
