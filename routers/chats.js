var express     = require( 'express' ),
    router      = express.Router(),
    Chat        = require( '../models/chat' ),
    Message     = require( '../models/message' ),
    Utils       = require( '../lib/utils' );

router.get( '/', function ( req, res, next ) {
    Utils.paginate( Chat, req, res, next );
});

router.post( '/', function ( req, res, next ) {
    Chat.create({
        from    : req.param( 'from' ),
        to      : req.param( 'to' )
    }, function ( err, chat ) {
        if ( err || !chat ) {
            err         = new Error( 'CHAT_CREATION_ERROR' );
            err.status  = 403;

            return next( err );
        }

        res.json( chat );
    });
});

router.delete( '/:id', function ( req, res, next ) {
    var removed = function ( err, chat ) {
        if ( err ) {
            return next( err );
        }

        res.json( chat );
    };

    Chat.findById( req.param( 'id' ), function ( err, chat ) {
        if ( err || !chat ) {
            err         = new Error( 'CHAT_INVALID_ID' );
            err.status  = 403;

            return next( err );
        }

        Message.find({ chat_id : chat.id }).remove();
        chat.remove( removed );
    });
});

module.exports  = router;