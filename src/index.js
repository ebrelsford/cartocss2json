import _ from 'underscore';
import carto from 'carto';
import rgbHex from 'rgb-hex';
var renderer = require('carto/lib/carto/renderer');

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
        layerRules[layer] = styledRules[0];
    });
    return layerRules;
}

function styleRule(rule) {
    return rule.map(rule => styleSubRule(rule));
}

function styleSubRule(rule) {
    var style = {};
    rule.rules.forEach(function (rule) {
        _.extend(style, property(rule.name, getValue(rule.value.value)));
    });
    return { style: style };
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
