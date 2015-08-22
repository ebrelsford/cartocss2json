import _ from 'underscore';
import carto from 'carto';
import rgbHex from 'rgb-hex';
var renderer = require('carto/lib/carto/renderer');
carto.tree = require('carto/lib/carto/tree'); 
require('carto/lib/carto/tree/zoom');

export function parse(cartocss) {
    var env = {};
    parser = carto.Parser(env);
    carto.tree.Reference.setVersion('3.0.0');
    var parser = parser.parse(cartocss);
    var ruleList = parser.toList(env);

    var layerRules = {};
    var layers = ruleList.map((rule) => rule.elements[0].clean);
    layers.forEach((layer) => {
        var matchingRules = ruleList.filter((rule) => {
            return rule.elements[0].clean === layer;
        });
        var layerRuleList = renderer.inheritDefinitions(matchingRules, env);
        var layerRulesSorted = renderer.sortStyles(layerRuleList, env);
        layerRules[layer] = layerRulesSorted;
    });
    return layerRules;
}

export function out(rules) {
    var layerRules = {};
    _.keys(rules).forEach((layer) => {
        var styledRules = rules[layer].map(rule => styleRule(rule));
        if (styledRules.length > 1) {
            console.warn('cartocss2leaflet.out(): More styledRules than expected');
        }
        // Sort by number of conditions
        layerRules[layer] = styledRules[0].sort((a, b) => {
            var aLen = (a.conditions ? a.conditions.length : 0),
                bLen = (b.conditions ? b.conditions.length : 0);
            return aLen - bLen;
        });
    });
    return layerRules;
}

function styleRule(rule) {
    return rule.map(rule => styleSubRule(rule));
}

function styleSubRule(rule) {
    var style = {};
    var sortedRules = rule.rules.sort((a, b) => a.index - b.index);
    var zoom;
    sortedRules.forEach(function (rule) {
        if (!zoom || countZoomLevels(rule.zoom) < countZoomLevels(zoom)) {
            zoom = rule.zoom;
        }
        _.extend(style, property(rule.name, getValue(rule.value.value)));
    });

    var renderedRule = { style: style };
    if (zoom !== carto.tree.Zoom.all) {
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
export function zoomCondition(zoom) {
    var zooms = [];
    for (var i = 0; i <= carto.tree.Zoom.maxZoom; i++) {
        if (zoom & (1 << i)) {
            zooms.push(i);
        }
    }

    var zoomRanges = detectZoomRanges(zooms),
        value,
        operator;
    if (zoomRanges.length > 1) {
        operator = 'IN';
        value = zooms;
    }
    else {
        var range = zoomRanges[0];
        if (range[0] === 0) {
            operator = '<=';
            value = range[1];
        }
        else if (range[1] === carto.tree.Zoom.maxZoom) {
            operator = '>=';
            value = range[0];
        }
        else {
            // We're only handling >=, <= and IN right now
            operator = 'IN';
            value = zooms;
        }
    }
    return [
        {
            operator: operator,
            type: 'zoom',
            value: value
        }
    ];
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
            if (z === (currentRange[1] + 1)) {
                currentRange[1] = z;
            }
            else {
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
        return value.map(e => e.value);
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
                color: '#' + rgbHex(...value.rgb),
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
                color: '#' + rgbHex(...value.rgb),
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
                fillColor: '#' + rgbHex(...value.rgb),
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
                fillColor: '#' + rgbHex(...value.rgb),
                fillOpacity: value.alpha
            };
        case 'polygon-opacity':
            return {
                fillOpacity: value.value
            };
        default:
            console.warn(`Unknown property "${name}"`);
    }
}
