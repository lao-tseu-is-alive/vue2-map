/* eslint-disable no-unexpected-multiline,no-sequences,no-undef */
/**
 * Created by cgil on 2/1/17.
 */
import {DEV} from '../config'
export const getEl = (elemntId) => (document.getElementById(elemntId))
export const functionExist = (functionName) => ((typeof (functionName) !== 'undefined') && (functionName !== null))
export const isNullOrUndefined = (variable) => ((typeof (variable) === 'undefined') || (variable === null))
export const isEmpty = (variable) => ((typeof (variable) === 'undefined') || (variable === null) || (variable === ''))
export const isEmptyField = function (fieldId) {
  const fieldValue = document.getElementById(fieldId).value
  return (typeof (fieldValue) === 'undefined') || (fieldValue === null) || (fieldValue === '')
}

export const addClass = function (elementId, cssClass) {
  document.getElementById(elementId).className += ' ' + cssClass
}
export const delClass = function (elementId, cssClass) {
  document.getElementById(elementId).className = document.getElementById(elementId).className.replace(cssClass, '').trim()
}

export const eventFire = function (el, etype) {
  if (el.fireEvent) {
    el.fireEvent('on' + etype)
  } else {
    let evObj = document.createEvent('Events')
    evObj.initEvent(etype, true, false)
    el.dispatchEvent(evObj)
  }
}
export const dateIso2Fr = function (strIsoDate) {
  if (isEmpty(strIsoDate)) {
    return null
  } else {
    let y = null
    let m = null
    let d = null
      [y, m, d] = strIsoDate.split('-')
    return [d, m, y].join('-')
  }
}

export const dateFr2Iso = function (strddmmyyyy) {
  if (isEmpty(strddmmyyyy)) {
    return null
  } else {
    let y = null
    let m = null
    let d = null
    [d, m, y] = strddmmyyyy.split('-')
    return [y, m, d].join('-')
  }
}

export const unescapeHtml = function (safe) {
  if (isNullOrUndefined(safe)) {
    return safe
  } else {
    return safe.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
  }
}

export const getArrObjectsProperties = function (objectName) {
  let arr = []
  for (let prop in objectName) {
    if (objectName.hasOwnProperty(prop)) {
      (DEV) ? console.log(prop) : ''
      arr.push(prop)
    }
  }
  return arr
}

export const dumpObject2String = function (objectName) {
  let objDump = ''
  const arrProp = getArrObjectsProperties(objectName)
  objDump = arrProp.reduce((a, b) => (`${a}\n ${b}: ${objectName[b]}`))
  return objDump
}

export const addImg = function (image, height, width, idElement) {
  const elem = document.createElement('img')
  elem.setAttribute('src', image)
  elem.setAttribute('height', height)
  elem.setAttribute('width', width)
  elem.setAttribute('alt', 'logo')
  document.getElementById(idElement).appendChild(elem)
}

