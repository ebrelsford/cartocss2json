'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.parse = parse;
exports.out = out;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _carto = require('carto');

var _carto2 = _interopRequireDefault(_carto);

var _rgbHex = require('rgb-hex');

var _rgbHex2 = _interopRequireDefault(_rgbHex);

var renderer = require('carto/lib/carto/renderer');

function parse(cartocss) {
    var env = {};
    parser = _carto2['default'].Parser(env);
    _carto2['default'].tree.Reference.setVersion('3.0.0');
    var parser = parser.parse(cartocss);
    var ruleList = parser.toList(env);

    ruleList = renderer.inheritDefinitions(ruleList, env);
    return renderer.sortStyles(ruleList, env);
}

function out(rules) {
    return rules.map(function (rule) {
        return styleRule(rule);
    });
}

function styleRule(rule) {
    return rule.map(function (rule) {
        return styleSubRule(rule);
    });
}

function styleSubRule(rule) {
    var style = {};
    rule.rules.forEach(function (rule) {
        _underscore2['default'].extend(style, property(rule.name, rule.value.value[0].value[0]));
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
                color: '#' + _rgbHex2['default'].apply(undefined, _toConsumableArray(value.rgb)),
                opacity: value.alpha
            };
        case 'line-width':
            return {
                weight: value.value
            };
        default:
            console.warn('Unknown property "' + name + '"');
    }
}
