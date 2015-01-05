var crypto          = require( 'crypto' ),
    config          = require( '../config/app' ),
    Application     = require( '../models/application' ),
    Encrypt         = require( './encrypt' );

exports.client      = function( req, res, next ) {
    var consumer    = req.param( 'consumer' ),
        timestamp   = req.param( 'timestamp' ),
        signature   = req.param( 'signature' ),
        shasum      = crypto.createHash( 'sha1' );

    Application.findById( consumer, function ( err, application ) {
        if ( err || !application ) {
            var err     = new Error( 'Invalid consumer' );
            err.status  = 401;

            return next( err );
        }

        // The application exists validate the timestamp and signature
        var now     = new Date().getTime(),
            elapsed = now - timestamp;

        if ( !timestamp || elapsed > config.request_lifespan ) {
            var err     = new Error( 'Expired request' );
            err.status  = 401;

            return next( err );
        }

        var secret  = Encrypt.decode( application.secret );
        shasum.update( timestamp + secret );
        if ( !signature || ( signature != shasum.digest( 'hex' ) ) ) {
            var err     = new Error( 'Invalid signature' );
            err.status  = 401;

            return next( err );
        }

        // The request is valid set the permissions in the request to verify throughout the app
        req.permissions = application.permissions;
        next();
    });
};

exports.permissions = function( req, res, next ) {
    var path        = req.path.split( '/' )[1],
        permission  = "";

    if ( path != "applications" && path != "sessions" && path != "users" && path != "messages" && path != "chats" ) {
        var err     = new Error( 'Invalid request' );
        err.status  = 403;

        return next( err );
    }

    if ( req.method == "GET" ) {
        permission  = path + "_read";
    } else {
        permission  = path + "_write";
    }

    if ( path != "" && req.permissions.indexOf( permission ) == -1 ) {
        var err     = new Error( 'Permission denied' );
        err.status  = 401;

        return next( err );
    }

    next();
};