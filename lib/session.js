var Encrypt         = require( './encrypt' ),
    Session         = require( '../models/session' ),
    User            = require( '../models/user' );

exports.login       = function ( req, cb ) {
    var start       = function ( err, user ) {
        if ( err ) {
            return cb( err );
        }

        if ( user ) {
            Session.create({
                access_level    : user.access_level,
                ip_address      : req.ip,
                user_id         : user.id
            }, function( err, session ) {
                if ( err ) {
                    return cb( err );
                }

                cb( null, session );
            });
        } else {
            cb( null, false );
        }
    };

    User.findOne({
        email   : req.param( 'email' )
    }, function ( err, user ) {
        if ( err ) {
            return cb( err );
        }

        if ( user ) {
            user.auth( req, start );
        } else {
            cb();
        }
    });
};

exports.validate    = function ( req, res, next ) {
    var sess        = ( req.param( 'session' ) ) ? Encrypt.decode( req.param( 'session' ) ) : '';
    
    Session.findById( sess, function ( err, session ) {
        if ( err || !session ) {
            var err     = new Error( 'Invalid session id' );
            err.status  = 401;
            return next( err );
        }

        if ( session.ip_address != req.ip ) {
            session.remove();

            var err     = new Error( 'Invalid session ip' );
            err.status  = 401;
            return next( err );
        }

        session.last_activity   = Date.now();
        session.save( function( err ) {
            if ( err ) {
                return next( err );
            }

            req.session = session;
            next();
        });
    });
};

exports.logout      = function ( req, cb ) {
    req.session.remove( function ( err ) {
        if ( err ) {
            return cb( err );
        }

        cb();
    });
};