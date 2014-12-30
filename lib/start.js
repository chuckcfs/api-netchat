var path        = require( 'path' ),
    bodyParser  = require( 'body-parser' ),
    logger      = require( 'morgan' ),
    mongoose    = require( 'mongoose' ),
    db          = require( '../config/db' ),
    config      = require( '../config/app' ),
    AuthHandler = require( './auth' ),
    Utils       = require( './utils' );

exports.launch  = function ( express, app ) {
    mongoose.connect( db.get() );

    app.use( logger( 'dev' ) );
    app.use( bodyParser.json() );
    app.use( bodyParser.urlencoded({ extended : false }) );
    app.use( '/public', express.static( path.join( __dirname, config.public_path ) ) );

    app.use( Utils.cors );
    app.use( Utils.params );

    app.use( AuthHandler.client );
    app.use( AuthHandler.permissions );
};