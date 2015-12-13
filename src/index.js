import _ from 'underscore';
import carto from 'carto';
import stringify from 'json-stable-stringify';
var renderer = require('carto/lib/carto/renderer');
carto.tree = require('carto/lib/carto/tree'); 
require('carto/lib/carto/tree/zoom');

export function cartocss2json(cartocss) {
    return out(parse(cartocss));
}

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
        var styledRules = rules[layer].map(layerRules => styleLayer(layerRules))[0];

        layerRules[layer] = [];
        _.each(styledRules, ruleGroup => {
            // Filter potentially null rules out
            ruleGroup = ruleGroup.filter((rule) => rule);
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
    var groups = _.map(layer, ruleGroup => {
        var groupedRules =  _.chain(ruleGroup.rules)
            .map(rule => {
                // Add conditions to each rule, if any
                var conditions = getConditions(rule);
                if (conditions && conditions.length > 0) {
                    rule.conditions = conditions;
                }
                return rule;
            })
            .groupBy(subRule => {
                // Group by conditions
                return stringify(subRule.conditions);
            })
            .value();
        return _.values(groupedRules);
    });

    return groups.map(ruleGroup => {
        try {
            return ruleGroup.map(ruleSubgroup => {
                return styleRuleGroup(ruleSubgroup);
            });
        }
        catch (e) {
            console.warn(e);
            return null;
        }
    });
}

function styleRuleGroup(group) {
    var style = {};
    var sortedRules = group.sort((a, b) => a.index - b.index);
    var zoom;
    sortedRules.forEach(function (rule) {
        if (!zoom || countZoomLevels(rule.zoom) < countZoomLevels(zoom)) {
            zoom = rule.zoom;
        }
        style[rule.name] = getValue(rule.value.value);
    });

    var renderedRule = { style: style };
    if (zoom !== carto.tree.Zoom.all) {
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
    if (rule.zoom !== carto.tree.Zoom.all) {
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

    if (value.length === 0) {
        return null;
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
    // Handle array values (eg 'line-dasharray')
    if (value.length > 1) {
        return value.map(e => e.value);
    }

    // If the value is a simple value, return that
    var nestedValue = value[0].value[0];
    if (nestedValue.value) {
        return nestedValue.value;
    }
    return nestedValue;
}
