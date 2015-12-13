'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.cartocss2json = cartocss2json;
exports.parse = parse;
exports.out = out;
exports.zoomCondition = zoomCondition;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _carto = require('carto');

var _carto2 = _interopRequireDefault(_carto);

var _jsonStableStringify = require('json-stable-stringify');

var _jsonStableStringify2 = _interopRequireDefault(_jsonStableStringify);

var renderer = require('carto/lib/carto/renderer');
_carto2['default'].tree = require('carto/lib/carto/tree');
require('carto/lib/carto/tree/zoom');

function cartocss2json(cartocss) {
    return out(parse(cartocss));
}

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
        var styledRules = rules[layer].map(function (layerRules) {
            return styleLayer(layerRules);
        })[0];

        layerRules[layer] = [];
        _underscore2['default'].each(styledRules, function (ruleGroup) {
            // Filter potentially null rules out
            ruleGroup = ruleGroup.filter(function (rule) {
                return rule;
            });
            layerRules[layer] = layerRules[layer].concat(ruleGroup);
        });
        layerRules[layer] = layerRules[layer].reverse();
    });
    return layerRules;
}

/**
 * Style a layer. The layer will have the following structure after being
 * parsed:
 *
 *  [
 *    [
 *      { ... }, // Rule groups...
 *      { ... },
 *      { ... }
 *    ]
 *  ]
 *
 */
function styleLayer(layer) {
    var groups = _underscore2['default'].map(layer, function (ruleGroup) {
        var groupedRules = _underscore2['default'].chain(ruleGroup.rules).map(function (rule) {
            // Add conditions to each rule, if any
            var conditions = getConditions(rule);
            if (conditions && conditions.length > 0) {
                rule.conditions = conditions;
            }
            return rule;
        }).groupBy(function (subRule) {
            // Group by conditions
            return (0, _jsonStableStringify2['default'])(subRule.conditions);
        }).value();
        return _underscore2['default'].values(groupedRules);
    });

    return groups.map(function (ruleGroup) {
        try {
            return ruleGroup.map(function (ruleSubgroup) {
                return styleRuleGroup(ruleSubgroup);
            });
        } catch (e) {
            console.warn(e);
            return null;
        }
    });
}

function styleRuleGroup(group) {
    var style = {};
    var sortedRules = group.sort(function (a, b) {
        return a.index - b.index;
    });
    var zoom;
    sortedRules.forEach(function (rule) {
        if (!zoom || countZoomLevels(rule.zoom) < countZoomLevels(zoom)) {
            zoom = rule.zoom;
        }
        style[rule.name] = getValue(rule.value.value);
    });

    var renderedRule = { style: style };
    if (zoom !== _carto2['default'].tree.Zoom.all) {
        var conditions = zoomCondition(zoom);
        if (!conditions) {
            throw new Error('Invalid zoom condition');
        }
        renderedRule.conditions = conditions;
    }
    return renderedRule;
}

function getConditions(rule) {
    var conditions = [];
    if (rule.zoom !== _carto2['default'].tree.Zoom.all) {
        var zoomConditions = zoomCondition(rule.zoom);
        if (zoomConditions) {
            conditions = conditions.concat(zoomConditions);
        }
    }
    return conditions;
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

    if (value.length === 0) {
        return null;
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
    // Handle array values (eg 'line-dasharray')
    if (value.length > 1) {
        return value.map(function (e) {
            return e.value;
        });
    }

    // If the value is a simple value, return that
    var nestedValue = value[0].value[0];
    if (nestedValue.value) {
        return nestedValue.value;
    }
    return nestedValue;
}
