var crypto      = require( 'crypto' );

exports.random  = function( length, type ) {
    var chars   = "";
    switch( type ) {
        case "alnum" :
            chars   = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            break;
        case "chars" :
            chars   = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            break;
        case "numeric" :
            chars   = "0123456789";
            break;
    }

    var rnd     = crypto.randomBytes( length ),
        value   = new Array( length ),
        len     = chars.length;

    for ( var i = 0; i < length; i++ ) {
        value[i]    = chars[rnd[i] % len];
    }

    return value.join( '' );
};