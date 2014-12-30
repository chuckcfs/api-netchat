var express         = require( 'express' ),
    app             = express(),
    error           = require( './lib/error' ),
    startup         = require( './lib/start' ),
    SessionHandler  = require( './lib/session' );

// Application required routers
var sessions        = require( './routers/sessions' );

startup.launch( express, app );

app.use( '/sessions', sessions );

app.use( SessionHandler.validate );

app.use( error.notFound );
app.use( error.handler );

module.exports  = app;