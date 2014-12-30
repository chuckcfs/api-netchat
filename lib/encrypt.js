var crypto      = require( 'crypto' ),
    config      = require( '../config/app' );

exports.encode  = function( text ) {
    var cipher  = crypto.createCipher( 'aes-256-cbc', config.encryption_key ),
        crypted = cipher.update( text, 'utf8', 'hex' );

    crypted     += cipher.final( 'hex' );
    return crypted;
};

exports.decode  = function( data ) {
    var decipher    = crypto.createDecipher( 'aes-256-cbc', config.encryption_key );

    try {
        var dec     = decipher.update( data, 'hex', 'utf8' );
        dec         += decipher.final( 'utf8' );
    } catch( err ) {
        var dec     = "";
    }

    return dec;
};