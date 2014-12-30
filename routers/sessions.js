var express         = require( 'express' ),
    router          = express.Router(),
    Encrypt         = require( '../lib/encrypt' ),
    SessionHandler  = require( '../lib/session' );

router.post( '/', function ( req, res, next ) {
    SessionHandler.login( req, function ( err, session ) {
        if ( err ) {
            return next( err );
        }

        if ( session ) {
            res.json({
                session : Encrypt.encode( session.id ),
                type    : session.access_level
            });
        } else {
            var err     = new Error( 'Invalid credentials' );
            err.status  = 401;
            next( err );
        }
    });
});

router.delete( '/:session', SessionHandler.validate, function ( req, res, next ) {
    SessionHandler.logout( req, function ( err ) {
        if ( err ) {
            return next( err );
        }

        res.json({
            message : "Session terminated"
        });
    });
});

module.exports  = router;