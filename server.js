var express     = require( 'express' ),
    app         = express(),
    error       = require( './lib/error' ),
    startup     = require( './lib/start' );

startup.launch( express, app );

app.use( error.notFound );
app.use( error.handler );

module.exports  = app;