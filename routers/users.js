var express     = require( 'express' ),
    router      = express.Router(),
    User        = require( '../models/user' ),
    Utils       = require( '../lib/utils' );

router.get( '/', function ( req, res, next ) {
    Utils.paginate( User, req, res, next );
});

router.get( '/:id', function ( req, res, next ) {
    User.findById( req.param( 'id' ), function ( err, user ) {
        if ( err || !user ) {
            err         = new Error( 'USER_INVALID_ID' );
            err.status  = 403;

            return next( err );
        }

        user.pass   = '';
        res.json( user );
    });
});

router.post( '/', function ( req, res, next ) {
    User.create({
        access_level    : req.param( 'access_level' ),
        email           : req.param( 'email' ),
        first_name      : req.param( 'first_name' ),
        last_name       : req.param( 'last_name' ),
        pass            : req.param( 'pass' )
    }, function ( err, user ) {
        if ( err || !user ) {
            err         = new Error( 'USER_CREATION_ERROR' );
            err.status  = 403;

            return next( err );
        }

        res.json( user );
    });
});

router.put( '/:id', function ( req, res, next ) {
    var updated = function ( err, user ) {
        if ( err ) {
            err = new Error( 'USER_ERROR_UPDATE' );
            return next( err );
        }

        res.json( user );
    };

    User.findById( req.param( 'id' ), function ( err, user ) {
        if ( err || !user ) {
            err         = new Error( 'USER_INVALID_ID' );
            err.status  = 403;

            return next( err );
        }

        for ( var key in req.body ) {
            if ( key == "pass" ) continue;

            user[key]   = req.body[key];
        }

        user.save( updated );
    });
});

router.put( '/:id/pass', function ( req, res, next ) {
    var updated = function( err, user ) {
        if ( err ) {
            err         = new Error( 'USER_ERROR_PASSWORD' );

            return next( err );
        }

        res.json( user );
    };

    User.findById( req.param( 'id' ), function ( err, user ) {
        if ( err || !user ) {
            err         = new Error( 'USER_INVALID_ID' );
            err.status  = 403;

            return next( err );
        }

        if ( user.id != req.session.user_id ) {
            err         = new Error( 'USER_PERMISSION_DENIED' );
            err.status  = 403;

            return next( err );
        }

        var pass    = ( req.param( 'pass' ) ) ? req.param( 'pass' ) : '';
        if ( !user.checkPassword( pass ) ) {
            err         = new Error( 'USER_INVALID_PASSWORD' );
            err.status  = 403;

            return next( err );
        }

        if ( !req.param( 'npass' ) || req.param( 'npass' ) != req.param( 'rpass' ) ) {
            err         = new Error( 'USER_INVALID_PASSWORD' );
            err.status  = 403;

            return next( err );
        }

        user.pass   = req.param( 'npass' );
        user.save( updated );
    });
});

router.delete( '/:id', function ( req, res, next ) {
    var removed = function ( err, user ) {
        if ( err ) {
            return next( err );
        }

        res.json( user );
    };

    User.findById( req.param( 'id' ), function ( err, user ) {
        if ( err || !user ) {
            err         = new Error( 'USER_INVALID_ID' );
            err.status  = 403;

            return next( err );
        }

        if ( user.id != req.session.user_id ) {
            err         = new Error( 'USER_PERMISSION_DENIED' );
            err.status  = 403;

            return next( err );
        }

        user.remove( removed );
    });
});

module.exports  = router;