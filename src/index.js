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

    ruleList = renderer.inheritDefinitions(ruleList, env);
    return renderer.sortStyles(ruleList, env);
}

export function out(rules) {
    return rules.map(rule => styleRule(rule));
}

function styleRule(rule) {
    return rule.map(rule => styleSubRule(rule));
}

function styleSubRule(rule) {
    var style = {};
    rule.rules.forEach(function (rule) {
        _.extend(style, property(rule.name, getValue(rule.value.value)));
    });
    return {
        layer: rule.elements[0].clean,
        style: style
    };
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
        case 'marker-fill':
            return {
                fill: true,
                fillColor: '#' + rgbHex(...value.rgb),
                fillOpacity: value.alpha
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
