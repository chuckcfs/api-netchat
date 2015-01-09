var express         = require( 'express' ),
    app             = express(),
    debug           = require( 'debug' )( 'app' ),
    io              = require( 'socket.io' ),
    error           = require( './lib/error' ),
    startup         = require( './lib/start' ),
    SessionHandler  = require( './lib/session' ),
    EventEmitter    = require( 'events' ).EventEmitter,
    emitter         = new EventEmitter();

// Application required routers
var sessions        = require( './routers/sessions' ),
    users           = require( './routers/users' ),
    messages        = require( './routers/messages' ),
    chats           = require( './routers/chats' );

startup.launch( express, app, emitter );

app.use( '/sessions', sessions );

app.use( SessionHandler.validate );

app.use( '/users', users );
app.use( '/messages', messages );
app.use( '/chats', chats );

app.use( error.notFound );
app.use( error.handler );

// Set the PORT and ENV variables and start the server
app.set( 'port', process.env.PORT || 3000 );
app.set( 'env', process.env.ENV || 'development' )

var server  = app.listen( app.get('port'), function() {
    debug( 'Express server listening on port ' + server.address().port );
});

// Start listening for connections
startup.sockets( io.listen( server ), emitter );

module.exports      = app;