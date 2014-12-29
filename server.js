var express     = require( 'express' ),
    app         = express();

app.all( '/', function ( req, res, next ) {
    res.end( "Hello NetChat!" );
});

module.exports  = app;