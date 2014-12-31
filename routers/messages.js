var express     = require( 'express' ),
    rimraf      = require( 'rimraf' ),
    join        = require( 'path' ).join,
    router      = express.Router(),
    config      = require( '../config/app' ),
    Message     = require( '../models/message' ),
    Utils       = require( '../lib/utils' );

router.get( '/', function ( req, res, next ) {
    Utils.paginate( Message, req, res, next );
});

router.post( '/', function ( req, res, next ) {
    var sender  = {
            _id     : req.session.user_id,
            email   : req.param( 'from' )
        };

    Message.create({
        content     : req.param( 'content' ),
        from        : sender,
        to          : req.param( 'to' )
    }, function ( err, message ) {
        if ( err || !message ) {
            err         = new Error( 'MESSAGE_CREATION_ERROR' );
            err.status  = 403;

            return next( err );
        }

        // Check if the message has an attachment
        var attachment  = req.param( 'attachment' );
        if ( attachment ) {
            var dest    = join( config.uploads_path, message.id );

            Utils.move( attachment.name, config.uploads_tmp_path, dest, function ( err ) {
                if ( err ) {
                    res.json({
                        message : message,
                        error   : err
                    });
                }

                message.attachment  = {
                    name    : attachment.name,
                    path    : join( dest, attachment.name )
                };
                message.save( function () {
                    res.json( message );
                });
            });
        } else {
            res.json( message );
        }
    });
});

router.post( '/file', function ( req, res, next ) {
    Utils.upload( 'file', req, function ( err, file ) {
        if ( err ) {
            var error       = err;
            error.status    = 403;

            return next( error );
        }

        res.json({
            file : {
                name    : file.name,
                path    : file.path
            }
        });
    });
});

router.delete( '/:id', function ( req, res, next ) {
    var removed = function ( err, message ) {
        if ( err ) {
            return next( err );
        }

        res.json( message );
    };

    Message.findById( req.param( 'id' ), function ( err, message ) {
        if ( err || !message ) {
            err         = new Error( 'MESSAGE_INVALID_ID' );
            err.status  = 403;

            return next( err );
        }

        if ( message.from._id != req.session.user_id ) {
            err         = new Error( 'MESSAGE_PERMISSION_DENIED' );
            err.status  = 403;

            return next( err );
        }

        rimraf( join( config.uploads_path, req.param( 'id' ) ), function () {
            message.remove( removed );
        });
    });
});

module.exports  = router;