var c2l = require('../index');
var chai = require('chai');
var assert = chai.assert;

describe('line', function () {
    it('should handle simple lines', function () {
        var s = '#world { line-color: #fff; line-width: 3; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            color: '#ffffff',
            opacity: 1,
            weight: 3
        };
        assert.deepEqual(out[0][0].style, expected);
    });

    it('should handle line opacity', function () {
        var s = '#world { line-color: #fff; line-opacity: 0.2; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            color: '#ffffff',
            opacity: 0.2
        };
        assert.deepEqual(out[0][0].style, expected);
    });

    it('should handle line join', function () {
        var s = '#world { line-join: round; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            lineJoin: 'round'
        };
        assert.deepEqual(out[0][0].style, expected);
    });
});

describe('polygon', function () {
    it('should handle simple polygons', function () {
        var s = '#world { polygon-fill: #fff; polygon-opacity: 0.2; }',
            out = c2l.out(c2l.parse(s));
        var expected = {
            fill: true,
            fillColor: '#ffffff',
            fillOpacity: 0.2
        };
        assert.deepEqual(out[0][0].style, expected);
    });
});
