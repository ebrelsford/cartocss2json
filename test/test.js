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
});
