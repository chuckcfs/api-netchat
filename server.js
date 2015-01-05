var express         = require( 'express' ),
    app             = express(),
    error           = require( './lib/error' ),
    startup         = require( './lib/start' ),
    SessionHandler  = require( './lib/session' );

// Application required routers
var sessions        = require( './routers/sessions' ),
    users           = require( './routers/users' ),
    messages        = require( './routers/messages' ),
    chats           = require( './routers/chats' );

startup.launch( express, app );

app.use( '/sessions', sessions );

app.use( SessionHandler.validate );

app.use( '/users', users );
app.use( '/messages', messages );
app.use( '/chats', chats );

app.use( error.notFound );
app.use( error.handler );

module.exports  = app;