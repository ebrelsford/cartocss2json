'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.parse = parse;
exports.out = out;
exports.zoomCondition = zoomCondition;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _carto = require('carto');

var _carto2 = _interopRequireDefault(_carto);

var _rgbHex = require('rgb-hex');

var _rgbHex2 = _interopRequireDefault(_rgbHex);

var renderer = require('carto/lib/carto/renderer');
_carto2['default'].tree = require('carto/lib/carto/tree');
require('carto/lib/carto/tree/zoom');

function parse(cartocss) {
    var env = {};
    parser = _carto2['default'].Parser(env);
    _carto2['default'].tree.Reference.setVersion('3.0.0');
    var parser = parser.parse(cartocss);
    var ruleList = parser.toList(env);

    var layerRules = {};
    var layers = ruleList.map(function (rule) {
        return rule.elements[0].clean;
    });
    layers.forEach(function (layer) {
        var matchingRules = ruleList.filter(function (rule) {
            return rule.elements[0].clean === layer;
        });
        var layerRuleList = renderer.inheritDefinitions(matchingRules, env);
        var layerRulesSorted = renderer.sortStyles(layerRuleList, env);
        layerRules[layer] = layerRulesSorted;
    });
    return layerRules;
}

function out(rules) {
    var layerRules = {};
    _underscore2['default'].keys(rules).forEach(function (layer) {
        var styledRules = rules[layer].map(function (rule) {
            return styleRule(rule);
        });
        if (styledRules.length > 1) {
            console.warn('cartocss2leaflet.out(): More styledRules than expected');
        }
        // Sort by number of conditions
        layerRules[layer] = styledRules[0].sort(function (a, b) {
            var aLen = a.conditions ? a.conditions.length : 0,
                bLen = b.conditions ? b.conditions.length : 0;
            return aLen - bLen;
        });
    });
    return layerRules;
}

function styleRule(rule) {
    return rule.map(function (rule) {
        return styleSubRule(rule);
    });
}

function styleSubRule(rule) {
    var style = {};
    var sortedRules = rule.rules.sort(function (a, b) {
        return a.index - b.index;
    });
    var zoom;
    sortedRules.forEach(function (rule) {
        if (!zoom || countZoomLevels(rule.zoom) < countZoomLevels(zoom)) {
            zoom = rule.zoom;
        }
        _underscore2['default'].extend(style, property(rule.name, getValue(rule.value.value)));
    });

    var renderedRule = { style: style };
    if (zoom !== _carto2['default'].tree.Zoom.all) {
        renderedRule.conditions = zoomCondition(zoom);
    }
    return renderedRule;
}

/**
 * Count number of bits set in zoom integer
 */
function countZoomLevels(zoom) {
    var count = 0;
    while (zoom) {
        count += zoom & 1;
        zoom >>= 1;
    }
    return count;
}

/**
 * Create a zoom condition given a zoom integer
 */

function zoomCondition(zoom) {
    var zooms = [];
    for (var i = 0; i <= _carto2['default'].tree.Zoom.maxZoom; i++) {
        if (zoom & 1 << i) {
            zooms.push(i);
        }
    }

    var zoomRanges = detectZoomRanges(zooms),
        value,
        operator;
    if (zoomRanges.length > 1) {
        operator = 'IN';
        value = zooms;
    } else {
        var range = zoomRanges[0];
        if (range[0] === 0) {
            operator = '<=';
            value = range[1];
        } else if (range[1] === _carto2['default'].tree.Zoom.maxZoom) {
            operator = '>=';
            value = range[0];
        } else {
            // We're only handling >=, <= and IN right now
            operator = 'IN';
            value = zooms;
        }
    }
    return [{
        operator: operator,
        type: 'zoom',
        value: value
    }];
}

/**
 * Find zoom ranges in a set of zooms
 */
function detectZoomRanges(zooms) {
    var ranges = [];
    var currentRange = [];
    for (var i = 0, z = zooms[0]; i <= zooms.length; i++, z = zooms[i]) {
        if (currentRange.length < 2) {
            currentRange.push(z);
            continue;
        }
        if (currentRange.length === 2) {
            if (z === currentRange[1] + 1) {
                currentRange[1] = z;
            } else {
                ranges.push(currentRange);
                currentRange = [];
            }
        }
    }
    if (currentRange.length > 0) {
        ranges.push(currentRange);
    }
    return ranges;
}

function getValue(value) {
    if (value.length > 1) {
        return value.map(function (e) {
            return e.value;
        });
    }
    return value[0].value[0];
}

function property(name, value) {
    switch (name) {
        case 'line-cap':
            return {
                lineCap: value.value
            };
        case 'line-color':
            return {
                color: '#' + _rgbHex2['default'].apply(undefined, _toConsumableArray(value.rgb)),
                opacity: value.alpha
            };
        case 'line-dasharray':
            return {
                dashArray: value.join(' ')
            };
        case 'line-opacity':
            return {
                opacity: value.value
            };
        case 'line-join':
            return {
                lineJoin: value.value
            };
        case 'line-width':
            return {
                weight: value.value
            };
        case 'marker-line-color':
            return {
                color: '#' + _rgbHex2['default'].apply(undefined, _toConsumableArray(value.rgb)),
                opacity: value.alpha,
                stroke: true
            };
        case 'marker-line-opacity':
            return {
                opacity: value.value
            };
        case 'marker-line-width':
            return {
                weight: value.value
            };
        case 'marker-fill':
            return {
                fill: true,
                fillColor: '#' + _rgbHex2['default'].apply(undefined, _toConsumableArray(value.rgb)),
                fillOpacity: value.alpha
            };
        case 'marker-fill-opacity':
            return {
                fillOpacity: value.value
            };
        case 'marker-width':
            return {
                radius: value.value
            };
        case 'polygon-fill':
            return {
                fill: true,
                fillColor: '#' + _rgbHex2['default'].apply(undefined, _toConsumableArray(value.rgb)),
                fillOpacity: value.alpha
            };
        case 'polygon-opacity':
            return {
                fillOpacity: value.value
            };
        default:
            console.warn('Unknown property "' + name + '"');
    }
}
