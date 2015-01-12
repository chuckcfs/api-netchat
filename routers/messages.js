var express     = require( 'express' ),
    rimraf      = require( 'rimraf' ),
    join        = require( 'path' ).join,
    router      = express.Router(),
    config      = require( '../config/app' ),
    Chat        = require( '../models/chat' ),
    Message     = require( '../models/message' ),
    Utils       = require( '../lib/utils' );

router.get( '/', function ( req, res, next ) {
    Utils.paginate( Message, req, res, next );
});

router.post( '/', function ( req, res, next ) {
    Message.create({
        chat_id     : req.param( 'chat' ),
        content     : req.param( 'content' ),
        from        : req.param( 'from' ),
        to          : req.param( 'to' )
    }, function ( err, message ) {
        if ( err || !message ) {
            err         = new Error( 'MESSAGE_CREATION_ERROR' );
            err.status  = 403;

            return next( err );
        }

        Chat.findById( message.chat_id, function ( err, chat ) {
            chat.last_message   = Date.now();

            chat.save( function () {
                // Check if the message has an attachment
                var attachment  = req.param( 'attachment' );
                if ( attachment ) {
                    if ( config.s3_uploads ) {
                        message.attachment  = attachment;
                        message.save( function () {
                            req.emitter.emit( 'message:new', message );
                            res.json( message );
                        });
                    } else {
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
                                req.emitter.emit( 'message:new', message );
                                res.json( message );
                            });
                        });
                    }
                } else {
                    req.emitter.emit( 'message:new', message );
                    res.json( message );
                }
            });
        });
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

        if ( config.s3_uploads && message.attachment && message.attachment.name ) {
            Utils.removeObject( message.attachment.name, function () {
                message.remove( removed );
            });
        } else {
            rimraf( join( config.uploads_path, req.param( 'id' ) ), function () {
                message.remove( removed );
            });
        }
    });
});

module.exports  = router;