var express     = require( 'express' ),
    app         = express(),
    startup     = require( './lib/start' );

startup.launch( express, app );

module.exports  = app;