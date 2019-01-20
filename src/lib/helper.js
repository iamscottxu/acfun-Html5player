import { Resources } from './resources'

/**
 * 设置值
 * @alias Helper.setValue
 * @param {*} value - 值
 * @param {*} defaultValue - 默认值
 * @param {string} type - 类型
 * @returns {*} - 值
 */
function setValue(value, defaultValue, type) {
    let returnValue;
    if (isEmpty(value)) returnValue = clone(defaultValue);
    else returnValue = clone(value);
    if (!isEmpty(type)) checkType(returnValue, type);
    else if (!isEmpty(defaultValue)) checkType(returnValue, _typeof(defaultValue));
    return returnValue;
}

/**
 * 设置多个值
 * @alias Helper.setValues
 * @param {object} values - 值
 * @param {object} defaultValues - 默认值
 * @param {object} types - 类型
 * @returns {object} - 值
 */
function setValues(values, defaultValues, types, clone = true) {
    let returnValues = clone ? setValue(values, {}) : defaultValues;
    let _values = clone ? returnValues : setValue(values, {});
    for (let key in defaultValues) {
        if (_typeof(defaultValues[key]) === 'object')
            returnValues[key] = setValues(_values[key], defaultValues[key], types[key]);
        else
            returnValues[key] = setValue(_values[key], defaultValues[key], types[key]);
    }
    return returnValues;
}

/**
 * 检查类型
 * @alias Helper.checkType
 * @param {string} value - 值
 * @param {string} type - 类型
 * @param {boolean} canBeNull - 可以为空
 */
function checkType(value, type, canBeNull = true) {
    if (typeof type != 'string' && _typeof(type) != 'array') throw new TypeError(Resources.PARAMETERS_TYPE_ERROR);
    if (canBeNull && isEmpty(value)) return;
    if (_typeof(type) === 'array') {
        let flat = false;
        for (let item of type) {
            if (typeof item != 'string') throw new TypeError(Resources.PARAMETERS_TYPE_ERROR);
            if (_typeof(value) === item) {
                flat = true;
                break;
            }
        }
        if (!flat) throw new TypeError(Resources.PARAMETERS_TYPE_ERROR);
    } else if (_typeof(value) != type) throw new TypeError(Resources.PARAMETERS_TYPE_ERROR);
}

/**
 * 检查多个值
 * @alias Helper.checkTypes
 * @param {object} values - 值
 * @param {object} types - 类型
 * @returns {object} - 值
 */
function checkTypes(values, types, canBeNull = true) {
    if (canBeNull && isEmpty(values)) return;
    for (let key in types) {
        if (_typeof(types[key]) === 'object')
            checkTypes(values[key], types[key]);
        else
            checkType(values[key], types[key], canBeNull);
    }
}

/**
 * 检查是否为空
 * @alias Helper.isEmpty
 * @param {*} value - 值
 */
function isEmpty(value) {
    return typeof value === 'undefined' ||
        (typeof value === 'number' && isNaN(value)) ||
        value === null
}

/**
 * 获取对象的类型（可区分数组等）
 * @alias Helper._typeof
 * @param {*} object - 对象
 */
function _typeof(object) {
    //eg: [Object Function] -> Function -> function
    return Object.prototype.toString.call(object).slice(8, -1).toLowerCase();
}

/**
 * 克隆对象
 * @param {*} object 
 */
function clone(object) {
    let result, type = _typeof(object);
    //确定result的类型
    if (type === 'object') result = {};
    else if (type === 'array') result = [];
    else return object;
    for (let key in object) {
        result[key] = clone(object[key]); //递归调用
    }
    return result;
}

/**
 * 格式化数字（在数字前加0）
 * @param {*} num - 数字
 * @param {*} n - 位数
 */
function pad(num, n) {
    num = num.toString();
    let len = num.length;
    while (len++ < n) num = "0" + num;
    return num;
}

/**
 * 获取时间的文本
 * @param {*} second - 时间：单位：秒。
 */
function getTimeText(second) {
    if (typeof second != 'number' || isNaN(second) || second < 0) return '00:00';
    second = Math.round(second);
    let hour = Math.floor(second / 3600);
    second = second % 3600;
    let minute = Math.floor(second / 60);
    second = second % 60;
    return ((hour === 0) ? '' : pad(hour, 2) + ':') + pad(minute, 2) + ':' + pad(second, 2);
}

/**
 * 把数字用逗号隔开
 * @param {number} n - 要分隔的数字
 */
function separateNumber(n) {
    var b = parseInt(n).toString();
    var len = b.length;
    if (len <= 3) { return b; }
    var r = len % 3;
    return r > 0 ? b.slice(0, r) + "," + b.slice(r, len).match(/\d{3}/g).join(",") : b.slice(r, len).match(/\d{3}/g).join(",");
}

function requestFullscreen(element) {
    if (typeof element.requestFullscreen === 'function') element.requestFullscreen();
    else if (typeof element.mozRequestFullScreen === 'function') element.mozRequestFullScreen();
    else if (typeof element.webkitRequestFullscreen === 'function') element.webkitRequestFullscreen();
    else if (typeof element.msRequestFullscreen === 'function') element.msRequestFullscreen();
    else if (typeof element.oRequestFullScreen === 'function') element.oRequestFullScreen();
}

function exitFullscreen() {
    if (typeof document.exitFullscreen === 'function') document.exitFullscreen();
    else if (typeof document.mozCancelFullScreen === 'function') document.mozCancelFullScreen();
    else if (typeof document.webkitExitFullscreen === 'function') document.webkitExitFullscreen();
    else if (typeof document.msExitFullScreen === 'function') document.msExitFullScreen();
    else if (typeof document.oExitFullScreen === 'function') document.oExitFullScreen();
}

function addScreenchangeEventListener(listerer, options) {
    document.addEventListener('fullscreenchange', listerer, options);
    document.addEventListener('webkitfullscreenchange', listerer, options);
    document.addEventListener('mozfullscreenchange', listerer, options);
    document.addEventListener('MSFullscreenChange', listerer, options);
    document.addEventListener('ofullscreenchange', listerer, options);
}

function getFullscreenElement() {
    if (typeof document.fullscreenElement != 'undefined') return document.fullscreenElement;
    else if (typeof document.mozFullScreenElement != 'undefined') return document.mozFullScreenElement;
}

/**
 * 帮助对象
 * @namespace
 */
const Helper = {
    setValue: setValue,
    setValues: setValues,
    checkType: checkType,
    checkTypes: checkTypes,
    isEmpty: isEmpty,
    _typeof: _typeof,
    clone: clone,
    pad: pad,
    getTimeText: getTimeText,
    separateNumber: separateNumber,
    requestFullscreen: requestFullscreen,
    exitFullscreen: exitFullscreen,
    addScreenchangeEventListener: addScreenchangeEventListener,
    getFullscreenElement: getFullscreenElement
}

export { Helper }