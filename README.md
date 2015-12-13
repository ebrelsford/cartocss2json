cartocss2json
=============

A node module for converting CartoCSS map styles to JSON.

This is a first step toward converting CartoCSS to other formats (eg, Leaflet
styles), what is returned is a simplified parse tree of the CartoCSS.


Install
-------

    npm install -g cartocss2json

or clone this repo and

    npm install -g


Usage
-----

You can use it as a module or as a command line script. To do the latter,
install it globally and invoke the script:

    cartocss2json < <file>


TODO
----

 * variables
 * :: attachments
 * / instances


Contributing
------------

All code changes should be made in `src/index.js` and compiled using Babel into
the resulting `index.js`. Run `npm run watch` while editing to continuously
compile using Babel.


License
-------

MIT.
