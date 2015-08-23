var c2l = require('../index');
var _ = require('underscore');
var chai = require('chai');
var assert = chai.assert;

describe('properties', function () {
    it('should handle line-color', function () {
        var s = '#world { line-color: #fff; }',
            out = c2l.out(c2l.parse(s));
        assert.deepProperty(out.world[0].style, 'line-color.alpha');
        assert.deepProperty(out.world[0].style, 'line-color.rgb');
    });

    it('should handle line-opacity', function () {
        var s = '#world { line-opacity: 0.2; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        'line-opacity': 0.2
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });

    it('should handle line-cap', function () {
        var s = '#world { line-cap: round; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        'line-cap': 'round'
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });

    it('should handle line-dasharray', function () {
        var s = '#world { line-dasharray: 8, 2, 8; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        'line-dasharray': [8, 2, 8]
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });

    it('should handle line-join', function () {
        var s = '#world { line-join: round; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        'line-join': 'round'
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });

    it('should handle marker-fill', function () {
        var s = '#world { marker-fill: #fff; }',
            out = c2l.out(c2l.parse(s));
        assert.deepProperty(out.world[0].style, 'marker-fill.alpha');
        assert.deepProperty(out.world[0].style, 'marker-fill.rgb');
    });

    it('should handle marker-fill-opacity', function () {
        var s = '#world { marker-fill-opacity: 0.2; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        'marker-fill-opacity': 0.2
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });

    it('should handle marker-line-color', function () {
        var s = '#world { marker-line-color: #fff; }',
            out = c2l.out(c2l.parse(s));
        assert.deepProperty(out.world[0].style, 'marker-line-color.alpha');
        assert.deepProperty(out.world[0].style, 'marker-line-color.rgb');
    });

    it('should handle marker-line-opacity', function () {
        var s = '#world { marker-line-opacity: 0.2; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        'marker-line-opacity': 0.2
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });

    it('should handle marker-line-width', function () {
        var s = '#world { marker-line-width: 10; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        'marker-line-width': 10
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });

    it('should handle marker-width', function () {
        var s = '#world { marker-width: 15; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        'marker-width': 15
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });

    it('should handle polygon-fill', function () {
        var s = '#world { polygon-fill: #fff; }',
            out = c2l.out(c2l.parse(s));
        assert.deepProperty(out.world[0].style, 'polygon-fill.alpha');
        assert.deepProperty(out.world[0].style, 'polygon-fill.rgb');
    });

    it('should handle polygon-opacity', function () {
        var s = '#world { polygon-opacity: 0.2; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        'polygon-opacity': 0.2
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });
});

describe('layers', function () {
    it('should handle multiple layers', function () {
        var s = '#world { polygon-fill: #ff0; } #sea { polygon-fill: #fff; polygon-opacity: 0.2; }',
            parsed = c2l.parse(s);
        var out = c2l.out(parsed);

        assert.sameMembers(_.keys(out), ['sea', 'world']);
        assert.sameMembers(_.keys(out.world[0].style), ['polygon-fill']);
        assert.sameMembers(_.keys(out.sea[0].style), ['polygon-fill', 'polygon-opacity']);
    });
});

describe('zoom', function () {
    it('should handle zoom >', function () {
        var s = '#world { polygon-fill: #ff0; } #world[zoom > 10] { polygon-fill: #fff; polygon-opacity: 0.2; }',
            parsed = c2l.parse(s);
        var out = c2l.out(parsed);

        var zoom = {
            type: 'zoom',
            operator: '>=',
            value: 11
        };
        assert.deepEqual(out.world[1].conditions[0], zoom);
    });

    it('should handle zoom <', function () {
        var s = '#world { polygon-fill: #ff0; } #world[zoom < 10] { polygon-fill: #fff; polygon-opacity: 0.2; }',
            parsed = c2l.parse(s);
        var out = c2l.out(parsed);

        var zoom = {
            type: 'zoom',
            operator: '<=',
            value: 9
        };
        assert.deepEqual(out.world[1].conditions[0], zoom);
    });

    it('should handle zoom IN', function () {
        var s = '#world { polygon-fill: #ff0; } #world[zoom > 10][zoom < 15] { polygon-fill: #fff; polygon-opacity: 0.2; }',
            parsed = c2l.parse(s);
        var out = c2l.out(parsed);

        var zoom = {
            type: 'zoom',
            operator: 'IN',
            value: [11, 12, 13, 14]
        };
        assert.deepEqual(out.world[1].conditions[0], zoom);
    });

    it('should handle zoom =', function () {
        var s = '#world { polygon-fill: #ff0; } #world[zoom = 10] { polygon-fill: #fff; polygon-opacity: 0.2; }',
            parsed = c2l.parse(s);
        var out = c2l.out(parsed);

        var zoom = {
            type: 'zoom',
            operator: 'IN',
            value: [10]
        };
        assert.deepEqual(out.world[1].conditions[0], zoom);
    });

    it('should ignore negative zooms', function () {
        var s = '#world { polygon-fill: #ff0; } #world[zoom = -1] { polygon-fill: #fff; polygon-opacity: 0.2; }',
            parsed = c2l.parse(s);
        var out = c2l.out(parsed);
        assert.sameMembers(_.keys(out.world[0].style), ['polygon-fill']);
    });

});
