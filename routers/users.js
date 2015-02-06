var config      = require( '../config/app' ),
    rimraf      = require( 'rimraf' ),
    join        = require( 'path' ).join,
    express     = require( 'express' ),
    router      = express.Router(),
    Chat        = require( '../models/chat' ),
    Message     = require( '../models/message' ),
    User        = require( '../models/user' ),
    Utils       = require( '../lib/utils' ),
    removeChats = function ( user ) {
        var filters         = {
                '$or'   : [
                    {
                        'to._id'    : user.id
                    },
                    {
                        'from._id'  : user.id
                    }
                ]
            },
            chatIndex       = 0,
            messagesFound   = function ( err, messages ) {
                var index   = 0;
                for ( var i = 0; i < messages.length; i++ ) {
                    if ( config.s3_uploads && messages[i].attachment && messages[i].attachment.name ) {
                        Utils.removeObject( messages[i].attachment.name, function () {
                            messages[index++].remove();
                        });
                    } else {
                        rimraf( join( config.uploads_path, messages[i].id ), function () {
                            messages[index++].remove();
                        });
                    }
                }
            },
            chatsFound      = function ( err, chats ) {
                for ( var i = 0; i < chats.length; i++ ) {
                    var peer    = "";

                    if ( chats[i].from._id == user._id ) {
                        peer    = chats[i].to._id;
                    } else {
                        peer    = chats[i].from._id;
                    }

                    User.count({
                        _id     : peer
                    }, function ( err, count ) {
                        if ( count == 0 ) {
                            // Remove the chat's messages and the chat object itself
                            Message.find({
                                chat_id : chats[chatIndex]._id
                            }, messagesFound );

                            chats[chatIndex].remove();
                        }

                        chatIndex++;
                    });
                }
            };

        Chat.find( filters, chatsFound );
    };

router.get( '/', function ( req, res, next ) {
    var filters = ( req.param( 'filters' ) ) ? JSON.parse( req.param( 'filters' ) ) : null;
    if ( filters && filters.name ) {
        filters.name        = new RegExp( filters.name, 'i' );
        req.query.filters   = filters;
    }

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
        name            : req.param( 'name' ),
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
    var removed     = function ( err, user ) {
            if ( err ) {
                return next( err );
            }

            removeChats( user );
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