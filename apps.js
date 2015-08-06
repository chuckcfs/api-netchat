// Load the required libraries
var mongoose    = require( 'mongoose' ),
    db          = require( './config/db' ),
    Encrypt     = require( './lib/encrypt' ),
    String      = require( './lib/string' ),
    Application = require( './models/application' ),
    UnitTest    = false,
    WebClient   = false;

mongoose.connect( db.get() );

// Set the unit test application secret
var secret      = String.random( 32, 'alnum' ),
    encoded     = Encrypt.encode( secret );

Application.create({
    description : 'Unit testing application',
    name        : 'UnitTest',
    permissions : [
        'chats_read',
        'chats_write',
        'messages_read',
        'messages_write',
        'users_read',
        'users_write',
        'sessions_write'
    ],
    secret      : encoded
}, function ( err, application ) {
    UnitTest    = true;
    console.log( '============= UnitTest ==============' );
    console.log( 'Application ID: ' + application.id );
    console.log( 'Application Secret: ' + Encrypt.decode( application.secret ) );

    if ( UnitTest && WebClient ) {
        process.exit();
    }
});

// Set the client application secret
secret      = String.random( 32, 'alnum' );
encoded     = Encrypt.encode( secret );

Application.create({
    description : 'Web client application',
    name        : 'NetChat',
    permissions : [
        'chats_read',
        'chats_write',
        'messages_read',
        'messages_write',
        'users_read',
        'users_write',
        'sessions_write'
    ],
    secret      : encoded
}, function ( err, application ) {
    WebClient   = true;
    console.log( '============= WebClient ==============' );
    console.log( 'Application ID: ' + application.id );
    console.log( 'Application Secret: ' + Encrypt.decode( application.secret ) );

    if ( UnitTest && WebClient ) {
        process.exit();
    }
});