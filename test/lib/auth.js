var crypto      = require( 'crypto' ),
    config      = require( '../../config/app' ),
    merge       = function ( obj1, obj2 ) {
        for ( var attr in obj2 ) {
            obj1[attr]  = obj2[attr];
        }

        return obj1;
    };

exports.sign    = function ( data ) {
    var secret      = config.application_secret,
        timestamp   = Date.now(),
        hash        = crypto.createHash( 'sha1' );
    hash.update( timestamp + secret );
    
    var auth        = {
        consumer    : config.application_id,
        timestamp   : timestamp,
        signature   : hash.digest( 'hex' )
    };
    
    if ( data ) {
        var auth    = merge( auth, data );
    }
    
    return auth;
};