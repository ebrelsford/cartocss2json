var c2l = require('../index');
var chai = require('chai');
var assert = chai.assert;

describe('line', function () {
    it('should handle line-color and line-width', function () {
        var s = '#world { line-color: #fff; line-width: 3; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        color: '#ffffff',
                        opacity: 1,
                        weight: 3
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });

    it('should handle line-opacity', function () {
        var s = '#world { line-color: #fff; line-opacity: 0.2; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        color: '#ffffff',
                        opacity: 0.2
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
                        lineCap: 'round'
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
                        dashArray: '8 2 8'
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
                        lineJoin: 'round'
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });
});

describe('marker', function () {
    it('should handle marker-fill', function () {
        var s = '#world { marker-fill: #fff; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        fill: true,
                        fillColor: '#ffffff',
                        fillOpacity: 1
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });

    it('should handle marker-fill-opacity', function () {
        var s = '#world { marker-fill-opacity: 0.2; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        fillOpacity: 0.2
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });

    it('should handle marker-line-color', function () {
        var s = '#world { marker-line-color: #fff; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        stroke: true,
                        color: '#ffffff',
                        opacity: 1
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });

    it('should handle marker-line-opacity', function () {
        var s = '#world { marker-line-opacity: 0.2; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        opacity: 0.2
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
                        weight: 10
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
                        radius: 15
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });
});

describe('polygon', function () {
    it('should handle simple polygons', function () {
        var s = '#world { polygon-fill: #fff; polygon-opacity: 0.2; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            world: [
                {
                    style: {
                        fill: true,
                        fillColor: '#ffffff',
                        fillOpacity: 0.2
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

        var expected = {
            sea: [
                {
                    style: {
                        fill: true,
                        fillColor: '#ffffff',
                        fillOpacity: 0.2
                    }
                }
            ],
            world: [
                {
                    style: {
                        fill: true,
                        fillColor: '#ffff00',
                        fillOpacity: 1
                    }
                }
            ]
        };
        assert.deepEqual(out, expected);
    });
});
