#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');

var cartocss2json = require('../index').cartocss2json;

program
    .version('0.0.1')
    .usage('< <input_file>')
    .parse(process.argv);

fs.readFile('/dev/stdin', 'utf8', function (error, contents) {
    console.log(JSON.stringify(cartocss2json(contents)));
});
