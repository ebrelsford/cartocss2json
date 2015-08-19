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
        _.extend(style, property(rule.name, rule.value.value[0].value[0]));
    });
    return {
        layer: rule.elements[0].clean,
        style: style
    };
}

function property(name, value) {
    switch (name) {
        case 'line-color':
            return {
                color: '#' + rgbHex(...value.rgb),
                opacity: value.alpha
            };
        case 'line-width':
            return {
                weight: value.value
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
