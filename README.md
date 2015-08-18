cartocss2leaflet
================

A node module for converting CartoCSS map styles to Leaflet styles.


Usage
-----

You can use it as a module or as a command line script. To do the latter, clone
this repo, `npm install -g` and invoke the script:

    cartocss2leaflet <file>


TODO
----

 * zoom (https://github.com/mapbox/carto/blob/master/lib/carto/tree/zoom.js#L112-L118)
 * variables
 * :: attachments
 * command line script


Contributing
------------

All code changes should be made in `src/index.js` and compiled using Babel into
the resulting `index.js`. Run `npm run watch` while editing to continuously
compile using Babel.


License
-------

MIT.
